require("dotenv").config();
const express = require("express");
const { getInvestmentSummary } = require("./services/investmentSummary");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
console.log("GROQ_API_KEY", process.env.GROQ_API_KEY ? "loaded" : "missing");
console.log("GROQ_MODEL", process.env.GROQ_MODEL || "missing");
console.log("GROQ_API_URL", process.env.GROQ_API_URL || "missing");
console.log("JWT_SECRET", process.env.JWT_SECRET ? "loaded" : "missing");
console.log("EMAIL_HOST", process.env.EMAIL_HOST ? "loaded" : "missing");
app.use(express.text({ type: "*/*", limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const parsePayload = req => {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (err) {
      return {};
    }
  }
  return req.body || {};
};

const mailTransport = () => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 2525);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
  });
};

const ensureResetTable = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (user_id),
      INDEX (token_hash),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );
};

const createToken = () => crypto.randomBytes(32).toString("hex");
const hashToken = token => crypto.createHash("sha256").update(token).digest("hex");

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change");
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

app.post("/api/signup", async (req, res) => {
  try {
    const { fullname, email, password } = parsePayload(req);
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "Fullname, email, password required" });
    }
    const [rows] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
    if (rows[0]) return res.status(409).json({ error: "Email already registered" });
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (fullname, email, password_hash) VALUES (?, ?, ?)",
      [fullname, email, hash]
    );
    return res.status(201).json({ id: result.insertId, fullname, email });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Signup error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = parsePayload(req);
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const [rows] = await pool.query(
      "SELECT id, fullname, email, password_hash FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, fullname: user.fullname, email: user.email },
      process.env.JWT_SECRET || "dev-secret-change",
      { expiresIn: "12h" }
    );
    return res.status(200).json({
      token,
      user: { id: user.id, fullname: user.fullname, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Auth error" });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = parsePayload(req);
    if (!email) return res.status(400).json({ error: "Email required" });
    const [rows] = await pool.query(
      "SELECT id, fullname, email FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(200).json({ ok: true });

    await ensureResetTable();
    const token = createToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await pool.query(
      "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.id, tokenHash, expiresAt]
    );

    const transport = mailTransport();
    if (!transport) {
      return res.status(500).json({ error: "Email transport not configured" });
    }

    const resetUrl = `${process.env.APP_URL || "http://localhost:5173"}/reset?email=${encodeURIComponent(
      user.email
    )}&token=${token}`;

    await transport.sendMail({
      from: process.env.EMAIL_FROM || "LifeOS <no-reply@lifeos.local>",
      to: user.email,
      subject: "Reset Password LifeOS",
      html: `<p>Hi ${user.fullname},</p><p>Klik link ini untuk reset password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link berlaku 30 menit.</p>`
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Forgot password error" });
  }
});

app.post("/api/auth/reset", async (req, res) => {
  try {
    const { email, token, password } = parsePayload(req);
    if (!email || !token || !password) {
      return res.status(400).json({ error: "Email, token, password required" });
    }
    const [users] = await pool.query(
      "SELECT id, email FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = users[0];
    if (!user) return res.status(400).json({ error: "Invalid token" });

    await ensureResetTable();
    const tokenHash = hashToken(token);
    const [resets] = await pool.query(
      "SELECT id, expires_at FROM password_resets WHERE user_id = ? AND token_hash = ? ORDER BY id DESC LIMIT 1",
      [user.id, tokenHash]
    );
    const reset = resets[0];
    if (!reset) return res.status(400).json({ error: "Invalid token" });
    if (new Date(reset.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: "Token expired" });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, user.id]);
    await pool.query("DELETE FROM password_resets WHERE user_id = ?", [user.id]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Reset error" });
  }
});

app.get("/api/investment-summary", authMiddleware, async (req, res) => {
  try {
    const result = await getInvestmentSummary();
    res.status(200).json({ summary: result.summary, meta: result.meta });
  } catch (err) {
    res.status(503).json({
      summary:
        "Maaf, layanan sedang tidak tersedia. Coba lagi beberapa saat.",
      error: err?.message || "Unknown error",
    });
  }
});

function buildLocalReply(messages, summary, meta) {
  const last = messages?.slice().reverse().find(m => m.role === "user")?.content || "";
  const lower = last.toLowerCase();
  if (lower.includes("antam")) {
    const antam = meta?.instruments?.ANTAM;
    if (!antam || antam.error) return "Data Antam belum tersedia saat ini.";
    return `XAU/USD terakhir ${antam.latestPrice} per gram dengan perubahan ${antam.delta} (${antam.latestDate}).`;
  }
  if (lower.includes("s&p") || lower.includes("sp500")) {
    const sp500 = meta?.instruments?.SP500;
    if (!sp500 || sp500.error) return "Data S&P 500 belum tersedia saat ini.";
    return `S&P 500 terakhir ${sp500.latestPrice} dengan perubahan ${sp500.delta} (${sp500.latestDate}).`;
  }
  if (summary) return `Ringkasan: ${summary}`;
  return "Saya siap membantu analisis data investasi jika ringkasan tersedia.";
}

async function sendGroq(messages) {
  const url = process.env.GROQ_API_URL;
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL;
  if (!url || !apiKey || !model) return null;

  const payload = {
    model,
    messages,
    temperature: 0.4
  };
  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: Number(process.env.GROQ_REQUEST_TIMEOUT_MS || 12000)
    });
    return response?.data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.error("GROQ_ERROR", status || "unknown", data || err?.message);
    return null;
  }
}

app.post("/api/ai-chat", authMiddleware, async (req, res) => {
  try {
    const payload = parsePayload(req);
    const { messages, summary, meta } = payload || {};
    if (!Array.isArray(messages)) {
      const fallback = buildLocalReply([], summary, meta);
      return res.status(200).json({ reply: fallback, usedGroq: false });
    }
    const groqReply = await sendGroq(messages);
    if (groqReply) {
      return res.status(200).json({ reply: groqReply, usedGroq: true });
    }
    const localReply = buildLocalReply(messages, summary, meta);
    return res.status(200).json({ reply: localReply, usedGroq: false });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "AI error" });
  }
});

app.get("/api/ai-chat", authMiddleware, (req, res) => {
  res.status(200).json({ status: "ok" });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
