import React, { useEffect, useMemo, useState } from 'react'
import AiChat from '../components/AiChat'
import MarketDashboard from '../components/MarketDashboard'
import { API_URL } from '../utils/api'

const initialState = {
  summary: '',
  meta: null,
  loading: true,
  error: ''
}

const formatSummary = summary => {
  if (!summary) return []
  const cleaned = summary.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean)
  return sentences.slice(0, 6)
}

export default function Dashboard() {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    let active = true
    setState(prev => ({ ...prev, loading: true, error: '' }))

    const token = window.localStorage.getItem('lifeOS_token')
    fetch(`${API_URL}/api/investment-summary`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Request failed')
        }
        return res.json()
      })
      .then(data => {
        if (!active) return
        setState({
          summary: data?.summary || '',
          meta: data?.meta || null,
          loading: false,
          error: ''
        })
      })
      .catch(err => {
        if (!active) return
        setState({
          summary: '',
          meta: null,
          loading: false,
          error: err?.message || 'Gagal mengambil data'
        })
      })

    return () => {
      active = false
    }
  }, [])

  const marketProps = useMemo(() => {
    const antam = state.meta?.instruments?.ANTAM

    const antamData =
      antam && !antam.error
        ? { price: antam.latestPrice, change: antam.delta, updatedAt: antam.latestDate }
        : undefined
    return { antam: antamData, sp500: [] }
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
                  {summaryItems.map((item, index) => (
                    <li key={index}>{item}</li>
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

      <MarketDashboard antam={marketProps.antam} sp500={marketProps.sp500} />
    </section>
  )
}
