/**
 * LifeOS.tsx — Personal Space (v2: Portfolio-aware market mirror)
 * Route: /personal-space
 * Removed: sleep, hydration, old backend APIs
 * Added: portfolio-aware hero, micro insights, dual currency, pro sections
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'
import { useAuthSession } from '../utils/useAuthSession'
import { hasProAccess } from '../utils/entitlements'
import { getPortfolioStorage } from '../utils/portfolioStorage'
import { getPortfolioIntelligence } from '../utils/portfolioIntelligence'

type Lang = 'id' | 'en'

const COPY = {
  id: {
    pageTitle: 'Ruang Personal',
    pageSub: 'Bukan lihat pasar — tapi lihat dirimu di dalam pasar.',
    emptyTitle: 'Personal Space akan aktif setelah kamu menambahkan aset pertama.',
    emptyCta: 'Tambah aset',
    heroLabel: 'Nilai Total',
    pnlLabel: 'PnL',
    statusPrefix: 'Posisi kamu hari ini:',
    riskLabel: 'Risiko',
    concLabel: 'Konsentrasi',
    concLevels: { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' } as Record<string, string>,
    riskLevels: { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' } as Record<string, string>,
    insightLabel: 'Yang mungkin kamu tidak sadari',
    cardPosisi: 'Posisi Hari Ini',
    cardRisiko: 'Risiko Tersembunyi',
    cardAset: 'Aset Paling Berpengaruh',
    assetListLabel: 'Komposisi Aset',
    scenarioLabel: 'Skenario Mikro',
    proTitle: 'Analisis Mendalam',
    proWhy: 'Kenapa ini terjadi',
    proImpact: 'Dampak ke posisi kamu',
    proIfCont: 'Jika berlanjut',
    proEvidence: 'Lihat Bukti',
    proEvidenceFallback: ['pergerakan harga', 'komposisi aset', 'bobot kontribusi', 'kondisi pasar utama'],
    proLabel: 'Pro',
    proPreview: 'Lihat pratinjau',
    proHint: 'Analisis lengkap tersedia di Pro',
    fallbackDominant: 'Belum cukup data untuk menentukan aset paling dominan.',
    fallbackImpact: 'Dampak belum dapat dihitung dari data saat ini.',
    fallbackAnalyzing: 'Sedang dianalisis...',
    fallbackWorkspace: 'Ruang Portofolio',
    fallbackRiskCard: 'Dampak belum dapat dihitung dari data saat ini.',
    ctaSensitive: 'Lihat kenapa posisimu sensitif',
    ctaAsk: 'Tanya Ting AI',
    ctaEvidence: 'Lihat bukti analisis',
    approx: '≈',
    basedOn: 'Berdasarkan:',
  },
  en: {
    pageTitle: 'Personal Space',
    pageSub: 'Not watching the market — seeing yourself inside it.',
    emptyTitle: 'Personal Space will activate after you add your first asset.',
    emptyCta: 'Add asset',
    heroLabel: 'Total Value',
    pnlLabel: 'PnL',
    statusPrefix: 'Your position today:',
    riskLabel: 'Risk',
    concLabel: 'Concentration',
    concLevels: { low: 'Low', medium: 'Medium', high: 'High' } as Record<string, string>,
    riskLevels: { low: 'Low', medium: 'Medium', high: 'High' } as Record<string, string>,
    insightLabel: 'What you might not realize',
    cardPosisi: "Today's Position",
    cardRisiko: 'Hidden Risk',
    cardAset: 'Most Influential Asset',
    assetListLabel: 'Asset Composition',
    scenarioLabel: 'Micro Scenario',
    proTitle: 'Deep Analysis',
    proWhy: 'Why this is happening',
    proImpact: 'Impact on your position',
    proIfCont: 'If this continues',
    proEvidence: 'See Evidence',
    proEvidenceFallback: ['price movements', 'asset composition', 'contribution weights', 'key market conditions'],
    proLabel: 'Pro',
    proPreview: 'Preview',
    proHint: 'Full analysis available in Pro',
    fallbackDominant: 'Not enough data to determine the most influential asset.',
    fallbackImpact: 'Impact cannot be calculated from the current data yet.',
    fallbackAnalyzing: 'Analyzing...',
    fallbackWorkspace: 'Personal Workspace',
    fallbackRiskCard: 'Impact cannot be calculated from the current data yet.',
    ctaSensitive: 'See why your position is sensitive',
    ctaAsk: 'Ask Ting AI',
    ctaEvidence: 'See analysis evidence',
    approx: '≈',
    basedOn: 'Based on:',
  },
}

function getCopy(lang: Lang) { return COPY[lang] ?? COPY.id }

function inferBaseCurrency(): 'IDR' | 'USD' {
  try {
    const s = localStorage.getItem('tingai_portfolio_base_currency')
    return s === 'USD' ? 'USD' : 'IDR'
  } catch { return 'IDR' }
}

function getFxRate(): number {
  return 16000 // same fallback as Portfolio.tsx
}

function fmtCurrency(val: number, cur: 'IDR' | 'USD'): string {
  if (cur === 'USD') return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  return `Rp ${val.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
}

function toBase(value: number, assetCur: 'IDR' | 'USD', baseCur: 'IDR' | 'USD', fx: number): number {
  if (assetCur === baseCur) return value
  if (assetCur === 'USD' && baseCur === 'IDR') return value * fx
  if (assetCur === 'IDR' && baseCur === 'USD') return value / fx
  return value
}

function inferAssetCurrency(position: ReturnType<typeof getPortfolioStorage>[number]): 'IDR' | 'USD' {
  if (position.assetCurrency) return position.assetCurrency
  return position.assetType === 'stock' && position.region === 'ID' ? 'IDR' : 'USD'
}

/* ── Pro Gate ─────────────────────────────────────────────────────── */
function ProGate({ children, isPro, label, previewLabel }: {
  children: React.ReactNode; isPro: boolean; label: string; previewLabel: string
}) {
  const [open, setOpen] = useState(false)
  if (isPro || open) return <>{children}</>
  return (
    <div className="relative rounded-2xl border border-white/[0.06] overflow-hidden">
      <div className="pointer-events-none blur-[3px] opacity-30 select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#080a0f]/60 backdrop-blur-sm">
        <div className="text-center space-y-2">
          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border border-teal-500/30 text-teal-400/70">Pro</span>
          <p className="text-slate-400 text-xs max-w-[200px]">{label}</p>
          <button onClick={() => setOpen(true)} className="px-4 py-1.5 text-[11px] font-semibold rounded-lg border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-all">{previewLabel}</button>
        </div>
      </div>
    </div>
  )
}

/* ── Main ─────────────────────────────────────────────────────────── */
export default function LifeOS() {
  const { user } = useAuthSession()
  const { language } = useLanguagePreference()
  const c = useMemo(() => getCopy(language), [language])
  const isPro = hasProAccess(user)
  const baseCurrency = inferBaseCurrency()
  const fx = getFxRate()

  const positions = useMemo(() => getPortfolioStorage(), [])
  const hasPortfolio = positions.length > 0

  const normalizedPositions = useMemo(() => {
    return positions.map((p, index) => {
      const assetCurrency = inferAssetCurrency(p)
      const quoteCurrency = assetCurrency
      const currentPrice =
        typeof p.currentPrice === 'number' && Number.isFinite(p.currentPrice) && p.currentPrice > 0
          ? p.currentPrice
          : p.entryPrice
      const currentValue =
        typeof p.currentValue === 'number' && Number.isFinite(p.currentValue) && p.currentValue > 0
          ? p.currentValue
          : currentPrice * p.quantity
      const investedAmount = p.quantity * p.entryPrice
      const pnl =
        typeof p.pnl === 'number' && Number.isFinite(p.pnl)
          ? p.pnl
          : currentValue - investedAmount
      const pnlPct =
        typeof p.pnlPct === 'number' && Number.isFinite(p.pnlPct)
          ? p.pnlPct
          : investedAmount > 0
            ? (pnl / investedAmount) * 100
            : null

      return {
        id: index + 1,
        assetId: index + 1,
        symbol: p.symbol,
        name: p.name || p.symbol,
        assetType: p.assetType,
        region: p.region,
        quantity: p.quantity,
        entryPrice: p.entryPrice,
        investedAmount,
        investedAmountDisplay: toBase(investedAmount, p.entryCurrency, baseCurrency, fx),
        latestPrice: currentPrice,
        currentValue: toBase(currentValue, quoteCurrency, baseCurrency, fx),
        pnl: toBase(pnl, quoteCurrency, baseCurrency, fx),
        pnlPct,
        entryCurrency: p.entryCurrency,
        quoteCurrency,
        displayCurrency: baseCurrency,
        fetchedAt: null,
      }
    })
  }, [positions, baseCurrency, fx])

  // Build intelligence from stored positions
  const intelligence = useMemo(() => {
    if (!hasPortfolio) return null
    const totalInvested = normalizedPositions.reduce((s, p) => s + (p.investedAmountDisplay ?? 0), 0)
    const totalCurrent = normalizedPositions.reduce((s, p) => s + (p.currentValue ?? 0), 0)
    const mockPortfolio = {
      summary: {
        totalCurrentValue: totalCurrent,
        totalInvested,
        totalPnl: totalCurrent - totalInvested,
        totalPnlPct: totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0,
        totalHoldings: normalizedPositions.length,
        displayCurrency: baseCurrency
      },
      holdings: normalizedPositions,
    }
    return getPortfolioIntelligence(mockPortfolio as any, language)
  }, [normalizedPositions, language, hasPortfolio, baseCurrency])

  // Compute totals in base currency
  const totals = useMemo(() => {
    if (!hasPortfolio) return { value: 0, invested: 0, pnl: 0, pnlPct: 0 }
    let value = 0, invested = 0
    for (const p of positions) {
      const currentCurrency = inferAssetCurrency(p)
      const currentValue =
        typeof p.currentValue === 'number' && Number.isFinite(p.currentValue) && p.currentValue > 0
          ? p.currentValue
          : (typeof p.currentPrice === 'number' && Number.isFinite(p.currentPrice) && p.currentPrice > 0
              ? p.currentPrice
              : p.entryPrice) * p.quantity
      const investedValue = p.quantity * p.entryPrice
      value += toBase(currentValue, currentCurrency, baseCurrency, fx)
      invested += toBase(investedValue, p.entryCurrency, baseCurrency, fx)
    }
    const pnl = value - invested
    return { value, invested, pnl, pnlPct: invested > 0 ? (pnl / invested) * 100 : 0 }
  }, [positions, baseCurrency, fx, hasPortfolio])

  // Asset list with dual currency
  const assetList = useMemo(() => {
    if (!hasPortfolio) return []
    const totalVal = totals.value || 1
    return positions.map(p => {
      const ac = inferAssetCurrency(p)
      const nativeVal =
        typeof p.currentValue === 'number' && Number.isFinite(p.currentValue) && p.currentValue > 0
          ? p.currentValue
          : (typeof p.currentPrice === 'number' && Number.isFinite(p.currentPrice) && p.currentPrice > 0
              ? p.currentPrice
              : p.entryPrice) * p.quantity
      const baseVal = toBase(nativeVal, ac, baseCurrency, fx)
      return {
        symbol: p.symbol,
        name: p.name,
        assetCurrency: ac,
        nativeValue: nativeVal,
        baseValue: baseVal,
        contribution: (baseVal / totalVal) * 100,
        showDual: ac !== baseCurrency,
      }
    }).sort((a, b) => b.baseValue - a.baseValue)
  }, [positions, baseCurrency, fx, totals.value, hasPortfolio])

  // Derived text
  const top = intelligence?.largestPosition
  const concPct = top?.weight ?? 0
  const concLevel = concPct > 50 ? 'high' : concPct > 30 ? 'medium' : 'low'
  const tone = intelligence?.portfolioTone ?? 'neutral'
  const riskLevel = tone === 'bearish' || tone === 'volatile' ? 'high' : tone === 'cautious' ? 'medium' : 'low'

  const statusSentence = useMemo(() => {
    if (!intelligence) return ''
    const l = language
    if (concPct > 50) return l === 'en' ? 'stable, but still sensitive to one main asset.' : 'stabil, tapi masih sensitif ke satu aset utama.'
    if (concPct > 30) return l === 'en' ? 'balanced, with moderate concentration.' : 'cukup seimbang, dengan konsentrasi sedang.'
    return l === 'en' ? 'well-diversified, no single dominant asset.' : 'terdiversifikasi baik, tidak ada aset yang terlalu dominan.'
  }, [intelligence, concPct, language])

  const microInsight = useMemo(() => {
    if (!top) return ''
    const l = language
    if (concPct > 50) return l === 'en' ? `1 asset determines more than half of your portfolio.` : `1 aset menentukan lebih dari setengah portofoliomu.`
    if (concPct > 30) return l === 'en' ? `Small moves in ${top.label} can feel significant to your total.` : `Pergerakan kecil di ${top.label} bisa terasa besar ke total portofoliomu.`
    return l === 'en' ? `Your portfolio looks safe, but keep monitoring concentration.` : `Portofoliomu terlihat aman, tapi tetap pantau konsentrasi.`
  }, [top, concPct, language])

  const cardTexts = useMemo(() => {
    const l = language
    return {
      posisi: concPct > 50
        ? (l === 'en' ? 'You are leaning defensive, not yet aggressive on market risk.' : 'Kamu cenderung defensif, belum terlalu agresif terhadap risiko pasar.')
        : (l === 'en' ? 'Your positioning is moderate with room for adjustment.' : 'Posisimu moderat, masih ada ruang untuk penyesuaian.'),
      risiko: !top
        ? c.fallbackRiskCard
        : concPct > 40
        ? (l === 'en' ? 'Portfolio is concentrated — one asset could be too dominant.' : 'Masih terpusat — satu aset bisa terlalu dominan.')
        : (l === 'en' ? 'Concentration is manageable, but keep watching.' : 'Konsentrasi masih terkendali, tapi tetap perhatikan.'),
      aset: top
        ? (l === 'en' ? `${top.label} has the biggest impact compared to others right now.` : `${top.label} memberi dampak terbesar dibanding aset lain saat ini.`)
        : '—',
    }
  }, [concPct, top, language, c])

  const scenarios = useMemo(() => {
    const l = language
    const items: string[] = []
    if (top) {
      items.push(l === 'en'
        ? `If ${top.label} drops, total value could feel it significantly.`
        : `Jika ${top.label} turun, total nilai bisa ikut terasa signifikan.`)
    }
    items.push(l === 'en'
      ? 'If market weakens, the dominant asset will determine overall direction.'
      : 'Jika pasar melemah, aset dominan akan paling menentukan arah total.')
    return items.slice(0, 2)
  }, [top, language])

  const cardAssetValue = top
    ? (language === 'en' ? `${top.label} has the biggest impact compared to others right now.` : `${top.label} memberi dampak terbesar dibanding aset lain saat ini.`)
    : c.fallbackDominant

  const proImpactText = top
    ? (language === 'en'
        ? `${top.label} at ${concPct.toFixed(0)}% makes your portfolio react disproportionately to its moves.`
        : `${top.label} di ${concPct.toFixed(0)}% membuat reaksi tidak proporsional terhadap pergerakannya.`)
    : c.fallbackImpact

  const safeScenarios = scenarios.length ? scenarios : [c.fallbackAnalyzing]

  const [showEvidence, setShowEvidence] = useState(false)

  // ── Empty state ─────────────────────────────────────────────────
  if (!hasPortfolio) {
    return (
      <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(20,184,166,0.06) 0%, transparent 60%), #080a0f', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-20 text-center space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{c.fallbackWorkspace}</h1>
          <p className="text-slate-500 text-sm" style={{ lineHeight: '1.55' }}>{c.emptyTitle}</p>
          <Link to="/portfolio" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl bg-teal-500 text-black">{c.emptyCta} →</Link>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-20" style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(20,184,166,0.06) 0%, transparent 60%), #080a0f', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-10 space-y-6">

        {/* Page header */}
        <div className="space-y-0.5">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{c.pageSub}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{c.fallbackWorkspace}</h1>
        </div>

        {/* ═══ HERO ═══ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/[0.07] overflow-hidden relative"
          style={{ background: 'rgba(20,184,166,0.04)' }}>
          <div className="absolute top-0 inset-x-0 h-[1.5px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.5), transparent)' }} />
          <div className="relative z-10 p-6 md:p-8 space-y-4">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">{c.heroLabel}</p>
            <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">{fmtCurrency(totals.value, baseCurrency)}</p>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${totals.pnl >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                {totals.pnl >= 0 ? '+' : ''}{fmtCurrency(totals.pnl, baseCurrency)} ({totals.pnlPct.toFixed(1)}%)
              </span>
            </div>
            <p className="text-slate-300 text-[14px]" style={{ lineHeight: '1.5' }}>
              {c.statusPrefix} {statusSentence}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskLevel === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : riskLevel === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'}`}>
                {c.riskLabel}: {c.riskLevels[riskLevel]}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${concLevel === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' : concLevel === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'}`}>
                {c.concLabel}: {c.concLevels[concLevel]}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ═══ MICRO INSIGHT ═══ */}
        {microInsight && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="rounded-xl border border-white/[0.06] px-4 py-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-1">{c.insightLabel}</p>
            <p className="text-slate-300 text-[13px]" style={{ lineHeight: '1.5' }}>{microInsight}</p>
          </motion.div>
        )}

        {/* ═══ 3 COMPACT CARDS ═══ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { label: c.cardPosisi, value: cardTexts.posisi },
            { label: c.cardRisiko, value: cardTexts.risiko },
            { label: c.cardAset, value: cardAssetValue },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}
              className="rounded-xl border border-white/[0.06] px-4 py-3.5 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)', minHeight: '68px' }}>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">{card.label}</p>
              <p className="text-slate-300 text-[13px]" style={{ lineHeight: '1.5' }}>{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ═══ ASSET LIST (dual currency) ═══ */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">{c.assetListLabel}</p>
          <div className="space-y-1.5">
            {assetList.map(a => (
              <div key={a.symbol} className="rounded-xl border border-white/[0.06] px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div>
                  <p className="text-white font-semibold text-[14px]">{a.symbol}</p>
                  {a.name && <p className="text-slate-600 text-[11px]">{a.name}</p>}
                </div>
                <div className="text-right">
                  <p className="text-white text-[14px] font-medium">{fmtCurrency(a.baseValue, baseCurrency)}</p>
                  {a.showDual && <p className="text-slate-500 text-[10px] font-mono">{c.approx} {fmtCurrency(a.nativeValue, a.assetCurrency)}</p>}
                  <p className="text-slate-600 text-[10px]">{a.contribution.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ MICRO SCENARIO (Free) ═══ */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">{c.scenarioLabel}</p>
          <div className="rounded-xl border border-white/[0.06] px-4 py-3.5 space-y-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
            {safeScenarios.map((s, i) => (
              <p key={i} className="flex items-start gap-2 text-slate-400 text-[13px]" style={{ lineHeight: '1.5' }}>
                <span className="text-slate-600 mt-0.5">•</span>{s}
              </p>
            ))}
          </div>
        </div>

        {/* ═══ PRO: Deep Analysis ═══ */}
        <ProGate isPro={isPro} label={c.proHint} previewLabel={c.proPreview}>
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider flex items-center gap-2">
              {c.proTitle}
              {!isPro && <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest border border-teal-500/25 text-teal-400/60 rounded">{c.proLabel}</span>}
            </p>
            {[
              { label: c.proWhy, text: language === 'en' ? 'Market structure and asset composition are creating this sensitivity profile.' : 'Struktur pasar dan komposisi aset membentuk profil sensitivitas ini.' },
              { label: c.proImpact, text: proImpactText },
              { label: c.proIfCont, text: language === 'en' ? 'If concentration persists, consider whether sizing still matches your thesis.' : 'Jika konsentrasi berlanjut, pertimbangkan apakah ukuran posisi masih sesuai tesis.' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-white/[0.05] px-4 py-3 space-y-1" style={{ background: 'rgba(255,255,255,0.015)' }}>
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">{s.label}</p>
                <p className="text-slate-400 text-[13px]" style={{ lineHeight: '1.55' }}>{s.text}</p>
              </div>
            ))}

            {/* Evidence */}
            <button onClick={() => setShowEvidence(v => !v)} className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors font-medium pt-1">
              <svg className={`w-3 h-3 transition-transform duration-200 ${showEvidence ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              {c.proEvidence}
            </button>
            <AnimatePresence>
              {showEvidence && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="rounded-xl border border-white/[0.05] px-4 py-3" style={{ background: 'rgba(255,255,255,0.015)' }}>
                    <p className="text-slate-500 text-[11px] mb-1.5">{c.basedOn}</p>
                    <ul className="space-y-1">
                      {c.proEvidenceFallback.map(e => (
                        <li key={e} className="flex items-start gap-2 text-slate-400 text-[12px]"><span className="text-slate-600 mt-0.5">•</span>{e}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ProGate>

        {/* ═══ CTAs ═══ */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/portfolio" className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold rounded-xl bg-teal-500 text-black transition-all hover:bg-teal-400">
            {c.ctaSensitive}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <Link to="/tingai" className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-xl border border-white/[0.08] text-slate-300 hover:bg-white/[0.04] transition-all">{c.ctaAsk}</Link>
        </div>

        {/* Pro hint */}
        {!isPro && (
          <Link to="/upgrade" className="flex items-center gap-2 text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
            <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest border border-white/[0.08] text-slate-600 rounded">Pro</span>
            {c.proHint} →
          </Link>
        )}

      </div>
    </div>
  )
}
