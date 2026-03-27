import React, { useEffect, useMemo, useState } from 'react'
import AiChat from '../components/AiChat'
import MarketDashboard from '../components/MarketDashboard'

const initialState = {
  summary: '',
  meta: null,
  loading: true,
  error: ''
}

const formatShortDate = value => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    let active = true
    setState(prev => ({ ...prev, loading: true, error: '' }))

    const token = window.localStorage.getItem('lifeOS_token')
    fetch('/api/investment-summary', {
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
    const sp500 = state.meta?.instruments?.SP500

    const antamData =
      antam && !antam.error
        ? { price: antam.latestPrice, change: antam.delta, updatedAt: antam.latestDate }
        : undefined

    const sp500Data =
      sp500 && !sp500.error
        ? [
            { date: formatShortDate(sp500.previousDate), value: sp500.previousPrice },
            { date: formatShortDate(sp500.latestDate), value: sp500.latestPrice }
          ]
        : undefined

    return { antam: antamData, sp500: sp500Data }
  }, [state.meta])

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
        <div className="card">
          <h3>Ringkasan Investasi</h3>
          {state.loading && <p className="card-note">Memuat ringkasan...</p>}
          {state.error && <p className="card-note warn">{state.error}</p>}
          {!state.loading && !state.error && <p className="card-note">{state.summary}</p>}
        </div>

        <div className="card">
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
