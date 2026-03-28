import React, { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../utils/api'
import type { InstrumentSummary, InvestmentMeta, InvestmentSummaryResponse } from '../types'

const defaultHealth = {
  sleep: '7.5h',
  hydration: '2.1L'
}

const defaultProductivity = {
  tasks: '3/5 Done',
  focus: '2h 40m'
}

const currencyIdr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

const currencyUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const buildInsight = (
  name: string,
  antam?: InstrumentSummary,
  sp500?: InstrumentSummary
) => {
  if (!antam || antam.error || !sp500 || sp500.error) {
    return `Halo ${name}, data keuangan belum lengkap. Fokuskan hari ini pada tidur yang cukup dan progress task utama.`
  }

  const antamTrend = (antam.delta ?? 0) >= 0 ? 'naik' : 'turun'
  const spTrend = (sp500.delta ?? 0) >= 0 ? 'naik' : 'turun'

  return `Halo ${name}, emas spot (XAU/USD) sedang ${antamTrend} dan S&P 500 ${spTrend}. Tidurmu belum ideal semalam, jadi batasi kopi dan jaga ritme fokus agar keputusan finansial tetap tenang.`
}

const buildExecutiveBrief = (summary: string) => {
  if (!summary) return 'Ringkasan akan tampil setelah data tersedia.'
  const cleaned = summary.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  const sentences = cleaned.split(/(?<=[.!?])\s+/)
  const brief = sentences.slice(0, 2).join(' ')
  if (brief.length > 240) return `${brief.slice(0, 240)}...`
  return brief
}

export default function LifeOS() {
  const [summary, setSummary] = useState('')
  const [meta, setMeta] = useState<InvestmentMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 15000)
    setLoading(true)
    setError('')

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
        setSummary(data.summary || '')
        setMeta(data.meta || null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(
          err instanceof Error && err.name === 'AbortError'
            ? 'Request timeout. Cek backend VPS, database, atau API key market.'
            : err instanceof Error
              ? err.message
              : 'Gagal mengambil data'
        )
        setLoading(false)
      })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  const userName = useMemo(() => window.localStorage.getItem('lifeOS_user') || 'Fatur', [])

  const antam = meta?.instruments?.ANTAM
  const sp500 = meta?.instruments?.SP500

  const insight = useMemo(() => buildInsight(userName, antam, sp500), [userName, antam, sp500])
  const executiveBrief = useMemo(() => buildExecutiveBrief(summary), [summary])
  const cleanedSummary = useMemo(
    () => (summary ? summary.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim() : ''),
    [summary]
  )

  return (
    <section className="lifeos-shell">
      <div className="container">
        <div className="dashboard-header">
          <div className="eyebrow">Executive Life OS</div>
          <h2>LifeOS Control Room</h2>
          <p className="lead">
            Ringkasan holistik yang memadukan kesehatan, produktivitas, dan finansial dalam satu
            tempat.
          </p>
        </div>

        <div className="lifeos-layout">
          <div className="lifeos-grid">
            <div className="lifeos-card premium-card">
              <h3>Kesehatan</h3>
              <div className="lifeos-metrics">
                <div>
                  <p className="lifeos-label">Sleep Quality</p>
                  <p className="lifeos-value">{defaultHealth.sleep}</p>
                </div>
                <div>
                  <p className="lifeos-label">Hydration</p>
                  <p className="lifeos-value">{defaultHealth.hydration}</p>
                </div>
              </div>
            </div>

            <div className="lifeos-card premium-card">
              <h3>Produktivitas</h3>
              <div className="lifeos-metrics">
                <div>
                  <p className="lifeos-label">Daily Tasks</p>
                  <p className="lifeos-value">{defaultProductivity.tasks}</p>
                </div>
                <div>
                  <p className="lifeos-label">Focus Time</p>
                  <p className="lifeos-value">{defaultProductivity.focus}</p>
                </div>
              </div>
            </div>

            <div className="lifeos-card premium-card">
              <h3>Keuangan</h3>
              {loading && <p className="card-note">Memuat data keuangan...</p>}
              {error && <p className="card-note warn">{error}</p>}
              {!loading && !error && (
                <div className="lifeos-metrics">
                  <div>
                    <p className="lifeos-label">XAU/USD</p>
                    <p className="lifeos-value">
                      {antam?.latestPrice ? currencyIdr.format(antam.latestPrice) : '-'}
                    </p>
                    <p className="lifeos-sub">Delta: {antam?.delta ?? '-'}</p>
                  </div>
                  <div>
                    <p className="lifeos-label">S&amp;P 500</p>
                    <p className="lifeos-value">
                      {sp500?.latestPrice ? currencyUsd.format(sp500.latestPrice) : '-'}
                    </p>
                    <p className="lifeos-sub">Delta: {sp500?.delta ?? '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="lifeos-ai">
            <div className="lifeos-card premium-card">
              <h3>AI Executive Assistant</h3>
              <div className="ai-summary-card bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-lg">
                <p
                  className={`ai-summary-text leading-relaxed text-zinc-300 ${
                    expanded ? '' : 'clamped'
                  }`}
                >
                  {expanded ? cleanedSummary || executiveBrief : executiveBrief}
                </p>
                {cleanedSummary && cleanedSummary.length > 240 && (
                  <button
                    type="button"
                    className="ai-summary-toggle"
                    onClick={() => setExpanded(prev => !prev)}
                  >
                    {expanded ? 'Tutup ringkasan' : 'Baca selengkapnya'}
                  </button>
                )}
              </div>
              <div className="lifeos-insight">{insight}</div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
