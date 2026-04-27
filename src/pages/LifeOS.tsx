import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { hasProAccess } from '../utils/entitlements'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import { useLanguagePreference } from '../utils/language'
import { useAuthSession } from '../utils/useAuthSession'
import type { InvestmentMeta, InvestmentSummaryResponse, PortfolioSummaryResponse } from '../types'

const currencyUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const decimalCompact = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})

const formatDelta = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${decimalCompact.format(value)}`
}

const localizeSummarySentence = (sentence: string, language: 'id' | 'en') => {
  if (language === 'en') return sentence.trim()

  let cleaned = sentence.trim().replace(/\s+/g, ' ')

  const directPrefixes: Array<[RegExp, string]> = [
    [/^Market brief:\s*/i, 'Ringkasan pasar: '],
    [/^What Changed:\s*/i, 'Apa yang berubah: '],
    [/^Why It Matters:\s*/i, 'Kenapa ini penting: '],
    [/^What To Watch:\s*/i, 'Yang perlu diperhatikan: ']
  ]

  for (const [pattern, replacement] of directPrefixes) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement)
      break
    }
  }

  return cleaned
    .replace(/\bRisk-on leaning\b/gi, 'Minat risiko mulai condong membaik')
    .replace(/\bRisk-on\b/gi, 'Minat risiko membaik')
    .replace(/\bRisk-off leaning\b/gi, 'Pasar cenderung menghindari risiko')
    .replace(/\bMixed tone\b/gi, 'Nada pasar campuran')
    .replace(/\bcross-asset consolidation\b/gi, 'konsolidasi lintas aset')
    .replace(/\bmedium conviction\b/gi, 'keyakinan sedang')
    .replace(/\blow conviction\b/gi, 'keyakinan rendah')
    .replace(/\bhigh conviction\b/gi, 'keyakinan tinggi')
}

const buildExecutiveBrief = (summary: string, language: 'id' | 'en') => {
  if (!summary) {
    return language === 'en'
      ? 'The brief will appear once the data is available.'
      : 'Ringkasan akan tampil setelah data tersedia.'
  }

  const cleaned = summary.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  const sentences = cleaned.split(/(?<=[.!?])\s+/)
  const brief = sentences
    .slice(0, 2)
    .map((sentence) => localizeSummarySentence(sentence, language))
    .join(' ')

  if (brief.length > 220) return `${brief.slice(0, 220)}...`
  return brief
}

export default function LifeOS() {
  const { user } = useAuthSession()
  const { language } = useLanguagePreference()
  const [summary, setSummary] = useState('')
  const [meta, setMeta] = useState<InvestmentMeta | null>(null)
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummaryResponse['summary'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const copy = language === 'en'
    ? {
        requestTimeout: 'Request timeout. Check the VPS backend, database, or market API key.',
        requestFailed: 'Failed to fetch data',
        shellTitle: 'Support Surface',
        shellLead: 'A lighter companion page for quick context, not the main decision surface.',
        previewNote:
          'Preview mode stays light here. Use Dashboard for the main decision flow and Portfolio for deeper position work.',
        plan: 'Plan',
        freePreview: 'Free Preview',
        mode: 'Mode',
        fullAccess: 'Full Access',
        preview: 'Preview',
        personalContext: 'Personal context',
        sleepQuality: 'Sleep Quality',
        hydration: 'Hydration',
        marketOverview: 'Market overview',
        loadingFinance: 'Loading finance data...',
        change: 'Change',
        financeSummary: 'Finance summary',
        capital: 'Capital',
        value: 'Value',
        pending: 'Waiting',
        supportNotes: 'Support notes',
        supportNotesBody:
          'This page stays intentionally light. Main decision-making lives in Dashboard, while portfolio work lives in Portfolio.',
        executiveBrief: 'Executive Brief',
        loadingBrief: 'Loading brief...',
        openDashboard: 'Open Dashboard',
        openPortfolio: 'Open Portfolio'
      }
    : {
        requestTimeout: 'Request timeout. Cek backend VPS, database, atau API key market.',
        requestFailed: 'Gagal mengambil data',
        shellTitle: 'Halaman Pendukung',
        shellLead: 'Halaman pendamping yang lebih ringan untuk konteks singkat, bukan titik keputusan utama.',
        previewNote:
          'Mode pratinjau tetap ringan di sini. Gunakan Dashboard untuk alur keputusan utama dan Portofolio untuk peninjauan posisi yang lebih mendalam.',
        plan: 'Paket',
        freePreview: 'Pratinjau Gratis',
        mode: 'Mode',
        fullAccess: 'Akses Penuh',
        preview: 'Preview',
        personalContext: 'Konteks personal',
        sleepQuality: 'Kualitas Tidur',
        hydration: 'Hidrasi',
        marketOverview: 'Ringkasan pasar',
        loadingFinance: 'Memuat data keuangan...',
        change: 'Perubahan',
        financeSummary: 'Ringkasan finansial',
        capital: 'Modal',
        value: 'Nilai',
        pending: 'Menunggu',
        supportNotes: 'Catatan pendukung',
        supportNotesBody:
          'Halaman ini sengaja dibuat ringan. Keputusan utama ada di Dashboard, sementara peninjauan portofolio ada di Portofolio.',
        executiveBrief: 'Ringkasan Eksekutif',
        loadingBrief: 'Memuat ringkasan...',
        openDashboard: 'Buka Dashboard',
        openPortfolio: 'Buka Portofolio'
      }

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 15000)
    setLoading(true)
    setError('')

    Promise.all([
      fetchWithSession(`${API_URL}/api/investment-summary`, { signal: controller.signal }),
      fetchWithSession(`${API_URL}/api/portfolio/summary`, { signal: controller.signal })
    ])
      .then(async ([investmentRes, portfolioRes]) => {
        if (!investmentRes.ok) {
          throw new Error(await readResponseError(investmentRes, 'Request failed'))
        }

        if (!portfolioRes.ok) {
          throw new Error(await readResponseError(portfolioRes, 'Portfolio request failed'))
        }

        const investmentData = (await investmentRes.json()) as InvestmentSummaryResponse
        const portfolioData = (await portfolioRes.json()) as PortfolioSummaryResponse
        return { investmentData, portfolioData }
      })
      .then(({ investmentData, portfolioData }) => {
        if (!active) return
        setSummary(investmentData.summary || '')
        setMeta(investmentData.meta || null)
        setPortfolioSummary(portfolioData.summary || null)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(
          err instanceof Error && err.name === 'AbortError'
            ? copy.requestTimeout
            : err instanceof Error
              ? err.message
              : copy.requestFailed
        )
        setLoading(false)
      })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [copy.requestFailed, copy.requestTimeout])

  const isProUser = hasProAccess(user)
  const antam = meta?.instruments?.ANTAM
  const sp500 = meta?.instruments?.SP500
  const ihsg = meta?.instruments?.IHSG
  const executiveBrief = useMemo(() => buildExecutiveBrief(summary, language), [language, summary])

  return (
    <section className="lifeos-shell">
      <div className="container">
        <div className="dashboard-header">
          <div className="eyebrow">Ting AI</div>
          <h2>{copy.shellTitle}</h2>
          <p className="lead">{copy.shellLead}</p>
          <div className="dashboard-stat-row" style={{ marginTop: '1rem' }}>
            <div className="dashboard-stat-pill">
              <span className="dashboard-stat-label">{copy.plan}</span>
              <strong>{isProUser ? 'Pro' : copy.freePreview}</strong>
            </div>
            <div className="dashboard-stat-pill">
              <span className="dashboard-stat-label">{copy.mode}</span>
              <strong>{isProUser ? copy.fullAccess : copy.preview}</strong>
            </div>
          </div>
        </div>

        <div className="lifeos-layout">
          <div className="lifeos-grid">
            <div className="lifeos-card premium-card">
              <h3>{copy.personalContext}</h3>
              <div className="lifeos-metrics">
                <div>
                  <p className="lifeos-label">{copy.sleepQuality}</p>
                  <p className="lifeos-value">7.5h</p>
                </div>
                <div>
                  <p className="lifeos-label">{copy.hydration}</p>
                  <p className="lifeos-value">2.1L</p>
                </div>
              </div>
            </div>

            <div className="lifeos-card premium-card">
              <h3>{copy.marketOverview}</h3>
              {loading && <p className="card-note">{copy.loadingFinance}</p>}
              {error && <p className="card-note warn">{error}</p>}
              {!loading && !error && (
                <div className="lifeos-metrics">
                  <div>
                    <p className="lifeos-label">XAU/USD</p>
                    <p className="lifeos-value">{antam?.latestPrice ? currencyUsd.format(antam.latestPrice) : '-'}</p>
                    <p className="lifeos-sub">{copy.change}: {formatDelta(antam?.delta)}</p>
                  </div>
                  <div>
                    <p className="lifeos-label">S&amp;P 500</p>
                    <p className="lifeos-value">{sp500?.latestPrice ? currencyUsd.format(sp500.latestPrice) : '-'}</p>
                    <p className="lifeos-sub">{copy.change}: {formatDelta(sp500?.delta)}</p>
                  </div>
                  <div>
                    <p className="lifeos-label">IHSG</p>
                    <p className="lifeos-value">{ihsg?.latestPrice ? decimalCompact.format(ihsg.latestPrice) : '-'}</p>
                    <p className="lifeos-sub">{copy.change}: {formatDelta(ihsg?.delta)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="lifeos-card premium-card">
              <h3>{copy.financeSummary}</h3>
              <div className="lifeos-metrics">
                <div>
                  <p className="lifeos-label">{copy.capital}</p>
                  <p className="lifeos-value">
                    {portfolioSummary ? currencyUsd.format(portfolioSummary.totalInvested) : copy.pending}
                  </p>
                </div>
                <div>
                  <p className="lifeos-label">{copy.value}</p>
                  <p className="lifeos-value">
                    {portfolioSummary ? currencyUsd.format(portfolioSummary.totalCurrentValue) : copy.pending}
                  </p>
                </div>
                <div>
                  <p className="lifeos-label">PnL</p>
                  <p className={`lifeos-value ${portfolioSummary && portfolioSummary.totalPnl >= 0 ? 'trend-up' : 'trend-down'}`}>
                    {portfolioSummary ? currencyUsd.format(portfolioSummary.totalPnl) : copy.pending}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="lifeos-ai">
            <div className="lifeos-card premium-card">
              <h3>{copy.supportNotes}</h3>
              <p className="card-note">{copy.supportNotesBody}</p>
              {!isProUser ? <div className="lifeos-insight">{copy.previewNote}</div> : null}
              <div className="metrics-widget-brief" style={{ marginTop: '1rem' }}>
                <p className="lifeos-label">{copy.executiveBrief}</p>
                <p className="ai-summary-text">{loading ? copy.loadingBrief : executiveBrief}</p>
              </div>
              <div className="lifeos-cta-row">
                <Link className="btn secondary" to="/dashboard">
                  {copy.openDashboard}
                </Link>
                <Link className="btn secondary" to="/portfolio">
                  {copy.openPortfolio}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
