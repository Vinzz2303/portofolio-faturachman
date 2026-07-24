import React, { useEffect, useState } from 'react'
import type { MarketHeadline } from '../../types'
import type { DashboardCopy, DecisionContext } from './types'

// ─── Types ───────────────────────────────────────────────────────────────────
type Sentiment = 'positive' | 'neutral' | 'negative' | 'cautious'

type NewsInsight = {
  summary: string
  sentiment: Sentiment
  impact: string
  dominantTheme: string
}

type Props = {
  copy: DashboardCopy
  headlines?: MarketHeadline[]
  decisionContext?: DecisionContext
}

// ─── Mock data ────────────────────────────────────────────────────────────────
function buildMockInsight(lang: 'en' | 'id', sentiment: Sentiment): NewsInsight {
  if (lang === 'id') {
    return {
      summary:
        'Sentimen pasar cenderung berhati-hati. Tekanan dari suku bunga global dan ketidakpastian kebijakan masih memengaruhi selera risiko investor.',
      sentiment,
      impact:
        'Kondisi ini menekan aset berisiko secara umum. Portofolio yang dominan pada aset global lebih sensitif terhadap perubahan sentimen ini.',
      dominantTheme: 'Makro & Suku Bunga',
    }
  }
  return {
    summary:
      'Market sentiment remains cautious. Pressure from global interest rates and ongoing policy uncertainty continues to weigh on risk appetite.',
    sentiment,
    impact:
      'This environment puts general pressure on risk assets. Portfolios with heavy global exposure are more sensitive to shifts in this sentiment.',
    dominantTheme: 'Macro & Rates',
  }
}

// ─── Derive insight from headlines ───────────────────────────────────────────
function deriveInsightFromHeadlines(
  headlines: MarketHeadline[],
  lang: 'en' | 'id',
  dominantAsset?: string
): NewsInsight {
  const relevant = headlines.filter((h) => h.relevance !== 'low').slice(0, 3)
  if (!relevant.length) return buildMockInsight(lang, 'neutral')

  // Derive aggregate sentiment from theme mix
  const themes = relevant.map((h) => h.theme)
  const hasMacro = themes.some((t) => t === 'macro' || t === 'rates' || t === 'dollar')
  const hasCrypto = themes.some((t) => t === 'crypto')
  const hasGeo = themes.some((t) => t === 'geopolitics')

  const allHigh = relevant.every((h) => h.relevance === 'high')
  const sentiment: Sentiment = allHigh && hasGeo ? 'negative' : hasMacro ? 'cautious' : 'neutral'

  const isBtcDominant =
    dominantAsset?.toLowerCase().includes('btc') ||
    dominantAsset?.toLowerCase().includes('bitcoin') ||
    dominantAsset?.toLowerCase().includes('crypto')
  const isIhsgDominant =
    dominantAsset?.toLowerCase().includes('ihsg') ||
    dominantAsset?.toLowerCase().includes('indonesia') ||
    dominantAsset?.toLowerCase().includes('id')

  if (lang === 'id') {
    const themeLabel = hasCrypto
      ? 'Kripto & Sentimen Global'
      : hasMacro
        ? 'Makro & Suku Bunga'
        : hasGeo
          ? 'Geopolitik'
          : 'Pasar Ekuitas'

    const impact = isBtcDominant
      ? 'Karena portofoliomu dominan di BTC, sentimen global memiliki pengaruh lebih besar dibanding faktor domestik. Pergerakan kripto cenderung mengikuti selera risiko pasar AS.'
      : isIhsgDominant
        ? 'Karena portofoliomu dominan di pasar domestik, kondisi IHSG dan kebijakan Bank Indonesia lebih relevan dibanding tekanan global langsung.'
        : 'Portofoliomu memiliki campuran eksposur. Pastikan alokasi aset globalmu sejalan dengan perubahan sentimen saat ini.'

    return {
      summary: `Sentimen pasar saat ini ${sentiment === 'negative' ? 'cenderung negatif' : sentiment === 'cautious' ? 'berhati-hati' : 'netral'}. ${relevant[0]?.whyItMatters ?? 'Beberapa headline menunjukkan tekanan pada aset berisiko.'}`,
      sentiment,
      impact,
      dominantTheme: themeLabel,
    }
  }

  const themeLabel = hasCrypto
    ? 'Crypto & Global Sentiment'
    : hasMacro
      ? 'Macro & Rates'
      : hasGeo
        ? 'Geopolitics'
        : 'Equity Markets'

  const impact = isBtcDominant
    ? 'Since your portfolio is dominated by BTC, global sentiment has a stronger influence than domestic factors. Crypto tends to follow US risk appetite closely.'
    : isIhsgDominant
      ? 'Since your portfolio leans toward domestic markets, IHSG conditions and Bank Indonesia policy are more relevant than direct global pressure.'
      : 'Your portfolio carries mixed exposure. Make sure your global allocation is positioned for the current sentiment shift.'

  return {
    summary: `Market sentiment is currently ${sentiment === 'negative' ? 'tilting negative' : sentiment === 'cautious' ? 'cautious' : 'neutral'}. ${relevant[0]?.whyItMatters ?? 'Recent headlines indicate pressure on risk assets.'}`,
    sentiment,
    impact,
    dominantTheme: themeLabel,
  }
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonLine({ width = '100%', height = '0.85rem' }: { width?: string; height?: string }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: 'rgba(255,255,255,0.06)',
        animation: 'news-shimmer 1.6s ease-in-out infinite',
      }}
    />
  )
}

// ─── Sentiment badge ──────────────────────────────────────────────────────────
function SentimentBadge({ sentiment, lang }: { sentiment: Sentiment; lang: 'en' | 'id' }) {
  const config: Record<Sentiment, { color: string; bg: string; label: string; labelId: string }> = {
    positive: {
      color: '#4ade80',
      bg: 'rgba(74,222,128,0.1)',
      label: 'Constructive',
      labelId: 'Konstruktif',
    },
    neutral: {
      color: 'rgba(214,178,107,0.9)',
      bg: 'rgba(214,178,107,0.08)',
      label: 'Neutral',
      labelId: 'Netral',
    },
    cautious: {
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      label: 'Cautious',
      labelId: 'Berhati-hati',
    },
    negative: {
      color: '#f87171',
      bg: 'rgba(248,113,113,0.1)',
      label: 'Under Pressure',
      labelId: 'Dalam Tekanan',
    },
  }

  const c = config[sentiment]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        borderRadius: 99,
        background: c.bg,
        color: c.color,
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        border: `1px solid ${c.color}30`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: c.color,
          flexShrink: 0,
        }}
      />
      {lang === 'id' ? c.labelId : c.label}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function NewsIntelligence({ copy, headlines, decisionContext }: Props) {
  const lang = copy.language

  const [loading, setLoading] = useState(true)
  const [newsData, setNewsData] = useState<NewsInsight | null>(null)

  useEffect(() => {
    // Simulate a brief connection delay for realism
    const timer = setTimeout(() => {
      const hasHeadlines = Array.isArray(headlines) && headlines.length > 0
      const dominantAsset =
        decisionContext?.actionableInsight?.actionStance
          ? undefined
          : undefined // extend with real portfolio data when available

      if (hasHeadlines) {
        setNewsData(deriveInsightFromHeadlines(headlines!, lang, dominantAsset))
      } else {
        // Use mock so UI is never empty
        setNewsData(buildMockInsight(lang, 'neutral'))
      }
      setLoading(false)
    }, 900)
    return () => clearTimeout(timer)
  }, [headlines, lang, decisionContext])

  return (
    <>
      <style>{`
        @keyframes news-shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.9; }
          100% { opacity: 0.4; }
        }
        @keyframes news-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .news-intel-card {
          animation: news-fade-in 0.4s ease forwards;
        }
        .news-intel-impact-block {
          border-left: 2px solid rgba(214,178,107,0.45);
          padding: 0.85rem 1rem;
          background: rgba(214,178,107,0.04);
          border-radius: 0 12px 12px 0;
          margin-top: 1rem;
        }
      `}</style>

      <section className="card dashboard-card" id="news-intelligence">
        <div className="dashboard-summary-head context-layer-head">
          <div>
            <p className="dashboard-summary-kicker">{copy.newsIntelligence}</p>
            <h3 style={{ fontSize: '1.06rem', marginBottom: '0.4rem' }}>{copy.newsIntelligence}</h3>
            <p className="summary-text context-layer-summary" style={{ margin: 0 }}>
              {copy.newsIntelligenceLead}
            </p>
          </div>
        </div>

        {/* ── LOADING STATE ─────────────────────────────────────── */}
        {loading && (
          <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'rgba(214,178,107,0.6)',
                  animation: 'news-shimmer 1.2s ease-in-out infinite',
                }}
              />
              <span
                style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'rgba(214,178,107,0.65)',
                  fontWeight: 600,
                  animation: 'news-shimmer 1.6s ease-in-out infinite',
                }}
              >
                {lang === 'id'
                  ? 'Menghubungkan ke sumber berita pasar...'
                  : 'Connecting to market news sources...'}
              </span>
            </div>

            <div
              className="brief-section-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              <SkeletonLine width="55%" height="0.72rem" />
              <SkeletonLine width="100%" />
              <SkeletonLine width="88%" />
              <SkeletonLine width="72%" />
            </div>

            <div
              className="brief-section-card"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              <SkeletonLine width="40%" height="0.72rem" />
              <SkeletonLine width="95%" />
              <SkeletonLine width="80%" />
            </div>
          </div>
        )}

        {/* ── ACTIVE / FALLBACK STATE ───────────────────────────── */}
        {!loading && newsData && (
          <div className="news-intel-card" style={{ marginTop: '1.2rem' }}>
            {/* Sentiment + theme row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.55rem',
                marginBottom: '1rem',
              }}
            >
              <SentimentBadge sentiment={newsData.sentiment} lang={lang} />
              <span
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  color: 'rgba(167,176,191,0.55)',
                  fontWeight: 600,
                }}
              >
                {newsData.dominantTheme}
              </span>
            </div>

            {/* Summary block */}
            <div className="brief-section-card">
              <span className="brief-section-label">
                {lang === 'id' ? 'Ringkasan Sentimen' : 'Sentiment Summary'}
              </span>
              <p style={{ color: 'var(--text)', lineHeight: 1.72, margin: 0 }}>
                {newsData.summary}
              </p>

              {/* Portfolio impact — always shown */}
              <div className="news-intel-impact-block">
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'rgba(214,178,107,0.75)',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                  }}
                >
                  {lang === 'id' ? 'Dampak ke portofoliomu' : 'Impact on your portfolio'}
                </span>
                <p
                  style={{
                    color: 'rgba(167,176,191,0.88)',
                    lineHeight: 1.7,
                    margin: 0,
                    fontSize: '0.92rem',
                  }}
                >
                  {newsData.impact}
                </p>
              </div>
            </div>

            {/* No headlines note — only show if no real data */}
            {(!headlines || headlines.length === 0) && (
              <p
                style={{
                  marginTop: '0.85rem',
                  fontSize: '0.78rem',
                  color: 'rgba(167,176,191,0.45)',
                  lineHeight: 1.6,
                }}
              >
                {lang === 'id'
                  ? 'Belum ada berita signifikan saat ini. Konteks pasar tetap dapat dibaca dari pergerakan IHSG dan aset global.'
                  : 'No significant news at the moment. Market context can still be understood from IHSG and global asset movements.'}
              </p>
            )}
          </div>
        )}
      </section>
    </>
  )
}
