/**
 * EmptyPortfolioState.tsx
 * Premium empty state for /komando-pagi when user has no portfolio
 * 
 * PRINCIPLE: No fake data. Show honest status.
 * - If market data available: show real quotes
 * - If market data unavailable: show "—" and "data syncing" message
 * - Never show fake numbers
 * 
 * Shows:
 * 1. Market overview (real data or honest empty state)
 * 2. Guidance: why portfolio matters
 * 3. CTA: "Tambah Portofolio" + "Coba Portofolio Demo"
 * 4. Benefits preview: 3 core benefits
 * 
 * Tone: Calm, premium, analytical, honest.
 */

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguagePreference, type LanguageCode } from '../utils/language'
import { getMorningCommandCopy } from '../utils/morningCommandI18n'
import { fetchMarketOverview, formatPrice, formatChangePercent, getChangeColor, type MarketOverview } from '../utils/marketOverviewService'

type EmptyPortfolioStateProps = {
  userPlan?: string
  language?: LanguageCode
}

export default function EmptyPortfolioState({ userPlan, language: passedLanguage }: EmptyPortfolioStateProps) {
  const navigate = useNavigate()
  const { language } = useLanguagePreference()
  const lang: LanguageCode = passedLanguage || language
  const copy = useMemo(() => getMorningCommandCopy(lang), [lang])
  const isPro = Boolean(userPlan && userPlan !== 'free')

  const [marketOverview, setMarketOverview] = useState<MarketOverview>({
    quotes: {},
    loaded: false,
    error: null,
    lastUpdate: Date.now(),
    hasCachedData: false,
  })

  useEffect(() => {
    fetchMarketOverview().then(setMarketOverview)
  }, [])

  // ── Market symbols to display (always show structure, even if empty) ──
  const MARKET_SYMBOLS = ['IHSG', 'BTC', 'XAUUSD', 'SP500', 'USDIDR']
  
  // ── Get all quotes including nulls (for honest empty state display) ──
  const allMarketQuotes = MARKET_SYMBOLS.map(symbol => ({
    symbol,
    data: marketOverview.quotes[symbol] || null,
  }))

  // ── Check if we have any real data ──
  const hasAnyRealData = marketOverview.loaded && 
                         Object.values(marketOverview.quotes).some(q => q !== null)

  // ── Benefits list ──
  const benefits = [
    { icon: '◈', key: 'riskConcentration' },
    { icon: '◎', key: 'marketPressure' },
    { icon: '◉', key: 'decisionTrade' },
  ]

  // ── Palette (teal for positive/calm) ──
  const p = {
    accent: '#2dd4bf',
    dot: '#14b8a6',
    glow: 'rgba(20,184,166,0.12)',
    bg: 'rgba(20,184,166,0.04)',
    pillBg: 'rgba(20,184,166,0.10)',
    pillText: '#5eead4',
    pillBorder: 'rgba(20,184,166,0.25)',
  }

  return (
    <div className="space-y-4">
      {/* ══════════════════════════════════════════════════════════
          HERO SECTION — Welcoming, not pushy
         ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden border border-white/[0.07]"
        style={{ background: p.bg }}
      >
        {/* Glow accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl"
          style={{ background: p.glow }}
        />
        <div
          className="absolute top-0 inset-x-0 h-[1.5px]"
          style={{ background: `linear-gradient(90deg, transparent, ${p.accent}70, transparent)` }}
        />

        <div className="relative z-10 p-6 md:p-8 space-y-6">
          {/* Headline + Description */}
          <div className="space-y-3 max-w-xl">
            <h2
              className="text-2xl font-bold tracking-tight text-white"
              style={{ lineHeight: '1.3' }}
            >
              {copy.emptyPortfolioHeroHeadline}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {copy.emptyPortfolioHeroSubtext}
            </p>
          </div>

          {/* Data sync status — humble message */}
          {marketOverview.loaded ? (
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              {copy.marketDataReady}
            </p>
          ) : (
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
              {copy.marketDataSyncing}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/portfolio')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold rounded-xl transition-all"
              style={{ background: p.accent, color: '#000', boxShadow: `0 4px 16px ${p.dot}20` }}
            >
              {copy.emptyPortfolioCTAPrimary}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/explore-intelligence')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-xl border border-white/[0.08] text-slate-300 hover:bg-white/[0.04] transition-all"
            >
              {copy.emptyPortfolioCTASecondary}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          MARKET OVERVIEW — Always show, but honest about data availability
         ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="rounded-2xl border border-white/[0.06] p-5 md:p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <span style={{ opacity: 0.5 }}>◈</span>
            {copy.marketOverviewLabel}
          </h3>
          
          {/* Status badge — honest about data availability */}
          {hasAnyRealData && (
            <span className="text-[9px] text-emerald-500/70 font-mono uppercase tracking-widest">
              {copy.marketDataReady}
            </span>
          )}
          {!marketOverview.loaded && (
            <span className="text-[9px] text-amber-500/70 font-mono uppercase tracking-widest">
              {copy.marketDataSyncing}
            </span>
          )}
        </div>

        {/* Market grid — always show structure, honest about values */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {allMarketQuotes.map(({ symbol, data }) => {
            const isAvailable = data !== null
            const changeColor = getChangeColor(data?.changePercent ?? null)

            return (
              <div
                key={symbol}
                className="rounded-lg px-3 py-2.5 border border-white/[0.04] space-y-1.5"
                style={{ background: 'rgba(255,255,255,0.01)' }}
              >
                <p className="text-[10px] font-semibold text-slate-400 line-clamp-1">
                  {symbol}
                </p>
                <p className="text-sm font-semibold text-white">
                  {isAvailable ? formatPrice(symbol, data.price) : '—'}
                </p>
                <p
                  className="text-[10px] font-mono font-medium"
                  style={{ color: changeColor }}
                >
                  {isAvailable ? formatChangePercent(data.changePercent) : '—'}
                </p>
                {!isAvailable && (
                  <p className="text-[8px] text-slate-600 uppercase tracking-wider">
                    {copy.marketDataUnavailableLabel}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Honest status message */}
        {!hasAnyRealData && (
          <p className="text-[10px] text-slate-600 italic leading-relaxed">
            {copy.marketDataSyncingFallback}
          </p>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          WHY PORTFOLIO MATTERS — 3 benefits
         ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.15 }}
      >
        <h3 className="text-[11px] font-mono text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span style={{ opacity: 0.5 }}>◎</span>
          {copy.emptyPortfolioBenefitsLabel}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 + i * 0.06 }}
              className="rounded-xl border border-white/[0.06] px-4 py-3.5 space-y-2"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <p className="text-[11px] font-semibold text-teal-300">
                {benefit.icon} {copy.emptyPortfolioBenefits[benefit.key as keyof typeof copy.emptyPortfolioBenefits]?.title || ''}
              </p>
              <p className="text-slate-400 text-[12px] leading-relaxed">
                {copy.emptyPortfolioBenefits[benefit.key as keyof typeof copy.emptyPortfolioBenefits]?.description || ''}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════
          GUIDANCE — Next steps (calm, not pushy)
         ══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.2 }}
        className="rounded-2xl border border-white/[0.06] p-5 md:p-6 space-y-3.5"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <h3 className="text-[11px] font-mono text-slate-600 uppercase tracking-widest flex items-center gap-2">
          <span style={{ opacity: 0.5 }}>◉</span>
          {copy.emptyPortfolioGuidanceLabel}
        </h3>

        <ol className="space-y-2.5 text-sm">
          {copy.emptyPortfolioGuidanceSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-slate-400 leading-relaxed text-[13px]">
              <span className="font-mono font-bold text-teal-400 flex-shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {/* Bottom note — encouraging but not pushy */}
        <p className="text-[11px] text-slate-600 italic pt-2 border-t border-white/[0.04]">
          {copy.emptyPortfolioNote}
        </p>
      </motion.div>
    </div>
  )
}
