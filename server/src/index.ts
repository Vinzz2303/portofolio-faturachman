import 'dotenv/config'
import crypto from 'crypto'
import express, { type NextFunction, type Request, type Response } from 'express'
import axios from 'axios'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import nodemailer from 'nodemailer'
import pool from './db'
import { getInvestmentSummary } from './services/investmentSummary'
import type { AuthTokenPayload, InstrumentSummary, MarketPoint } from './types'

type RequestWithUser = Request & {
  user?: AuthTokenPayload
}

type PricePointRow = RowDataPacket & {
  time: string | number
  open: number
  high: number
  low: number
  close: number
}

type UserRow = RowDataPacket & {
  id: number
  fullname: string
  email: string
  password_hash: string
}

type ResetRow = RowDataPacket & {
  id: number
  expires_at: Date | string
}

type AuthBody = {
  fullname?: string
  email?: string
  password?: string
  token?: string
}

type AiMessage = {
  role: string
  content: string
}

type AiChatBody = {
  messages?: AiMessage[]
  summary?: string
  meta?: {
    instruments?: {
      ANTAM?: InstrumentSummary
      SP500?: InstrumentSummary
    }
  }
}

const app = express()

app.use(express.text({ type: '*/*', limit: '1mb' }))
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

app.get('/', (_req, res) => {
  res.status(200).send('LifeOS API is running.')
})

const sp500Cache: { data: MarketPoint[] | null; timestamp: number } = {
  data: null,
  timestamp: 0
}

const btcCache: { data: MarketPoint[] | null; timestamp: number } = {
  data: null,
  timestamp: 0
}

const lastGood: {
  sp500Daily: MarketPoint[] | null
  btcDaily: MarketPoint[] | null
} = {
  sp500Daily: null,
  btcDaily: null
}

const parsePayload = <T>(req: Request): T => {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as T
    } catch {
      return {} as T
    }
  }

  return ((req.body || {}) as T)
}

const toDateString = (value: Date) => value.toISOString().slice(0, 10)

const fetchSp500Series = async (days: number): Promise<MarketPoint[]> => {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY
  if (!apiKey) {
    throw new Error('ALPHAVANTAGE_API_KEY missing')
  }

  const cacheTtlMs = Number(process.env.MARKET_CACHE_TTL_MS || 60 * 60 * 1000)
  const now = Date.now()
  if (sp500Cache.data && now - sp500Cache.timestamp < cacheTtlMs) {
    return sp500Cache.data.slice(-days)
  }

  const url =
    'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&outputsize=compact&apikey=' +
    apiKey

  const response = await axios.get(url, { timeout: 12000 })
  const series = response.data?.['Time Series (Daily)'] as
    | Record<string, Record<string, string>>
    | undefined

  if (!series) {
    const note = response.data?.Note || response.data?.['Error Message']
    throw new Error(note || 'Failed to load market data')
  }

  const points = Object.keys(series)
    .map((date) => {
      const entry = series[date] || {}
      const open = Number(entry['1. open'] || 0)
      const high = Number(entry['2. high'] || 0)
      const low = Number(entry['3. low'] || 0)
      const close = Number(entry['4. close'] || 0)

      return { time: date, open, high, low, close }
    })
    .filter((point) => point.open && point.high && point.low && point.close)
    .sort((a, b) => String(a.time).localeCompare(String(b.time)))

  sp500Cache.data = points
  sp500Cache.timestamp = now
  lastGood.sp500Daily = points
  return points.slice(-days)
}

const fetchBtcDaily = async (days: number): Promise<MarketPoint[]> => {
  const cacheTtlMs = Number(process.env.MARKET_CACHE_TTL_MS || 60 * 60 * 1000)
  const now = Date.now()

  if (btcCache.data && btcCache.timestamp > now - cacheTtlMs) {
    const sinceDate = new Date(now - days * 24 * 60 * 60 * 1000)
    const filteredData = btcCache.data.filter((point) => new Date(String(point.time)) > sinceDate)
    if (filteredData.length >= days) {
      return filteredData
    }
  }

  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${days}`
  const response = await axios.get<number[][]>(url, { timeout: 12000 })

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid data format from CoinGecko API')
  }

  const dailyData = new Map<string, MarketPoint>()
  response.data.forEach((kline) => {
    const dateStr = toDateString(new Date(kline[0]))
    dailyData.set(dateStr, {
      time: dateStr,
      open: Number(kline[1]),
      high: Number(kline[2]),
      low: Number(kline[3]),
      close: Number(kline[4])
    })
  })

  const points = Array.from(dailyData.values())
  btcCache.data = points
  btcCache.timestamp = now
  lastGood.btcDaily = points
  return points
}

const mailTransport = () => {
  const host = process.env.EMAIL_HOST
  const port = Number(process.env.EMAIL_PORT || 2525)
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
  })
}

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
  )
}

const createToken = () => crypto.randomBytes(32).toString('hex')
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')

const authMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-change'
    ) as AuthTokenPayload
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

app.post('/api/signup', async (req, res) => {
  try {
    const { fullname, email, password } = parsePayload<AuthBody>(req)
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: 'Fullname, email, password required' })
    }

    const [rows] = await pool.query<UserRow[]>('SELECT id FROM users WHERE email = ? LIMIT 1', [email])
    if (rows[0]) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hash = await bcrypt.hash(password, 10)
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (fullname, email, password_hash) VALUES (?, ?, ?)',
      [fullname, email, hash]
    )

    return res.status(201).json({ id: result.insertId, fullname, email })
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Signup error' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = parsePayload<AuthBody>(req)
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, fullname, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    )
    const user = rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { id: user.id, fullname: user.fullname, email: user.email },
      process.env.JWT_SECRET || 'dev-secret-change',
      { expiresIn: '12h' }
    )

    return res.status(200).json({
      token,
      user: { id: user.id, fullname: user.fullname, email: user.email }
    })
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Auth error' })
  }
})

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = parsePayload<AuthBody>(req)
    if (!email) {
      return res.status(400).json({ error: 'Email required' })
    }

    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, fullname, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    )
    const user = rows[0]
    if (!user) {
      return res.status(200).json({ ok: true })
    }

    await ensureResetTable()
    const token = createToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30)

    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    )

    const transport = mailTransport()
    if (!transport) {
      return res.status(500).json({ error: 'Email transport not configured' })
    }

    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset?email=${encodeURIComponent(
      user.email
    )}&token=${token}`

    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'LifeOS <no-reply@lifeos.local>',
      to: user.email,
      subject: 'Reset Password LifeOS',
      html: `<p>Hi ${user.fullname},</p><p>Klik link ini untuk reset password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link berlaku 30 menit.</p>`
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Forgot password error' })
  }
})

app.post('/api/auth/reset', async (req, res) => {
  try {
    const { email, token, password } = parsePayload<AuthBody>(req)
    if (!email || !token || !password) {
      return res.status(400).json({ error: 'Email, token, password required' })
    }

    const [users] = await pool.query<UserRow[]>(
      'SELECT id, fullname, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    )
    const user = users[0]
    if (!user) {
      return res.status(400).json({ error: 'Invalid token' })
    }

    await ensureResetTable()
    const tokenHash = hashToken(token)
    const [resets] = await pool.query<ResetRow[]>(
      'SELECT id, expires_at FROM password_resets WHERE user_id = ? AND token_hash = ? ORDER BY id DESC LIMIT 1',
      [user.id, tokenHash]
    )
    const reset = resets[0]
    if (!reset) {
      return res.status(400).json({ error: 'Invalid token' })
    }
    if (new Date(reset.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Token expired' })
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id])
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [user.id])

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Reset error' })
  }
})

app.get('/api/investment-summary', authMiddleware, async (_req, res) => {
  try {
    const result = await getInvestmentSummary()
    res.status(200).json({ summary: result.summary, meta: result.meta })
  } catch (error) {
    res.status(503).json({
      summary: 'Maaf, layanan sedang tidak tersedia. Coba lagi beberapa saat.',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.get('/api/market/sp500', authMiddleware, async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 7), 120)
    const data = await fetchSp500Series(days)
    res.status(200).json({ data })
  } catch (error) {
    if (lastGood.sp500Daily) {
      return res.status(200).json({ data: lastGood.sp500Daily, fallback: 'cached' })
    }
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Market data unavailable'
    })
  }
})

app.get('/api/market/btc', authMiddleware, async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 7), 120)
    const data = await fetchBtcDaily(days)
    res.status(200).json({ data })
  } catch (error) {
    if (lastGood.btcDaily) {
      return res.status(200).json({ data: lastGood.btcDaily, fallback: 'cached' })
    }
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Market data unavailable'
    })
  }
})

const buildLocalReply = (
  messages: AiMessage[],
  summary?: string,
  meta?: AiChatBody['meta']
) => {
  const last = messages
    .slice()
    .reverse()
    .find((message) => message.role === 'user')
    ?.content?.toLowerCase() || ''

  if (last.includes('antam')) {
    const antam = meta?.instruments?.ANTAM
    if (!antam || antam.error) return 'Data Antam belum tersedia saat ini.'
    return `XAU/USD terakhir ${antam.latestPrice} per gram dengan perubahan ${antam.delta} (${antam.latestDate}).`
  }

  if (last.includes('s&p') || last.includes('sp500')) {
    const sp500 = meta?.instruments?.SP500
    if (!sp500 || sp500.error) return 'Data S&P 500 belum tersedia saat ini.'
    return `S&P 500 terakhir ${sp500.latestPrice} dengan perubahan ${sp500.delta} (${sp500.latestDate}).`
  }

  if (summary) {
    return `Ringkasan: ${summary}`
  }

  return 'Saya siap membantu analisis data investasi jika ringkasan tersedia.'
}

const sendGroq = async (messages: AiMessage[]) => {
  const url = process.env.GROQ_API_URL
  const apiKey = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL
  if (!url || !apiKey || !model) return null

  const payload = {
    model,
    messages,
    temperature: 0.4
  }

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: Number(process.env.GROQ_REQUEST_TIMEOUT_MS || 12000)
    })

    return (response.data?.choices?.[0]?.message?.content?.trim() as string | undefined) || null
  } catch (error) {
    console.error('GROQ_ERROR', error)
    return null
  }
}

app.post('/api/ai-chat', authMiddleware, async (req, res) => {
  try {
    const payload = parsePayload<AiChatBody>(req)
    const { messages, summary, meta } = payload

    if (!Array.isArray(messages)) {
      const fallback = buildLocalReply([], summary, meta)
      return res.status(200).json({ reply: fallback, usedGroq: false })
    }

    const groqReply = await sendGroq(messages)
    if (groqReply) {
      return res.status(200).json({ reply: groqReply, usedGroq: true })
    }

    const localReply = buildLocalReply(messages, summary, meta)
    return res.status(200).json({ reply: localReply, usedGroq: false })
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'AI error' })
  }
})

app.get('/api/ai-chat', authMiddleware, (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {})
