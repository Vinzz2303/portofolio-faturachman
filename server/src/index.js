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

const sp500Cache = {
  data: null,
  timestamp: 0
};
const sp500IntradayCache = {
  data: null,
  timestamp: 0,
  interval: "5min"
};
const xauCache = {
  data: null,
  timestamp: 0
};
const xauIntradayCache = {
  data: null,
  timestamp: 0,
  interval: "5min"
};
const lastGood = {
  sp500Daily: null,
  sp500Intraday: null,
  xauDaily: null,
  xauIntraday: null
};

const isAlphaPremium = process.env.ALPHAVANTAGE_PREMIUM === "true";
const metalpriceKey = process.env.METALPRICE_API_KEY || "";
const metalpriceBaseUrl = "https://api.metalpriceapi.com/v1";

const toDateString = value => value.toISOString().slice(0, 10);
const toMidnight = value => new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));

const fetchSp500Series = async days => {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error("ALPHAVANTAGE_API_KEY missing");
  }

  const cacheTtlMs = Number(process.env.MARKET_CACHE_TTL_MS || 60 * 60 * 1000);
  const now = Date.now();
  if (sp500Cache.data && now - sp500Cache.timestamp < cacheTtlMs) {
    return sp500Cache.data.slice(-days);
  }

  const url =
    "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&outputsize=compact&apikey=" +
    apiKey;

  const response = await axios.get(url, { timeout: 12000 });
  const series = response?.data?.["Time Series (Daily)"];
  if (!series) {
    const note = response?.data?.Note || response?.data?.["Error Message"];
    throw new Error(note || "Failed to load market data");
  }

  const points = Object.keys(series)
    .map(date => {
      const open = Number(series[date]?.["1. open"] || 0);
      const high = Number(series[date]?.["2. high"] || 0);
      const low = Number(series[date]?.["3. low"] || 0);
      const close = Number(series[date]?.["4. close"] || 0);
      return {
        time: date,
        open,
        high,
        low,
        close
      };
    })
    .filter(point => point.open && point.high && point.low && point.close)
    .sort((a, b) => a.time.localeCompare(b.time));

  sp500Cache.data = points;
  sp500Cache.timestamp = now;
  lastGood.sp500Daily = points;
  return points.slice(-days);
};

const fetchSp500Intraday = async (interval, points) => {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;
  if (!apiKey) {
    throw new Error("ALPHAVANTAGE_API_KEY missing");
  }

  const cacheTtlMs = Number(process.env.MARKET_CACHE_TTL_MS || 60 * 60 * 1000);
  const now = Date.now();
  if (
    sp500IntradayCache.data &&
    sp500IntradayCache.interval === interval &&
    now - sp500IntradayCache.timestamp < cacheTtlMs
  ) {
    return sp500IntradayCache.data.slice(-points);
  }

  const url =
    "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=SPY&interval=" +
    interval +
    "&outputsize=compact&apikey=" +
    apiKey;

  const response = await axios.get(url, { timeout: 12000 });
  const series = response?.data?.[`Time Series (${interval})`];
  if (!series) {
    const note = response?.data?.Note || response?.data?.["Error Message"];
    throw new Error(note || "Failed to load market data");
  }

  const pointsData = Object.keys(series)
    .map(date => {
      const open = Number(series[date]?.["1. open"] || 0);
      const high = Number(series[date]?.["2. high"] || 0);
      const low = Number(series[date]?.["3. low"] || 0);
      const close = Number(series[date]?.["4. close"] || 0);
      return {
        time: Math.floor(new Date(date).getTime() / 1000),
        open,
        high,
        low,
        close
      };
    })
    .filter(point => point.open && point.high && point.low && point.close)
    .sort((a, b) => a.time - b.time);

  sp500IntradayCache.data = pointsData;
  sp500IntradayCache.timestamp = now;
  sp500IntradayCache.interval = interval;
  lastGood.sp500Intraday = pointsData;
  return pointsData.slice(-points);
};

const fetchXauDaily = async days => {
  if (!metalpriceKey) {
    const err = new Error("METALPRICE_API_KEY missing");
    err.code = "XAU_UNAVAILABLE";
    throw err;
  }

  const cacheTtlMs = Number(process.env.MARKET_CACHE_TTL_MS || 60 * 60 * 1000);
  const now = Date.now();
  if (xauCache.data && now - xauCache.timestamp < cacheTtlMs) {
    return xauCache.data.slice(-days);
  }

  const end = toMidnight(new Date());
  const start = toMidnight(new Date(end.getTime() - (days - 1) * 86400000));

  const response = await axios.get(`${metalpriceBaseUrl}/timeframe`, {
    params: {
      api_key: metalpriceKey,
      base: "USD",
      currencies: "XAU",
      start_date: toDateString(start),
      end_date: toDateString(end)
    },
    timeout: 12000
  });

  const rates = response?.data?.rates;
  if (!rates) {
    const message = response?.data?.error?.info || response?.data?.error || "MetalpriceAPI error";
    const err = new Error(message);
    err.code = "XAU_UNAVAILABLE";
    throw err;
  }

  const points = Object.keys(rates)
    .map(date => {
      const daily = rates[date] || {};
      const usdXau = Number(daily.USDXAU || 0);
      const xau = Number(daily.XAU || 0);
      const close = usdXau || (xau ? 1 / xau : 0);
      if (!close) return null;
      return {
        time: date,
        open: close,
        high: close,
        low: close,
        close
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.time.localeCompare(b.time));

  xauCache.data = points;
  xauCache.timestamp = now;
  lastGood.xauDaily = points;
  return points.slice(-days);
};

const fetchXauIntraday = async (interval, points) => {
  if (!metalpriceKey) {
    const err = new Error("METALPRICE_API_KEY missing");
    err.code = "XAU_UNAVAILABLE";
    throw err;
  }

  const cacheTtlMs = Number(process.env.MARKET_CACHE_TTL_MS || 60 * 60 * 1000);
  const now = Date.now();
  if (
    xauIntradayCache.data &&
    xauIntradayCache.interval === interval &&
    now - xauIntradayCache.timestamp < cacheTtlMs
  ) {
    return xauIntradayCache.data.slice(-points);
  }

  const end = toMidnight(new Date());
  const start = toMidnight(new Date(end.getTime() - 86400000));

  const response = await axios.get(`${metalpriceBaseUrl}/hourly`, {
    params: {
      api_key: metalpriceKey,
      base: "USD",
      currency: "XAU",
      start_date: toDateString(start),
      end_date: toDateString(end)
    },
    timeout: 12000
  });

  const hourlyRates = response?.data?.rates;
  if (!Array.isArray(hourlyRates)) {
    const message = response?.data?.error?.info || response?.data?.error || "MetalpriceAPI error";
    const err = new Error(message);
    err.code = "XAU_UNAVAILABLE";
    throw err;
  }

  const pointsData = hourlyRates
    .map(entry => {
      const rate = entry?.rates || {};
      const usdXau = Number(rate.USDXAU || 0);
      const xau = Number(rate.XAU || 0);
      const close = usdXau || (xau ? 1 / xau : 0);
      if (!close) return null;
      return {
        time: Number(entry.timestamp),
        open: close,
        high: close,
        low: close,
        close
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);

  xauIntradayCache.data = pointsData;
  xauIntradayCache.timestamp = now;
  xauIntradayCache.interval = interval;
  lastGood.xauIntraday = pointsData;
  return pointsData.slice(-points);
};

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

app.get("/api/market/sp500", authMiddleware, async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 7), 120);
    const data = await fetchSp500Series(days);
    res.status(200).json({ data });
  } catch (err) {
    res.status(503).json({
      error: err?.message || "Market data unavailable"
    });
  }
});

app.get("/api/market/sp500/intraday", authMiddleware, async (req, res) => {
  try {
    const interval = req.query.interval || "5min";
    const points = Math.min(Math.max(Number(req.query.points || 200), 50), 400);
    if (!isAlphaPremium) {
      const fallback = await fetchSp500Series(7);
      return res.status(200).json({ data: fallback, fallback: "daily" });
    }
    const data = await fetchSp500Intraday(interval, points);
    res.status(200).json({ data, interval });
  } catch (err) {
    console.error("SP500_INTRADAY_ERROR", err?.message || err);
    try {
      const fallback = await fetchSp500Series(30);
      res.status(200).json({ data: fallback, fallback: "daily" });
    } catch (fallbackErr) {
      if (lastGood.sp500Intraday) {
        return res.status(200).json({ data: lastGood.sp500Intraday, fallback: "cached" });
      }
      if (lastGood.sp500Daily) {
        return res.status(200).json({ data: lastGood.sp500Daily, fallback: "cached-daily" });
      }
      console.error("SP500_FALLBACK_ERROR", fallbackErr?.message || fallbackErr);
      res.status(503).json({
        error: err?.message || fallbackErr?.message || "Market data unavailable"
      });
    }
  }
});

app.get("/api/market/xau", authMiddleware, async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 7), 120);
    const data = await fetchXauDaily(days);
    res.status(200).json({ data });
  } catch (err) {
    if (err?.code === "XAU_UNAVAILABLE") {
      return res.status(200).json({
        data: [],
        note: "XAU daily candles require a supported provider or premium access."
      });
    }
    res.status(503).json({
      error: err?.message || "Market data unavailable"
    });
  }
});

app.get("/api/market/xau/intraday", authMiddleware, async (req, res) => {
  try {
    const interval = req.query.interval || "5min";
    const points = Math.min(Math.max(Number(req.query.points || 200), 50), 400);
    if (!isAlphaPremium) {
      const fallback = await fetchXauDaily(7);
      return res.status(200).json({ data: fallback, fallback: "daily" });
    }
    const data = await fetchXauIntraday(interval, points);
    res.status(200).json({ data, interval });
  } catch (err) {
    console.error("XAU_INTRADAY_ERROR", err?.message || err);
    try {
      const fallback = await fetchXauDaily(30);
      res.status(200).json({ data: fallback, fallback: "daily" });
    } catch (fallbackErr) {
      if (err?.code === "XAU_UNAVAILABLE" || fallbackErr?.code === "XAU_UNAVAILABLE") {
        return res.status(200).json({
          data: [],
          note: "XAU intraday candles require a supported provider or premium access."
        });
      }
      if (lastGood.xauIntraday) {
        return res.status(200).json({ data: lastGood.xauIntraday, fallback: "cached" });
      }
      if (lastGood.xauDaily) {
        return res.status(200).json({ data: lastGood.xauDaily, fallback: "cached-daily" });
      }
      console.error("XAU_FALLBACK_ERROR", fallbackErr?.message || fallbackErr);
      res.status(503).json({
        error: err?.message || fallbackErr?.message || "Market data unavailable"
      });
    }
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
