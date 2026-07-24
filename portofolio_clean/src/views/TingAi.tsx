import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import HeroInput          from '../components/ting-ai-v2/HeroInput'
import InsightPanel       from '../components/ting-ai-v2/InsightPanel'
import InsightEngineCard  from '../components/ting-ai-v2/InsightEngineCard'
import TingAiCopilot      from '../components/ting-ai-v2/TingAiCopilot'
import ProAwareTingAiHeader from '../components/ting-ai-v2/ProAwareTingAiHeader'
import PortfolioStatusCard from '../components/ting-ai-v2/PortfolioStatusCard'
import { fetchIndonesianStocks } from '../lib/stockService'
import type { DetailedStockData } from '../lib/stockService'
import MarketSnapshot from '../components/ting-ai-v2/MarketSnapshot'
import StockChart    from '../components/ting-ai-v2/StockChart'
import { analyzePortfolio, parsePortfolio } from '../engine/analyzePortfolio'
import type { AnalysisResult, Holding } from '../engine/analyzePortfolio'
import { generateInsight, generateQuickInsight } from '../engine/insightEngine'
import {
  computeConfidenceFromQuotes,
  computeConfidenceForSymbol,
  aggregateConfidenceScores,
} from '../engine/trustLayer'
import type { ConfidenceScore } from '../engine/trustLayer'
import type { FullInsight, InsightInput } from '../engine/insightEngine'
import { useAuthSession } from '../utils/useAuthSession'
import { hasProAccess } from '../utils/entitlements'
import { useLanguagePreference } from '../utils/language'
import { formatPercent, sanitizeMarketPercent } from '../utils/marketFormatting'
import { getTingAiI18n } from '../utils/tingAiI18n'
import { readPortfolioSnapshot, type NormalizedPortfolioSnapshot } from '../utils/portfolioSnapshot'

// ─────────────────────────────────────────────────────────────────────
// Design tokens (inline — Tailwind-independent)
// ─────────────────────────────────────────────────────────────────────
const C = {
  bg:       '#0b0d12',
  surface:  'rgba(255,255,255,0.025)',
  border:   'rgba(255,255,255,0.07)',
  teal:     '#14b8a6',
  amber:    '#f59e0b',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  white:    '#ffffff',
  mono:     "'SF Mono', 'Fira Mono', 'JetBrains Mono', monospace",
}

// ─────────────────────────────────────────────────────────────────────
// IHSG Summary Card
// ─────────────────────────────────────────────────────────────────────
function IhsgCard({ quotes }: { quotes: DetailedStockData[] }) {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)
  const cleanQuotes = quotes
    .map(q => ({ ...q, changePercent: sanitizeMarketPercent(q.changePercent, 35) }))
    .filter((q): q is DetailedStockData & { changePercent: number } => q.changePercent !== null)
  const bullish   = cleanQuotes.filter(q => q.changePercent >= 0).length
  const bearish   = cleanQuotes.filter(q => q.changePercent <  0).length
  const avgChange = quotes.length > 0
    ? cleanQuotes.reduce((s, q) => s + q.changePercent, 0) / Math.max(cleanQuotes.length, 1)
    : 0
  const sentiment  = avgChange > 0.5 ? t.bullish : avgChange < -0.5 ? t.bearish : t.neutral
  const sentColor  = avgChange > 0.5 ? '#22d3ee' : avgChange < -0.5 ? '#f87171' : C.slate400
  const sentBg     = avgChange > 0.5 ? 'rgba(34,211,238,0.08)' : avgChange < -0.5 ? 'rgba(248,113,113,0.08)' : 'rgba(148,163,184,0.08)'

  if (!quotes.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      style={{
        borderRadius: 16, border: `1px solid ${C.border}`,
        background: C.surface, padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: 18,
      }}
    >
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: C.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: C.slate500 }}>{t.ihsgLabel}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: C.mono, fontSize: 10, color: C.teal }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal }} />
              {t.ihsgDelayed}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.slate500 }}>
            {t.ihsgSubtitle}
          </p>
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: sentBg, color: sentColor, whiteSpace: 'nowrap' }}>
          {sentiment}
        </div>
      </div>

      {/* stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { value: bullish,   label: t.ihsgUp,      color: '#22d3ee' },
          { value: bearish,   label: t.ihsgDown,    color: '#f87171' },
          { value: formatPercent(avgChange, lang), label: t.ihsgAverage, color: sentColor },
        ].map(({ value, label, color }) => (
          <div key={label} style={{
            borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.02)', padding: '12px 8px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: C.mono, fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontFamily: C.mono, fontSize: 10, color: C.slate500, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* movers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: C.mono, fontSize: 10, color: C.slate600, textTransform: 'uppercase', letterSpacing: '0.2em' }}>{t.ihsgNotableLabel}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[...cleanQuotes]
            .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
            .slice(0, 6)
            .map(q => (
              <div key={q.yahooSymbol} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontFamily: C.mono, fontSize: 11,
                padding: '4px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ color: C.slate400 }}>{q.symbol}</span>
                <span style={{ color: q.changePercent >= 0 ? '#22d3ee' : '#f87171' }}>
                  {formatPercent(q.changePercent, lang)}
                </span>
              </div>
            ))}
        </div>
      </div>

      <p style={{ margin: 0, fontFamily: C.mono, fontSize: 10, color: C.slate700, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
        {t.ihsgDisclaimer(quotes.length)}
      </p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Free / Pro Capability Row
// ─────────────────────────────────────────────────────────────────────
function CapabilityRow() {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)

  const chip = (text: string, color: string, bg: string, border: string) => (
    <span key={text} style={{ fontFamily: C.mono, fontSize: 10, padding: '3px 9px', borderRadius: 6, background: bg, color, border: `1px solid ${border}` }}>
      {text}
    </span>
  )

  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
      {/* Free */}
      <div style={{
        flex: 1, minWidth: 220,
        borderRadius: 12, border: '1px solid rgba(20,184,166,0.18)',
        background: 'rgba(20,184,166,0.025)', padding: 12,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid rgba(20,184,166,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal }} />
          </div>
          <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.teal }}>{t.capFree}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {t.capFreeItems.map(f => chip(f, 'rgba(20,184,166,0.85)', 'rgba(20,184,166,0.1)', 'rgba(20,184,166,0.12)'))}
        </div>
      </div>

      {/* Pro */}
      <div style={{
        flex: 1, minWidth: 220,
        borderRadius: 12, border: '1px solid rgba(245,158,11,0.18)',
        background: 'rgba(245,158,11,0.025)', padding: 12,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="13" height="13" fill={C.amber} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.amber }}>{t.capPro}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {t.capProItems.map(f => chip(f, 'rgba(245,158,11,0.85)', 'rgba(245,158,11,0.1)', 'rgba(245,158,11,0.12)'))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Analysis Loading Skeleton
// ─────────────────────────────────────────────────────────────────────
function AnalysisLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ height: 100, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 130, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Section Divider Label
// ─────────────────────────────────────────────────────────────────────
function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
      <span style={{ fontFamily: C.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.25em', color: C.slate600 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────
export default function TingAi() {
  const { authenticated, user } = useAuthSession()
  const isPro = hasProAccess(user)
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)

  useEffect(() => {
    if (!(import.meta as any).env?.DEV || !user) return

    console.debug('[TingAI entitlement]', {
      email: user.email,
      plan: user.plan,
      isPro: user.isPro,
      proUntil: user.proUntil,
      subscriptionStatus: user.subscriptionStatus,
      computedHasProAccess: isPro,
    })
  }, [isPro, user])

  const [quotes, setQuotes]             = useState<DetailedStockData[]>([])
  const [quotesLoading, setQuotesLoading] = useState(true)
  const [selectedTicker, setSelectedTicker] = useState('BBCA.JK')

  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [result, setResult]             = useState<AnalysisResult | null>(null)
  const [holdings, setHoldings]         = useState<Holding[]>([])
  const [portfolioSnapshot, setPortfolioSnapshot] = useState<NormalizedPortfolioSnapshot>(() => readPortfolioSnapshot())
  const [showPanel, setShowPanel]       = useState(false)

  // Insight Engine v1 state
  const [quickInsight, setQuickInsight]   = useState<string | null>(null)
  const [fullInsight, setFullInsight]     = useState<FullInsight | null>(null)

  // Trust Layer state
  const [confidenceScore, setConfidenceScore] = useState<ConfidenceScore | undefined>(undefined)

  // Load market data ───────────────────────────────────────────────
  const loadMarketData = useCallback(() => {
    fetchIndonesianStocks()
      .then(data => { if (data.length > 0) setQuotes(data); setQuotesLoading(false) })
      .catch(() => setQuotesLoading(false))
  }, [])

  useEffect(() => {
    loadMarketData()
    const id = setInterval(loadMarketData, 30000)
    return () => clearInterval(id)
  }, [loadMarketData])

  useEffect(() => {
    const syncPortfolioSnapshot = () => setPortfolioSnapshot(readPortfolioSnapshot())
    syncPortfolioSnapshot()
    window.addEventListener('tingai-portfolio-snapshot', syncPortfolioSnapshot)
    window.addEventListener('storage', syncPortfolioSnapshot)
    return () => {
      window.removeEventListener('tingai-portfolio-snapshot', syncPortfolioSnapshot)
      window.removeEventListener('storage', syncPortfolioSnapshot)
    }
  }, [])

  // Handle analysis ────────────────────────────────────────────────
  const handleAnalyze = useCallback((input: string) => {
    setAnalysisLoading(true)
    setShowPanel(false)
    setQuickInsight(null)
    setFullInsight(null)
    setConfidenceScore(undefined)

    setTimeout(() => {
      const cleanQuotes = quotes.map(q => ({
        ticker: q.yahooSymbol.replace('.JK', ''),
        changePercent: sanitizeMarketPercent(q.changePercent, 35) ?? 0
      }))
      const parsed  = parsePortfolio(input)
      const outcome = analyzePortfolio(input, cleanQuotes, lang)

      // ── Derive MarketCondition from live quote data ───────────────
      const validChanges = cleanQuotes.map(q => q.changePercent).filter(v => !isNaN(v))
      const avgAbs = validChanges.length > 0
        ? validChanges.reduce((s, v) => s + Math.abs(v), 0) / validChanges.length
        : 0
      const redRatio = validChanges.length > 0
        ? validChanges.filter(v => v < 0).length / validChanges.length
        : 0.5

      const volatility: 'low' | 'medium' | 'high' =
        avgAbs > 2.5 ? 'high' : avgAbs < 0.8 ? 'low' : 'medium'
      const trend: 'up' | 'sideways' | 'down' =
        redRatio < 0.35 ? 'up' : redRatio > 0.65 ? 'down' : 'sideways'

      const lightQuotes = quotes.map(q => ({
        status: q.status,
        changePercent: sanitizeMarketPercent(q.changePercent, 35) ?? 0,
      }))
      const initialTrust = computeConfidenceFromQuotes(lightQuotes, volatility)
      const insightCtx: InsightInput = {
        portfolio: parsed.map(h => ({ asset: h.ticker, weight: h.weight })),
        market: { volatility, trend },
        language: lang as 'id' | 'en',
        trust: initialTrust,
      }

      setConfidenceScore(initialTrust)
      setQuickInsight(generateQuickInsight(insightCtx))
      setFullInsight(generateInsight(insightCtx))

      setHoldings(parsed)
      setResult(outcome)
      setShowPanel(true)
      setAnalysisLoading(false)

      // ── Trust Layer v2: async per-symbol FMP validation ──────────────────────
      // Run after panel is shown so it never blocks the UI.
      // Falls back to breadth-based heuristic when FMP is unavailable.
      ;(async () => {
        const API_URL = (import.meta as any).env?.VITE_API_URL ?? ''

        // Equity tickers that map 1:1 to a FMP symbol (IDX stocks end with .JK)
        const equityHoldings = parsed.filter(h => !['BTC', 'ETH', 'XAU', 'GOLD'].includes(h.ticker.toUpperCase()))

        if (equityHoldings.length === 0) {
          // Non-equity portfolio — use fallback breadth heuristic
          const lightQuotes = quotes.map(q => ({
            status: q.status,
            changePercent: sanitizeMarketPercent(q.changePercent, 35) ?? 0,
          }))
          const fallbackScore = computeConfidenceFromQuotes(lightQuotes, volatility)
          setConfidenceScore(fallbackScore)
          // Re-generate with trust context
          const fallbackCtx: InsightInput = { portfolio: parsed.map(h => ({ asset: h.ticker, weight: h.weight })), market: { volatility, trend }, language: lang as 'id' | 'en', trust: fallbackScore }
          setQuickInsight(generateQuickInsight(fallbackCtx))
          setFullInsight(generateInsight(fallbackCtx))
          return
        }

        // Attempt FMP price fetch for each equity holding
        const symbolScores = await Promise.all(
          equityHoldings.map(async h => {
            const yahooQuote = quotes.find(
              q => q.symbol === h.ticker || q.yahooSymbol.replace('.JK', '') === h.ticker
            )
            const yahooPrice = yahooQuote?.price ?? null
            const yahooStatus = yahooQuote?.status ?? 'error'

            // Try to get FMP price from backend
            let fmpPrice: number | null = null
            try {
              const fmpSymbol = h.ticker.includes('.') ? h.ticker : `${h.ticker}.JK`
              const res = await fetch(
                `${API_URL}/api/market/quote?symbol=${encodeURIComponent(fmpSymbol)}&source=fmp`,
                { signal: AbortSignal.timeout(4000) }
              )
              if (res.ok) {
                const json = await res.json()
                if (json.ok && json.data?.price > 0) fmpPrice = json.data.price
              }
            } catch {
              // FMP unavailable — proceed with yahoo-only path
            }

            return computeConfidenceForSymbol({
              symbol: h.ticker,
              yahooPrice,
              fmpPrice,
              volatility,
              status: yahooStatus,
            })
          })
        )

        const aggregated = aggregateConfidenceScores(symbolScores)
        setConfidenceScore(aggregated)

        // Re-generate insights with resolved trust context so text reflects
        // the real data reliability signal from Phase 2.
        const insightCtxWithTrust: InsightInput = {
          portfolio: parsed.map(h => ({ asset: h.ticker, weight: h.weight })),
          market: { volatility, trend },
          language: lang as 'id' | 'en',
          trust: aggregated,
        }
        setQuickInsight(generateQuickInsight(insightCtxWithTrust))
        setFullInsight(generateInsight(insightCtxWithTrust))
      })()

      setTimeout(() => document.getElementById('ai-result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300)
    }, 1400)
  }, [quotes, lang])

  const selectedQuote = quotes.find(q => q.yahooSymbol === selectedTicker)
  const isFallback    = quotes.some(q => (q as any).status === 'fallback')
  const portfolioContext = useMemo(() => {
    if (holdings.length > 0) {
      return holdings.map(h => ({ asset: h.ticker, weight: h.weight }))
    }

    return portfolioSnapshot.holdings.map(h => ({
      asset: h.symbol,
      weight: h.allocationPercent,
    }))
  }, [holdings, portfolioSnapshot.holdings])
  const hasPortfolioContext = holdings.length > 0 || portfolioSnapshot.hasPortfolio

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.white, overflowX: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ══ TOPNAV ══════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(11,13,18,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>
          {/* Back */}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
            fontFamily: C.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
            color: C.slate500,
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
            </svg>
            {t.back}
          </Link>

          {/* Logo badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 7,
              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="10" fill={C.amber} viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span style={{ fontFamily: C.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.slate500 }}>Ting AI</span>
          </div>

          {/* Auth actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!authenticated && (
              <Link to="/login" style={{
                fontFamily: C.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em',
                color: C.slate500, textDecoration: 'none',
              }}>
                {t.login}
              </Link>
            )}
            {!isPro && (
              <Link to="/upgrade" style={{
                fontFamily: C.mono, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '6px 14px', borderRadius: 8,
                border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.08)',
                color: C.amber, textDecoration: 'none',
              }}>
                {t.viewPro}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ══ MAIN ══════════════════════════════════════════════════════ */}
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '88px 24px 96px', display: 'flex', flexDirection: 'column', gap: 64 }}>

        {/* ── 1. HERO & START ─────────────────────────────────────── */}
        <section className="grid lg:grid-cols-12 gap-10 lg:gap-16 pt-6">
          
          {/* Left Column (Hero + Option B) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Pro-aware header */}
            <ProAwareTingAiHeader isPro={isPro} hasPortfolio={hasPortfolioContext} />

            {isPro && (
              <PortfolioStatusCard hasPortfolio={hasPortfolioContext} />
            )}

            <CapabilityRow />

            <div style={{ padding: '24px 0', borderTop: `1px solid ${C.border}` }}>
              <div style={{ position: 'relative', marginTop: 16 }}>
                <HeroInput onAnalyze={handleAnalyze} loading={analysisLoading} isPro={isPro} />
                {isFallback && (
                  <p style={{ marginTop: 10, fontFamily: C.mono, fontSize: 10, color: C.slate600, letterSpacing: '0.1em' }}>
                    {t.fallbackDataNote}
                  </p>
                )}
              </div>
              
              {/* Preview Hint */}
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, border: `1px dashed ${C.border}`, background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ fontFamily: C.mono, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.slate500, marginBottom: 6, display: 'block' }}>
                  {lang === 'id' ? 'Ting AI akan menganalisis:' : 'Ting AI will analyze:'}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[t.cardPortfolioSummary, t.cardPortfolioImpact, t.cardMarketContext].map(l => (
                    <span key={l} style={{ fontSize: 10, color: C.slate400, padding: '2px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Copilot Starter) */}
          <div className="lg:col-span-7 flex flex-col gap-4 relative">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: C.teal, fontSize: 11, fontWeight: 700, fontFamily: C.mono }}>A</span>
              </div>
              <span style={{ fontFamily: C.mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.white }}>
                {lang === 'id' ? 'Tanya Ting AI langsung' : 'Ask Ting AI directly'}
              </span>
            </div>
            
            <div className="sticky top-[88px]" style={{ zIndex: 10 }}>
              <TingAiCopilot
                market={{
                  volatility: (() => {
                    const validChanges = quotes.map(q => sanitizeMarketPercent(q.changePercent, 35) ?? 0).filter(v => !isNaN(v))
                    const avgAbs = validChanges.length > 0 ? validChanges.reduce((s, v) => s + Math.abs(v), 0) / validChanges.length : 0
                    return avgAbs > 2.5 ? 'high' : avgAbs < 0.8 ? 'low' : 'medium'
                  })(),
                  trend: (() => {
                    const validChanges = quotes.map(q => sanitizeMarketPercent(q.changePercent, 35) ?? 0).filter(v => !isNaN(v))
                    const redRatio = validChanges.length > 0 ? validChanges.filter(v => v < 0).length / validChanges.length : 0.5
                    return redRatio < 0.35 ? 'up' : redRatio > 0.65 ? 'down' : 'sideways'
                  })(),
                }}
                portfolio={portfolioContext}
                trust={confidenceScore || { confidence: 'MEDIUM', reason: { sourceAlignment: false, volatility: 'medium', dataQuality: 'weak', note: '' } }}
                insight={fullInsight || { reality: '', tradeoff: '', direction: '' }}
                isPro={isPro}
              />
            </div>
          </div>
        </section>

        {/* ── 2. ANALYSIS RESULT ──────────────────────────────────── */}
        <AnimatePresence>
          {(showPanel || analysisLoading) && (
            <motion.section
              id="ai-result-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <Divider label={t.analysisResult} />

              {/* ── Insight Engine card ─────────────────────────────── */}
              {showPanel && quickInsight && fullInsight && !analysisLoading && (
                <InsightEngineCard
                  quickInsight={quickInsight}
                  fullInsight={fullInsight}
                  language={lang as 'id' | 'en'}
                />
              )}

              {/* ── Panel ───────────────────────────────────────────── */}
              {analysisLoading
                ? <AnalysisLoading />
                : showPanel && result && (
                  <InsightPanel
                    result={result}
                    holdings={holdings}
                    visible={showPanel}
                    isPro={isPro}
                    confidenceScore={confidenceScore}
                    quickInsight={quickInsight}
                    fullInsight={fullInsight}
                    language={lang as 'id' | 'en'}
                    trust={confidenceScore}
                  />
                )
              }

            </motion.section>
          )}
        </AnimatePresence>

        {/* ── 3. IHSG MARKET CONTEXT ──────────────────────────────── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Section header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: C.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', color: C.slate500 }}>
                {t.marketContextLabel}
              </span>
              {!quotesLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: C.mono, fontSize: 10, color: C.teal }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal }} />
                  {t.ihsgDelayed}
                </div>
              )}
            </div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: C.white }}>
              {t.marketContextTitle}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: C.slate500 }}>
              {t.marketContextSubtitle}
            </p>
          </div>

          {/* IHSG card */}
          {!quotesLoading && quotes.length > 0 ? (
            <IhsgCard quotes={quotes} />
          ) : !quotesLoading ? (
            <div style={{
              borderRadius: 16,
              border: `1px solid ${C.border}`,
              background: C.surface,
              padding: 22,
              color: C.slate500,
              fontSize: 13,
            }}>
              {t.ihsgUnavailable}
            </div>
          ) : null}

          <StockChart ticker="^JKSE" />

          {/* Stock grid */}
          <MarketSnapshot
            quotes={quotes}
            loading={quotesLoading}
            onSelectTicker={setSelectedTicker}
            selectedTicker={selectedTicker}
          />

          {/* Chart */}
          <StockChart
            ticker={selectedTicker}
            currentPrice={selectedQuote?.price}
            changePercent={selectedQuote?.changePercent}
          />
        </section>

        {/* ── 4. FOOTER NOTE ──────────────────────────────────────── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: 32, display: 'flex', flexDirection: 'column', gap: 24,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4 style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.slate500 }}>
                {t.footerPhilosophyTitle}
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: C.slate600, lineHeight: 1.8 }}>
                {t.footerPhilosophyBody}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h4 style={{ margin: 0, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.slate500 }}>
                {t.footerDataTitle}
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: C.slate600, lineHeight: 1.8 }}>
                {t.footerDataBody}
              </p>
            </div>
          </div>
          <p style={{ margin: 0, fontFamily: C.mono, fontSize: 10, color: C.slate700, textAlign: 'center', letterSpacing: '0.08em' }}>
            {t.footerCredit}
          </p>
        </footer>
      </main>
    </div>
  )
}
