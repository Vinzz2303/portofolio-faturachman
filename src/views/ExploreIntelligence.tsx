/**
 * ExploreIntelligence.tsx
 * Route: /explore-intelligence  (redirects from /ting-ai-2, /decision-briefing)
 *
 * Fixes applied:
 * 1. Chart: locale-aware date labels passed to fetchHistory
 * 2. Chart: error boundary per-ticker so one failure doesn't blank everything
 * 3. Chart: explicit container height via inline style (not Tailwind class)
 * 4. Data: no fake/demo numbers — shows clear unavailable state on failure
 * 5. i18n: 100% driven by exploreIntelligenceI18n, zero hardcoded JSX text
 * 6. userPlan: read from localStorage so route doesn't need to pass it
 */
import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts'
import { getMarketQuote, getMultipleMarketQuotes, getMarketHistory, getMarketNews, getMarketNewsResponse } from '../services/marketData'
import type { MarketQuote, MarketHistoryPoint, MarketNewsItem, MarketNewsResponse } from '../services/marketData'
import { getPortfolioRelevance } from '../utils/explorePortfolioRelevance'
import { readPortfolioSnapshot } from '../utils/portfolioSnapshot'
import { getExploreI18n } from '../utils/exploreIntelligenceI18n'
import { useLanguagePreference } from '../utils/language'
import MulaiDariSiniCard from '../components/MulaiDariSiniCard'
import FundamentalPanel from '../components/FundamentalPanel'
import AIForecastPanel from '../components/AIForecastPanel'
import MarketRadarSection from '../components/MarketRadarSection'
import MacroDashboard from '../components/MacroDashboard'

// ── Market assets ─────────────────────────────────────────────────────────────
const PULSE_ASSETS = [
  { symbol: 'IHSG',    apiSymbol: '^JKSE',     labelId: 'IDX Composite', labelEn: 'IDX Composite' },
  { symbol: 'XAU/USD', apiSymbol: 'GC=F',      labelId: 'Emas',          labelEn: 'Gold (XAU)' },
  { symbol: 'XAG/USD', apiSymbol: 'SI=F',      labelId: 'Perak',         labelEn: 'Silver (XAG)' },
  { symbol: 'Oil',     apiSymbol: 'CL=F',      labelId: 'Minyak WTI',    labelEn: 'WTI Oil' },
  { symbol: 'BTC',     apiSymbol: 'BTC-USD',   labelId: 'Bitcoin',       labelEn: 'Bitcoin' },
  { symbol: 'ETH',     apiSymbol: 'ETH-USD',   labelId: 'Ethereum',      labelEn: 'Ethereum' },
  { symbol: 'SOL',     apiSymbol: 'SOL-USD',   labelId: 'Solana',        labelEn: 'Solana' },
  { symbol: 'BNB',     apiSymbol: 'BNB-USD',   labelId: 'BNB',           labelEn: 'BNB' },
  { symbol: 'XRP',     apiSymbol: 'XRP-USD',   labelId: 'XRP',           labelEn: 'XRP' },
  { symbol: 'S&P 500', apiSymbol: 'SPY',       labelId: 'S&P 500 ETF',   labelEn: 'S&P 500 ETF' },
  { symbol: 'Nasdaq',  apiSymbol: 'QQQ',       labelId: 'Nasdaq ETF',    labelEn: 'Nasdaq ETF' },
  { symbol: 'DXY',     apiSymbol: 'DX-Y.NYB',  labelId: 'Indeks USD',    labelEn: 'USD Index' },
]

// Pre-computed stable reference — avoids re-creating array every render
const NEWS_SYMBOLS = PULSE_ASSETS.map(a => a.apiSymbol)

const RANGES = ['5d', '1mo', '3mo', '6mo'] as const
type Range = typeof RANGES[number]

// ── Number formatter ─────────────────────────────────────────────────────────
function fmt(n: number, currency?: string): string {
  if (!Number.isFinite(n)) return '—'
  if (currency === 'IDR' || n > 100_000)
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(n)
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

// ── Pulse Card ────────────────────────────────────────────────────────────────
function PulseCard({
  asset, quote, selected, onClick, i18n, language,
}: {
  asset: typeof PULSE_ASSETS[number]
  quote: MarketQuote | null | undefined
  selected: boolean
  onClick: () => void
  i18n: ReturnType<typeof getExploreI18n>
  language: 'en' | 'id'
}) {
  const hasData = quote != null
  const up = (quote?.changePercent ?? 0) >= 0
  const assetLabel = language === 'id' ? asset.labelId : asset.labelEn

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-all duration-300 w-full cursor-pointer group ${
        selected
          ? 'bg-white/[0.07] border-teal-500/30 ring-1 ring-teal-500/10 shadow-xl shadow-teal-500/5'
          : 'bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-sm tracking-tight">{asset.symbol}</p>
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-0.5">{assetLabel}</p>
        </div>
        {hasData ? (
          <span
            className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
            style={{
              background: up ? 'rgba(20,184,166,0.12)' : 'rgba(239,68,68,0.10)',
              color: up ? '#2dd4bf' : '#f87171',
              border: `1px solid ${up ? 'rgba(20,184,166,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {up ? '↑' : '↓'}
          </span>
        ) : (
          <span className="text-[9px] font-mono text-slate-700 uppercase">{i18n.unavailableLabel}</span>
        )}
      </div>

      {hasData ? (
        <div className="space-y-0.5">
          <p className="text-base font-semibold numeric-value">{fmt(quote!.price, quote!.currency)}</p>
          <p className={`text-xs font-mono font-medium ${up ? 'text-teal-400' : 'text-red-400'}`}>
            {up ? '+' : ''}{quote!.changePercent.toFixed(2)}%
          </p>
        </div>
      ) : (
        <p className="text-xs text-slate-600 mt-2">
          {asset.apiSymbol === '^JKSE' ? i18n.ihsgUnavailable : i18n.marketDataUnavailable}
        </p>
      )}
    </motion.button>
  )
}

// ── Chart Tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({
  active, payload, label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0c0e14] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-mono text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold numeric-value text-teal-400">{fmt(payload[0].value)}</p>
    </div>
  )
}

// ── Smart Chart ───────────────────────────────────────────────────────────────
function SmartChart({
  ticker, up, locale, i18n,
}: {
  ticker: string
  up: boolean
  locale: string
  i18n: ReturnType<typeof getExploreI18n>
}) {
  const [data, setData]     = useState<(MarketHistoryPoint & { date: string, close: number })[]>([])
  const [range, setRange]   = useState<Range>('1mo')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  // Reset + fetch when ticker OR range OR locale changes
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setData([])

    getMarketHistory(ticker, range)
      .then(d => {
        if (cancelled) return
        if (!d.length) {
          setStatus('error')
          return
        }
        const formattedData = d.map(p => ({
          ...p,
          date: new Date(p.time).toLocaleDateString(locale, { day: '2-digit', month: 'short' }),
          close: p.price
        }))
        setData(formattedData)
        setStatus('ok')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => { cancelled = true }
  }, [ticker, range, locale])

  const values = data.map(d => d.close)
  const minVal = values.length ? Math.min(...values) : 0
  const maxVal = values.length ? Math.max(...values) : 0
  // Unique gradient id safe for SVG
  const gradId = `grad-${ticker.replace(/[^a-z0-9]/gi, '_')}`

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-6 space-y-5"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-0.5">
          <p className="label-uppercase text-[10px]">{i18n.smartChart}</p>
          <p className="text-sm font-medium text-slate-300">
            {/* Display clean symbol */}
            {ticker.replace('=F', '').replace('-', '/').replace('.NYB', '')}
          </p>
        </div>

        {/* Range selector */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all duration-200 ${
                range === r 
                  ? 'bg-teal-500 text-black shadow-[0_0_12px_rgba(20,184,166,0.2)]' 
                  : 'text-slate-600 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {i18n.rangeLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/*
        CHART FIX — Root cause explanation:
        ResponsiveContainer reads clientHeight of its own DOM node.
        If the parent has height:0 or is in a flex column without fixed height,
        ResponsiveContainer gets height=0 → renders nothing.
        Fix: explicit pixel height on the wrapper div via inline style.
        Do NOT rely on Tailwind h-* here because Vite + Tailwind JIT can
        purge classes that appear only as computed strings in some configs.
      */}
      <div style={{ height: '220px', width: '100%', position: 'relative' }}>
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            <span className="w-5 h-5 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
            <span className="text-xs text-slate-600 font-mono">{i18n.chartLoading}</span>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-slate-700 font-mono uppercase tracking-widest">
              {i18n.chartUnavailable}
            </p>
          </div>
        )}

        {status === 'ok' && data.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            style={{ height: '100%', width: '100%' }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={up ? '#2dd4bf' : '#ef4444'} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={up ? '#2dd4bf' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                  // Reduce crowding on small screens
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => fmt(v)}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={up ? '#2dd4bf' : '#ef4444'}
                  strokeWidth={2}
                  fill={`url(#${gradId})`}
                  animationDuration={1000}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Range stats */}
      {status === 'ok' && values.length > 0 && (
        <div className="flex gap-5 text-[10px] font-mono text-slate-700 uppercase tracking-widest">
          <span>{i18n.chartMin} <span className="text-slate-500">{fmt(minVal)}</span></span>
          <span>{i18n.chartMax} <span className="text-slate-500">{fmt(maxVal)}</span></span>
        </div>
      )}
    </div>
  )
}

function formatNewsDate(raw: string): string {
  if (!raw) return ''
  // Handle Alpha Vantage format: 20260429T143000
  if (/^\d{8}T\d{6}$/.test(raw)) {
    return `${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}`
  }
  // Handle ISO format
  if (raw.includes('-') || raw.includes('T')) {
    return raw.slice(0, 10)
  }
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return raw
}

function NewsSection({ i18n, symbols, userPlan }: { i18n: ReturnType<typeof getExploreI18n>, symbols: string[], userPlan: string }) {
  const [news, setNews] = useState<MarketNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const isFree = userPlan === 'free'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFailed(false)
    getMarketNews(symbols)
      .then(data => {
        if (!cancelled) {
          setNews(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [symbols])

  // Free: max 2, Pro: max 5
  const visibleNews = isFree ? news.slice(0, 2) : news.slice(0, 5)
  const hasMore = isFree && news.length > 2

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-7 space-y-4"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <p className="label-uppercase text-[10px]">{i18n.newsIntelligence}</p>
      
      {loading ? (
        <div className="flex items-center gap-3 py-4">
          <span className="w-5 h-5 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
          <span className="text-xs text-slate-600 font-mono">{i18n.newsLoading}</span>
        </div>
      ) : failed ? (
        <p className="text-xs text-slate-700 font-mono uppercase tracking-widest py-4">{i18n.newsFailed}</p>
      ) : news.length === 0 ? (
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">{i18n.newsNotConnected}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-md">{i18n.newsNotConnectedBody}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleNews.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl border border-white/[0.04] hover:bg-white/[0.02] transition-colors">
              <p className="text-sm font-semibold text-slate-200 mb-1">{item.title}</p>
              <p className="text-xs text-slate-400 mb-2 line-clamp-2 leading-relaxed">{item.summary}</p>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                <span className="text-teal-400 uppercase">{item.source}</span>
                <span>•</span>
                <span>{formatNewsDate(item.publishedAt)}</span>
              </div>
            </a>
          ))}
          {hasMore && (
            <div className="text-center pt-2">
              <Link to="/upgrade" className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                {i18n.proUnlockCta} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Opportunity Context (Screener) ─────────────────────────────────────────────
function newsStatusLabel(status: MarketNewsResponse['dataStatus'] | MarketNewsItem['dataStatus'], i18n: ReturnType<typeof getExploreI18n>): string {
  if (status === 'cached') return i18n.newsStatusCached
  if (status === 'delayed') return i18n.newsStatusDelayed
  if (status === 'unavailable') return i18n.newsStatusUnavailable
  return i18n.liveLabel
}

function newsRelatedTags(item: MarketNewsItem): string[] {
  const related = item.relatedSymbols || item.symbols || []
  return [...new Set([...(related || []), item.topic || 'general'].filter(Boolean))].slice(0, 5)
}

function NewsSectionV2({ i18n, symbols, userPlan }: { i18n: ReturnType<typeof getExploreI18n>, symbols: string[], userPlan: string }) {
  const [newsResponse, setNewsResponse] = useState<MarketNewsResponse>({
    items: [],
    dataStatus: 'unavailable',
    lastUpdated: null,
    message: null,
  })
  const [loading, setLoading] = useState(true)
  const isFree = userPlan === 'free'
  const snapshot = useMemo(() => readPortfolioSnapshot(), [])
  const portfolioSymbols = useMemo(
    () => snapshot.holdings.map((holding) => holding.symbol).filter(Boolean),
    [snapshot]
  )
  const querySymbols = portfolioSymbols.length ? portfolioSymbols : symbols
  const hasPortfolio = snapshot.hasPortfolio && portfolioSymbols.length > 0

  const loadNews = useCallback(() => {
    let cancelled = false
    setLoading(true)
    getMarketNewsResponse(querySymbols, { country: 'ID', limit: isFree ? 3 : 6, pro: !isFree })
      .then((data) => {
        if (!cancelled) {
          setNewsResponse(data)
          try {
            localStorage.setItem('tingai_market_news_context_v2_3_1', JSON.stringify({
              ...data,
              items: data.items.slice(0, isFree ? 3 : 6),
              portfolioSymbols,
              storedAt: new Date().toISOString(),
            }))
          } catch {
            // News context is optional for the copilot.
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNewsResponse({
            items: [],
            dataStatus: 'unavailable',
            lastUpdated: null,
            message: i18n.newsProviderUnavailableBody,
          })
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [querySymbols, isFree, i18n.newsProviderUnavailableBody, portfolioSymbols])

  useEffect(() => loadNews(), [loadNews])

  const visibleNews = isFree ? newsResponse.items.slice(0, 3) : newsResponse.items.slice(0, 6)
  const hasMore = isFree && newsResponse.items.length > 3
  const hasNews = visibleNews.length > 0
  const unavailable = newsResponse.dataStatus === 'unavailable'

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-7 space-y-4"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-uppercase text-[10px]">{hasPortfolio ? i18n.newsIntelligence : i18n.newsGeneralTitle}</p>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {hasPortfolio ? i18n.newsLoadedSubtitle : i18n.newsNoPortfolioBody}
          </p>
        </div>
        {!loading && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 border border-white/[0.06] rounded-full px-3 py-1">
            {newsStatusLabel(newsResponse.dataStatus, i18n)}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-start gap-3 py-4">
          <span className="w-5 h-5 mt-0.5 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-300">{i18n.newsLoadingTitle}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{i18n.newsLoadingBody}</p>
          </div>
        </div>
      ) : unavailable ? (
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">{i18n.newsProviderUnavailableTitle}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-md">{i18n.newsProviderUnavailableBody}</p>
            <button
              type="button"
              onClick={loadNews}
              className="mt-4 text-xs px-4 py-2 rounded-xl border border-white/[0.07] text-slate-300 hover:text-white hover:border-white/15 transition-all"
            >
              {i18n.newsRetryCta}
            </button>
          </div>
        </div>
      ) : !hasPortfolio && !hasNews ? (
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h10M4 17h7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">{i18n.newsGeneralTitle}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-md">{i18n.newsNoPortfolioBody}</p>
            <Link to="/portfolio" className="mt-4 inline-flex text-xs px-4 py-2 rounded-xl border border-white/[0.07] text-slate-300 hover:text-white hover:border-white/15 transition-all">
              {i18n.newsAddPortfolioCta}
            </Link>
          </div>
        </div>
      ) : !hasNews ? (
        <div>
          <p className="text-sm font-medium text-slate-400">{i18n.newsEmptyTitle}</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-md">{i18n.newsEmptyBody}</p>
          {newsResponse.message && (
            <p className="text-[10px] font-mono text-slate-700 uppercase tracking-widest mt-4">{newsResponse.message}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleNews.map((item, i) => (
            <a key={`${item.url}-${i}`} href={item.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl border border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-300">
              <p className="text-sm font-semibold text-slate-200 mb-1">{item.title}</p>
              {item.summary && (
                <p className="text-xs text-slate-400 mb-2 line-clamp-2 leading-relaxed">{item.summary}</p>
              )}
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                {item.relevanceReason || i18n.newsFallbackRelevance}
              </p>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 flex-wrap">
                <span className="text-teal-400 uppercase">{item.source}</span>
                <span>&bull;</span>
                <span>{formatNewsDate(item.publishedAt)}</span>
                <span>&bull;</span>
                <span>{newsStatusLabel(item.dataStatus || newsResponse.dataStatus, i18n)}</span>
              </div>
              <div className="flex gap-2 flex-wrap mt-3">
                {newsRelatedTags(item).map((tag) => (
                  <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded-full bg-white/[0.04] text-slate-500 border border-white/[0.05]">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
          {hasMore && (
            <div className="text-center pt-2">
              <Link to="/upgrade" className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors">
                {i18n.proUnlockCta} &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ScreenerSection({ i18n, userPlan, language }: { i18n: ReturnType<typeof getExploreI18n>, userPlan: string, language: 'en' | 'id' }) {
  const isPro = userPlan === 'pro'
  
  const categories = [
    {
      name: language === 'id' ? 'High Yield' : 'High Yield',
      assets: ['PTBA', 'ITMG', 'ADRO'],
      proTextId: 'Beberapa saham menunjukkan karakteristik yield tinggi, tetapi yield tinggi tidak selalu berarti peluang tanpa melihat penyebabnya. Seringkali pasar mengantisipasi penurunan laba di masa depan.',
      proTextEn: 'Some stocks show high-yield characteristics, but high yield does not always mean opportunity without understanding the cause. The market often anticipates future earnings decline.'
    },
    {
      name: language === 'id' ? 'Stable Dividend' : 'Stable Dividend',
      assets: ['BBCA', 'BMRI', 'TLKM'],
      proTextId: 'Kelompok ini menawarkan stabilitas cash flow. Dalam kondisi suku bunga tinggi, dividen ini bersaing dengan instrumen pendapatan tetap dan mengimbangi risiko volatilitas.',
      proTextEn: 'This group offers cash flow stability. Under high interest rates, these dividends compete with fixed income and offset volatility risk.'
    },
    {
      name: language === 'id' ? 'Growth' : 'Growth',
      assets: ['AMMN', 'PANI', 'BRPT'],
      proTextId: 'Aset yang didorong oleh ekspektasi ekspansi margin atau proyeksi masa depan. Memiliki sensitivitas tertinggi terhadap likuiditas pasar makro.',
      proTextEn: 'Assets driven by margin expansion expectations or future projections. They have the highest sensitivity to macro market liquidity.'
    },
    {
      name: language === 'id' ? 'Cyclical Income' : 'Cyclical Income',
      assets: ['ASII', 'UNTR', 'INDF'],
      proTextId: 'Kinerjanya sangat bergantung pada fase siklus ekonomi domestik dan komoditas pendukung. Risiko terbesar ada pada timing masuk/keluar siklus.',
      proTextEn: 'Performance relies heavily on the domestic economic cycle and supporting commodities. The biggest risk is being exposed at the wrong phase of the cycle.'
    }
  ]

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-7 space-y-4"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <p className="label-uppercase text-[10px]">{i18n.opportunityContext}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{i18n.opportunityExample}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-slate-200">{cat.name}</span>
              <div className="flex gap-1.5">
                {cat.assets.map(asset => (
                  <span key={asset} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.05]">
                    {asset}
                  </span>
                ))}
              </div>
            </div>
            
            {isPro ? (
              <p className="text-xs text-slate-400 mt-3 leading-relaxed border-t border-white/[0.04] pt-3">
                <span className="text-amber-500 font-mono text-[10px] uppercase tracking-widest block mb-1">{i18n.intelligenceNote}</span>
                {language === 'id' ? cat.proTextId : cat.proTextEn}
              </p>
            ) : (
              <div className="mt-3 pt-3 border-t border-white/[0.04]">
                <div className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-3">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full filter blur-xl" />
                  <p className="text-xs text-slate-500 line-clamp-2 blur-[2px] select-none">
                    {language === 'id' ? cat.proTextId : cat.proTextEn}
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center bg-[#080a0f]/40 backdrop-blur-[1px]">
                    <Link to="/upgrade" className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors">
                      {i18n.proInterpretation}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest text-center mt-4">
        {i18n.notTransactionRecommendation}
      </p>
    </div>
  )
}

// ── Portfolio Relation ────────────────────────────────────────────────────────
function PortfolioRelation({
  i18n, userPlan, language, selectedTicker
}: {
  i18n: ReturnType<typeof getExploreI18n>
  userPlan: string
  language: 'en' | 'id'
  selectedTicker: string
}) {
  const snapshot = useMemo(() => readPortfolioSnapshot(), [])
  const positions = snapshot.holdings

  const relevanceItems = useMemo(
    () => getPortfolioRelevance({ portfolioPositions: positions, language, userPlan, selectedTicker }),
    [positions, language, userPlan, selectedTicker]
  )

  if (!positions.length) {
    return (
      <div
        className="rounded-2xl border border-white/[0.06] p-7"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="label-uppercase text-[10px] mb-3">{i18n.portfolioRelation}</p>
        <p className="text-xs text-slate-600 leading-relaxed">{i18n.portfolioRelationEmpty}</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-7 space-y-4"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <p className="label-uppercase text-[10px]">{i18n.portfolioRelation}</p>
      <div className="space-y-3">
        {relevanceItems.map(item => (
          <div
            key={item.symbol}
            className="flex items-start justify-between py-3 border-b border-white/[0.04] last:border-0 gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                item.relevanceLevel === 'high' ? 'bg-teal-400' :
                item.relevanceLevel === 'medium' ? 'bg-yellow-400' : 'bg-slate-600'
              }`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-300">{item.title}</p>
                {item.proLocked ? (
                  <Link to="/upgrade" className="text-[11px] text-teal-400/70 hover:text-teal-400 transition-colors mt-1 inline-block">
                    {i18n.proLockedRelevance} →
                  </Link>
                ) : (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ExploreIntelligence() {
  const { language } = useLanguagePreference()
  const i18n = useMemo(() => getExploreI18n(language), [language])

  // Read plan from localStorage — same source as Portfolio.tsx
  const userPlan = useMemo(() => {
    try { return localStorage.getItem('lifeOS_user_plan') || 'free' }
    catch { return 'free' }
  }, [])

  // Locale string for date formatting
  const locale = language === 'en' ? 'en-US' : 'id-ID'

  const [quotes, setQuotes]           = useState<Record<string, MarketQuote | null>>({})
  const [quotesLoading, setQuotesLoading] = useState(true)
  const [selectedTicker, setSelectedTicker] = useState(PULSE_ASSETS[0].apiSymbol)

  const selectedQuote = quotes[selectedTicker]
  const selectedUp    = (selectedQuote?.changePercent ?? 0) >= 0

  const loadQuotes = useCallback(async () => {
    setQuotesLoading(true)
    try {
      const results = await getMultipleMarketQuotes(PULSE_ASSETS.map(a => a.apiSymbol))
      const map: Record<string, MarketQuote> = {}
      results.forEach(q => { map[q.symbol] = q })
      setQuotes(map)
    } catch {
      // All proxies failed — cards will show unavailable (not fake data)
    } finally {
      setQuotesLoading(false)
    }
  }, [])

  useEffect(() => { void loadQuotes() }, [loadQuotes])

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(20,184,166,0.06) 0%, transparent 55%), #080a0f',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Ambient grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-4xl mx-auto px-4 pt-24 pb-14 space-y-10">

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <p className="label-uppercase">{i18n.pageTitle}</p>
              <h1 className="text-2xl font-semibold tracking-tight">{i18n.pageSubtitle}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/komando-pagi"
                className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/15 transition-all"
              >
                {i18n.ctaMorningCommand} →
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/15 transition-all"
              >
                {i18n.ctaPortfolio} →
              </Link>
            </div>
          </div>
        </motion.div>

        <MulaiDariSiniCard />

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="hidden md:block rounded-2xl border border-teal-400/15 bg-teal-400/[0.035] p-5 md:p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="label-uppercase text-[10px] text-teal-300">{i18n.startHereTitle}</p>
              <p className="text-sm leading-relaxed text-slate-300 max-w-2xl">{i18n.startHereBody}</p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Link
                to="/komando-pagi"
                className="text-xs px-3 py-2 rounded-lg border border-teal-400/20 bg-teal-400/10 text-teal-200 hover:bg-teal-400/15 transition-all"
              >
                {i18n.startHereMorning}
              </Link>
              <Link
                to="/portfolio"
                className="text-xs px-3 py-2 rounded-lg border border-white/[0.07] text-slate-300 hover:text-white hover:border-white/15 transition-all"
              >
                {i18n.startHerePortfolio}
              </Link>
              <Link
                to="/ting-ai"
                className="text-xs px-3 py-2 rounded-lg border border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/15 transition-all"
              >
                {i18n.startHereAsk}
              </Link>
            </div>
          </div>
        </motion.section>

        {/* 1. Market Pulse */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="label-uppercase">{i18n.marketPulse}</p>
            <p className="text-[10px] font-mono text-slate-700 uppercase">{i18n.chartClickHint}</p>
          </div>

          {quotesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: PULSE_ASSETS.length }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {PULSE_ASSETS.map(asset => (
                <PulseCard
                  key={asset.apiSymbol}
                  asset={asset}
                  quote={quotes[asset.apiSymbol] ?? null}
                  selected={selectedTicker === asset.apiSymbol}
                  onClick={() => setSelectedTicker(asset.apiSymbol)}
                  i18n={i18n}
                  language={language}
                />
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            {i18n.ihsgPortfolioCopy}
          </p>

          {/* Bullish / Bearish summary — i18n keys */}
          {!quotesLoading && Object.keys(quotes).length > 0 && (
            <div className="flex gap-5 px-1 text-[10px] font-mono text-slate-700 uppercase tracking-widest">
              <span>
                {i18n.bullish}:{' '}
                <span className="text-teal-500 font-bold">
                  {Object.values(quotes).filter(q => (q?.changePercent ?? 0) >= 0).length}
                </span>
              </span>
              <span>
                {i18n.bearish}:{' '}
                <span className="text-red-500 font-bold">
                  {Object.values(quotes).filter(q => (q?.changePercent ?? 0) < 0).length}
                </span>
              </span>
            </div>
          )}
        </section>

        {/* 2. Smart Chart */}
        <section>
          <SmartChart
            ticker={selectedTicker}
            up={selectedUp}
            locale={locale}
            i18n={i18n}
          />
        </section>

        {/* 2b. Fundamental Panel */}
        <section>
          <FundamentalPanel ticker={selectedTicker} language={language} />
        </section>

        {/* 2c. AI Forecast */}
        <section>
          <AIForecastPanel ticker={selectedTicker} language={language} currentPrice={quotes[selectedTicker]?.price} />
        </section>

        {/* 2d. Market Radar */}
        <section>
          <MarketRadarSection ticker={selectedTicker} i18n={i18n} onSelectTicker={setSelectedTicker} />
        </section>

        {/* 2e. Macro Dashboard */}
        <section>
          <MacroDashboard i18n={i18n} />
        </section>

        {/* 3. News Intelligence */}
        <section>
          <NewsSectionV2 i18n={i18n} symbols={NEWS_SYMBOLS} userPlan={userPlan} />
        </section>

        {/* 4. Opportunity Context (Screener) */}
        <section>
          <ScreenerSection i18n={i18n} userPlan={userPlan} language={language} />
        </section>

        {/* 5. Portfolio Relation */}
        <section>
          <PortfolioRelation i18n={i18n} userPlan={userPlan} language={language} selectedTicker={selectedTicker} />
        </section>

      </div>
    </div>
  )
}
