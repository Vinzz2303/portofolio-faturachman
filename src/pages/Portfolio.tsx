import React, { useEffect, useMemo, useState } from 'react'
import AiChat from '../components/AiChat'
import { API_URL } from '../utils/api'
import { fetchWithSession, getSessionExpiredMessage, readResponseError } from '../utils/authFetch'
import { formatCurrency as formatDisplayCurrency, getDisplayCurrency } from '../utils/currency'
import { getPortfolioIntelligence } from '../utils/portfolioIntelligence'
import {
  generateDecisionEngine,
  generatePortfolioInsight,
  generateRiskSimulation
} from '../utils/portfolioInsightHero'
import { useLanguagePreference } from '../utils/language'
import type {
  AssetListResponse,
  AssetMasterItem,
  PortfolioHoldingItem,
  PortfolioSummaryResponse
} from '../types'

type FormState = {
  assetId: string
  entryCurrency: string
  quantity: string
  entryPrice: string
  investedAmount: string
  notes: string
  openedAt: string
}

const initialForm: FormState = {
  assetId: '',
  entryCurrency: '',
  quantity: '',
  entryPrice: '',
  investedAmount: '',
  notes: '',
  openedAt: ''
}

const formatSigned = (value: number | null | undefined, fractionDigits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Menunggu'
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value)}`
}

const formatPercent = (value: number | null | undefined, fractionDigits = 2) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Menunggu'
  return `${new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value)}%`
}

const formatFreshness = (value?: string | null) => {
  if (!value) return 'Menunggu sinkronisasi harga pertama'

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Waktu sinkronisasi harga tidak tersedia'

  const diffMs = Date.now() - timestamp
  if (diffMs < 60 * 1000) return 'Baru saja diperbarui'

  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  if (diffMinutes < 60) return `Diperbarui ${diffMinutes}m lalu`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `Diperbarui ${diffHours}j lalu`

  const diffDays = Math.floor(diffHours / 24)
  return `Diperbarui ${diffDays} hari lalu`
}

const getMarketPriceCurrency = (
  symbol?: string | null,
  quoteCurrency?: string | null,
  fallbackCurrency: string = 'IDR'
) => {
  if ((symbol || '').toUpperCase() === 'XAU') return 'IDR'
  return (quoteCurrency || fallbackCurrency).toUpperCase()
}

const formatCombinedLots = (lots: number, isEnglish: boolean) =>
  isEnglish ? `${lots} positions combined` : `${lots} posisi digabung`

const normalizeNumericInput = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
    return trimmed.replace(/\./g, '')
  }

  return trimmed.replace(/,/g, '')
}

export default function Portfolio() {
  const { language } = useLanguagePreference()
  const isEnglish = language === 'en'
  const defaultDisplayCurrency = getDisplayCurrency()
  const [assets, setAssets] = useState<AssetMasterItem[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioSummaryResponse | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const [editingHoldingId, setEditingHoldingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [assetTypeFilter, setAssetTypeFilter] = useState<'all' | AssetMasterItem['assetType']>('all')
  const [regionFilter, setRegionFilter] = useState('all')

  const latestPortfolioSync = useMemo(() => {
    const timestamps = (portfolio?.holdings || [])
      .map((holding) => (holding.fetchedAt ? new Date(holding.fetchedAt).getTime() : NaN))
      .filter((value) => Number.isFinite(value))

    if (!timestamps.length) return null
    return new Date(Math.max(...timestamps)).toISOString()
  }, [portfolio?.holdings])
  const normalizedPortfolio = portfolio
  const displayCurrency = normalizedPortfolio?.summary?.displayCurrency || defaultDisplayCurrency
  const selectedAsset = useMemo(
    () => assets.find((asset) => String(asset.id) === form.assetId) || null,
    [assets, form.assetId]
  )
  const selectedAssetMarket = useMemo(
    () => normalizedPortfolio?.holdings?.find((holding) => holding.assetId === selectedAsset?.id) || null,
    [normalizedPortfolio?.holdings, selectedAsset]
  )
  const normalizedEntryPrice = useMemo(
    () => Number(normalizeNumericInput(form.entryPrice)),
    [form.entryPrice]
  )
  const priceWarning = useMemo(() => {
    const latestPrice = selectedAssetMarket?.latestPrice
    const marketPriceCurrency = getMarketPriceCurrency(
      selectedAsset?.symbol,
      selectedAssetMarket?.quoteCurrency || selectedAsset?.quoteCurrency,
      displayCurrency
    )
    if (!selectedAsset || !latestPrice || !Number.isFinite(latestPrice)) return ''
    if (!form.entryPrice.trim() || !Number.isFinite(normalizedEntryPrice) || normalizedEntryPrice <= 0) return ''

    if (normalizedEntryPrice < latestPrice * 0.01) {
      return `Harga entry terlihat terlalu rendah dibanding market saat ini (${formatDisplayCurrency(latestPrice, marketPriceCurrency)}). Gunakan 67000, bukan 67.000.`
    }

    if (normalizedEntryPrice > latestPrice * 100) {
      return `Harga entry terlihat terlalu tinggi dibanding market saat ini (${formatDisplayCurrency(latestPrice, marketPriceCurrency)}).`
    }

    return ''
  }, [displayCurrency, selectedAsset, selectedAssetMarket, form.entryPrice, normalizedEntryPrice])
  const latestPriceLabel = useMemo(() => {
    if (!selectedAsset) return ''
    if (selectedAssetMarket?.latestPrice) {
      const marketPriceCurrency = getMarketPriceCurrency(
        selectedAsset.symbol,
        selectedAssetMarket.quoteCurrency || selectedAsset.quoteCurrency,
        defaultDisplayCurrency
      )
      return `Harga terakhir yang terlacak: ${formatDisplayCurrency(
        selectedAssetMarket.latestPrice,
        marketPriceCurrency
      )} / ${formatFreshness(selectedAssetMarket.fetchedAt)}`
    }

    if (selectedAsset.provider === 'manual') {
      return 'Feed market live belum terhubung untuk aset ini.'
    }

    return 'Menunggu sinkronisasi harga pertama.'
  }, [defaultDisplayCurrency, selectedAsset, selectedAssetMarket])
  const intelligence = useMemo(
    () => getPortfolioIntelligence(normalizedPortfolio, language),
    [language, normalizedPortfolio]
  )
  const portfolioHeroInsight = useMemo(
    () => generatePortfolioInsight(intelligence, intelligence.portfolioTone, language),
    [intelligence, language]
  )
  const portfolioDecision = useMemo(
    () => generateDecisionEngine(intelligence, intelligence.portfolioTone, portfolioHeroInsight, language),
    [intelligence, language, portfolioHeroInsight]
  )
  const riskSimulation = useMemo(
    () => generateRiskSimulation(intelligence, language),
    [intelligence, language]
  )
  const showFullRiskSimulation = !isPreviewMode
  const availableRegions = useMemo(() => {
    const regions = new Set(
      (normalizedPortfolio?.holdings || [])
        .map((holding) => holding.region?.trim())
        .filter((value): value is string => Boolean(value))
    )

    return Array.from(regions).sort((a, b) => a.localeCompare(b))
  }, [normalizedPortfolio?.holdings])
  const filteredHoldings = useMemo(
    () =>
      intelligence.holdings.filter((holding) => {
        const matchesType = assetTypeFilter === 'all' ? true : holding.assetType === assetTypeFilter
        const matchesRegion = regionFilter === 'all' ? true : holding.region === regionFilter
        return matchesType && matchesRegion
      }),
    [assetTypeFilter, intelligence.holdings, regionFilter]
  )

  const fetchPortfolioData = React.useCallback(async () => {
    if (!window.localStorage.getItem('lifeOS_token')) {
      setError('Akses tidak diizinkan')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const [assetsRes, summaryRes] = await Promise.all([
        fetchWithSession(`${API_URL}/api/assets`),
        fetchWithSession(`${API_URL}/api/portfolio/summary`)
      ])

      if (!assetsRes.ok) {
        throw new Error(await readResponseError(assetsRes, 'Gagal memuat daftar aset'))
      }

      if (!summaryRes.ok) {
        throw new Error(await readResponseError(summaryRes, 'Gagal memuat ringkasan portofolio'))
      }

      const assetsData = (await assetsRes.json()) as AssetListResponse
      const summaryData = (await summaryRes.json()) as PortfolioSummaryResponse

      setAssets(assetsData.assets || [])
      setPortfolio(summaryData)
      setIsPreviewMode(Boolean(summaryData.isPreview))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : getSessionExpiredMessage())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    scrollTop()
    const frameId = window.requestAnimationFrame(scrollTop)
    const timer = window.setTimeout(scrollTop, 50)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    void fetchPortfolioData()
  }, [fetchPortfolioData])

  const handleStartEdit = (holding: PortfolioHoldingItem) => {
    setEditingHoldingId(holding.id)
    setForm({
      assetId: String(holding.assetId),
      entryCurrency: holding.entryCurrency || holding.quoteCurrency,
      quantity: String(holding.quantity),
      entryPrice: String(holding.entryPrice),
      investedAmount:
        holding.investedAmount !== null && holding.investedAmount !== undefined
          ? String(holding.investedAmount)
          : '',
      notes: holding.notes || '',
      openedAt: holding.openedAt || ''
    })
    setError('')
    setSuccess('')
  }

  const handleCancelEdit = () => {
    setEditingHoldingId(null)
    setForm(initialForm)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const normalizedQuantity = Number(normalizeNumericInput(form.quantity))
      const normalizedEntry = Number(normalizeNumericInput(form.entryPrice))
      const normalizedInvested = form.investedAmount
        ? Number(normalizeNumericInput(form.investedAmount))
        : undefined

      const payload = {
        assetId: Number(form.assetId),
        positionCurrency: (form.entryCurrency || selectedAsset?.quoteCurrency || defaultDisplayCurrency).toUpperCase(),
        quantity: normalizedQuantity,
        entryPrice: normalizedEntry,
        investedAmount: normalizedInvested,
        notes: form.notes.trim() || undefined,
        openedAt: form.openedAt.trim() || undefined
      }

      if (!payload.assetId || Number.isNaN(payload.assetId)) {
        throw new Error('Pilih aset terlebih dahulu.')
      }

      if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) {
        throw new Error('Kuantitas harus lebih besar dari 0.')
      }

      if (!Number.isFinite(payload.entryPrice) || payload.entryPrice < 0) {
        throw new Error('Harga entry harus 0 atau lebih besar.')
      }

      const response = await fetchWithSession(
        `${API_URL}/api/portfolio/holdings${editingHoldingId ? `/${editingHoldingId}` : ''}`,
        {
          method: editingHoldingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        throw new Error(
          await readResponseError(
            response,
            editingHoldingId ? 'Gagal memperbarui posisi' : 'Gagal menyimpan posisi'
          )
        )
      }

      setEditingHoldingId(null)
      setForm(initialForm)
      setSuccess(editingHoldingId ? 'Posisi berhasil diperbarui.' : 'Posisi berhasil disimpan.')
      await fetchPortfolioData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : getSessionExpiredMessage())
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefreshPrices = async () => {
    setRefreshing(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetchWithSession(`${API_URL}/api/portfolio/refresh-prices`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error(await readResponseError(response, 'Gagal me-refresh harga'))
      }

      setSuccess('Harga berhasil diperbarui.')
      await fetchPortfolioData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : getSessionExpiredMessage())
    } finally {
      setRefreshing(false)
    }
  }

  const handleDeleteHolding = async (holdingId: number) => {
    const confirmed = window.confirm('Hapus posisi ini dari portofolio Anda?')
    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      const response = await fetchWithSession(`${API_URL}/api/portfolio/holdings/${holdingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(await readResponseError(response, 'Gagal menghapus posisi'))
      }

      if (editingHoldingId === holdingId) {
        handleCancelEdit()
      }

      setSuccess('Posisi berhasil dihapus.')
      await fetchPortfolioData()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : getSessionExpiredMessage())
    }
  }

  return (
    <section className="container portfolio-shell">
      <div className="portfolio-header">
        <div className="dashboard-header">
          <div className="eyebrow">{isEnglish ? 'Portfolio' : 'Portofolio'}</div>
          <h2>{isEnglish ? 'Portfolio Insight' : 'Insight Portofolio'}</h2>
          <p className="lead">
            {isEnglish
              ? 'Track positions, live value, concentration, and exposure without relying only on historical charts.'
              : 'Pantau posisi, nilai live, serta konsentrasi dan eksposur tanpa hanya bergantung pada chart historis.'}
          </p>
          <div className="dashboard-stat-row" style={{ marginTop: '1rem' }}>
            <div className="dashboard-stat-pill">
              <span className="dashboard-stat-label">{isEnglish ? 'Mode' : 'Mode'}</span>
              <strong>{isPreviewMode ? (isEnglish ? 'Preview' : 'Preview') : (isEnglish ? 'Full Access' : 'Akses Penuh')}</strong>
            </div>
            <div className="dashboard-stat-pill">
              <span className="dashboard-stat-label">Plan</span>
              <strong>{isPreviewMode ? (isEnglish ? 'Free' : 'Gratis') : 'Pro'}</strong>
            </div>
          </div>
        </div>
        <div className="portfolio-header-actions">
          <p className="portfolio-freshness">{formatFreshness(latestPortfolioSync)}</p>
          <button
            className="btn secondary portfolio-refresh"
            type="button"
            onClick={handleRefreshPrices}
          disabled={refreshing}
        >
            {refreshing ? (isEnglish ? 'Refreshing...' : 'Memperbarui...') : (isEnglish ? 'Refresh Prices' : 'Refresh Harga')}
          </button>
        </div>
      </div>

      {error && <div className="ai-error">{error}</div>}
      {success && <div className="portfolio-success">{success}</div>}
      {isPreviewMode ? (
        <div className="portfolio-success">
          {isEnglish
            ? 'You are viewing the portfolio preview. Pro unlocks full analysis, while free still shows the market overview and basic context.'
            : 'Anda sedang melihat preview portofolio. Pro membuka analisis penuh, sementara free tetap bisa memantau ringkasan pasar dan konteks dasar.'}
        </div>
      ) : null}

      <section className="card portfolio-hero-card" aria-label={isEnglish ? 'Portfolio insight hero' : 'Hero insight portofolio'}>
        <div className="portfolio-hero-head">
          <div>
            <div className="eyebrow">{isEnglish ? 'Portfolio Insight' : 'Insight Portofolio'}</div>
            <h3>{isEnglish ? 'Ting AI Portfolio Read' : 'Pembacaan Portofolio Ting AI'}</h3>
          </div>
          <span className={`portfolio-hero-risk ${portfolioHeroInsight.risk_level}`}>
            {portfolioHeroInsight.risk_level === 'high'
              ? isEnglish ? 'High Risk' : 'Risiko Tinggi'
              : portfolioHeroInsight.risk_level === 'medium'
                ? isEnglish ? 'Medium Risk' : 'Risiko Menengah'
                : isEnglish ? 'Low Risk' : 'Risiko Rendah'}
          </span>
        </div>

        <p className="portfolio-hero-headline">{portfolioHeroInsight.headline}</p>

        <div className="portfolio-hero-metrics">
          <div className="portfolio-hero-metric">
            <span className="portfolio-mini-label">{isEnglish ? 'Current Value' : 'Nilai Saat Ini'}</span>
            <strong>{formatDisplayCurrency(intelligence.summary?.totalCurrentValue, displayCurrency)}</strong>
          </div>
          <div className="portfolio-hero-metric">
            <span className="portfolio-mini-label">{isEnglish ? 'Total Capital' : 'Total Modal'}</span>
            <strong>{formatDisplayCurrency(intelligence.summary?.totalInvested, displayCurrency)}</strong>
          </div>
          <div className="portfolio-hero-metric">
            <span className="portfolio-mini-label">{isEnglish ? 'Return %' : 'Imbal Hasil %'}</span>
            <strong>{intelligence.summary?.totalPnlPct !== null && intelligence.summary?.totalPnlPct !== undefined ? `${formatSigned(intelligence.summary.totalPnlPct, 1)}%` : 'Menunggu'}</strong>
          </div>
          <div className="portfolio-hero-metric">
            <span className="portfolio-mini-label">{isEnglish ? 'Largest Holding' : 'Holding Terbesar'}</span>
            <strong>
              {intelligence.largestPosition
                ? `${intelligence.largestPosition.label} / ${formatPercent(intelligence.largestPosition.weight, 1)}`
                : isEnglish ? 'Waiting' : 'Menunggu'}
            </strong>
          </div>
        </div>

        <div className="portfolio-hero-body">
          <ul className="portfolio-hero-reasons">
            {portfolioHeroInsight.reasons.slice(0, 2).map((reason) => (
              <li key={reason} className="portfolio-hero-reason">
                <strong>{reason}</strong>
              </li>
            ))}
          </ul>
          <div className="portfolio-hero-action">
            <span className="portfolio-mini-label">{isEnglish ? 'Next step' : 'Langkah yang bisa dipertimbangkan'}</span>
            <strong>{portfolioHeroInsight.action}</strong>
          </div>
        </div>
      </section>

      <section className="card portfolio-decision-card" aria-label={isEnglish ? 'Decision engine card' : 'Kartu decision engine'}>
        <div className="portfolio-decision-head">
          <div>
            <div className="eyebrow">{isEnglish ? 'Decision Engine' : 'Decision Engine'}</div>
            <h3>{isEnglish ? 'Decision Framing' : 'Kerangka Keputusan'}</h3>
          </div>
          <span className={`portfolio-decision-badge ${portfolioDecision.decision}`}>
            {portfolioDecision.decision === 'rebalance'
              ? 'Rebalance'
              : portfolioDecision.decision === 'reduce_exposure'
                ? isEnglish ? 'Reduce Exposure' : 'Kurangi Eksposur'
                : portfolioDecision.decision === 'wait'
                  ? isEnglish ? 'Wait' : 'Tunggu'
                  : isEnglish ? 'Monitor' : 'Pantau'}
          </span>
        </div>

        <p className="portfolio-decision-reasoning">{portfolioDecision.reasoning}</p>
        <p className="portfolio-decision-risk-note">{portfolioDecision.risk_note}</p>
      </section>

      <section className="card portfolio-simulation-card" aria-label={isEnglish ? 'Risk simulation card' : 'Kartu simulasi risiko'}>
        <div className="portfolio-simulation-head">
          <div>
            <div className="eyebrow">{isEnglish ? 'Risk Simulation' : 'Simulasi Risiko'}</div>
            <h3>{showFullRiskSimulation ? (isEnglish ? '5% Drop Scenario' : 'Skenario Turun 5%') : isEnglish ? 'Risk Simulation (Pro)' : 'Simulasi risiko (Pro)'}</h3>
            <p className="portfolio-widget-caption">
              {isEnglish
                ? 'Pro helps you see risk impact before making a decision.'
                : 'Pro membantu melihat dampak risiko sebelum mengambil keputusan.'}
            </p>
            {!showFullRiskSimulation ? (
              <p className="card-note">
                {isEnglish
                  ? 'See the impact if your largest holding drops 5%.'
                  : 'Lihat dampak jika aset terbesarmu turun 5%.'}
              </p>
            ) : null}
          </div>
          <span className={`portfolio-decision-badge ${portfolioDecision.decision}`}>
            {isEnglish ? 'Scenario' : 'Skenario'}
          </span>
        </div>

        {showFullRiskSimulation ? (
          <div className="portfolio-simulation-grid">
            <div className="portfolio-simulation-metric">
              <span className="portfolio-mini-label">{isEnglish ? 'Largest Holding' : 'Holding Terbesar'}</span>
              <strong>{riskSimulation.largest_holding}</strong>
            </div>
            <div className="portfolio-simulation-metric">
              <span className="portfolio-mini-label">{isEnglish ? 'Scenario' : 'Skenario'}</span>
              <strong>{riskSimulation.scenario}</strong>
            </div>
            <div className="portfolio-simulation-metric">
              <span className="portfolio-mini-label">{isEnglish ? 'Impact %' : 'Dampak %'}</span>
              <strong>{`${formatSigned(riskSimulation.impact_percent, 2)}%`}</strong>
            </div>
            <div className="portfolio-simulation-metric">
              <span className="portfolio-mini-label">{isEnglish ? 'Nominal Impact' : 'Dampak Nominal'}</span>
              <strong>
                {riskSimulation.nominal_impact !== null
                  ? `-${formatDisplayCurrency(riskSimulation.nominal_impact, displayCurrency)}`
                  : 'Menunggu'}
              </strong>
            </div>
          </div>
        ) : (
          <div className="portfolio-simulation-grid locked">
            <div className="portfolio-simulation-metric locked">
              <span className="portfolio-mini-label">{isEnglish ? 'Largest Holding' : 'Holding Terbesar'}</span>
              <strong>•••••</strong>
            </div>
            <div className="portfolio-simulation-metric locked">
              <span className="portfolio-mini-label">{isEnglish ? 'Scenario' : 'Skenario'}</span>
              <strong>••••••••••</strong>
            </div>
            <div className="portfolio-simulation-metric locked">
              <span className="portfolio-mini-label">{isEnglish ? 'Impact %' : 'Dampak %'}</span>
              <strong>••••</strong>
            </div>
            <div className="portfolio-simulation-metric locked">
              <span className="portfolio-mini-label">{isEnglish ? 'Nominal Impact' : 'Dampak Nominal'}</span>
              <strong>••••••</strong>
            </div>
          </div>
        )}

        <p className="portfolio-simulation-interpretation">{riskSimulation.interpretation}</p>
      </section>

      <details className="card portfolio-advanced-fold">
        <summary className="portfolio-advanced-summary">
          <div>
            <div className="eyebrow">{isEnglish ? 'Advanced' : 'Fitur lanjutan'}</div>
            <h3>{isEnglish ? 'Advanced Features' : 'Fitur lanjutan'}</h3>
            <p className="portfolio-widget-caption">
              {isEnglish
                ? 'Screeners, technicals, and extra indicators for deeper exploration.'
                : 'Screener, teknikal, dan indikator tambahan untuk eksplorasi lebih dalam.'}
            </p>
          </div>
        </summary>

        <div className="portfolio-advanced-content">
          <div className="card portfolio-widget-card">
            <div className="portfolio-widget-head">
              <div>
                <div className="eyebrow">Lensa Portofolio</div>
                <h3>{isEnglish ? 'Portfolio Intelligence' : 'Intelijensi Portofolio'}</h3>
                <p className="portfolio-widget-caption">
                  {isEnglish
                    ? 'A quick read on tone, concentration, and current exposure.'
                    : 'Tampilan singkat tentang nada, konsentrasi, dan eksposur saat ini.'}
                </p>
              </div>
              <span className="portfolio-widget-tone">{intelligence.portfolioTone}</span>
            </div>

            <div className="portfolio-widget-grid">
              <div className="portfolio-widget-metric">
                <span className="portfolio-mini-label">{isEnglish ? 'Positions' : 'Posisi'}</span>
                <strong>{intelligence.summary?.totalHoldings ?? intelligence.holdings.length}</strong>
              </div>
              <div className="portfolio-widget-metric">
                <span className="portfolio-mini-label">{isEnglish ? 'Largest Position' : 'Posisi Terbesar'}</span>
                <strong>
                  {intelligence.largestPosition
                    ? `${intelligence.largestPosition.label} / ${formatPercent(intelligence.largestPosition.weight, 1)}`
                    : isEnglish ? 'Waiting' : 'Menunggu'}
                </strong>
              </div>
              <div className="portfolio-widget-metric">
                <span className="portfolio-mini-label">{isEnglish ? 'Concentration' : 'Konsentrasi'}</span>
                <strong>{intelligence.concentrationLabel}</strong>
              </div>
              <div className="portfolio-widget-metric">
                <span className="portfolio-mini-label">{isEnglish ? 'Last Sync' : 'Sinkronisasi Terakhir'}</span>
                <strong>{formatFreshness(latestPortfolioSync)}</strong>
              </div>
            </div>

            <div className="portfolio-widget-meta">
              <span className="portfolio-mini-label">{isEnglish ? 'Health Note' : 'Catatan Kesehatan'}</span>
              <strong>{intelligence.healthNote}</strong>
            </div>

            <div className="portfolio-widget-list">
              <div className="portfolio-widget-row">
                <div>
                  <strong>{isEnglish ? 'Top Winners' : 'Pemenang Teratas'}</strong>
                  <p className="card-note">
                    {isEnglish
                      ? 'Positions contributing the most to unrealized profit.'
                      : 'Posisi yang memberi kontribusi terbesar pada laba berjalan.'}
                  </p>
                </div>
                <div className="portfolio-widget-row-value">
                  {intelligence.winners.length ? (
                    intelligence.winners.map((item) => (
                      <div key={`winner-${item.symbol}`}>
                        <strong>{item.symbol}</strong>
                        <span className="portfolio-widget-subnote">
                          {item.lots > 1 ? formatCombinedLots(item.lots, isEnglish) : item.name}
                        </span>
                        <span className="trend-up">
                          {item.pnl !== null && item.pnl !== undefined
                            ? `${formatDisplayCurrency(item.pnl, displayCurrency)}${
                                item.pnlPct !== null && item.pnlPct !== undefined
                                  ? ` (${formatPercent(item.pnlPct)})`
                                  : ''
                              }`
                            : 'Menunggu'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="card-note">Menunggu</span>
                  )}
                </div>
              </div>

              <div className="portfolio-widget-row">
                <div>
                  <strong>{isEnglish ? 'Biggest Drag' : 'Penekan Terbesar'}</strong>
                  <p className="card-note">
                    {isEnglish
                      ? 'Positions that weigh on portfolio performance the most.'
                      : 'Posisi yang paling menekan performa portofolio.'}
                  </p>
                </div>
                <div className="portfolio-widget-row-value">
                  {intelligence.losers.length ? (
                    intelligence.losers.map((item) => (
                      <div key={`loser-${item.symbol}`}>
                        <strong>{item.symbol}</strong>
                        <span className="portfolio-widget-subnote">
                          {item.lots > 1 ? formatCombinedLots(item.lots, isEnglish) : item.name}
                        </span>
                        <span className={(item.pnl ?? 0) >= 0 ? 'trend-up' : 'trend-down'}>
                          {item.pnl !== null && item.pnl !== undefined
                            ? `${formatDisplayCurrency(item.pnl, displayCurrency)}${
                                item.pnlPct !== null && item.pnlPct !== undefined
                                  ? ` (${formatPercent(item.pnlPct)})`
                                  : ''
                              }`
                            : 'Menunggu'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="card-note">Menunggu</span>
                  )}
                </div>
              </div>

              <div className="portfolio-widget-row">
                <div>
                  <strong>{isEnglish ? 'Allocation Snapshot' : 'Snapshot Alokasi'}</strong>
                  <p className="card-note">
                    {isEnglish
                      ? 'A quick view of where capital is most concentrated.'
                      : 'Lihat cepat area modal yang paling terkonsentrasi.'}
                  </p>
                </div>
                <div className="portfolio-widget-row-value">
                  {intelligence.allocation.slice(0, 3).length ? (
                    intelligence.allocation.slice(0, 3).map((item) => (
                      <div key={`allocation-${item.label}`}>
                        <strong>{item.label}</strong>
                        <span>{`${formatPercent(item.weight, 1)} / ${formatDisplayCurrency(item.value, displayCurrency)}`}</span>
                      </div>
                    ))
                  ) : (
                    <span className="card-note">Menunggu</span>
                  )}
                </div>
              </div>

              <div className="portfolio-widget-row">
                <div>
                  <strong>{isEnglish ? 'Exposure Snapshot' : 'Snapshot Eksposur'}</strong>
                  <p className="card-note">
                    {isEnglish
                      ? 'See the asset bucket and region that dominate the portfolio.'
                      : 'Lihat bucket aset dan wilayah yang paling dominan.'}
                  </p>
                </div>
                <div className="portfolio-widget-row-value">
                  {intelligence.topAssetType ? (
                    <div>
                      <strong>{intelligence.topAssetType.label}</strong>
                      <span>{`${formatPercent(intelligence.topAssetType.weight, 1)} ${isEnglish ? 'of portfolio value' : 'dari nilai portofolio'}`}</span>
                    </div>
                  ) : (
                    <span className="card-note">Menunggu</span>
                  )}
                  {intelligence.topRegion ? (
                    <div>
                      <strong>{intelligence.topRegion.label}</strong>
                      <span>{`${formatPercent(intelligence.topRegion.weight, 1)} ${isEnglish ? 'regional exposure' : 'eksposur wilayah'}`}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="card portfolio-widget-card portfolio-narrative-card">
            <div className="portfolio-widget-head">
              <div>
                <div className="eyebrow">{isEnglish ? 'Portfolio Narrative' : 'Narasi Portofolio'}</div>
                <h3>{isEnglish ? 'Portfolio Brief' : 'Brief Portofolio'}</h3>
                <p className="portfolio-widget-caption">
                  {isEnglish
                    ? 'A holdings-based brief on exposure, concentration, and the main portfolio driver.'
                    : 'Brief singkat tentang eksposur, konsentrasi, dan penggerak utama portofolio.'}
                </p>
              </div>
              <span className="portfolio-widget-tone">{intelligence.portfolioTone}</span>
            </div>

            <div className="portfolio-narrative-list">
              {intelligence.narratives.map((item) => (
                <article key={item.title} className="portfolio-narrative-item">
                  <span className="portfolio-mini-label">{item.title}</span>
                  <strong>{item.body}</strong>
                </article>
              ))}
            </div>
          </div>

          <div className="portfolio-summary-grid">
            <div className="portfolio-stat-card">
              <span className="portfolio-stat-label">{isEnglish ? 'Total Capital' : 'Total Modal'}</span>
              <strong>{formatDisplayCurrency(intelligence.summary?.totalInvested, displayCurrency)}</strong>
            </div>
            <div className="portfolio-stat-card">
              <span className="portfolio-stat-label">{isEnglish ? 'Current Value' : 'Nilai Saat Ini'}</span>
              <strong>{formatDisplayCurrency(intelligence.summary?.totalCurrentValue, displayCurrency)}</strong>
            </div>
            <div className="portfolio-stat-card">
              <span className="portfolio-stat-label">{isEnglish ? 'Total PnL' : 'Total PnL'}</span>
              <strong
                className={
                  intelligence.summary && intelligence.summary.totalPnl >= 0 ? 'trend-up' : 'trend-down'
                }
              >
                {intelligence.summary ? formatDisplayCurrency(intelligence.summary.totalPnl, displayCurrency) : 'Menunggu'}
              </strong>
            </div>
            <div className="portfolio-stat-card">
              <span className="portfolio-stat-label">{isEnglish ? 'Return %' : 'Imbal Hasil %'}</span>
              <strong
                className={
                  intelligence.summary && (intelligence.summary.totalPnlPct || 0) >= 0
                    ? 'trend-up'
                    : 'trend-down'
                }
              >
                {intelligence.summary?.totalPnlPct !== null && intelligence.summary?.totalPnlPct !== undefined
                  ? `${formatSigned(intelligence.summary.totalPnlPct)}%`
                  : 'Menunggu'}
              </strong>
            </div>
          </div>
        </div>
      </details>

      <AiChat
        sectionId="portfolio-ask-ting-ai"
        variant="panel"
        language={language}
        portfolio={portfolio}
        userPlan={isPreviewMode ? 'free' : 'pro'}
        analysisStatus={{
          label: isEnglish ? 'Portfolio-aware' : 'Sadar portofolio',
          detail: portfolio?.summary
            ? isEnglish
              ? 'Ask about portfolio safety, concentration risk, or trade-offs using your live holdings context.'
              : 'Tanyakan keamanan portofolio, konsentrasi, atau trade-off dengan konteks posisi yang sedang aktif.'
            : isEnglish
              ? 'Portfolio context is not ready yet, but Ask Ting AI will still answer with a safe fallback.'
              : 'Konteks portofolio belum siap, tetapi Ask Ting AI tetap akan menjawab dengan nada yang sama dan tetap hati-hati.'
        }}
      />

      <div className="portfolio-layout">
        <div className="portfolio-card">
          <h3>{editingHoldingId ? (isEnglish ? 'Edit Position' : 'Edit Posisi') : (isEnglish ? 'Add Position' : 'Tambah Posisi')}</h3>
          <form className="portfolio-form" onSubmit={handleSubmit}>
            <label className="auth-label" htmlFor="portfolio-asset">
              {isEnglish ? 'Asset' : 'Aset'}
            </label>
            <select
              id="portfolio-asset"
              className="auth-input"
              value={form.assetId}
              onChange={(event) => setForm((prev) => ({ ...prev, assetId: event.target.value }))}
              disabled={Boolean(editingHoldingId)}
              required
            >
              <option value="">{isEnglish ? 'Select asset' : 'Pilih aset'}</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.symbol} - {asset.name} ({asset.quoteCurrency})
                </option>
              ))}
            </select>
            {selectedAsset && (
              <p className="portfolio-input-hint">
                {selectedAsset.symbol} / {selectedAsset.assetType} /{' '}
                {isEnglish ? 'Quote currency' : 'Mata uang quote'} {selectedAsset.quoteCurrency}
              </p>
            )}
            {selectedAsset && <p className="portfolio-input-hint">{latestPriceLabel}</p>}

            <label className="auth-label" htmlFor="portfolio-entry-currency">
              {isEnglish ? 'Entry Currency' : 'Mata Uang Entry'}
            </label>
            <select
              id="portfolio-entry-currency"
              className="auth-input"
              value={form.entryCurrency || selectedAsset?.quoteCurrency || defaultDisplayCurrency}
              onChange={(event) => setForm((prev) => ({ ...prev, entryCurrency: event.target.value }))}
            >
              {['IDR', 'USD'].map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <p className="portfolio-input-hint">
              {isEnglish
                ? 'Preserve the currency you originally used when opening the position.'
                : 'Simpan mata uang yang Anda pakai saat membuka posisi.'}
            </p>

            <label className="auth-label" htmlFor="portfolio-quantity">
              {isEnglish ? 'Quantity' : 'Kuantitas'}
            </label>
            <input
              id="portfolio-quantity"
              className="auth-input"
              type="number"
              min="0"
              step="0.00000001"
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
              required
            />
            <p className="portfolio-input-hint">
              {isEnglish
                ? 'Use plain numbers like 2 or 0.5. Do not use thousand separators.'
                : 'Gunakan angka biasa seperti 2 atau 0.5. Jangan gunakan pemisah ribuan.'}
            </p>

            <label className="auth-label" htmlFor="portfolio-entry">
              {isEnglish ? 'Entry Price' : 'Harga Entry'}
            </label>
            <input
              id="portfolio-entry"
              className="auth-input"
              type="number"
              min="0"
              step="0.00000001"
              value={form.entryPrice}
              onChange={(event) => setForm((prev) => ({ ...prev, entryPrice: event.target.value }))}
              required
            />
            <p className="portfolio-input-hint">
              {isEnglish
                ? `Use ${selectedAsset?.quoteCurrency || 'the asset quote currency'} format like 67000, not 67.000.`
                : `Gunakan format ${selectedAsset?.quoteCurrency || 'mata uang quote aset'} seperti 67000, bukan 67.000.`}
            </p>
            {priceWarning && <p className="portfolio-input-warning">{priceWarning}</p>}

            <label className="auth-label" htmlFor="portfolio-invested">
              {isEnglish ? 'Total Capital' : 'Total Modal'}
            </label>
            <input
              id="portfolio-invested"
              className="auth-input"
              type="number"
              min="0"
              step="0.00000001"
              value={form.investedAmount}
              onChange={(event) => setForm((prev) => ({ ...prev, investedAmount: event.target.value }))}
              placeholder="Opsional, dihitung otomatis jika kosong"
            />
            <p className="portfolio-input-hint">
              {isEnglish
                ? 'Optional total capital. Use plain numbers like 134000, not 134.000.'
                : 'Total modal opsional. Gunakan angka biasa seperti 134000, bukan 134.000.'}
            </p>

            <label className="auth-label" htmlFor="portfolio-notes">
              {isEnglish ? 'Notes' : 'Catatan'}
            </label>
            <textarea
              id="portfolio-notes"
              className="auth-input portfolio-notes"
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder={isEnglish ? 'Optional notes' : 'Catatan opsional'}
            />

            <label className="auth-label" htmlFor="portfolio-opened-at">
              {isEnglish ? 'Opened At' : 'Tanggal Buka'}
            </label>
            <input
              id="portfolio-opened-at"
              className="auth-input"
              type="date"
              value={form.openedAt}
              onChange={(event) => setForm((prev) => ({ ...prev, openedAt: event.target.value }))}
            />
            <p className="portfolio-input-hint">
              {isEnglish
                ? 'Optional. Save the opening date so portfolio reviews stay tidy.'
                : 'Opsional. Simpan tanggal buka posisi agar review portofolio lebih rapi.'}
            </p>

            <div className="portfolio-form-actions">
              <button className="btn portfolio-submit" type="submit" disabled={submitting}>
                {submitting
                  ? isEnglish
                    ? 'Saving...'
                    : 'Menyimpan...'
                  : editingHoldingId
                    ? isEnglish
                      ? 'Save Changes'
                      : 'Simpan Perubahan'
                    : isEnglish
                      ? 'Add Position'
                      : 'Tambah Posisi'}
              </button>
              {editingHoldingId ? (
                <button className="btn secondary" type="button" onClick={handleCancelEdit} disabled={submitting}>
                  {isEnglish ? 'Cancel Edit' : 'Batal Edit'}
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="portfolio-card">
          <h3>{isEnglish ? 'Positions List' : 'Daftar Posisi'}</h3>
          <div className="portfolio-filter-bar">
            <label className="portfolio-filter">
              <span className="portfolio-mini-label">{isEnglish ? 'Filter Asset Type' : 'Filter Tipe Aset'}</span>
              <select
                className="auth-input"
                value={assetTypeFilter}
                onChange={(event) =>
                  setAssetTypeFilter(event.target.value as 'all' | AssetMasterItem['assetType'])
                }
              >
                <option value="all">{isEnglish ? 'All asset types' : 'Semua tipe aset'}</option>
                <option value="stock">{isEnglish ? 'Stock' : 'Saham'}</option>
                <option value="index">{isEnglish ? 'Index' : 'Indeks'}</option>
                <option value="crypto">{isEnglish ? 'Crypto' : 'Kripto'}</option>
                <option value="commodity">{isEnglish ? 'Commodity' : 'Komoditas'}</option>
              </select>
            </label>

            <label className="portfolio-filter">
              <span className="portfolio-mini-label">{isEnglish ? 'Filter Region' : 'Filter Wilayah'}</span>
              <select
                className="auth-input"
                value={regionFilter}
                onChange={(event) => setRegionFilter(event.target.value)}
              >
                <option value="all">{isEnglish ? 'All regions' : 'Semua wilayah'}</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="btn secondary portfolio-filter-reset"
              onClick={() => {
                setAssetTypeFilter('all')
                setRegionFilter('all')
              }}
              disabled={assetTypeFilter === 'all' && regionFilter === 'all'}
            >
              {isEnglish ? 'Reset Filters' : 'Reset Filter'}
            </button>
          </div>
          {loading ? (
            <p className="card-note">{isEnglish ? 'Loading portfolio...' : 'Memuat portofolio...'}</p>
          ) : filteredHoldings.length ? (
            <div className="portfolio-holdings">
              {filteredHoldings.map((holding) => (
                <div key={holding.id} className="portfolio-row">
                  <div className="portfolio-row-head">
                    <div>
                      <strong>{holding.symbol}</strong>
                      <p className="card-note">{holding.name}</p>
                      <p className="portfolio-sync-note">{formatFreshness(holding.fetchedAt)}</p>
                      <p className="card-note">
                        {holding.assetType} / {holding.region}
                      </p>
                    </div>
                    <div className="portfolio-row-actions">
                      <span className={`portfolio-trend ${holding.trend || 'flat'}`}>
                        {holding.trend || 'flat'}
                      </span>
                      <button
                        type="button"
                        className="btn secondary portfolio-edit"
                        onClick={() => handleStartEdit(holding)}
                        disabled={submitting || refreshing}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="portfolio-remove"
                        onClick={() => void handleDeleteHolding(holding.id)}
                        disabled={submitting || refreshing}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="portfolio-row-grid">
                    <div>
                      <span className="portfolio-mini-label">Kuantitas</span>
                      <strong>{holding.quantity}</strong>
                    </div>
                    <div>
                      <span className="portfolio-mini-label">Entry</span>
                      <strong>{formatDisplayCurrency(holding.entryPrice, holding.entryCurrency || holding.quoteCurrency)}</strong>
                    </div>
                    <div>
                      <span className="portfolio-mini-label">Harga Terbaru</span>
                      <strong>{formatDisplayCurrency(holding.latestPrice, getMarketPriceCurrency(holding.symbol, holding.quoteCurrency, displayCurrency))}</strong>
                    </div>
                    <div>
                      <span className="portfolio-mini-label">Nilai Saat Ini</span>
                      <strong>{formatDisplayCurrency(holding.currentValue, displayCurrency)}</strong>
                    </div>
                    <div>
                      <span className="portfolio-mini-label">PnL</span>
                      <strong className={(holding.pnl || 0) >= 0 ? 'trend-up' : 'trend-down'}>
                        {holding.pnl !== null && holding.pnl !== undefined
                          ? `${formatDisplayCurrency(holding.pnl, displayCurrency)}${
                              holding.pnlPct !== null && holding.pnlPct !== undefined
                                ? ` (${formatSigned(holding.pnlPct)}%)`
                                : ''
                            }`
                          : 'Menunggu'}
                      </strong>
                    </div>
                    <div>
                      <span className="portfolio-mini-label">Perubahan Harian</span>
                      <strong>
                        {holding.dayChange !== null && holding.dayChange !== undefined
                          ? `${formatDisplayCurrency(holding.dayChange, displayCurrency)} (${formatSigned(holding.dayChangePct || 0)}%)`
                          : 'Menunggu'}
                      </strong>
                    </div>
                    <div>
                      <span className="portfolio-mini-label">Tanggal Buka</span>
                      <strong>{holding.openedAt || 'Tidak dicatat'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : intelligence.holdings.length ? (
            <p className="card-note">
              {isEnglish
                ? 'No positions match the current filters. Try changing asset type or region.'
                : 'Tidak ada posisi yang cocok dengan filter saat ini. Coba ubah tipe aset atau wilayah.'}
            </p>
          ) : (
            <p className="card-note">
              {isEnglish
                ? 'No positions yet. Add your first position to start tracking PnL.'
                : 'Belum ada posisi. Tambahkan posisi pertama Anda untuk mulai melacak PnL.'}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
