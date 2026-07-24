/**
 * FundamentalPanel.tsx
 * Phase 2 — OpenBB-powered fundamental data panel.
 * Shows: company profile · analyst consensus · key metrics · ETF info
 * Appears below SmartChart when a US equity or ETF is selected.
 */
import { useEffect, useState } from 'react'
import { API_URL } from '../utils/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Profile {
  name: string; symbol: string; sector?: string; industry?: string
  exchange?: string; description?: string; website?: string
  country?: string; employees?: number; currency?: string
}
interface Consensus {
  symbol: string; targetHigh: number; targetLow: number
  targetConsensus: number; targetMedian: number
  recommendation: string; recommendationMean: number
  numberOfAnalysts: number; currentPrice: number; currency: string
}
interface Metrics {
  peRatio?: number; marketCap?: number; dividendYield?: number
  beta?: number; revenuePerShare?: number; priceToBook?: number; priceToSales?: number
}
interface EtfInfo {
  name?: string; description?: string; fundFamily?: string; category?: string
  totalAssets?: number; navPrice?: number; trailingPe?: number
  dividendYield?: number; yearHigh?: number; yearLow?: number; inceptionDate?: string
}

// ── Asset type detection ──────────────────────────────────────────────────────
const CRYPTO_TICKERS  = new Set(['BTC-USD','ETH-USD','SOL-USD','BNB-USD','XRP-USD'])
const COMMODITY_TICKERS = new Set(['GC=F','SI=F','CL=F','NG=F','HG=F'])
const IDX_TICKERS     = new Set(['^JKSE','BBCA.JK','BBRI.JK','BMRI.JK','TLKM.JK','ASII.JK','UNVR.JK','GOTO.JK','AMMN.JK'])
const INDEX_TICKERS   = new Set(['^JKSE','DX-Y.NYB'])
const ETF_TICKERS     = new Set(['SPY','QQQ','GLD','TLT','VNQ','EEM'])

function detectType(ticker: string): 'us' | 'etf' | 'crypto' | 'commodity' | 'idx' | 'index' | 'unknown' {
  if (CRYPTO_TICKERS.has(ticker))    return 'crypto'
  if (COMMODITY_TICKERS.has(ticker)) return 'commodity'
  if (IDX_TICKERS.has(ticker))       return 'idx'
  if (INDEX_TICKERS.has(ticker))     return 'index'
  if (ETF_TICKERS.has(ticker))       return 'etf'
  // Plain US stock symbols (no dot, no =, no ^)
  if (/^[A-Z]{1,5}$/.test(ticker))  return 'us'
  return 'unknown'
}

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtMarketCap(n?: number): string {
  if (!n || !Number.isFinite(n)) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`
  return `$${n.toLocaleString()}`
}
function fmtPct(n?: number): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(2)}%`
}
function fmtNum(n?: number, decimals = 2): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return n.toFixed(decimals)
}

// ── Recommendation color ──────────────────────────────────────────────────────
function recColor(rec: string): { bg: string; border: string; text: string; label: string } {
  const r = rec?.toLowerCase()
  if (r === 'buy' || r === 'strong buy')
    return { bg: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.3)', text: '#2dd4bf', label: 'BULLISH (Analis)' }
  if (r === 'sell' || r === 'strong sell' || r === 'underperform')
    return { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#f87171', label: 'BEARISH (Analis)' }
  return { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', text: '#fbbf24', label: 'NETRAL (Analis)' }
}

// ── Metric chip ───────────────────────────────────────────────────────────────
function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '0.75rem 1rem', borderRadius: 14,
      background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'monospace' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'rgba(255,255,255,0.88)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      {[80, 60, 90].map((w, i) => (
        <div key={i} style={{
          height: 12, borderRadius: 6, width: `${w}%`,
          background: 'rgba(255,255,255,0.04)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  )
}

// ── Price Target Gauge ────────────────────────────────────────────────────────
function PriceTargetGauge({ consensus, current }: { consensus: Consensus; current: number }) {
  const lo = consensus.targetLow
  const hi = consensus.targetHigh
  const range = hi - lo
  if (range <= 0) return null
  const currentPct  = Math.min(Math.max((current - lo) / range, 0), 1) * 100
  const consensusPct = Math.min(Math.max((consensus.targetConsensus - lo) / range, 0), 1) * 100
  const upside = ((consensus.targetConsensus - current) / current) * 100

  return (
    <div style={{ marginTop: 12 }}>
      {/* Bar */}
      <div style={{ position: 'relative', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }}>
        {/* Filled zone: low → consensus */}
        <div style={{
          position: 'absolute', left: `${Math.min(currentPct, consensusPct)}%`,
          width: `${Math.abs(consensusPct - currentPct)}%`,
          height: '100%', borderRadius: 999,
          background: upside >= 0 ? 'rgba(20,184,166,0.4)' : 'rgba(239,68,68,0.4)',
        }} />
        {/* Current price dot */}
        <div style={{
          position: 'absolute', left: `${currentPct}%`, top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: '#fff', border: '2px solid #0b0d12',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.2)',
        }} />
        {/* Consensus dot */}
        <div style={{
          position: 'absolute', left: `${consensusPct}%`, top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: upside >= 0 ? '#2dd4bf' : '#f87171',
          border: '2px solid #0b0d12',
        }} />
      </div>
      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: 4 }}>
        <span>Low ${fmtNum(lo)}</span>
        <span style={{ color: upside >= 0 ? '#2dd4bf' : '#f87171', fontWeight: 700 }}>
          {upside >= 0 ? '↑' : '↓'} {Math.abs(upside).toFixed(1)}% upside
        </span>
        <span>High ${fmtNum(hi)}</span>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FundamentalPanel({
  ticker, language,
}: {
  ticker: string
  language: 'en' | 'id'
}) {
  const assetType = detectType(ticker)
  const [profile,   setProfile]   = useState<Profile | null>(null)
  const [consensus, setConsensus] = useState<Consensus | null>(null)
  const [metrics,   setMetrics]   = useState<Metrics | null>(null)
  const [etfInfo,   setEtfInfo]   = useState<EtfInfo | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(false)

  useEffect(() => {
    if (assetType !== 'us' && assetType !== 'etf') return
    let cancelled = false
    setLoading(true); setError(false)
    setProfile(null); setConsensus(null); setMetrics(null); setEtfInfo(null)

    const base = API_URL || ''

    if (assetType === 'us') {
      Promise.all([
        fetch(`${base}/api/openbb/profile?symbol=${ticker}`).then(r => r.json()).catch(() => null),
        fetch(`${base}/api/openbb/consensus?symbol=${ticker}`).then(r => r.json()).catch(() => null),
        fetch(`${base}/api/openbb/metrics?symbol=${ticker}`).then(r => r.json()).catch(() => null),
      ]).then(([p, c, m]) => {
        if (cancelled) return
        setProfile(p?.data ?? null)
        setConsensus(c?.data ?? null)
        setMetrics(m?.data ?? null)
        setLoading(false)
      }).catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    } else {
      // ETF
      fetch(`${base}/api/openbb/etf_info?symbol=${ticker}`).then(r => r.json())
        .then(d => { if (!cancelled) { setEtfInfo(d?.data ?? null); setLoading(false) } })
        .catch(() => { if (!cancelled) { setError(true); setLoading(false) } })
    }
    return () => { cancelled = true }
  }, [ticker, assetType])

  // Don't render for non-equity assets
  if (assetType !== 'us' && assetType !== 'etf') return null

  const label = language === 'id' ? 'Analisis Fundamental' : 'Fundamental Analysis'
  const poweredBy = language === 'id'
    ? 'Data dari Yahoo Finance via OpenBB · Bukan rekomendasi investasi Ting AI'
    : 'Data via Yahoo Finance & OpenBB · Not Ting AI\'s investment recommendation'

  return (
    <div style={{
      borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)', padding: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: 'monospace' }}>
          {label}
        </p>
        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
          {poweredBy}
        </span>
      </div>

      {loading && <Skeleton />}
      {error && (
        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
          {language === 'id' ? 'Data fundamental tidak tersedia saat ini.' : 'Fundamental data unavailable.'}
        </p>
      )}

      {/* ── US Stock View ── */}
      {!loading && assetType === 'us' && (
        <>
          {/* Company profile */}
          {profile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {profile.sector && (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: 999,
                    background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf',
                    fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>{profile.sector}</span>
                )}
                {profile.industry && (
                  <span style={{
                    fontSize: '0.65rem', padding: '0.25rem 0.65rem', borderRadius: 999,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
                  }}>{profile.industry}</span>
                )}
              </div>
              {profile.description && (
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
                  {profile.description}…
                </p>
              )}
            </div>
          )}

          {/* Key metrics grid */}
          {metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
              <MetricChip label="Market Cap"    value={fmtMarketCap(metrics.marketCap)} />
              <MetricChip label="P/E Ratio"     value={fmtNum(metrics.peRatio)} />
              <MetricChip label="Beta"          value={fmtNum(metrics.beta, 3)} />
              <MetricChip label="Div Yield"     value={fmtPct(metrics.dividendYield ? metrics.dividendYield / 100 : undefined)} />
              <MetricChip label="P/B Ratio"     value={fmtNum(metrics.priceToBook)} />
              <MetricChip label="P/S Ratio"     value={fmtNum(metrics.priceToSales)} />
            </div>
          )}

          {/* Analyst consensus */}
          {consensus && (
            <div style={{
              padding: '1rem', borderRadius: 14,
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'monospace' }}>
                  {language === 'id' ? `Konsensus Analis · ${consensus.numberOfAnalysts} analis` : `Analyst Consensus · ${consensus.numberOfAnalysts} analysts`}
                </span>
                {consensus.recommendation && (() => {
                  const c = recColor(consensus.recommendation)
                  return (
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: 999,
                      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
                      letterSpacing: '0.1em', fontFamily: 'monospace',
                    }}>{c.label}</span>
                  )
                })()}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 2px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    {language === 'id' ? 'Target Konsensus' : 'Consensus Target'}
                  </p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    ${fmtNum(consensus.targetConsensus)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', margin: '0 0 2px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                    {language === 'id' ? 'Harga Kini' : 'Current Price'}
                  </p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    ${fmtNum(consensus.currentPrice)}
                  </p>
                </div>
              </div>
              <PriceTargetGauge consensus={consensus} current={consensus.currentPrice} />
              <p style={{ margin: '8px 0 0', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', lineHeight: 1.5 }}>
                ⚠ {language === 'id'
                  ? `Konsensus di atas adalah pandangan ${consensus.numberOfAnalysts} analis pihak ketiga via Yahoo Finance. Bukan rekomendasi investasi Ting AI. Keputusan investasi sepenuhnya ada pada Anda.`
                  : `Above consensus reflects ${consensus.numberOfAnalysts} third-party analysts via Yahoo Finance. Not a Ting AI investment recommendation. All investment decisions are solely yours.`
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* ── ETF View ── */}
      {!loading && assetType === 'etf' && etfInfo && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {etfInfo.fundFamily && (
              <span style={{
                fontSize: '0.65rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: 999,
                background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', color: '#2dd4bf',
                fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{etfInfo.fundFamily}</span>
            )}
            {etfInfo.category && (
              <span style={{
                fontSize: '0.65rem', padding: '0.25rem 0.65rem', borderRadius: 999,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
              }}>{etfInfo.category}</span>
            )}
          </div>

          {etfInfo.description && (
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
              {etfInfo.description}…
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
            <MetricChip label="Total Assets"  value={fmtMarketCap(etfInfo.totalAssets)} />
            <MetricChip label="NAV"           value={etfInfo.navPrice ? `$${fmtNum(etfInfo.navPrice)}` : '—'} />
            <MetricChip label="Trailing P/E"  value={fmtNum(etfInfo.trailingPe)} />
            <MetricChip label="Div Yield"     value={fmtPct(etfInfo.dividendYield)} />
            <MetricChip label="52W High"      value={etfInfo.yearHigh ? `$${fmtNum(etfInfo.yearHigh)}` : '—'} />
            <MetricChip label="52W Low"       value={etfInfo.yearLow  ? `$${fmtNum(etfInfo.yearLow)}`  : '—'} />
          </div>
        </>
      )}
    </div>
  )
}
