import React, { useEffect, useMemo, useState } from 'react'
import AiChat from '../components/AiChat'
import MarketDashboard from '../components/MarketDashboard'
import { API_URL } from '../utils/api'
import type {
  CandlestickPoint,
  GoldCardData,
  InvestmentMeta,
  InvestmentSummaryResponse
} from '../types'

type DashboardState = {
  summary: string
  meta: InvestmentMeta | null
  loading: boolean
  error: string
}

const initialState: DashboardState = {
  summary: '',
  meta: null,
  loading: true,
  error: ''
}

const formatSummary = (summary: string) => {
  if (!summary) return []
  const cleaned = summary.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean)
  return sentences.slice(0, 6)
}

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>(initialState)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 15000)
    setState(prev => ({ ...prev, loading: true, error: '' }))

    const token = window.localStorage.getItem('lifeOS_token')
    void fetch(`${API_URL}/api/investment-summary`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Request failed')
        }
        return (await res.json()) as InvestmentSummaryResponse
      })
      .then((data) => {
        if (!active) return
        setState({
          summary: data.summary || '',
          meta: data.meta || null,
          loading: false,
          error: ''
        })
      })
      .catch((err: unknown) => {
        if (!active) return
        setState({
          summary: '',
          meta: null,
          loading: false,
          error:
            err instanceof Error && err.name === 'AbortError'
              ? 'Request timeout. Cek backend VPS, database, atau API key market.'
              : err instanceof Error
                ? err.message
                : 'Gagal mengambil data'
        })
      })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  const marketProps = useMemo(() => {
    const gold = state.meta?.instruments?.ANTAM

    const goldData: GoldCardData | undefined =
      gold && !gold.error
        ? {
            price: gold.latestPrice ?? null,
            change: gold.delta ?? 0,
            updatedAt: gold.latestDate ?? '-'
          }
        : undefined

    return { gold: goldData, sp500: [] as CandlestickPoint[] }
  }, [state.meta])

  const summaryItems = useMemo(() => formatSummary(state.summary), [state.summary])

  return (
    <section className="container dashboard-shell">
      <div className="dashboard-header">
        <div className="eyebrow">Fatur LifeOS</div>
        <h2>Investment Dashboard</h2>
        <p className="lead">
          Ringkasan data investasi terbaru dan AI assistant untuk interpretasi cepat.
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-card dashboard-summary">
          <h3>Ringkasan Investasi</h3>
          {state.loading && <p className="card-note">Memuat ringkasan...</p>}
          {state.error && <p className="card-note warn">{state.error}</p>}
          {!state.loading && !state.error && (
            <>
              {summaryItems.length ? (
                <ul className="summary-list">
                  {summaryItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="card-note summary-text">Ringkasan belum tersedia.</p>
              )}
            </>
          )}
        </div>

        <div className="card dashboard-card">
          <AiChat
            summary={state.summary}
            meta={state.meta}
            disabled={state.loading}
            variant="panel"
          />
        </div>
      </div>

      <MarketDashboard gold={marketProps.gold} sp500={marketProps.sp500} />
    </section>
  )
}
