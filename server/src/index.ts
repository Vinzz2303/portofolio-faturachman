
import 'dotenv/config'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import express, { type NextFunction, type Request, type Response } from 'express'
import axios from 'axios'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import type { FileFilterCallback } from 'multer'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import nodemailer from 'nodemailer'
import pool from './db'
import { getInvestmentSummary } from './services/investmentSummary'
import { getFxRate } from './services/fxAdapter'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AuthTokenPayload, BriefSection, InstrumentSummary, MarketContext, MarketPoint } from './types'
import { getXauSpot } from './services/xauSpot'
import { refineInsightWithLLM, normalizeInsight, type TingRawInsight } from './services/tingAiProviderOrchestrator'
import { sendAzureChat } from './services/azureProvider'

// --- START: Portfolio Context Types ---
type PortfolioHolding = {
  symbol: string;
  name: string;
  currentValue: number;
  pnlPct: number;
  assetType?: string | null;
};

type PortfolioSummary = {
  totalInvested: number;
  totalCurrentValue: number;
  totalPnl: number;
  totalPnlPct: number;
};

type PortfolioData = {
  summary: PortfolioSummary;
  holdings: PortfolioHolding[];
};

type AskTingAiStructuredResponse = {
  direct_answer: string;
  why_it_matters: [string, string] | string[];
  risk_note: string;
  suggested_next_step: 'monitor' | 'wait' | 'rebalance' | 'reduce_exposure';
};
// --- END: Portfolio Context Types ---


type RequestWithUser = Request & {
  user?: AuthTokenPayload
  file?: Express.Multer.File
}

type AdminRequest = RequestWithUser & {
  admin?: boolean
}

type PricePointRow = RowDataPacket & {
  time: string | number
  open: number
  high: number
  low: number
  close: number
}

type MarketPriceRow = RowDataPacket & {
  timestamp: Date | string
  price_open: number | string | null
  price_high: number | string | null
  price_low: number | string | null
  price_close: number | string | null
}

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[]
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>
          high?: Array<number | null>
          low?: Array<number | null>
          close?: Array<number | null>
        }>
      }
    }>
    error?: {
      description?: string
    } | null
  }
}

type UserRow = RowDataPacket & {
  id: number
  fullname: string
  email: string
  password_hash: string
  email_verified?: number | boolean
}

type ResetRow = RowDataPacket & {
  id: number
  expires_at: Date | string
}

type AssetMasterRow = RowDataPacket & {
  id: number
  symbol: string
  name: string
  asset_type: 'stock' | 'index' | 'crypto' | 'commodity'
  region: string
  provider: string | null
  provider_symbol: string | null
  quote_currency: string
  display_order: number
  is_active: number
}

type GlobalQuoteResponse = {
  'Global Quote'?: {
    '05. price'?: string
    '09. change'?: string
    '10. change percent'?: string
  }
}

type TwelveDataQuoteResponse = {
  code?: number
  message?: string
  status?: string
  close?: string
  previous_close?: string
  change?: string
  percent_change?: string
}

type HoldingRow = RowDataPacket & {
  id: number
  user_id: number
  asset_id: number
  quantity: number | string
  entry_price: number | string
  invested_amount: number | string
  position_currency: string
  notes: string | null
  opened_at: Date | string | null
  is_active: number
  symbol: string
  name: string
  asset_type: 'stock' | 'index' | 'crypto' | 'commodity'
  region: string
  quote_currency: string
}

type HoldingSummaryRow = RowDataPacket & {
  id: number
  asset_id: number
  quantity: number | string
  entry_price: number | string
  invested_amount: number | string
  position_currency: string
  notes: string | null
  opened_at: Date | string | null
  symbol: string
  name: string
  asset_type: 'stock' | 'index' | 'crypto' | 'commodity'
  region: string
  quote_currency: string
  latest_price: number | string | null
  price_change: number | string | null
  price_change_pct: number | string | null
  trend: 'up' | 'down' | 'flat' | null
  fetched_at: Date | string | null
}

type DisplayCurrency = 'IDR' | 'USD'

const isHealthyPnlBasis = ({
  investedAmountDisplay,
  currentValue,
  pnlPctRaw,
  fxStatus
}: {
  investedAmountDisplay: number | null
  currentValue: number | null
  pnlPctRaw: number | null
  fxStatus: 'live' | 'fallback' | 'unavailable'
}) => {
  if (fxStatus === 'unavailable') return false
  if (investedAmountDisplay === null || !Number.isFinite(investedAmountDisplay) || investedAmountDisplay <= 0) {
    return false
  }
  if (pnlPctRaw === null || !Number.isFinite(pnlPctRaw)) return false
  if (Math.abs(pnlPctRaw) > 1000) return false
  if (
    currentValue !== null &&
    currentValue > 100000 &&
    investedAmountDisplay < 10000
  ) {
    return false
  }
  return true
}

type AuthBody = {
  fullname?: string
  email?: string
  password?: string
  token?: string
}

type ProUpgradeStatus = 'draft' | 'pending' | 'approved' | 'rejected'

type ProUpgradeRow = RowDataPacket & {
  id: number
  user_id: number
  full_name: string
  email: string
  sender_name: string
  transfer_date: string | Date
  proof_file_name: string | null
  notes: string | null
  status: ProUpgradeStatus
  admin_note: string | null
  approved_at: Date | string | null
  expires_at: Date | string | null
  created_at: Date | string
  updated_at: Date | string
}

type ProUpgradeBody = {
  fullName?: string
  email?: string
  senderName?: string
  transferDate?: string
  proofFileName?: string
  fileName?: string
  notes?: string
}

type UserSummaryRow = RowDataPacket & {
  id: number
  fullname: string
  email: string
  created_at: Date | string | null
}

type CountRow = RowDataPacket & {
  total: number
}

type CreateHoldingBody = {
  assetId?: number
  quantity?: number
  entryPrice?: number
  investedAmount?: number
  positionCurrency?: string
  notes?: string
  openedAt?: string
}

type UpdateHoldingBody = CreateHoldingBody

type AiMessage = {
  role: string
  content: string
}

type RefreshRunResult = {
  ok: boolean
  refreshed: string[]
  skipped: string[]
  startedAt: string
  finishedAt: string
  durationMs: number
  trigger: 'manual' | 'scheduled' | 'startup'
}

const tingAiStrictSystemPrompt = `You are Ting AI, a calm and trustworthy financial decision copilot for retail investors.

Your role:
Help the user understand portfolio risk, market context, and decision framing.

You are NOT a signal provider.
Do NOT say "buy", "sell", or guarantee profit.
Do NOT predict exact future prices.
Do NOT scare the user.
Do NOT use dramatic words like "hancur", "kehancuran", "catastrophic", "devastating", "crash pasti", or "pasti rugi".
Do NOT ask the user for more data if portfolio context is already available.
If data is incomplete, answer with a conservative assumption and mention uncertainty briefly.

Tone:
- Calm
- Specific
- Personal
- Simple Indonesian when user writes in Indonesian
- Professional but human
- No long paragraphs
- No mixed English unless the term is common in finance

RESPONSE FORMAT - CRITICAL:
Respond ALWAYS as valid JSON in this exact structure (no markdown, no plain text):
{
  "direct_answer": "1 short paragraph, max 2 sentences",
  "why_it_matters": ["bullet point 1", "bullet point 2"],
  "risk_note": "1 short sentence",
  "suggested_next_step": "monitor|wait|rebalance|reduce_exposure"
}

Decision rules:
- If one asset weight > 50%, emphasize concentration risk and suggest rebalance or reduce_exposure
- If one sector weight > 60%, emphasize sector concentration risk
- If portfolio is in profit but concentrated, say the portfolio is profitable but still vulnerable
- If portfolio is losing and concentrated, say risk control should be prioritized
- If market sentiment is defensive or volatile, suggest caution (wait)
- If portfolio is diversified and risk is low, suggest monitor
- Always connect the answer to the user's actual portfolio context
- Use "portofoliomu" or "modalmu" naturally if language is Indonesian

Language rules:
If portfolio context shows user language is Indonesian, answer fully in Indonesian.
If unclear, default to English.
Use simple, natural Indonesian phrases.
Avoid excessive technical terms unless already present in user's question.

Examples:

CONCENTRATED PORTFOLIO (AAPL 76.8%, profit +5.16%, defensive market):
User: "Portofolio saya aman gak?"
Output:
{
  "direct_answer": "Portofoliomu masih cukup rentan karena terlalu bergantung pada satu aset utama. Meskipun dalam keuntungan, konsentrasinya adalah risiko utama saat ini.",
  "why_it_matters": ["Porsi AAPL terlalu dominan terhadap total portofoliomu", "Jika AAPL melemah, dampaknya langsung terasa ke nilai portofolio"],
  "risk_note": "Risiko utama saat ini adalah konsentrasi, bukan arah harga.",
  "suggested_next_step": "rebalance"
}

DIVERSIFIED PORTFOLIO:
User: "Apa yang harus saya lakukan?"
Output:
{
  "direct_answer": "Portofoliomu terlihat cukup seimbang, jadi langkah paling aman saat ini adalah memantau kondisi pasar.",
  "why_it_matters": ["Tidak ada satu aset yang mendominasi portofoliomu", "Diversifikasi membantu mengurangi dampak dari pergerakan satu aset"],
  "risk_note": "Tetap pantau perubahan market karena risiko bisa berubah.",
  "suggested_next_step": "monitor"
}

Non-portfolio questions (general market context, specific asset prices, etc):
- Still respond as JSON with the same structure
- Use direct_answer for the main insight
- why_it_matters for 2 reasons why this matters
- risk_note for the main risk or caveat
- suggested_next_step: use "monitor" as default for general market questions`

const tingAiSystemPrompt = tingAiStrictSystemPrompt

const formatPercentId = (value: number, fractionDigits = 1) =>
  new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value)

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

const limitSentences = (value: string, maxSentences: number) => {
  const cleaned = normalizeWhitespace(value)
  if (!cleaned) return cleaned
  const parts = cleaned.match(/[^.!?]+[.!?]?/g) || [cleaned]
  return parts
    .slice(0, maxSentences)
    .map((part) => part.trim())
    .join(' ')
    .trim()
}

const cleanTingIndonesian = (value: string) =>
  normalizeWhitespace(value)
    .replace(/\bdiversified\b/gi, 'terdiversifikasi')
    .replace(/\bbalanced\b/gi, 'seimbang')
    .replace(/\bportfolio\b/gi, 'portofolio')
    .replace(/\bcontext\b/gi, 'konteks')
    .replace(/\bcatastrophic\b/gi, 'berat')
    .replace(/\bdevastating\b/gi, 'berat')
    .replace(/\bhancur\b/gi, 'tertekan')
    .replace(/\bkehancuran\b/gi, 'tekanan besar')
    .replace(/\bcrash pasti\b/gi, 'tekanan tajam')
    .replace(/\bpasti rugi\b/gi, 'berpotensi rugi')
    .replace(/\bguaranteed\b/gi, 'lebih terjaga')
    .replace(/\b100%\s*aman\b/gi, 'lebih terjaga')
    .replace(/\bPortofolio Anda\b/g, 'Portofoliomu')
    .replace(/\bportofolio anda\b/g, 'portofoliomu')
    .replace(/\bAnda\b/g, 'Kamu')
    .replace(/\banda\b/g, 'kamu')

const normalizeStructuredAskTingAiResponse = (
  response: AskTingAiStructuredResponse,
  preferredLanguage: 'id' | 'en'
): AskTingAiStructuredResponse => ({
  ...response,
  direct_answer:
    preferredLanguage === 'id'
      ? cleanTingIndonesian(limitSentences(response.direct_answer, 2))
      : limitSentences(response.direct_answer, 2),
  why_it_matters: (response.why_it_matters || [])
    .slice(0, 2)
    .map((item) => (preferredLanguage === 'id' ? cleanTingIndonesian(item) : normalizeWhitespace(item))),
  risk_note:
    preferredLanguage === 'id'
      ? cleanTingIndonesian(limitSentences(response.risk_note, 1))
      : limitSentences(response.risk_note, 1)
})

type AiChatBody = {
  provider?: 'groq' | 'gemini'
  messages?: AiMessage[]
  summary?: string
  meta?: {
    instruments?: {
      ANTAM?: InstrumentSummary
      SP500?: InstrumentSummary
      IHSG?: InstrumentSummary
      BTC?: InstrumentSummary
    }
    briefing?: BriefSection[]
    context?: MarketContext
  }
  portfolio?: PortfolioData
}

const app = express()

const uploadsRoot = path.resolve(__dirname, '../uploads')
const proUpgradeProofsDir = path.join(uploadsRoot, 'pro-upgrade-proofs')
fs.mkdirSync(proUpgradeProofsDir, { recursive: true })

const proUpgradeUpload = multer({
  storage: multer.diskStorage({
    destination: (
      _req: Request,
      _file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => cb(null, proUpgradeProofsDir),
    filename: (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {
      const safeExt = path.extname(file.originalname || '').toLowerCase()
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`
      cb(null, uniqueName)
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMime = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
    if (allowedMime.includes(file.mimetype)) {
      cb(null, true)
      return
    }
    cb(new Error('Only PNG, JPG, WEBP, or PDF proof files are allowed'))
  }
})

app.use('/uploads', express.static(uploadsRoot))
app.use(express.text({ type: ['text/plain'], limit: '1mb' }))
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

app.get('/', (_req, res) => {
  res.status(200).send('Ting AI API is running.')
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

const twelveDataRateLimitState = {
  blockedUntil: 0
}

const refreshScheduleState: {
  enabled: boolean
  intervalMs: number
  runOnStartup: boolean
  isRunning: boolean
  timer: NodeJS.Timeout | null
  lastRun: RefreshRunResult | null
  lastError: string | null
} = {
  enabled: String(process.env.PORTFOLIO_REFRESH_ENABLED || 'true').toLowerCase() !== 'false',
  intervalMs: Math.max(Number(process.env.PORTFOLIO_REFRESH_INTERVAL_MS || 30 * 60 * 1000), 60 * 1000),
  runOnStartup: String(process.env.PORTFOLIO_REFRESH_RUN_ON_STARTUP || 'true').toLowerCase() !== 'false',
  isRunning: false,
  timer: null,
  lastRun: null,
  lastError: null
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

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'object' && error) {
    const maybeSqlMessage = Reflect.get(error, 'sqlMessage')
    if (typeof maybeSqlMessage === 'string' && maybeSqlMessage.trim()) {
      return maybeSqlMessage
    }

    const maybeCode = Reflect.get(error, 'code')
    if (typeof maybeCode === 'string' && maybeCode.trim()) {
      return maybeCode
    }
  }

  return fallback
}

const logError = (label: string, error: unknown) => {
  console.error(label, error)
}

const toDateString = (value: Date) => value.toISOString().slice(0, 10)
const getPortfolioDisplayCurrency = (): DisplayCurrency => 'IDR'
const toProofUrl = (fileName?: string | null) =>
  fileName ? `/uploads/pro-upgrade-proofs/${encodeURIComponent(fileName)}` : null
const toAdminProofUrl = (requestId: number, fileName?: string | null) =>
  fileName ? `/api/admin/pro-upgrade-requests/${requestId}/proof` : null

const trendFromNumber = (value: number | null | undefined): 'up' | 'down' | 'flat' => {
  if (value === null || value === undefined || Number.isNaN(value) || value === 0) return 'flat'
  return value > 0 ? 'up' : 'down'
}

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

const usNumberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

const signedIdr = (value: number) => `${value >= 0 ? '+' : '-'}${idrFormatter.format(Math.abs(value))}`

const signedPoints = (value: number) => `${value >= 0 ? '+' : '-'}${usNumberFormatter.format(Math.abs(value))} points`

const signedPercent = (value: number) =>
  `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(2).replace('.', ',')}%`

const upsertPortfolioPriceCache = async (payload: {
  assetId: number
  latestPrice: number
  priceChange: number | null
  priceChangePct: number | null
  trend: 'up' | 'down' | 'flat'
  source: string
}) => {
  await pool.query(
    `INSERT INTO portfolio_price_cache
      (asset_id, latest_price, price_change, price_change_pct, trend, source, fetched_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
      latest_price = VALUES(latest_price),
      price_change = VALUES(price_change),
      price_change_pct = VALUES(price_change_pct),
      trend = VALUES(trend),
      source = VALUES(source),
      fetched_at = VALUES(fetched_at)`,
    [
      payload.assetId,
      payload.latestPrice,
      payload.priceChange,
      payload.priceChangePct,
      payload.trend,
      payload.source
    ]
  )
}

const refreshUsStockQuote = async (asset: AssetMasterRow) => {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY
  if (!apiKey) {
    throw new Error('ALPHAVANTAGE_API_KEY missing')
  }

  const symbol = asset.provider_symbol || asset.symbol
  const url =
    'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' +
    encodeURIComponent(symbol) +
    '&apikey=' +
    apiKey

  const response = await axios.get<GlobalQuoteResponse>(url, { timeout: 12000 })
  const quote = response.data?.['Global Quote']
  const latestPrice = Number(quote?.['05. price'] || 0)
  const priceChange = Number(quote?.['09. change'] || 0)
  const priceChangePctRaw = String(quote?.['10. change percent'] || '').replace('%', '')
  const priceChangePct = priceChangePctRaw ? Number(priceChangePctRaw) : null

  if (!latestPrice) {
    throw new Error(`Quote unavailable for ${asset.symbol}`)
  }

  await upsertPortfolioPriceCache({
    assetId: asset.id,
    latestPrice,
    priceChange: Number.isFinite(priceChange) ? priceChange : null,
    priceChangePct: priceChangePct !== null && Number.isFinite(priceChangePct) ? priceChangePct : null,
    trend: trendFromNumber(priceChange),
    source: 'alphavantage'
  })
}

const refreshTwelveDataQuote = async (asset: AssetMasterRow) => {
  const apiKey = process.env.TWELVEDATA_API_KEY
  if (!apiKey) {
    throw new Error('TWELVEDATA_API_KEY missing')
  }

  if (Date.now() < twelveDataRateLimitState.blockedUntil) {
    throw new Error('Twelve Data cooldown active after rate limit')
  }

  const symbol = asset.provider_symbol || asset.symbol
  const url =
    'https://api.twelvedata.com/quote?symbol=' +
    encodeURIComponent(symbol) +
    '&apikey=' +
    apiKey

  const response = await axios.get<TwelveDataQuoteResponse>(url, { timeout: 12000 })
  const payload = response.data

  if (payload?.status === 'error' || payload?.code) {
    if ((payload?.message || '').toLowerCase().includes('run out of api credits')) {
      twelveDataRateLimitState.blockedUntil = Date.now() + 65 * 1000
    }
    throw new Error(payload?.message || `Twelve Data quote unavailable for ${asset.symbol}`)
  }

  const latestPrice = Number(payload?.close || 0)
  const priceChange = Number(payload?.change || 0)
  const priceChangePct = payload?.percent_change ? Number(payload.percent_change) : null

  if (!latestPrice) {
    throw new Error(`Twelve Data price unavailable for ${asset.symbol}`)
  }

  await upsertPortfolioPriceCache({
    assetId: asset.id,
    latestPrice,
    priceChange: Number.isFinite(priceChange) ? priceChange : null,
    priceChangePct: priceChangePct !== null && Number.isFinite(priceChangePct) ? priceChangePct : null,
    trend: trendFromNumber(priceChange),
    source: 'twelvedata'
  })
}

const refreshUsEquityOrIndexQuote = async (asset: AssetMasterRow) => {
  const provider = (asset.provider || '').toLowerCase()

  if (provider === 'twelvedata') {
    try {
      await refreshTwelveDataQuote(asset)
      return true
    } catch (error) {
      logError(`refresh twelvedata ${asset.symbol}`, error)
    }
  }

  await refreshUsStockQuote(asset)
  return true
}

const refreshCryptoQuote = async (assets: AssetMasterRow[]) => {
  const ids = assets
    .map((asset) => asset.provider_symbol)
    .filter((value): value is string => Boolean(value))

  if (!ids.length) return [] as string[]

  const url =
    'https://api.coingecko.com/api/v3/simple/price?ids=' +
    encodeURIComponent(ids.join(',')) +
    '&vs_currencies=usd&include_24hr_change=true'

  const response = await axios.get<Record<string, { usd?: number; usd_24h_change?: number }>>(url, {
    timeout: 12000
  })

  const refreshedSymbols: string[] = []

  for (const asset of assets) {
    const key = asset.provider_symbol || ''
    const entry = response.data?.[key]
    const latestPrice = Number(entry?.usd || 0)
    const priceChangePct = entry?.usd_24h_change ?? null

    if (!latestPrice) continue

    await upsertPortfolioPriceCache({
      assetId: asset.id,
      latestPrice,
      priceChange: null,
      priceChangePct: priceChangePct !== null && Number.isFinite(priceChangePct) ? Number(priceChangePct) : null,
      trend: trendFromNumber(priceChangePct),
      source: 'coingecko'
    })
    refreshedSymbols.push(asset.symbol)
  }

  return refreshedSymbols
}

const refreshGoldSilverQuotes = async (assets: AssetMasterRow[]) => {
  const refreshedSymbols: string[] = []
  const xauAsset = assets.find((asset) => asset.symbol === 'XAU')
  if (xauAsset) {
    const xau = await getXauSpot()
    await pool.query('UPDATE assets_master SET quote_currency = ? WHERE id = ?', ['IDR', xauAsset.id])
    await upsertPortfolioPriceCache({
      assetId: xauAsset.id,
      latestPrice: Number(xau.latestPrice || 0),
      priceChange: xau.delta ?? null,
      priceChangePct: xau.pct ?? null,
      trend: trendFromNumber(xau.delta),
      source: xau.source || 'gold-api.com'
    })
    refreshedSymbols.push(xauAsset.symbol)
  }

  const xagAsset = assets.find((asset) => asset.symbol === 'XAG')
  if (xagAsset) {
    const response = await axios.get<{ price?: number }>('https://api.gold-api.com/price/XAG', {
      timeout: 12000
    })
    const latestPrice = Number(response.data?.price || 0)
    if (latestPrice) {
      await upsertPortfolioPriceCache({
        assetId: xagAsset.id,
        latestPrice,
        priceChange: null,
        priceChangePct: null,
        trend: 'flat',
        source: 'gold-api.com'
      })
      refreshedSymbols.push(xagAsset.symbol)
    }
  }

  return refreshedSymbols
}

const runPortfolioPriceRefresh = async (
  trigger: RefreshRunResult['trigger']
): Promise<RefreshRunResult> => {
  const startedAtDate = new Date()
  const startedAt = startedAtDate.toISOString()

  const [assetRows] = await pool.query<AssetMasterRow[]>(
    `SELECT id, symbol, name, asset_type, region, provider, provider_symbol, quote_currency, display_order, is_active
     FROM assets_master
     WHERE is_active = 1`
  )

  const supportedStockSymbols = new Set(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'SPX', 'DJIA', 'NDX'])
  const stockAssets = assetRows.filter(
    (asset) =>
      (asset.asset_type === 'stock' || asset.asset_type === 'index') &&
      supportedStockSymbols.has(asset.symbol)
  )
  const cryptoAssets = assetRows.filter((asset) => asset.asset_type === 'crypto')
  const commodityAssets = assetRows.filter((asset) => asset.asset_type === 'commodity')

  const refreshed: string[] = []
  const skipped: string[] = []

  for (const asset of stockAssets) {
    try {
      await refreshUsEquityOrIndexQuote(asset)
      refreshed.push(asset.symbol)
    } catch (error) {
      logError(`refresh stock ${asset.symbol}`, error)
      skipped.push(asset.symbol)
    }
  }

  try {
    const refreshedCryptoSymbols = await refreshCryptoQuote(cryptoAssets)
    refreshed.push(...refreshedCryptoSymbols)
    const refreshedCryptoSet = new Set(refreshedCryptoSymbols)
    skipped.push(...cryptoAssets.filter((asset) => !refreshedCryptoSet.has(asset.symbol)).map((asset) => asset.symbol))
  } catch (error) {
    logError('refresh crypto quotes', error)
    skipped.push(...cryptoAssets.map((asset) => asset.symbol))
  }

  try {
    const refreshedCommoditySymbols = await refreshGoldSilverQuotes(commodityAssets)
    refreshed.push(...refreshedCommoditySymbols)
    const refreshedCommoditySet = new Set(refreshedCommoditySymbols)
    skipped.push(
      ...commodityAssets.filter((asset) => !refreshedCommoditySet.has(asset.symbol)).map((asset) => asset.symbol)
    )
  } catch (error) {
    logError('refresh commodity quotes', error)
    skipped.push(...commodityAssets.map((asset) => asset.symbol))
  }

  const finishedAtDate = new Date()
  return {
    ok: true,
    refreshed: Array.from(new Set(refreshed)),
    skipped: Array.from(new Set(skipped)),
    startedAt,
    finishedAt: finishedAtDate.toISOString(),
    durationMs: finishedAtDate.getTime() - startedAtDate.getTime(),
    trigger
  }
}

const executeScheduledRefresh = async (trigger: RefreshRunResult['trigger']) => {
  if (refreshScheduleState.isRunning) {
    return
  }

  refreshScheduleState.isRunning = true

  try {
    const result = await runPortfolioPriceRefresh(trigger)
    refreshScheduleState.lastRun = result
    refreshScheduleState.lastError = null
  } catch (error) {
    refreshScheduleState.lastError = getErrorMessage(error, 'Failed to refresh portfolio prices')
    logError(`portfolio refresh ${trigger} error`, error)
  } finally {
    refreshScheduleState.isRunning = false
  }
}

const startPortfolioRefreshScheduler = () => {
  if (!refreshScheduleState.enabled) {
    return
  }

  if (refreshScheduleState.runOnStartup) {
    void executeScheduledRefresh('startup')
  }

  refreshScheduleState.timer = setInterval(() => {
    void executeScheduledRefresh('scheduled')
  }, refreshScheduleState.intervalMs)
}

const fetchSp500Series = async (
  days: number
): Promise<{ data: MarketPoint[]; source: 'alphavantage' | 'yahoo-finance' | 'cache' }> => {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY
  const cacheTtlMs = Number(process.env.MARKET_CACHE_TTL_MS || 60 * 60 * 1000)
  const now = Date.now()
  if (sp500Cache.data && sp500Cache.data.length >= days && now - sp500Cache.timestamp < cacheTtlMs) {
    return { data: sp500Cache.data.slice(-days), source: 'cache' }
  }

  if (apiKey) {
    try {
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
      return { data: points.slice(-days), source: 'alphavantage' }
    } catch (error) {
      logError('fetch sp500 alphavantage fallback to yahoo', error)
    }
  }

  const yahooPoints = await fetchYahooSeries('SPY', days)

  sp500Cache.data = yahooPoints
  sp500Cache.timestamp = now
  lastGood.sp500Daily = yahooPoints
  return { data: yahooPoints.slice(-days), source: 'yahoo-finance' }
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

  const providerDays = days <= 7 ? 7 : days <= 30 ? 30 : days <= 90 ? 90 : 180
  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${providerDays}`
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
  return points.slice(-days)
}

const fetchMarketSeriesFromDb = async (
  instrument: string,
  days: number
): Promise<MarketPoint[]> => {
  const [rows] = await pool.query<MarketPriceRow[]>(
    `SELECT timestamp, price_open, price_high, price_low, price_close
     FROM market_prices
     WHERE instrument_name = ?
       AND DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     ORDER BY timestamp ASC`,
    [instrument, days]
  )

  return rows
    .map((row) => ({
      time: new Date(row.timestamp).toISOString().slice(0, 10),
      open: Number(row.price_open ?? row.price_close ?? 0),
      high: Number(row.price_high ?? row.price_close ?? 0),
      low: Number(row.price_low ?? row.price_close ?? 0),
      close: Number(row.price_close ?? 0)
    }))
    .filter((point) => point.open && point.high && point.low && point.close)
}

const buildGoldSpotFallbackSeries = async (): Promise<{
  data: MarketPoint[]
  source: string
  fallback: 'external'
  note: string
}> => {
  const spot = await getXauSpot()
  const latestDate = spot.latestDate || new Date().toISOString().slice(0, 10)
  const previousDate =
    spot.previousDate ||
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const latestPrice = Number(spot.latestPrice ?? 0)
  const previousPrice = Number(spot.previousPrice ?? latestPrice)

  const data =
    latestPrice > 0
      ? [
          {
            time: previousDate,
            open: previousPrice,
            high: previousPrice,
            low: previousPrice,
            close: previousPrice
          },
          {
            time: latestDate,
            open: latestPrice,
            high: latestPrice,
            low: latestPrice,
            close: latestPrice
          }
        ]
      : []

  return {
    data,
    source: spot.source || 'gold-api.com',
    fallback: 'external',
    note: data.length ? 'GOLD spot fallback is currently using live XAU feed.' : 'GOLD spot fallback is unavailable.'
  }
}

const fetchYahooSeries = async (symbol: string, days: number): Promise<MarketPoint[]> => {
  const range = days <= 2 ? '5d' : days <= 7 ? '7d' : days <= 30 ? '1mo' : days <= 90 ? '3mo' : '6mo'
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`
  const response = await axios.get<YahooChartResponse>(url, { timeout: 12000 })
  const result = response.data?.chart?.result?.[0]
  const timestamps = result?.timestamp || []
  const quote = result?.indicators?.quote?.[0]
  const opens = quote?.open || []
  const highs = quote?.high || []
  const lows = quote?.low || []
  const closes = quote?.close || []

  const points = timestamps
    .map((timestamp, index) => {
      const open = opens[index]
      const high = highs[index]
      const low = lows[index]
      const close = closes[index]

      if (
        open === null ||
        open === undefined ||
        high === null ||
        high === undefined ||
        low === null ||
        low === undefined ||
        close === null ||
        close === undefined
      ) {
        return null
      }

      return {
        time: new Date(timestamp * 1000).toISOString().slice(0, 10),
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close)
      }
    })
    .filter((point): point is NonNullable<typeof point> => point !== null)

  if (!points.length) {
    throw new Error(response.data?.chart?.error?.description || `No Yahoo series available for ${symbol}`)
  }

  return points.slice(-days)
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

const ensureUsersVerificationColumn = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME = 'email_verified'
     LIMIT 1`
  )

  if (rows.length > 0) return

  await pool.query(
    `ALTER TABLE users
     ADD COLUMN email_verified TINYINT(1) NOT NULL DEFAULT 0`
  )
}

const ensureProUpgradeTable = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS pro_upgrade_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL,
      sender_name VARCHAR(120) NOT NULL,
      transfer_date DATE NOT NULL,
      proof_file_name VARCHAR(255) DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      status ENUM('draft', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      admin_note TEXT DEFAULT NULL,
      approved_at DATETIME DEFAULT NULL,
      expires_at DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_pro_upgrade_requests_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      KEY idx_pro_upgrade_requests_user_status (user_id, status),
      KEY idx_pro_upgrade_requests_status_created (status, created_at)
    )`
  )

  const [approvedColumn] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'pro_upgrade_requests'
       AND COLUMN_NAME = 'approved_at'`
  )

  if (!Number((approvedColumn[0] as { total?: number })?.total || 0)) {
    await pool.query(`ALTER TABLE pro_upgrade_requests ADD COLUMN approved_at DATETIME DEFAULT NULL`)
  }

  const [expiresColumn] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'pro_upgrade_requests'
       AND COLUMN_NAME = 'expires_at'`
  )

  if (!Number((expiresColumn[0] as { total?: number })?.total || 0)) {
    await pool.query(`ALTER TABLE pro_upgrade_requests ADD COLUMN expires_at DATETIME DEFAULT NULL`)
  }
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

const getOptionalAuthUser = (req: Request): AuthTokenPayload | null => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change') as AuthTokenPayload
  } catch {
    return null
  }
}

const getAdminEmails = () =>
  String(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

const isAdminEmail = (email?: string) => {
  if (!email) return false
  const adminEmails = getAdminEmails()
  return adminEmails.includes(email.trim().toLowerCase())
}

const adminMiddleware = (req: AdminRequest, res: Response, next: NextFunction) => {
  const email = req.user?.email
  if (!email || !isAdminEmail(email)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  req.admin = true
  next()
}

const getPlanForEmail = (email?: string) => (isAdminEmail(email) ? 'pro' : 'free')

const toIsoLike = (value: string | Date | null | undefined) => {
  if (!value) return null
  if (typeof value === 'string') return value
  return value.toISOString()
}

const getRequestExpiry = (request?: Pick<ProUpgradeRow, 'approved_at' | 'expires_at' | 'created_at' | 'updated_at'> | null) => {
  if (!request) return null

  const approvedAt = request.approved_at || request.updated_at || request.created_at
  const fallbackBase = new Date(approvedAt).getTime()
  if (!Number.isFinite(fallbackBase)) return null

  if (request.expires_at) {
    const expiry = new Date(request.expires_at).getTime()
    return Number.isFinite(expiry) ? new Date(expiry) : null
  }

  return new Date(fallbackBase + 30 * 24 * 60 * 60 * 1000)
}

const isProRequestActive = (request?: Pick<ProUpgradeRow, 'status' | 'approved_at' | 'expires_at' | 'created_at' | 'updated_at'> | null) => {
  if (!request || request.status !== 'approved') return false

  const expiryDate = getRequestExpiry(request)
  const expiresAt = expiryDate?.getTime() || NaN

  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

const getEffectivePlan = async (payload: { userId?: number; email?: string }) => {
  if (isAdminEmail(payload.email)) {
    return 'pro' as const
  }

  if (!payload.userId) {
    return 'free' as const
  }

  await ensureProUpgradeTable()
  const [rows] = await pool.query<CountRow[]>(
    "SELECT COUNT(*) AS total FROM pro_upgrade_requests WHERE user_id = ? AND status = 'approved'",
    [payload.userId]
  )

  if (!Number(rows[0]?.total || 0)) {
    return 'free' as const
  }

  const [requestRows] = await pool.query<ProUpgradeRow[]>(
    `SELECT id, user_id, full_name, email, sender_name, transfer_date, proof_file_name, notes, status, admin_note, approved_at, expires_at, created_at, updated_at
     FROM pro_upgrade_requests
     WHERE user_id = ? AND status = 'approved'
     ORDER BY COALESCE(expires_at, updated_at, created_at) DESC, id DESC
     LIMIT 1`,
    [payload.userId]
  )

  return isProRequestActive(requestRows[0]) ? ('pro' as const) : ('free' as const)
}

const getRequestPlan = async (user?: AuthTokenPayload | null) => {
  if (!user?.id) {
    return 'free' as const
  }

  return getEffectivePlan({ userId: user.id, email: user.email })
}

const getFreeInvestmentSummaryPreview = (summary?: string, meta?: AiChatBody['meta']) => ({
  summary:
    summary && summary.trim()
      ? summary
          .replace(/\*\*/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .split(/(?<=[.!?])\s+/)
          .slice(0, 2)
          .join(' ')
      : 'Free preview available after the latest market sync.',
  meta: meta
    ? {
        ...meta,
        briefing: meta.briefing?.slice(0, 1),
        context: meta.context
          ? {
              ...meta.context,
              headlines: meta.context.headlines?.slice(0, 1) || [],
              watchItems: meta.context.watchItems?.slice(0, 1) || [],
              drivers: meta.context.drivers?.slice(0, 2) || [],
              macroSignals: meta.context.macroSignals?.slice(0, 1) || [],
              stressDrivers: meta.context.stressDrivers?.slice(0, 1) || []
            }
          : undefined
      }
    : null
})

const getUserProfileById = async (userId: number) => {
  await ensureUsersVerificationColumn()
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, fullname, email, password_hash, email_verified FROM users WHERE id = ? LIMIT 1',
    [userId]
  )

  const user = rows[0]
  if (!user) {
    return null
  }

  const plan = await getEffectivePlan({ userId: user.id, email: user.email })
  let planExpiresAt: string | null = null

  if (plan === 'pro') {
    await ensureProUpgradeTable()
    const [requestRows] = await pool.query<ProUpgradeRow[]>(
      `SELECT id, user_id, full_name, email, sender_name, transfer_date, proof_file_name, notes, status, admin_note, approved_at, expires_at, created_at, updated_at
       FROM pro_upgrade_requests
       WHERE user_id = ? AND status = 'approved'
       ORDER BY COALESCE(expires_at, updated_at, created_at) DESC, id DESC
       LIMIT 1`,
      [user.id]
    )

    const request = requestRows[0]
    const expiry = getRequestExpiry(request)
    planExpiresAt = expiry ? expiry.toISOString() : null
  }

  return {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    plan,
    planExpiresAt,
    emailVerified: Boolean(user.email_verified)
  }
}

app.get('/api/auth/session', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const profile = await getUserProfileById(userId)
    if (!profile) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    return res.status(200).json({
      authenticated: true,
      user: profile
    })
  } catch (error) {
    logError('auth session error', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Failed to validate session') })
  }
})

app.get('/api/me', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const profile = await getUserProfileById(userId)
    if (!profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json({ user: profile })
  } catch (error) {
    logError('me error', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Failed to load profile') })
  }
})

app.post('/api/signup', async (req, res) => {
  try {
    await ensureUsersVerificationColumn()
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
      'INSERT INTO users (fullname, email, password_hash, email_verified) VALUES (?, ?, ?, ?)',
      [fullname, email, hash, 0]
    )

    return res.status(201).json({
      id: result.insertId,
      fullname,
      email,
      plan: getPlanForEmail(email),
      emailVerified: false
    })
  } catch (error) {
    logError('SIGNUP_ERROR', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Signup error') })
  }
})

app.get('/api/pro-upgrade/status', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await ensureProUpgradeTable()
    const [rows] = await pool.query<ProUpgradeRow[]>(
      `SELECT id, user_id, full_name, email, sender_name, transfer_date, proof_file_name, notes, status, admin_note, approved_at, expires_at, created_at, updated_at
       FROM pro_upgrade_requests
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    )

    const request = rows[0]
    if (!request) {
      return res.status(200).json({ request: null })
    }

    return res.status(200).json({
      request: {
        id: request.id,
        userId: request.user_id,
        fullName: request.full_name,
        email: request.email,
        senderName: request.sender_name,
        transferDate: typeof request.transfer_date === 'string'
          ? request.transfer_date
          : new Date(request.transfer_date).toISOString().slice(0, 10),
        proofFileName: request.proof_file_name,
        proofUrl: toProofUrl(request.proof_file_name),
        notes: request.notes,
        status: request.status,
        adminNote: request.admin_note,
        approvedAt: toIsoLike(request.approved_at),
        expiresAt: toIsoLike(request.expires_at),
        createdAt: request.created_at,
        updatedAt: request.updated_at
      }
    })
  } catch (error) {
    logError('pro upgrade status error', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Failed to load upgrade status') })
  }
})

app.post('/api/pro-upgrade', authMiddleware, proUpgradeUpload.single('proofFile'), async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const body = parsePayload<ProUpgradeBody>(req)
    const fullName = body.fullName?.trim() || ''
    const email = body.email?.trim() || ''
    const senderName = body.senderName?.trim() || ''
    const transferDate = body.transferDate?.trim() || ''
    const uploadedProofFile = req.file?.filename || null
    const proofFileName = uploadedProofFile || body.proofFileName?.trim() || body.fileName?.trim() || null
    const notes = body.notes?.trim() || null

    console.log(
      `[PRO_UPGRADE_HIT] userId=${userId} email=${email || '<missing>'} senderName=${senderName || '<missing>'} transferDate=${transferDate || '<missing>'} proofFileName=${proofFileName || '<missing>'}`
    )

    if (!fullName || !email || !senderName || !transferDate || !proofFileName) {
      return res.status(400).json({ error: 'Full name, email, sender name, transfer date, and proof file are required' })
    }

    await ensureProUpgradeTable()
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO pro_upgrade_requests
        (user_id, full_name, email, sender_name, transfer_date, proof_file_name, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, fullName, email, senderName, transferDate, proofFileName, notes, 'pending']
    )

    return res.status(201).json({
      id: result.insertId,
      status: 'pending',
      message: 'Bukti transfer diterima. Menunggu verifikasi manual.'
    })
  } catch (error) {
    logError('pro upgrade submit error', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Failed to submit upgrade request') })
  }
})

app.get('/api/admin/pro-upgrade-requests', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    await ensureProUpgradeTable()
    const [rows] = await pool.query<ProUpgradeRow[]>(
      `SELECT id, user_id, full_name, email, sender_name, transfer_date, proof_file_name, notes, status, admin_note, approved_at, expires_at, created_at, updated_at
       FROM pro_upgrade_requests
       ORDER BY created_at DESC`
    )

    return res.status(200).json({
      requests: rows.map((request) => ({
        id: request.id,
        userId: request.user_id,
        fullName: request.full_name,
        email: request.email,
        senderName: request.sender_name,
        transferDate:
          typeof request.transfer_date === 'string'
            ? request.transfer_date
            : new Date(request.transfer_date).toISOString().slice(0, 10),
        proofFileName: request.proof_file_name,
        proofUrl: toAdminProofUrl(request.id, request.proof_file_name),
        notes: request.notes,
        status: request.status,
        adminNote: request.admin_note,
        approvedAt: toIsoLike(request.approved_at),
        expiresAt: toIsoLike(request.expires_at),
        createdAt: request.created_at,
        updatedAt: request.updated_at
      }))
    })
  } catch (error) {
    logError('admin pro upgrade list error', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Failed to load Pro requests') })
  }
})

app.get('/api/admin/pro-upgrade-requests/:id/proof', authMiddleware, adminMiddleware, async (req: AdminRequest, res) => {
  try {
    await ensureProUpgradeTable()
    const requestId = Number(req.params.id)
    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request id' })
    }

    const [rows] = await pool.query<ProUpgradeRow[]>(
      `SELECT id, proof_file_name
       FROM pro_upgrade_requests
       WHERE id = ?
       LIMIT 1`,
      [requestId]
    )

    const request = rows[0]
    if (!request?.proof_file_name) {
      return res.status(404).json({ error: 'Proof file not found' })
    }

    const proofPath = path.join(proUpgradeProofsDir, request.proof_file_name)
    if (!fs.existsSync(proofPath)) {
      return res.status(404).json({ error: 'Stored proof file is missing' })
    }

    return res.sendFile(proofPath)
  } catch (error) {
    logError('admin pro proof error', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Failed to open proof file') })
  }
})

app.patch('/api/admin/pro-upgrade-requests/:id', authMiddleware, adminMiddleware, async (req: AdminRequest, res) => {
  try {
    await ensureProUpgradeTable()
    const requestId = Number(req.params.id)
    if (!requestId || Number.isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request id' })
    }

    const payload = parsePayload<{ status?: ProUpgradeStatus; adminNote?: string }>(req)
    const status = payload.status
    const adminNote = payload.adminNote?.trim() || null
    const markApproved = status === 'approved'

    if (!status || !['approved', 'rejected', 'pending', 'draft'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE pro_upgrade_requests
       SET status = ?,
           admin_note = ?,
           approved_at = ?,
           expires_at = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        status,
        adminNote,
        markApproved ? new Date() : null,
        markApproved ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        requestId
      ]
    )

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Request not found' })
    }

    return res.status(200).json({
      ok: true,
      id: requestId,
      status,
      adminNote,
      approvedAt: markApproved ? new Date().toISOString() : null,
      expiresAt: markApproved ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    })
  } catch (error) {
    logError('admin pro upgrade update error', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Failed to update Pro request') })
  }
})

app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    await ensureProUpgradeTable()

    const [[userCountRow]] = await pool.query<CountRow[]>('SELECT COUNT(*) AS total FROM users')
    const [[pendingRow]] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM pro_upgrade_requests WHERE status = 'pending'"
    )
    const [[approvedRow]] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM pro_upgrade_requests WHERE status = 'approved'"
    )
    const [[rejectedRow]] = await pool.query<CountRow[]>(
      "SELECT COUNT(*) AS total FROM pro_upgrade_requests WHERE status = 'rejected'"
    )

    const [recentUsers] = await pool.query<UserSummaryRow[]>(
      `SELECT id, fullname, email, created_at
       FROM users
       ORDER BY id DESC
       LIMIT 10`
    )

    const [recentRequests] = await pool.query<ProUpgradeRow[]>(
      `SELECT id, user_id, full_name, email, sender_name, transfer_date, proof_file_name, notes, status, admin_note, created_at, updated_at
       FROM pro_upgrade_requests
       ORDER BY id DESC
       LIMIT 10`
    )

    return res.status(200).json({
      totalUsers: Number(userCountRow?.total || 0),
      pendingProRequests: Number(pendingRow?.total || 0),
      approvedProRequests: Number(approvedRow?.total || 0),
      rejectedProRequests: Number(rejectedRow?.total || 0),
      recentUsers: recentUsers.map((user) => ({
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        createdAt: user.created_at
      })),
      recentRequests: recentRequests.map((request) => ({
        id: request.id,
        userId: request.user_id,
        fullName: request.full_name,
        email: request.email,
        senderName: request.sender_name,
        transferDate:
          typeof request.transfer_date === 'string'
            ? request.transfer_date
            : new Date(request.transfer_date).toISOString().slice(0, 10),
        proofFileName: request.proof_file_name,
        proofUrl: toAdminProofUrl(request.id, request.proof_file_name),
        notes: request.notes,
        status: request.status,
        adminNote: request.admin_note,
        createdAt: request.created_at,
        updatedAt: request.updated_at
      }))
    })
  } catch (error) {
    logError('admin stats error', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Failed to load admin stats') })
  }
})

app.get('/api/assets', authMiddleware, async (_req, res) => {
  try {
    const [rows] = await pool.query<AssetMasterRow[]>(
      `SELECT id, symbol, name, asset_type, region, provider, provider_symbol, quote_currency, display_order, is_active
       FROM assets_master
       WHERE is_active = 1
       ORDER BY display_order ASC, name ASC`
    )

    res.status(200).json({
      assets: rows.map((row) => ({
        id: row.id,
        symbol: row.symbol,
        name: row.name,
        assetType: row.asset_type,
        region: row.region,
        provider: row.provider,
        providerSymbol: row.provider_symbol,
        quoteCurrency: row.quote_currency
      }))
    })
  } catch (error) {
    logError('assets error', error)
    res.status(500).json({ error: getErrorMessage(error, 'Failed to load assets') })
  }
})

app.get('/api/portfolio/holdings', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const [rows] = await pool.query<HoldingRow[]>(
      `SELECT
         h.id,
         h.user_id,
         h.asset_id,
         h.quantity,
         h.entry_price,
         h.invested_amount,
         h.position_currency,
         h.notes,
         h.opened_at,
         h.is_active,
         a.symbol,
         a.name,
         a.asset_type,
         a.region,
         a.quote_currency
       FROM user_portfolio_holdings h
       INNER JOIN assets_master a ON a.id = h.asset_id
       WHERE h.user_id = ?
         AND h.is_active = 1
       ORDER BY h.created_at DESC`,
      [userId]
    )

    res.status(200).json({
      holdings: rows.map((row) => ({
        id: row.id,
        assetId: row.asset_id,
        symbol: row.symbol,
        name: row.name,
        assetType: row.asset_type,
        region: row.region,
        quantity: Number(row.quantity),
        entryPrice: Number(row.entry_price),
        investedAmount: Number(row.invested_amount),
        positionCurrency: row.position_currency || row.quote_currency,
        notes: row.notes,
        openedAt: row.opened_at
          ? new Date(row.opened_at).toISOString().slice(0, 10)
          : null
      }))
    })
  } catch (error) {
    logError('portfolio holdings error', error)
    res.status(500).json({ error: getErrorMessage(error, 'Failed to load holdings') })
  }
})

app.post('/api/portfolio/holdings', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const body = parsePayload<CreateHoldingBody>(req)
    const assetId = Number(body.assetId)
    const quantity = Number(body.quantity)
    const entryPrice = Number(body.entryPrice)
    const investedAmount =
      body.investedAmount !== undefined && body.investedAmount !== null
        ? Number(body.investedAmount)
        : quantity * entryPrice
    const positionCurrency = (body.positionCurrency || 'USD').trim().toUpperCase()
    const notes = body.notes?.trim() || null
    const openedAt = body.openedAt?.trim() || null

    if (!assetId || Number.isNaN(assetId)) {
      return res.status(400).json({ error: 'assetId is required' })
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be greater than 0' })
    }

    if (!Number.isFinite(entryPrice) || entryPrice < 0) {
      return res.status(400).json({ error: 'entryPrice must be 0 or greater' })
    }

    if (!Number.isFinite(investedAmount) || investedAmount < 0) {
      return res.status(400).json({ error: 'investedAmount must be 0 or greater' })
    }

    const [assetRows] = await pool.query<AssetMasterRow[]>(
      `SELECT id, symbol, name, asset_type, region, provider, provider_symbol, quote_currency, display_order, is_active
       FROM assets_master
       WHERE id = ?
         AND is_active = 1
       LIMIT 1`,
      [assetId]
    )

    const asset = assetRows[0]
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' })
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO user_portfolio_holdings
       (user_id, asset_id, quantity, entry_price, invested_amount, position_currency, notes, opened_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        assetId,
        quantity,
        entryPrice,
        investedAmount,
        positionCurrency || asset.quote_currency,
        notes,
        openedAt
      ]
    )

    res.status(201).json({
      id: result.insertId,
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      quantity,
      entryPrice,
      investedAmount,
      positionCurrency: positionCurrency || asset.quote_currency,
      notes,
      openedAt
    })
  } catch (error) {
    logError('create holding error', error)
    res.status(500).json({ error: getErrorMessage(error, 'Failed to create holding') })
  }
})

app.put('/api/portfolio/holdings/:id', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const holdingId = Number(req.params.id)
    if (!holdingId || Number.isNaN(holdingId)) {
      return res.status(400).json({ error: 'Invalid holding id' })
    }

    const body = parsePayload<UpdateHoldingBody>(req)
    const quantity = Number(body.quantity)
    const entryPrice = Number(body.entryPrice)
    const investedAmount =
      body.investedAmount !== undefined && body.investedAmount !== null
        ? Number(body.investedAmount)
        : quantity * entryPrice
    const positionCurrency = (body.positionCurrency || 'USD').trim().toUpperCase()
    const notes = body.notes?.trim() || null
    const openedAt = body.openedAt?.trim() || null

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'quantity must be greater than 0' })
    }

    if (!Number.isFinite(entryPrice) || entryPrice < 0) {
      return res.status(400).json({ error: 'entryPrice must be 0 or greater' })
    }

    if (!Number.isFinite(investedAmount) || investedAmount < 0) {
      return res.status(400).json({ error: 'investedAmount must be 0 or greater' })
    }

    const [holdingRows] = await pool.query<HoldingRow[]>(
      `SELECT
         h.id,
         h.user_id,
         h.asset_id,
         h.quantity,
         h.entry_price,
         h.invested_amount,
         h.position_currency,
         h.notes,
         h.opened_at,
         h.is_active,
         a.symbol,
         a.name,
         a.asset_type,
         a.region,
         a.quote_currency
       FROM user_portfolio_holdings h
       INNER JOIN assets_master a ON a.id = h.asset_id
       WHERE h.id = ?
         AND h.user_id = ?
         AND h.is_active = 1
       LIMIT 1`,
      [holdingId, userId]
    )

    const holding = holdingRows[0]
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' })
    }

    await pool.query<ResultSetHeader>(
      `UPDATE user_portfolio_holdings
       SET quantity = ?,
           entry_price = ?,
           invested_amount = ?,
           position_currency = ?,
           notes = ?,
           opened_at = ?
       WHERE id = ?
         AND user_id = ?
         AND is_active = 1`,
      [
        quantity,
        entryPrice,
        investedAmount,
        positionCurrency || holding.quote_currency,
        notes,
        openedAt,
        holdingId,
        userId
      ]
    )

    res.status(200).json({
      id: holdingId,
      assetId: holding.asset_id,
      symbol: holding.symbol,
      name: holding.name,
      quantity,
      entryPrice,
      investedAmount,
      positionCurrency: positionCurrency || holding.quote_currency,
      notes,
      openedAt
    })
  } catch (error) {
    logError('update holding error', error)
    res.status(500).json({ error: getErrorMessage(error, 'Failed to update holding') })
  }
})

app.delete('/api/portfolio/holdings/:id', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const holdingId = Number(req.params.id)
    if (!holdingId || Number.isNaN(holdingId)) {
      return res.status(400).json({ error: 'Invalid holding id' })
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user_portfolio_holdings
       SET is_active = 0
       WHERE id = ?
         AND user_id = ?
         AND is_active = 1`,
      [holdingId, userId]
    )

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Holding not found' })
    }

    res.status(200).json({ ok: true, id: holdingId })
  } catch (error) {
    logError('delete holding error', error)
    res.status(500).json({ error: getErrorMessage(error, 'Failed to delete holding') })
  }
})

app.get('/api/portfolio/summary', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const plan = await getRequestPlan(req.user)
    const displayCurrency = getPortfolioDisplayCurrency()

    const [rows] = await pool.query<HoldingSummaryRow[]>(
      `SELECT
         h.id,
         h.asset_id,
         h.quantity,
         h.entry_price,
         h.invested_amount,
         h.position_currency,
         h.notes,
         h.opened_at,
         a.symbol,
         a.name,
         a.asset_type,
         a.region,
         a.quote_currency,
         p.latest_price,
         p.price_change,
         p.price_change_pct,
         p.trend,
         p.fetched_at
       FROM user_portfolio_holdings h
       INNER JOIN assets_master a ON a.id = h.asset_id
       LEFT JOIN portfolio_price_cache p ON p.asset_id = h.asset_id
       WHERE h.user_id = ?
         AND h.is_active = 1
       ORDER BY h.created_at DESC`,
      [userId]
    )

    const holdings = await Promise.all(rows.map(async (row) => {
      const quantity = Number(row.quantity)
      const entryPrice = Number(row.entry_price)
      const investedAmount = Number(row.invested_amount)
      const entryCurrency = (row.position_currency || row.quote_currency || displayCurrency).toUpperCase()
      const quoteCurrency = (row.quote_currency || displayCurrency).toUpperCase()
      const latestPrice =
        row.latest_price === null || row.latest_price === undefined
          ? null
          : Number(row.latest_price)
      const entryFx = await getFxRate(entryCurrency, displayCurrency)
      const quoteFx = await getFxRate(quoteCurrency, displayCurrency)
      const investedAmountDisplay =
        entryFx.rate !== null ? investedAmount * entryFx.rate : null
      const currentValue =
        latestPrice !== null && quoteFx.rate !== null ? quantity * latestPrice * quoteFx.rate : null
      const pnl =
        currentValue !== null && investedAmountDisplay !== null ? currentValue - investedAmountDisplay : null
      const fxStatus =
        quoteFx.meta.source === 'unavailable' || entryFx.meta.source === 'unavailable'
          ? 'unavailable'
          : quoteFx.meta.source === 'last_known' || entryFx.meta.source === 'last_known'
            ? 'fallback'
            : 'live'
      const pnlPctRaw =
        pnl === null || investedAmountDisplay === null || investedAmountDisplay <= 0
          ? null
          : (pnl / investedAmountDisplay) * 100
      const pnlPct = isHealthyPnlBasis({
        investedAmountDisplay,
        currentValue,
        pnlPctRaw,
        fxStatus
      })
        ? pnlPctRaw
        : null
      const dayChange =
        row.price_change === null || quoteFx.rate === null ? null : Number(row.price_change) * quoteFx.rate

      return {
        id: row.id,
        assetId: row.asset_id,
        symbol: row.symbol,
        name: row.name,
        assetType: row.asset_type,
        region: row.region,
        quantity,
        entryPrice,
        investedAmount,
        latestPrice,
        entryCurrency,
        quoteCurrency,
        displayCurrency,
        investedAmountDisplay,
        currentValue,
        pnl,
        pnlPct,
        dayChange,
        dayChangePct: row.price_change_pct === null ? null : Number(row.price_change_pct),
        trend: row.trend || (pnl === null ? 'flat' : pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'flat'),
        fxStatus,
        fetchedAt: row.fetched_at ? new Date(row.fetched_at).toISOString() : null,
        notes: row.notes,
        openedAt: row.opened_at ? new Date(row.opened_at).toISOString().slice(0, 10) : null
      }
    }))

    const totals = holdings.reduce(
      (acc, row) => {
        if (row.investedAmountDisplay !== null && row.investedAmountDisplay !== undefined) {
          acc.totalInvested += row.investedAmountDisplay
        }
        if (row.currentValue !== null) {
          acc.totalCurrentValue += row.currentValue
        }
        return acc
      },
      { totalInvested: 0, totalCurrentValue: 0 }
    )

    const totalPnl = totals.totalCurrentValue - totals.totalInvested
    const totalPnlPct =
      totals.totalInvested > 0 ? (totalPnl / totals.totalInvested) * 100 : null
    const responseHoldings = plan === 'pro' ? holdings : holdings.slice(0, 2)

    res.status(200).json({
      summary: {
        totalInvested: totals.totalInvested,
        totalCurrentValue: totals.totalCurrentValue,
        totalPnl,
        totalPnlPct,
        totalHoldings: holdings.length,
        displayCurrency
      },
      holdings: responseHoldings,
      accessLevel: plan,
      isPreview: plan !== 'pro'
    })
  } catch (error) {
    logError('portfolio summary error', error)
    res.status(500).json({ error: getErrorMessage(error, 'Failed to load portfolio summary') })
  }
})

app.post('/api/ting-ai/refine', authMiddleware, async (req: RequestWithUser, res) => {
  const startedAt = Date.now()
  try {
    const payload = parsePayload<{ rawInsight?: Partial<TingRawInsight> }>(req)
    const normalizedRaw = normalizeInsight(payload.rawInsight || {})
    const refined = await refineInsightWithLLM(normalizedRaw)
    return res.status(200).json({ insight: refined })
  } catch (error) {
    logError('ting ai refine error', error)
    const fallback = normalizeInsight({})
    return res.status(200).json({
      insight: {
        ...fallback,
        providerStatus: {
          used: 'local',
          fallbackDepth: 4,
          durationMs: Date.now() - startedAt,
          failures: [
            {
              provider: 'gemini',
              reason: getErrorMessage(error, 'Refinement failed before provider orchestration'),
              durationMs: Date.now() - startedAt
            }
          ]
        }
      }
    })
  }
})

app.post('/api/portfolio/refresh-prices', authMiddleware, async (_req: RequestWithUser, res) => {
  try {
    const result = await runPortfolioPriceRefresh('manual')
    refreshScheduleState.lastRun = result
    refreshScheduleState.lastError = null
    res.status(200).json(result)
  } catch (error) {
    logError('portfolio refresh prices error', error)
    res.status(500).json({ error: getErrorMessage(error, 'Failed to refresh portfolio prices') })
  }
})

app.get('/api/portfolio/refresh-prices/status', authMiddleware, async (_req: RequestWithUser, res) => {
  res.status(200).json({
    scheduler: {
      enabled: refreshScheduleState.enabled,
      intervalMs: refreshScheduleState.intervalMs,
      runOnStartup: refreshScheduleState.runOnStartup,
      isRunning: refreshScheduleState.isRunning,
      lastError: refreshScheduleState.lastError
    },
    lastRun: refreshScheduleState.lastRun
  })
})

app.post('/api/login', async (req, res) => {
  try {
    await ensureUsersVerificationColumn()
    const { email, password } = parsePayload<AuthBody>(req)
    console.log(`[LOGIN_HIT] ${new Date().toISOString()} email=${email || '<missing>'}`)
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, fullname, email, password_hash, email_verified FROM users WHERE email = ? LIMIT 1',
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
      { id: user.id, fullname: user.fullname, email: user.email, emailVerified: Boolean(user.email_verified) },
      process.env.JWT_SECRET || 'dev-secret-change',
      { expiresIn: '12h' }
    )

    const plan = await getEffectivePlan({ userId: user.id, email: user.email })

    return res.status(200).json({
      token,
      user: { id: user.id, fullname: user.fullname, email: user.email, plan, emailVerified: Boolean(user.email_verified) }
    })
  } catch (error) {
    logError('LOGIN_ERROR', error)
    return res.status(500).json({ error: getErrorMessage(error, 'Auth error') })
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
      console.warn('Forgot password requested but email transport is not configured')
      return res.status(200).json({ ok: true })
    }

    const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset?email=${encodeURIComponent(
      user.email
    )}&token=${token}`

    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'Ting AI <no-reply@tingai.local>',
      to: user.email,
      subject: 'Reset Password Ting AI',
      html: `<p>Hi ${user.fullname},</p><p>Klik link ini untuk reset password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Link berlaku 30 menit.</p>`
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Forgot password error' })
  }
})

app.post('/api/auth/email-verification/request', authMiddleware, async (req: RequestWithUser, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    await ensureUsersVerificationColumn()
    const [rows] = await pool.query<UserRow[]>(
      'SELECT id, fullname, email, password_hash, email_verified FROM users WHERE id = ? LIMIT 1',
      [userId]
    )
    const user = rows[0]
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (Boolean(user.email_verified)) {
      return res.status(200).json({ ok: true, emailVerified: true, message: 'Email kamu sudah terverifikasi.' })
    }

    const transport = mailTransport()
    if (!transport) {
      return res.status(200).json({
        ok: true,
        emailVerified: false,
        message: 'Jika email terdaftar, instruksi verifikasi akan dikirim.'
      })
    }

    const verificationUrl = `${process.env.APP_URL || 'http://localhost:5173'}/profile?verification=ready`

    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'Ting AI <no-reply@tingai.local>',
      to: user.email,
      subject: 'Verifikasi Email Ting AI',
      html: `<p>Hi ${user.fullname},</p><p>Klik link ini untuk meninjau status verifikasi akun:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`
    })

    return res.status(200).json({
      ok: true,
      emailVerified: false,
      message: 'Jika email terdaftar, instruksi verifikasi akan dikirim.'
    })
  } catch (error) {
    return res.status(200).json({
      ok: true,
      emailVerified: false,
      message: 'Jika email terdaftar, instruksi verifikasi akan dikirim.'
    })
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
      return res.status(400).json({ error: 'Link reset tidak valid atau sudah kedaluwarsa' })
    }

    await ensureResetTable()
    const tokenHash = hashToken(token)
    const [resets] = await pool.query<ResetRow[]>(
      'SELECT id, expires_at FROM password_resets WHERE user_id = ? AND token_hash = ? ORDER BY id DESC LIMIT 1',
      [user.id, tokenHash]
    )
    const reset = resets[0]
    if (!reset) {
      return res.status(400).json({ error: 'Link reset tidak valid atau sudah kedaluwarsa' })
    }
    if (new Date(reset.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Link reset tidak valid atau sudah kedaluwarsa' })
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, user.id])
    await pool.query('DELETE FROM password_resets WHERE user_id = ?', [user.id])

    return res.status(200).json({ ok: true })
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Reset error' })
  }
})

app.get('/api/investment-summary', async (_req, res) => {
  try {
    const plan = await getRequestPlan(getOptionalAuthUser(_req))
    const result = await getInvestmentSummary()
    if (plan === 'pro') {
      return res.status(200).json({
        summary: result.summary,
        meta: result.meta,
        accessLevel: 'pro',
        isPreview: false,
        previewNote: null
      })
    }

    const preview = getFreeInvestmentSummaryPreview(result.summary, result.meta)
    return res.status(200).json({
      summary: preview.summary,
      meta: preview.meta,
      accessLevel: 'free',
      isPreview: true,
      previewNote: 'Free preview shows a condensed market brief. Pro unlocks the full briefing layer.'
    })
  } catch (error) {
    res.status(503).json({
      summary: 'Maaf, layanan sedang tidak tersedia. Coba lagi beberapa saat.',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

app.get('/api/market/sp500', async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 120)
    const result = await fetchSp500Series(days)
    res.status(200).json(result)
  } catch (error) {
    if (lastGood.sp500Daily) {
      return res.status(200).json({ data: lastGood.sp500Daily, source: 'cache', fallback: 'cached' })
    }
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Market data unavailable'
    })
  }
})

app.get('/api/market/gold', async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 120)
    const data = await fetchMarketSeriesFromDb('XAUUSD', days)
    if (!data.length) {
      const fallbackResult = await buildGoldSpotFallbackSeries()
      return res.status(200).json(fallbackResult)
    }
    res.status(200).json({
      data,
      source: 'database',
      note: data.length ? '' : 'GOLD (XAU/USD) candle data is not available in the database yet.'
    })
  } catch (error) {
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Market data unavailable'
    })
  }
})

app.get('/api/market/btc', async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 120)
    const data = await fetchBtcDaily(days)
    res.status(200).json({ data, source: 'coingecko' })
  } catch (error) {
    if (lastGood.btcDaily) {
      return res.status(200).json({ data: lastGood.btcDaily, source: 'cache', fallback: 'cached' })
    }
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Market data unavailable'
    })
  }
})

app.get('/api/market/ihsg', async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days || 30), 1), 120)
    const dbData = await fetchMarketSeriesFromDb('IHSG', days)

    if (dbData.length) {
      return res.status(200).json({ data: dbData, source: 'database' })
    }

    const yahooData = await fetchYahooSeries('^JKSE', days)
    return res.status(200).json({
      data: yahooData,
      source: 'yahoo-finance',
      fallback: 'external',
      note: 'Data candle IHSG saat ini memakai fallback Yahoo Finance.'
    })
  } catch (error) {
    res.status(503).json({
      error: error instanceof Error ? error.message : 'Market data unavailable'
    })
  }
})

const detectPreferredLanguage = (messages: AiMessage[]) => {
  const lastUserMessage =
    messages
      .slice()
      .reverse()
      .find((message) => message.role === 'user')
      ?.content?.toLowerCase() || ''

  const indonesianHints = [
    'apa',
    'bagaimana',
    'kenapa',
    'tolong',
    'saya',
    'portfolio saya',
    'portofolio saya',
    'yang perlu',
    'emas',
    'saham',
    'pasar',
    'ringkas',
    'bahasa indonesia'
  ]

  return indonesianHints.some((hint) => lastUserMessage.includes(hint)) ? 'id' : 'en'
}

const getLastUserMessage = (messages: AiMessage[]) =>
  messages
    .slice()
    .reverse()
    .find((message) => message.role === 'user')
    ?.content?.toLowerCase() || ''

const getPreviousUserMessage = (messages: AiMessage[]) => {
  const userMessages = messages.filter((message) => message.role === 'user')
  if (userMessages.length < 2) return ''
  return userMessages[userMessages.length - 2]?.content?.toLowerCase() || ''
}

const getRecentUserMessages = (messages: AiMessage[], count = 3) =>
  messages
    .filter((message) => message.role === 'user')
    .slice(-count)
    .map((message) => message.content?.toLowerCase() || '')

const isIdentityQuestion = (text: string) =>
  text.includes('siapa anda') ||
  text.includes('siapa kamu') ||
  text.includes('who are you') ||
  text.includes('what are you') ||
  text.includes('kamu siapa') ||
  text.includes('anda siapa') ||
  text.includes('halo kiting ai') ||
  text.includes('hi kiting ai') ||
  text.includes('hello kiting ai') ||
  text.includes('halo ting ai') ||
  text.includes('hi ting ai') ||
  text.includes('hello ting ai') ||
  (text.includes('ting ai') &&
    (text.includes('siapa') ||
      text.includes('apa itu') ||
      text.includes('what is') ||
      text.includes('who is') ||
      text.includes('identity')))

const isNamingQuestion = (text: string) =>
  text.includes('kiting ai') ||
  (text.includes('ting ai') &&
    (text.includes('kiting ai') ||
      text.includes('plesetan') ||
      text.includes('singkatan') ||
      text.includes('kepanjangan') ||
      text.includes('nama lengkap') ||
      text.includes('full form') ||
      text.includes('stands for'))) ||
  text.includes('asal nama ting ai')

const isGreetingOnly = (text: string) => {
  const normalized = text.trim()
  return [
    'halo',
    'hi',
    'hello',
    'hai',
    'pagi',
    'siang',
    'sore',
    'malam',
    'halo ting ai',
    'hi ting ai',
    'hello ting ai',
    'halo kiting ai',
    'hi kiting ai',
    'hello kiting ai'
  ].includes(normalized)
}

const isMarketQuestion = (text: string) =>
  [
    'emas',
    'gold',
    'xau',
    'xauusd',
    'antam',
    'btc',
    'bitcoin',
    'sp500',
    's&p',
    'spy',
    'yield',
    'dollar',
    'uup',
    'us10y',
    'macro',
    'market',
    'pasar',
    'risk tone',
    'stress state',
    'stress',
    'portfolio',
    'portofolio',
    'regime',
    'conviction',
    'headline',
    'watch',
    'brief',
    'ringkas',
    'investasi',
    'saham',
    'equities',
    'ihsg',
    'idx',
    'jci',
    'jakarta composite',
    'index saham indo',
    'index saham indonesia',
    'saham indonesia',
    'pasar indonesia'
  ].some((keyword) => text.includes(keyword))

const isAmbiguousMarketQuestion = (text: string) => {
  if (!isMarketQuestion(text)) return false

  const broadMarketPhrases = [
    'sentimen pasar global',
    'sentimen global',
    'market global',
    'pasar global',
    'kondisi market',
    'kondisi pasar',
    'bagaimana market',
    'bagaimana pasar',
    'bagaimana kedepannya',
    'bagaimana ke depannya',
    'gimana kedepannya',
    'gimana ke depannya',
    'outlook market',
    'outlook pasar',
    'secara umum',
    'in general',
    'overall'
  ]

  const hasBroadPhrase = broadMarketPhrases.some((phrase) => text.includes(phrase))
  const hasSpecificAnchor =
    text.includes('emas') ||
    text.includes('gold') ||
    text.includes('xau') ||
    text.includes('btc') ||
    text.includes('bitcoin') ||
    text.includes('sp500') ||
    text.includes('s&p') ||
    text.includes('ihsg') ||
    text.includes('idx') ||
    text.includes('jci') ||
    text.includes('uup') ||
    text.includes('us10y') ||
    text.includes('portfolio') ||
    text.includes('portofolio') ||
    text.includes('crypto') ||
    text.includes('kripto') ||
    text.includes('saham')

  return hasBroadPhrase && !hasSpecificAnchor
}

const shouldInjectMarketContext = (text: string) =>
  isMarketQuestion(text) && !isAmbiguousMarketQuestion(text)

const detectIntentLabel = (text: string, previousUserMessage = '', recentUserMessages: string[] = []) => {
  if (isGreetingOnly(text)) return 'greeting'
  if (isIdentityQuestion(text)) return 'identity'
  if (isNamingQuestion(text)) return 'naming'
  if (isAmbiguousMarketQuestion(text)) return 'ambiguous_market'
  if (isCompareAssetsFollowUp(text, previousUserMessage, recentUserMessages)) return 'compare_assets_followup'
  if (isCompareAssetsQuestion(text)) return 'compare_assets'
  if (
    text.includes('portfolio') ||
    text.includes('portofolio') ||
    text.includes('holding') ||
    text.includes('exposure') ||
    text.includes('konsentrasi')
  ) {
    return 'portfolio'
  }
  if (
    text.includes('emas') ||
    text.includes('gold') ||
    text.includes('xau') ||
    text.includes('btc') ||
    text.includes('bitcoin') ||
    text.includes('sp500') ||
    text.includes('s&p') ||
    text.includes('ihsg') ||
    text.includes('idx') ||
    text.includes('jci')
  ) {
    return 'asset'
  }
  if (isMarketQuestion(text)) return 'market'
  if (!text.trim()) return 'empty'
  return 'other'
}

const buildClarificationReply = (preferredLanguage: 'id' | 'en') =>
  preferredLanguage === 'id'
    ? 'Cakupan pertanyaan ini masih terlalu luas. Anda ingin saya fokus ke makro seperti US10Y dan dolar, ke saham/global equities, atau ke aset spesifik seperti BTC dan emas?'
    : 'That question is still too broad. Do you want me to focus on macro indicators such as US10Y and the dollar, on global equities, or on specific assets such as BTC and gold?'

const mentionsUsdCash = (text: string) =>
  text.includes(' usd') ||
  text.startsWith('usd') ||
  text.includes('/usd') ||
  text.includes('dollar') ||
  text.includes('cash')

const isCompareAssetsQuestion = (text: string) => {
  const compareSeparators = text.includes('/') || text.includes(' vs ') || text.includes(' atau ')
  const compareCue =
    text.includes('lebih baik mana') ||
    text.includes('mending mana') ||
    text.includes('pilih mana') ||
    text.includes('better to hold') ||
    text.includes('better choice') ||
    text.includes('which is better')

  const assetMentions = [
    text.includes('btc') || text.includes('bitcoin'),
    text.includes('emas') || text.includes('gold') || text.includes('xau'),
    mentionsUsdCash(text),
    text.includes('sp500') || text.includes('s&p'),
    text.includes('ihsg') || text.includes('idx') || text.includes('jci')
  ].filter(Boolean).length

  return assetMentions >= 2 && (compareSeparators || compareCue)
}

const isCompareAssetsFollowUp = (
  text: string,
  previousUserMessage: string,
  recentUserMessages: string[] = []
) => {
  const normalized = text.trim()
  const shortFollowUps = [
    'boleh bandingkan',
    'bandingkan',
    'tolong bandingkan',
    'lanjut bandingkan',
    'compare',
    'please compare',
    'go ahead',
    'lanjut',
    'jelaskan',
    'boleh'
  ]

  const recentCompareContext = [previousUserMessage, ...recentUserMessages].some((message) =>
    isCompareAssetsQuestion(message)
  )

  return shortFollowUps.includes(normalized) && recentCompareContext
}

const isAssetSpecificQuestion = (text: string) =>
  [
    'emas',
    'gold',
    'xau',
    'xauusd',
    'antam',
    'btc',
    'bitcoin',
    'sp500',
    's&p',
    'ihsg',
    'idx',
    'jci',
    'usd',
    'dollar',
    'cash',
    'uup',
    'us10y'
  ].some((keyword) => text.includes(keyword))

const hasReliableAssetContext = (text: string, meta?: AiChatBody['meta']) => {
  const instruments = meta?.instruments

  if (text.includes('emas') || text.includes('gold') || text.includes('xau') || text.includes('antam')) {
    return Boolean(instruments?.ANTAM && !instruments.ANTAM.error && instruments.ANTAM.latestPrice)
  }

  if (text.includes('sp500') || text.includes('s&p')) {
    return Boolean(instruments?.SP500 && !instruments.SP500.error && instruments.SP500.latestPrice)
  }

  if (text.includes('btc') || text.includes('bitcoin')) {
    return Boolean(instruments?.BTC && !instruments.BTC.error && instruments.BTC.latestPrice)
  }

  if (
    text.includes('ihsg') ||
    text.includes('idx') ||
    text.includes('jci') ||
    mentionsUsdCash(text) ||
    text.includes('uup') ||
    text.includes('us10y')
  ) {
    return Boolean(
      (instruments?.IHSG && !instruments.IHSG.error && instruments.IHSG.latestPrice) ||
      meta?.context ||
      meta?.briefing?.length
    )
  }

  return Boolean(meta?.context || meta?.briefing?.length || instruments)
}

const buildAssetContextGuardReply = (preferredLanguage: 'id' | 'en') =>
  preferredLanguage === 'id'
    ? 'Saya belum punya context live yang cukup kuat untuk menjawab aset itu dengan yakin saat ini. Jika Anda ingin, saya bisa bantu dari market brief terakhir yang tersedia, atau Anda bisa sebutkan aset/fokusnya lebih spesifik.'
    : 'I do not have enough reliable live context to answer that asset question confidently right now. If useful, I can answer from the latest available market brief, or you can narrow the asset or angle more specifically.'

const buildCompareAssetsReply = (preferredLanguage: 'id' | 'en') =>
  preferredLanguage === 'id'
    ? 'Jika yang Anda maksud adalah membandingkan BTC, cash USD, dan emas, maka pilihannya tergantung tujuan. Untuk defensif jangka pendek, cash USD atau emas biasanya lebih stabil. Untuk potensi upside dengan risiko lebih tinggi, BTC lebih agresif. Jika Anda mau, saya bisa bandingkan ketiganya dari sisi defensif, momentum, atau kecocokannya dengan portofolio Anda.'
    : 'If you mean comparing BTC, USD cash, and gold, the better choice depends on your goal. For short-term defense, USD cash or gold is usually more stable. For higher-upside but higher-risk exposure, BTC is more aggressive. If useful, I can compare the three from a defensive, momentum, or portfolio-fit angle.'

const shouldReturnClarification = (text: string) =>
  !text ||
  (!isGreetingOnly(text) &&
    !isIdentityQuestion(text) &&
    !isNamingQuestion(text) &&
    !isMarketQuestion(text))

const buildAiFallbackReply = (
  messages: AiMessage[],
  summary?: string,
  meta?: AiChatBody['meta'],
  reason: 'provider_unavailable' | 'invalid_payload' = 'provider_unavailable'
) => {
  const baseReply = buildLocalReply(messages, summary, meta)
  const preferredLanguage = detectPreferredLanguage(messages)

  if (reason === 'invalid_payload') {
    return preferredLanguage === 'id'
      ? `Format permintaan AI tidak lengkap. ${baseReply}`
      : `The AI request format is incomplete. ${baseReply}`
  }

  return preferredLanguage === 'id'
    ? `Koneksi ke live AI sedang terganggu. Berdasarkan konteks terakhir yang tersedia, ${baseReply.charAt(0).toLowerCase()}${baseReply.slice(1)}`
    : `The live AI connection is unstable right now. Based on the latest available context, ${baseReply.charAt(0).toLowerCase()}${baseReply.slice(1)}`
}

const logAiTelemetry = (payload: {
  intent: string
  providerRequested: string
  providerUsed: string
  durationMs: number
  fallbackUsed: boolean
  hasMarketContext: boolean
  hasPortfolioContext: boolean
}) => {
  const {
    intent,
    providerRequested,
    providerUsed,
    durationMs,
    fallbackUsed,
    hasMarketContext,
    hasPortfolioContext
  } = payload

  console.log(
    `[AI_CHAT] [INTENT:${intent}] [PROVIDER_REQUESTED:${providerRequested}] [PROVIDER_USED:${providerUsed}] [TIME_TAKEN:${durationMs}ms] [FALLBACK_USED:${fallbackUsed}] [MARKET_CONTEXT:${hasMarketContext}] [PORTFOLIO_CONTEXT:${hasPortfolioContext}]`
  )
}

const buildGroqMessages = (
  messagesWithContext: AiMessage[],
  marketBriefContext: string | null,
  portfolioContext: string | null
) => {
  const groqMessages = [
    { role: 'system', content: tingAiSystemPrompt },
    ...messagesWithContext.filter((message) => message.role !== 'system')
  ]

  if (marketBriefContext) {
    groqMessages[0].content += `\n\n${marketBriefContext}`
  }
  if (portfolioContext) {
    groqMessages[0].content += `\n\n${portfolioContext}`
  }

  return groqMessages
}

const buildGeminiMessages = (
  messages: AiMessage[],
  marketBriefContext: string | null,
  portfolioContext: string | null
) => {
  const geminiMessages = [...messages]
  if (marketBriefContext) {
    geminiMessages.unshift({ role: 'system', content: marketBriefContext })
  }
  if (portfolioContext) {
    geminiMessages.unshift({ role: 'system', content: portfolioContext })
  }
  geminiMessages.unshift({ role: 'system', content: tingAiSystemPrompt })
  return geminiMessages
}

const buildLocalReply = (
  messages: AiMessage[],
  summary?: string,
  meta?: AiChatBody['meta']
) => {
  const last = getLastUserMessage(messages)
  const previousUserMessage = getPreviousUserMessage(messages)
  const recentUserMessages = getRecentUserMessages(messages)
  const preferredLanguage = detectPreferredLanguage(messages)
  if (isAmbiguousMarketQuestion(last)) {
    return buildClarificationReply(preferredLanguage)
  }
  if (isCompareAssetsFollowUp(last, previousUserMessage, recentUserMessages)) {
    return buildCompareAssetsReply(preferredLanguage)
  }
  if (isCompareAssetsQuestion(last)) {
    return buildCompareAssetsReply(preferredLanguage)
  }
  if (isAssetSpecificQuestion(last) && !hasReliableAssetContext(last, meta)) {
    return buildAssetContextGuardReply(preferredLanguage)
  }

  const asksAboutGold =
    last.includes('antam') ||
    last.includes('emas') ||
    last.includes('gold') ||
    last.includes('xau') ||
    last.includes('xauusd') ||
    last.includes('harga emas')
  const asksAboutIndonesiaEquities =
    last.includes('ihsg') ||
    last.includes('idx') ||
    last.includes('jci') ||
    last.includes('jakarta composite') ||
    last.includes('index saham indo') ||
    last.includes('index saham indonesia') ||
    last.includes('saham indonesia') ||
    last.includes('pasar indonesia')
  const asksAboutIndonesiaGeopolitics =
    (last.includes('geopolitik indonesia') ||
      last.includes('politik indonesia') ||
      last.includes('indonesia aman')) &&
    !last.includes('portfolio') &&
    !last.includes('portofolio')

  if (asksAboutGold) {
    const antam = meta?.instruments?.ANTAM
    if (!antam || antam.error) {
      return preferredLanguage === 'id'
        ? 'Data GOLD belum tersedia saat ini.'
        : 'GOLD data is not available right now.'
    }
    return preferredLanguage === 'id'
      ? `Emas saat ini ${idrFormatter.format(antam.latestPrice ?? 0)} per gram, dengan perubahan ${signedIdr(antam.delta ?? 0)} (${signedPercent(antam.pct ?? 0)}) pada ${antam.latestDate}.`
      : `Gold is currently ${idrFormatter.format(antam.latestPrice ?? 0)} per gram, with a move of ${signedIdr(antam.delta ?? 0)} (${signedPercent(antam.pct ?? 0)}) on ${antam.latestDate}.`
  }

  if (asksAboutIndonesiaEquities) {
    const ihsg = meta?.instruments?.IHSG
    const sp500 = meta?.instruments?.SP500
    if (ihsg && !ihsg.error) {
      return preferredLanguage === 'id'
        ? `IHSG terakhir ${usNumberFormatter.format(ihsg.latestPrice ?? 0)}, dengan perubahan ${signedPoints(ihsg.delta ?? 0)} (${signedPercent(ihsg.pct ?? 0)}) pada ${ihsg.latestDate}. Ini memberi pembacaan langsung untuk sentimen saham Indonesia.`
        : `IHSG last printed ${usNumberFormatter.format(ihsg.latestPrice ?? 0)}, with a move of ${signedPoints(ihsg.delta ?? 0)} (${signedPercent(ihsg.pct ?? 0)}) on ${ihsg.latestDate}. That gives a direct read on Indonesian equity sentiment.`
    }
    if (preferredLanguage === 'id') {
      return sp500 && !sp500.error
        ? `Saya belum punya feed IHSG langsung di layer ini. Untuk sekarang saya hanya punya proxy US equities melalui SP500 yang terakhir bergerak ${signedPoints(sp500.delta ?? 0)} (${signedPercent(sp500.pct ?? 0)}) pada ${sp500.latestDate}. Jika Anda ingin, saya bisa bantu jelaskan implikasinya untuk sentimen saham Indonesia secara umum.`
        : 'Saya belum punya feed IHSG langsung di layer ini. Jika Anda ingin, tanyakan konteks saham Indonesia secara lebih spesifik atau hubungkan ke market brief saat ini.'
    }

    return sp500 && !sp500.error
      ? `I do not have a direct IHSG feed in this layer yet. For now I only have a US equity proxy through the SP500, which last moved ${signedPoints(sp500.delta ?? 0)} (${signedPercent(sp500.pct ?? 0)}) on ${sp500.latestDate}. If useful, I can still explain what that may imply for Indonesian equity sentiment more broadly.`
      : 'I do not have a direct IHSG feed in this layer yet. If useful, ask about Indonesian equities more specifically or tie the question to the current market brief.'
  }

  if (asksAboutIndonesiaGeopolitics) {
    return preferredLanguage === 'id'
      ? 'Saya belum punya layer geopolitik Indonesia yang cukup spesifik untuk menilai apakah situasinya aman atau tidak. Kalau mau, saya bisa bantu dari sudut dampaknya ke pasar, saham Indonesia, emas, atau portofolio.'
      : 'I do not have a dedicated Indonesia geopolitical layer yet, so I cannot judge whether the situation is safe or not with confidence. If useful, I can still help frame the market impact on Indonesian equities, gold, or portfolio risk.'
  }

  if (isIdentityQuestion(last)) {
    return preferredLanguage === 'id'
      ? 'Saya Ting AI, asisten digital di dashboard ini. Ting AI di sini dimaknai sebagai Kiting AI.'
      : 'I am Ting AI, the digital assistant inside this dashboard. Here, Ting AI is treated as Kiting AI.'
  }

  if (isGreetingOnly(last)) {
    return preferredLanguage === 'id'
      ? 'Halo. Saya Ting AI. Kalau Anda ingin, Anda bisa tanya soal emas, BTC, market brief, stress state, atau portofolio.'
      : 'Hello. I am Ting AI. You can ask about gold, BTC, the market brief, stress state, or portfolio implications.'
  }

  if (last.includes('kiting ai')) {
    return preferredLanguage === 'id'
      ? 'Saya Ting AI. Di produk ini, Ting AI dimaknai sebagai Kiting AI.'
      : 'I am Ting AI. In this product, Ting AI is treated as Kiting AI.'
  }

  if (last.includes('ting ai') && (last.includes('kiting ai') || last.includes('plesetan') || last.includes('nama lengkap'))) {
    return preferredLanguage === 'id'
      ? 'Ya. Di produk ini, Ting AI dimaknai sebagai Kiting AI.'
      : 'Yes. In this product, Ting AI is treated as Kiting AI.'
  }

  if (last.includes('s&p') || last.includes('sp500')) {
    const sp500 = meta?.instruments?.SP500
    if (!sp500 || sp500.error) {
      return preferredLanguage === 'id'
        ? 'Data S&P 500 belum tersedia saat ini.'
        : 'S&P 500 data is not available right now.'
    }
    return preferredLanguage === 'id'
      ? `S&P 500 terakhir ${usNumberFormatter.format(sp500.latestPrice ?? 0)}, dengan perubahan ${signedPoints(sp500.delta ?? 0)} (${signedPercent(sp500.pct ?? 0)}) pada ${sp500.latestDate}.`
      : `The S&P 500 last printed ${usNumberFormatter.format(sp500.latestPrice ?? 0)}, with a move of ${signedPoints(sp500.delta ?? 0)} (${signedPercent(sp500.pct ?? 0)}) on ${sp500.latestDate}.`
  }

  if (
    last.includes('risk tone') ||
    last.includes('stress state') ||
    last.includes('macro pressure') ||
    last.includes('portfolio') ||
    last.includes('dampak') ||
    last.includes('stress')
  ) {
    const context = meta?.context
    if (context) {
      const topWatch = context.watchItems?.[0]?.detail || ''
      if (preferredLanguage === 'id') {
        return `Risk tone saat ini ${context.riskTone.toLowerCase()} dengan regime ${context.regime.toLowerCase()} dan stress state ${context.stressState.toLowerCase()}. Implikasi utamanya: pengguna sebaiknya membaca tekanan makro dan konfirmasi lintas aset sebelum menambah risk. ${topWatch}`.trim()
      }

      return `The current market read is ${context.riskTone.toLowerCase()}, with ${context.regime.toLowerCase()} and ${context.stressState.toLowerCase()}. The main implication is that users should demand cross-asset confirmation before adding risk. ${topWatch}`.trim()
    }
  }

  if (last.includes('ting ai') && (last.includes('kiting ai') || last.includes('plesetan'))) {
    return preferredLanguage === 'id'
      ? 'Ya. Dalam konteks produk ini, Ting AI dimaknai sebagai Kiting AI.'
      : 'Yes. In this product context, Ting AI is treated as Kiting AI.'
  }

  if (last.includes('ting ai') && (last.includes('singkatan') || last.includes('kepanjangan'))) {
    return preferredLanguage === 'id'
      ? 'Kepanjangan yang dipakai di produk ini adalah Kiting AI.'
      : 'In this product, the expanded form used is Kiting AI.'
  }

  if (shouldReturnClarification(last)) {
    return preferredLanguage === 'id'
      ? 'Maaf, saya belum mengerti maksud pertanyaan itu. Coba perjelas atau tanyakan secara lebih spesifik, misalnya tentang emas, BTC, market brief, stress state, atau portofolio.'
      : 'Sorry, I do not understand that request yet. Please rephrase it or ask more specifically about gold, BTC, the market brief, stress state, or portfolio.'
  }

  if (summary && isMarketQuestion(last)) {
    return preferredLanguage === 'id' ? `Ringkasan: ${summary}` : `Summary: ${summary}`
  }

  return preferredLanguage === 'id'
    ? 'Saya siap membantu analisis data investasi jika ringkasan tersedia.'
    : 'I am ready to help with investment analysis once the summary context is available.'
}

const sendGroq = async (messages: AiMessage[]) => {
  const url = process.env.GROQ_API_URL
  const apiKey = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL
  if (!url || !apiKey || !model) return null

  // In Groq, the first message is the system prompt.
  const hasSystemPrompt = messages[0]?.role === 'system'
  const normalizedMessages = hasSystemPrompt ? messages : [{ role: 'system', content: tingAiSystemPrompt }, ...messages]

  const payload = {
    model,
    messages: normalizedMessages,
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

const sendGemini = async (messages: AiMessage[]) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

    const systemInstructions = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content)
      .join('\n\n')

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstructions || tingAiSystemPrompt
    })

    const normalizedConversation = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((message): { role: 'user' | 'model'; parts: { text: string }[] } => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      }))
      .reduce((acc, current) => {
        if (acc.length > 0 && acc[acc.length - 1].role === current.role) {
          acc[acc.length - 1].parts[0].text += `\n${current.parts[0].text}`
          return acc
        }

        acc.push(current)
        return acc
      }, [] as Array<{ role: 'user' | 'model'; parts: { text: string }[] }>)

    const lastUserIndex = [...normalizedConversation].map((message) => message.role).lastIndexOf('user')
    if (lastUserIndex === -1) {
      return null
    }

    const prompt = normalizedConversation[lastUserIndex]
    const history = normalizedConversation
      .slice(0, lastUserIndex)
      .filter((message, index, list) => !(index === 0 && message.role === 'model') && !(index === list.length - 1 && message.role === 'user'))

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(prompt.parts)
    return result.response.text().trim()
  } catch (error) {
    console.error('GEMINI_ERROR', error)
    return null
  }
}

// --- START: Response Parser and Fallback Logic ---
function parseAskTingAiResponse(rawResponse: string): AskTingAiStructuredResponse | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    if (
      parsed.direct_answer &&
      Array.isArray(parsed.why_it_matters) &&
      parsed.why_it_matters.length === 2 &&
      parsed.risk_note &&
      ['monitor', 'wait', 'rebalance', 'reduce_exposure'].includes(parsed.suggested_next_step)
    ) {
      return {
        direct_answer: parsed.direct_answer,
        why_it_matters: parsed.why_it_matters.slice(0, 2),
        risk_note: parsed.risk_note,
        suggested_next_step: parsed.suggested_next_step
      };
    }
  } catch (e) {
    // JSON parse failed, return null to trigger fallback
  }
  return null;
}

function buildAskTingAiFallback(
  portfolio?: PortfolioData,
  preferredLanguage: 'id' | 'en' = 'id'
): AskTingAiStructuredResponse {
  if (!portfolio || !portfolio.holdings?.length || !portfolio.summary) {
    const response: AskTingAiStructuredResponse = preferredLanguage === 'id'
      ? {
          direct_answer: 'Saya siap membantu membaca kondisi portofolio dan hal yang perlu diperhatikan.',
          why_it_matters: [
            'Gambaran risiko yang jelas membantu kamu membaca situasi dengan lebih tenang.',
            'Konteks portofolio membantu jawaban terasa lebih relevan.'
          ],
          risk_note: 'Tetap monitor perubahan kondisi agar pembacaan risikonya tidak tertinggal.',
          suggested_next_step: 'monitor'
        }
      : {
          direct_answer: 'I am ready to help you understand your portfolio and investment risk.',
          why_it_matters: [
            'Clear risk understanding leads to better investment decisions.',
            'Personal portfolio context is key to effective strategy.'
          ],
          risk_note: 'Always monitor your portfolio conditions regularly.',
          suggested_next_step: 'monitor'
        }

    return normalizeStructuredAskTingAiResponse(response, preferredLanguage)
  }

  const { summary, holdings } = portfolio;
  const totalValue = summary.totalCurrentValue || 0;
  const totalPnlPct = summary.totalPnlPct || 0;

  if (totalValue <= 0) {
    const response: AskTingAiStructuredResponse = preferredLanguage === 'id'
      ? {
          direct_answer: 'Portofoliomu belum punya nilai yang cukup untuk dibaca dengan jelas.',
          why_it_matters: [
            'Data awal yang rapi membantu pembacaan portofolio jadi lebih akurat.',
            'Catatan entry memudahkan kamu membaca perubahan risiko ke depan.'
          ],
          risk_note: 'Lengkapi data posisi dulu agar pembacaan berikutnya lebih konsisten.',
          suggested_next_step: 'wait'
        }
      : {
          direct_answer: 'Your portfolio is empty or has no current value.',
          why_it_matters: [
            'Start with clear initial capital for accurate tracking.',
            'Clear entry documentation helps future risk analysis.'
          ],
          risk_note: 'Make sure your data entry is complete before starting.',
          suggested_next_step: 'wait'
        }

    return normalizeStructuredAskTingAiResponse(response, preferredLanguage)
  }

  const sortedHoldings = [...holdings].sort(
    (a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0)
  );
  const largestPosition = sortedHoldings[0];
  const largestWeight = largestPosition.currentValue
    ? (largestPosition.currentValue / totalValue) * 100
    : 0;

  // Concentration-based fallback
  if (largestWeight > 50) {
    const response: AskTingAiStructuredResponse = preferredLanguage === 'id'
      ? {
          direct_answer: `Portofoliomu terlalu terkonsentrasi pada ${largestPosition.symbol} (${formatPercentId(largestWeight)}%). ${totalPnlPct > 0 ? 'Meskipun sedang untung, portofoliomu masih cukup rentan.' : `${largestPosition.symbol} yang melemah bisa cepat menekan total nilai portofolio.`}`,
          why_it_matters: [
            `Porsi ${largestPosition.symbol} masih terlalu dominan di portofoliomu.`,
            `Jika ${largestPosition.symbol} melemah, nilainya cepat memengaruhi total portofolio.`
          ],
          risk_note: 'Risiko utama saat ini ada di konsentrasi satu aset, bukan hanya arah market.',
          suggested_next_step: 'rebalance'
        }
      : {
          direct_answer: `Your portfolio is heavily concentrated in ${largestPosition.symbol} (${largestWeight.toFixed(1)}%). ${totalPnlPct > 0 ? 'Even though you are profitable, concentration risk remains high.' : 'Loss could be significant if ${largestPosition.symbol} declines.'}`,
          why_it_matters: [
            `${largestPosition.symbol} dominates your portfolio allocation.`,
            `If ${largestPosition.symbol} weakens, the impact on portfolio value is direct and immediate.`
          ],
          risk_note: 'The main risk is concentration in a single asset, not general market direction.',
          suggested_next_step: 'rebalance'
        }

    return normalizeStructuredAskTingAiResponse(response, preferredLanguage)
  } else if (largestWeight > 35) {
    const response: AskTingAiStructuredResponse = preferredLanguage === 'id'
      ? {
          direct_answer: `Portofoliomu masih cukup terkonsentrasi pada ${largestPosition.symbol} (${formatPercentId(largestWeight)}%). Kondisinya belum berat, tetapi tetap perlu diperhatikan.`,
          why_it_matters: [
            `Porsi ${largestPosition.symbol} masih cukup besar dibanding posisi lain.`,
            'Diversifikasi tambahan bisa membantu meredam pergerakan satu aset.'
          ],
          risk_note: 'Konsentrasi moderat masih perlu dipantau agar portofolio tetap seimbang.',
          suggested_next_step: 'rebalance'
        }
      : {
          direct_answer: `Your portfolio has moderate concentration in ${largestPosition.symbol} (${largestWeight.toFixed(1)}%). Consider reducing risk through further diversification.`,
          why_it_matters: [
            `${largestPosition.symbol} still represents a significant portion of your portfolio.`,
            'Adding diversification could help reduce the impact of single-asset volatility.'
          ],
          risk_note: 'Moderate concentration level - continue monitoring and consider rebalancing if opportunities arise.',
          suggested_next_step: 'rebalance'
        }

    return normalizeStructuredAskTingAiResponse(response, preferredLanguage)
  } else {
    const response: AskTingAiStructuredResponse = preferredLanguage === 'id'
      ? {
          direct_answer: 'Portofoliomu terlihat cukup seimbang. Langkah paling aman saat ini adalah tetap monitor kondisi market dan posisi utama.',
          why_it_matters: [
            'Tidak ada satu aset yang terlalu mendominasi portofoliomu.',
            'Diversifikasi membantu mengurangi dampak dari pergerakan satu aset.'
          ],
          risk_note: 'Tetap monitor perubahan market karena profil risiko bisa berubah seiring waktu.',
          suggested_next_step: 'monitor'
        }
      : {
          direct_answer: 'Your portfolio appears reasonably balanced and diversified. The safest step right now is to continue monitoring market conditions and your positions.',
          why_it_matters: [
            'No single asset dominates your portfolio allocation.',
            'Good diversification helps reduce the impact of single-asset volatility.'
          ],
          risk_note: 'Keep monitoring market changes as your risk profile can shift over time.',
          suggested_next_step: 'monitor'
        }

    return normalizeStructuredAskTingAiResponse(response, preferredLanguage)
  }
}
// --- END: Response Parser and Fallback Logic ---

function createPortfolioContext(portfolio?: PortfolioData): string | null {
  if (!portfolio || !portfolio.holdings?.length || !portfolio.summary) {
    return null;
  }

  const { summary, holdings } = portfolio;
  if (!summary.totalCurrentValue || summary.totalCurrentValue <= 0) {
    return "PORTFOLIO CONTEXT:\nThe user's portfolio is initialized but currently has zero value.";
  }

  const sortedHoldings = [...holdings].sort((a, b) => (b.currentValue ?? 0) - (a.currentValue ?? 0));
  const largestPosition = sortedHoldings[0];
  const largestPositionWeight = (largestPosition.currentValue / summary.totalCurrentValue) * 100;

  // Calculate sector exposure
  const sectorExposure: Record<string, number> = {};
  holdings.forEach((holding) => {
    const sector = holding.assetType || 'Other';
    sectorExposure[sector] = (sectorExposure[sector] || 0) + (holding.currentValue || 0);
  });
  
  const sortedSectors = Object.entries(sectorExposure)
    .sort(([, a], [, b]) => b - a)
    .map(([sector, value]) => ({ sector, percentage: (value / summary.totalCurrentValue) * 100 }));

  const largestSector = sortedSectors[0];
  const top3Holdings = sortedHoldings
    .slice(0, 3)
    .map((holding) => `${holding.symbol} (${((holding.currentValue / summary.totalCurrentValue) * 100).toFixed(1)}%)`);

  let context = 'PORTFOLIO CONTEXT:\n';
  context += `Total Capital Invested: $${summary.totalInvested.toFixed(2)}\n`;
  context += `Current Portfolio Value: $${summary.totalCurrentValue.toFixed(2)}\n`;
  context += `Profit/Loss Amount: $${summary.totalPnl.toFixed(2)}\n`;
  context += `Profit/Loss Percentage: ${(summary.totalPnlPct || 0).toFixed(2)}%\n`;
  context += `Number of Holdings: ${holdings.length}\n`;
  context += `Top 3 Holdings: ${top3Holdings.join(', ')}\n`;
  context += `Largest Holding: ${largestPosition.symbol} (${largestPositionWeight.toFixed(1)}% of portfolio)\n`;

  if (largestSector) {
    context += `Largest Asset Type: ${largestSector.sector} (${largestSector.percentage.toFixed(1)}% of portfolio)\n`;
  }

  // Concentration risk assessment
  if (largestPositionWeight > 50) {
    context += `RISK ASSESSMENT: HIGH CONCENTRATION - The portfolio is heavily concentrated in ${largestPosition.symbol}. The user's portfolio outcome is heavily tied to this single asset's performance.\n`;
  } else if (largestPositionWeight > 35) {
    context += `RISK ASSESSMENT: MODERATE CONCENTRATION - ${largestPosition.symbol} represents a significant portion of the portfolio.\n`;
  } else if (largestPositionWeight > 25) {
    context += `RISK ASSESSMENT: MODERATE DIVERSIFICATION - The portfolio has some concentration but is fairly balanced.\n`;
  } else {
    context += `RISK ASSESSMENT: WELL DIVERSIFIED - The portfolio is reasonably spread across holdings.\n`;
  }

  // P/L context
  if ((summary.totalPnlPct || 0) > 0) {
    context += `PORTFOLIO STATUS: The portfolio is in PROFIT (${(summary.totalPnlPct || 0).toFixed(2)}%).\n`;
  } else if ((summary.totalPnlPct || 0) < 0) {
    context += `PORTFOLIO STATUS: The portfolio is in LOSS (${(summary.totalPnlPct || 0).toFixed(2)}%).\n`;
  } else {
    context += `PORTFOLIO STATUS: The portfolio is BREAKEVEN.\n`;
  }

  context += '\nIMPORTANT: Use this portfolio context to answer the user\'s question personally. Connect concentration risk, sector exposure, and P/L status to your recommendations. Do not ask for more data - if something is missing, answer conservatively with available context.';

  return context;
}
// --- END: Portfolio Context Generator ---

function createMarketBriefContext(summary?: string, meta?: AiChatBody['meta']): string | null {
  const briefing = meta?.briefing || []
  const context = meta?.context
  const instruments = meta?.instruments

  if (!summary && !briefing.length && !context && !instruments) {
    return null
  }

  const lines: string[] = ['MARKET BRIEF CONTEXT:']

  if (context?.overnightContext) lines.push(`- Overnight context: ${context.overnightContext}`)
  if (context?.macroContext) lines.push(`- Macro context: ${context.macroContext}`)
  if (context?.geopoliticContext) lines.push(`- Geopolitical context: ${context.geopoliticContext}`)
  if (context?.externalContext) lines.push(`- External context: ${context.externalContext}`)
  if (context?.externalWhyItMatters) lines.push(`- External why it matters: ${context.externalWhyItMatters}`)
  if (context?.headlinePressure) lines.push(`- Headline pressure: ${context.headlinePressure}`)
  if (context?.riskTone) lines.push(`- Risk tone: ${context.riskTone}`)
  if (context?.regime) lines.push(`- Regime: ${context.regime}`)
  if (context?.conviction) lines.push(`- Conviction: ${context.conviction}`)
  if (context?.stressState) lines.push(`- Stress state: ${context.stressState}`)
  if (context?.watchLevel) lines.push(`- Watch level: ${context.watchLevel}`)

  if (context?.drivers?.length) {
    context.drivers.forEach((item) => lines.push(`- Driver / ${item.label} / ${item.signal}: ${item.detail}`))
  }

  if (context?.macroSignals?.length) {
    context.macroSignals.forEach((item) =>
      lines.push(`- Macro signal / ${item.label} / ${item.signal}: ${item.detail}`)
    )
  }

  if (context?.stressDrivers?.length) {
    context.stressDrivers.forEach((item) => lines.push(`- Stress driver: ${item}`))
  }

  if (context?.headlines?.length) {
    context.headlines.forEach((item) =>
      lines.push(`- External headline / ${item.source} / ${item.theme} / ${item.relevance}: ${item.title} | Why it matters: ${item.whyItMatters}`)
    )
  }

  if (context?.watchItems?.length) {
    context.watchItems.forEach((item) =>
      lines.push(`- Watch item / ${item.label} / ${item.priority}: ${item.detail}`)
    )
  }

  if (briefing.length) {
    briefing.forEach((item) => lines.push(`- ${item.title}: ${item.body}`))
  } else if (summary) {
    lines.push(`- Summary: ${summary}`)
  }

  if (instruments?.ANTAM && !instruments.ANTAM.error) {
    lines.push(`- Gold latest ${instruments.ANTAM.latestPrice ?? '-'} with delta ${instruments.ANTAM.delta ?? 0} and pct ${instruments.ANTAM.pct ?? 0}`)
  }
  if (instruments?.SP500 && !instruments.SP500.error) {
    lines.push(`- US equity proxy latest ${instruments.SP500.latestPrice ?? '-'} with delta ${instruments.SP500.delta ?? 0} and pct ${instruments.SP500.pct ?? 0}`)
  }
  if (instruments?.BTC && !instruments.BTC.error) {
    lines.push(`- BTC latest ${instruments.BTC.latestPrice ?? '-'} with delta ${instruments.BTC.delta ?? 0} and pct ${instruments.BTC.pct ?? 0}`)
  }
  if (instruments?.IHSG && !instruments.IHSG.error) {
    lines.push(`- IHSG latest ${instruments.IHSG.latestPrice ?? '-'} with delta ${instruments.IHSG.delta ?? 0} and pct ${instruments.IHSG.pct ?? 0}`)
  }

  lines.push(
    '- Reasoning instruction: connect the market brief, stress state, macro pressure, and portfolio context before answering. Prefer direct implications over generic market commentary.'
  )

  return lines.join('\n')
}


// --- START: Helper to format Ask Ting AI response ---
function formatAskTingAiResponse(
  rawReply: string | null,
  portfolio?: PortfolioData,
  preferredLanguage: 'id' | 'en' = 'id'
): AskTingAiStructuredResponse {
  if (!rawReply) {
    return buildAskTingAiFallback(portfolio, preferredLanguage);
  }

  // Try to parse the AI response
  const parsed = parseAskTingAiResponse(rawReply);
  if (parsed) {
    return normalizeStructuredAskTingAiResponse(parsed, preferredLanguage);
  }

  // If parsing fails, use fallback
  return buildAskTingAiFallback(portfolio, preferredLanguage);
}
// --- END: Helper to format Ask Ting AI response ---

app.post('/api/ai-chat', async (req, res) => {
  const startedAt = Date.now()
  let providerUsed = 'none'
  let fallbackUsed = false
  let providerRequested = 'auto'
  let intent = 'empty'
  let hasMarketContext = false
  let hasPortfolioContext = false

  try {
    const payload = parsePayload<AiChatBody>(req)
    const { messages, summary, meta, provider, portfolio } = payload
    const requestPlan = await getRequestPlan(getOptionalAuthUser(req))
    providerRequested = provider || (summary || meta || portfolio ? 'gemini' : 'groq')

    if (!Array.isArray(messages)) {
      fallbackUsed = true
      const fallback = buildAiFallbackReply([], summary, meta, 'invalid_payload')
      logAiTelemetry({
        intent,
        providerRequested,
        providerUsed,
        durationMs: Date.now() - startedAt,
        fallbackUsed,
        hasMarketContext,
        hasPortfolioContext
      })
        return res.status(200).json({
          reply: fallback,
          usedGroq: false,
          usedGemini: false,
          providerStatus: {
            requested: providerRequested as 'auto' | 'groq' | 'gemini',
            used: 'local',
            fallbackUsed,
            hasMarketContext,
            hasPortfolioContext,
            durationMs: Date.now() - startedAt
          }
        })
    }

    // --- START: Context Injection ---
    const lastUserMessage = getLastUserMessage(messages)
    const previousUserMessage = getPreviousUserMessage(messages)
    const recentUserMessages = getRecentUserMessages(messages)
    intent = detectIntentLabel(lastUserMessage, previousUserMessage, recentUserMessages)
    if (isIdentityQuestion(lastUserMessage) || isNamingQuestion(lastUserMessage)) {
      const directReply = buildLocalReply(messages, undefined, meta)
      providerUsed = 'local'
      logAiTelemetry({
        intent,
        providerRequested,
        providerUsed,
        durationMs: Date.now() - startedAt,
        fallbackUsed,
        hasMarketContext,
        hasPortfolioContext
      })
      return res.status(200).json({
        reply: directReply,
        usedGroq: false,
        usedGemini: false,
        providerStatus: {
          requested: providerRequested as 'auto' | 'groq' | 'gemini',
          used: 'local',
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext,
          durationMs: Date.now() - startedAt
        }
      })
    }

    if (isAmbiguousMarketQuestion(lastUserMessage)) {
      const clarificationReply = buildClarificationReply(detectPreferredLanguage(messages))
      providerUsed = 'local'
      logAiTelemetry({
        intent,
        providerRequested,
        providerUsed,
        durationMs: Date.now() - startedAt,
        fallbackUsed,
        hasMarketContext,
        hasPortfolioContext
      })
      return res.status(200).json({
        reply: clarificationReply,
        usedGroq: false,
        usedGemini: false,
        providerStatus: {
          requested: providerRequested as 'auto' | 'groq' | 'gemini',
          used: 'local',
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext,
          durationMs: Date.now() - startedAt
        }
      })
    }

    if (isCompareAssetsFollowUp(lastUserMessage, previousUserMessage, recentUserMessages)) {
      const compareReply = buildCompareAssetsReply(detectPreferredLanguage(messages))
      providerUsed = 'local'
      logAiTelemetry({
        intent,
        providerRequested,
        providerUsed,
        durationMs: Date.now() - startedAt,
        fallbackUsed,
        hasMarketContext,
        hasPortfolioContext
      })
      return res.status(200).json({
        reply: compareReply,
        usedGroq: false,
        usedGemini: false,
        providerStatus: {
          requested: providerRequested as 'auto' | 'groq' | 'gemini',
          used: 'local',
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext,
          durationMs: Date.now() - startedAt
        }
      })
    }

    if (isCompareAssetsQuestion(lastUserMessage)) {
      const compareReply = buildCompareAssetsReply(detectPreferredLanguage(messages))
      providerUsed = 'local'
      logAiTelemetry({
        intent,
        providerRequested,
        providerUsed,
        durationMs: Date.now() - startedAt,
        fallbackUsed,
        hasMarketContext,
        hasPortfolioContext
      })
      return res.status(200).json({
        reply: compareReply,
        usedGroq: false,
        usedGemini: false,
        providerStatus: {
          requested: providerRequested as 'auto' | 'groq' | 'gemini',
          used: 'local',
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext,
          durationMs: Date.now() - startedAt
        }
      })
    }

    if (isAssetSpecificQuestion(lastUserMessage) && !hasReliableAssetContext(lastUserMessage, meta)) {
      const guardedReply = buildAssetContextGuardReply(detectPreferredLanguage(messages))
      providerUsed = 'local'
      logAiTelemetry({
        intent,
        providerRequested,
        providerUsed,
        durationMs: Date.now() - startedAt,
        fallbackUsed,
        hasMarketContext,
        hasPortfolioContext
      })
      return res.status(200).json({
        reply: guardedReply,
        usedGroq: false,
        usedGemini: false,
        providerStatus: {
          requested: providerRequested as 'auto' | 'groq' | 'gemini',
          used: 'local',
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext,
          durationMs: Date.now() - startedAt
        }
      })
    }

    const marketBriefContext = shouldInjectMarketContext(lastUserMessage)
      ? createMarketBriefContext(summary, meta)
      : null
    const portfolioContext = requestPlan === 'pro' ? createPortfolioContext(portfolio) : null
    hasMarketContext = Boolean(marketBriefContext)
    hasPortfolioContext = Boolean(portfolioContext)
    const messagesWithContext = [...messages]
    const preferredLanguage = detectPreferredLanguage(messages)

    if (marketBriefContext) {
      messagesWithContext.splice(1, 0, { role: 'system', content: marketBriefContext })
    }

    if (portfolioContext) {
      const systemPrompt = { role: 'system', content: portfolioContext }
      // Inject after the main system prompt (which is added later in sendGroq/sendGemini)
      messagesWithContext.splice(1, 0, systemPrompt)
    }
    // --- END: Context Injection ---

    const resolvedProvider = providerRequested as 'groq' | 'gemini'
    const groqMessages = buildGroqMessages(messagesWithContext, marketBriefContext, portfolioContext)
    const geminiMessages = buildGeminiMessages(messages, marketBriefContext, portfolioContext)

    if (resolvedProvider === 'groq') {
      const groqReply = await sendGroq(groqMessages)
      if (groqReply) {
        providerUsed = 'groq'
        const structured = formatAskTingAiResponse(groqReply, portfolio, preferredLanguage)
        logAiTelemetry({
          intent,
          providerRequested,
          providerUsed,
          durationMs: Date.now() - startedAt,
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext
        })
        return res.status(200).json({
          structured,
          providerStatus: {
            requested: providerRequested as 'auto' | 'groq' | 'gemini',
            used: 'groq',
            fallbackUsed,
            hasMarketContext,
            hasPortfolioContext,
            durationMs: Date.now() - startedAt
          }
        })
      }
    } else {
      const geminiReply = await sendGemini(geminiMessages)
      if (geminiReply) {
        providerUsed = 'gemini'
        const structured = formatAskTingAiResponse(geminiReply, portfolio, preferredLanguage)
        logAiTelemetry({
          intent,
          providerRequested,
          providerUsed,
          durationMs: Date.now() - startedAt,
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext
        })
        return res.status(200).json({
          structured,
          providerStatus: {
            requested: providerRequested as 'auto' | 'groq' | 'gemini',
            used: 'gemini',
            fallbackUsed,
            hasMarketContext,
            hasPortfolioContext,
            durationMs: Date.now() - startedAt
          }
        })
      }

      const groqReply = await sendGroq(groqMessages)
      if (groqReply) {
        providerUsed = 'groq'
        fallbackUsed = true
        const structured = formatAskTingAiResponse(groqReply, portfolio, preferredLanguage)
        logAiTelemetry({
          intent,
          providerRequested,
          providerUsed: 'gemini->groq',
          durationMs: Date.now() - startedAt,
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext
        })
        return res.status(200).json({
          structured,
          providerStatus: {
            requested: providerRequested as 'auto' | 'groq' | 'gemini',
            used: 'groq',
            fallbackUsed,
            hasMarketContext,
            hasPortfolioContext,
            durationMs: Date.now() - startedAt
          }
        })
      }
    }

    const azureReply = await sendAzureChat(groqMessages)
    if (azureReply) {
      providerUsed = 'azure'
      fallbackUsed = true
      const structured = formatAskTingAiResponse(azureReply, portfolio, preferredLanguage)
      logAiTelemetry({
        intent,
        providerRequested,
        providerUsed,
        durationMs: Date.now() - startedAt,
        fallbackUsed,
        hasMarketContext,
        hasPortfolioContext
      })
      return res.status(200).json({
        structured,
        providerStatus: {
          requested: providerRequested as 'auto' | 'groq' | 'gemini',
          used: 'azure',
          fallbackUsed,
          hasMarketContext,
          hasPortfolioContext,
          durationMs: Date.now() - startedAt
        }
      })
    }

    providerUsed = 'local'
    fallbackUsed = true
    const structured = buildAskTingAiFallback(portfolio, preferredLanguage)
    logAiTelemetry({
      intent,
      providerRequested,
      providerUsed,
      durationMs: Date.now() - startedAt,
      fallbackUsed,
      hasMarketContext,
      hasPortfolioContext
    })
    return res.status(200).json({
      structured,
      providerStatus: {
        requested: providerRequested as 'auto' | 'groq' | 'gemini',
        used: 'local',
        fallbackUsed,
        hasMarketContext,
        hasPortfolioContext,
        durationMs: Date.now() - startedAt
      }
    })
  } catch (error) {
    logAiTelemetry({
      intent,
      providerRequested,
      providerUsed: providerUsed === 'none' ? 'error' : providerUsed,
      durationMs: Date.now() - startedAt,
      fallbackUsed: true,
      hasMarketContext,
      hasPortfolioContext
    })
    return res.status(500).json({ error: error instanceof Error ? error.message : 'AI error' })
  }
})

app.get('/api/ai-chat', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {
  startPortfolioRefreshScheduler()
})
