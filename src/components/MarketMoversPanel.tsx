/**
 * MarketMoversPanel.tsx
 * Phase 3 — Real-time market movers powered by OpenBB + Yahoo Finance.
 * Shows: Top Gainers · Top Losers · Most Active
 * Clicking a row calls onSelectTicker to update the chart above.
 */
import { useEffect, useState, useCallback } from 'react'
import { API_URL } from '../utils/api'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Mover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  earningsDate?: string | null
}

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtVol(n: number): string {
  if (!n || !Number.isFinite(n)) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`
  return String(n)
}
function fmtMcap(n?: number): string {
  if (!n || !Number.isFinite(n)) return ''
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(0)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`
  return ''
}
function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return n < 10 ? n.toFixed(3) : n.toFixed(2)
}
function fmtEarnings(d: string | null | undefined): string | null {
  if (!d) return null
  try {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return null }
}

// ── Types for tabs ────────────────────────────────────────────────────────────
type Tab = 'gainers' | 'losers' | 'active'

// ── Row Component ─────────────────────────────────────────────────────────────
function MoverRow({
  mover, rank, onSelect, isSelected,
}: {
  mover: Mover; rank: number; onSelect: () => void; isSelected: boolean
}) {
  const up = mover.changePercent >= 0
  const earnings = fmtEarnings(mover.earningsDate)

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: '100%', textAlign: 'left',
        padding: '0.6rem 0.75rem',
        borderRadius: 12,
        background: isSelected ? 'rgba(45,212,191,0.07)' : 'rgba(255,255,255,0.02)',
        border: isSelected ? '1px solid rgba(45,212,191,0.2)' : '1px solid transparent',
        cursor: 'pointer', transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
    >
      {/* Rank */}
      <span style={{ width: 18, fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', flexShrink: 0, textAlign: 'right' }}>
        {rank}
      </span>

      {/* Symbol + name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{mover.symbol}</span>
          {fmtMcap(mover.marketCap) && (
            <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
              {fmtMcap(mover.marketCap)}
            </span>
          )}
          {earnings && (
            <span style={{
              fontSize: '0.58rem', fontFamily: 'monospace', padding: '1px 5px', borderRadius: 4,
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24',
            }}>
              ER {earnings}
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {mover.name}
        </p>
      </div>

      {/* Price + change */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
          ${fmtPrice(mover.price)}
        </p>
        <p style={{
          margin: 0, fontSize: '0.7rem', fontWeight: 700, fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums',
          color: up ? '#2dd4bf' : '#f87171',
        }}>
          {up ? '+' : ''}{(mover.changePercent * 100).toFixed(2)}%
        </p>
      </div>

      {/* Volume */}
      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 40 }}>
        <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
          {fmtVol(mover.volume)}
        </p>
      </div>
    </button>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          height: 52, borderRadius: 12,
          background: `rgba(255,255,255,${0.015 + i * 0.002})`,
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 0.06}s`,
        }} />
      ))}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MarketMoversPanel({
  language, selectedTicker, onSelectTicker,
}: {
  language: 'en' | 'id'
  selectedTicker: string
  onSelectTicker: (ticker: string) => void
}) {
  const [activeTab, setActiveTab] = useState<Tab>('gainers')
  const [data, setData] = useState<Record<Tab, Mover[]>>({ gainers: [], losers: [], active: [] })
  const [loading, setLoading] = useState<Record<Tab, boolean>>({ gainers: true, losers: true, active: true })
  const [error, setError] = useState<Record<Tab, boolean>>({ gainers: false, losers: false, active: false })

  const fetchTab = useCallback((tab: Tab) => {
    const base = API_URL || ''
    setLoading(prev => ({ ...prev, [tab]: true }))
    setError(prev => ({ ...prev, [tab]: false }))
    fetch(`${base}/api/openbb/${tab}`)
      .then(r => r.json())
      .then(d => {
        setData(prev => ({ ...prev, [tab]: d.data ?? [] }))
        setLoading(prev => ({ ...prev, [tab]: false }))
      })
      .catch(() => {
        setError(prev => ({ ...prev, [tab]: true }))
        setLoading(prev => ({ ...prev, [tab]: false }))
      })
  }, [])

  // Fetch all tabs on mount
  useEffect(() => {
    fetchTab('gainers')
    fetchTab('losers')
    fetchTab('active')
  }, [fetchTab])

  const tabs: { key: Tab; labelId: string; labelEn: string; color: string }[] = [
    { key: 'gainers', labelId: '🚀 Naik',   labelEn: '🚀 Gainers', color: '#2dd4bf' },
    { key: 'losers',  labelId: '📉 Turun',  labelEn: '📉 Losers',  color: '#f87171' },
    { key: 'active',  labelId: '⚡ Aktif',  labelEn: '⚡ Active',  color: '#fbbf24' },
  ]

  const currentTab = tabs.find(t => t.key === activeTab)!
  const rows = data[activeTab]
  const isLoading = loading[activeTab]
  const hasError = error[activeTab]

  return (
    <div style={{
      borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)', padding: '1.25rem 1.25rem 1rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: 'monospace' }}>
            {language === 'id' ? 'Pergerakan Pasar' : 'Market Movers'}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
            {language === 'id' ? 'US Equity · Data berkala via Yahoo Finance (OpenBB)' : 'US Equity · Periodic data via Yahoo Finance (OpenBB)'}
          </p>
        </div>
        {/* Live indicator */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.6rem', fontFamily: 'monospace', color: 'rgba(45,212,191,0.7)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf', boxShadow: '0 0 6px #2dd4bf', animation: 'pulse 2s ease-in-out infinite' }} />
          LIVE DATA
        </span>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 6 }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '0.45rem 0.5rem', borderRadius: 10, cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s',
              border: activeTab === tab.key ? `1px solid ${tab.color}33` : '1px solid rgba(255,255,255,0.06)',
              background: activeTab === tab.key ? `${tab.color}12` : 'rgba(255,255,255,0.02)',
              color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.4)',
            }}
          >
            {language === 'id' ? tab.labelId : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 0.75rem' }}>
        <span style={{ width: 18 }} />
        <span style={{ flex: 1, fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textTransform: 'uppercase' }}>
          {language === 'id' ? 'Saham' : 'Stock'}
        </span>
        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textTransform: 'uppercase', minWidth: 70, textAlign: 'right' }}>
          Price / Δ%
        </span>
        <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', textTransform: 'uppercase', minWidth: 40, textAlign: 'right' }}>
          Vol
        </span>
      </div>

      {/* Rows */}
      {isLoading ? (
        <LoadingRows />
      ) : hasError ? (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
            {language === 'id' ? 'Data tidak tersedia' : 'Data unavailable'}
          </p>
          <button
            type="button"
            onClick={() => fetchTab(activeTab)}
            style={{ marginTop: 8, fontSize: '0.7rem', color: 'rgba(45,212,191,0.7)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {language === 'id' ? 'Coba lagi' : 'Retry'}
          </button>
        </div>
      ) : rows.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', padding: '0.5rem 0.75rem' }}>
          {language === 'id' ? 'Belum ada data' : 'No data yet'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rows.map((mover, i) => (
            <MoverRow
              key={mover.symbol}
              mover={mover}
              rank={i + 1}
              isSelected={selectedTicker === mover.symbol}
              onSelect={() => onSelectTicker(mover.symbol)}
            />
          ))}
        </div>
      )}

      <p style={{ margin: 0, fontSize: '0.58rem', color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', textAlign: 'center' }}>
        {language === 'id'
          ? '* Klik baris untuk buka grafik & analisis aset tersebut'
          : '* Click any row to open its chart & analysis above'}
      </p>
    </div>
  )
}
