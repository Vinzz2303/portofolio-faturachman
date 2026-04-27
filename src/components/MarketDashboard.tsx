import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time
} from 'lightweight-charts'
import { API_URL } from '../utils/api'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import type { CandlestickPoint, GoldCardData, MarketSeriesResponse } from '../types'
import type { DecisionContext } from './dashboard/types'
import { computePortfolioImpact } from '../utils/portfolio'

type Timeframe = '1D' | '1W' | '1M' | '3M'
type ChartKind = 'gold' | 'btc' | 'sp500' | 'ihsg'

type RawPoint = Partial<CandlestickPoint> & {
  date?: string
  value?: number
}

type MarketDashboardProps = {
  sectionId?: string
  gold?: GoldCardData
  sp500?: CandlestickPoint[]
  ihsg?: CandlestickPoint[]
  decisionContext?: DecisionContext
}

const marketCopy = {
  id: {
    eyebrow: 'KONTEKS PENDUKUNG',
    title: 'Ringkasan Pasar',
    lead: 'Emas, Bitcoin, indeks saham AS, dan IHSG ditampilkan sebagai konteks pendukung yang cepat dibaca.',
    note: 'Ringkasan ini membantu membaca kondisi pasar hari ini.',
    sourceStatus: 'STATUS SUMBER DATA',
    loadingContext: 'Memuat konteks pasar...',
    waitingData: 'Menunggu data',
    allReady: 'Semua sumber data siap',
    marketReady: 'Ringkasan pasar siap digunakan sebagai konteks pembacaan hari ini.',
    marketWaiting: 'Ringkasan pasar masih menunggu sumber data utama.',
    marketPartial: 'Sebagian sumber data aktif. Gunakan sebagai konteks pendukung, bukan keputusan tunggal.',
    lastUpdate: 'PEMBARUAN TERAKHIR',
    coverage: 'CAKUPAN',
    coverageValue: 'Emas, BTC, SPY, IHSG',
    coverageCaption: 'Daftar aset inti lintas pasar untuk konteks harian.',
    lastUpdateCaption: 'Menunjukkan apakah data masih cukup relevan untuk pembacaan hari ini.',
    sourcesActive: (count: number) => `${count}/4 sumber data aktif`,
    chartSourcesCaption: (count: number) => `${count} sumber grafik dan 1 data harga utama tersedia.`,
    chartCandleUnavailable: (title: string) => `Data candle ${title} belum tersedia.`,
    updatedJustNow: 'Baru saja diperbarui',
    updatedMinutesAgo: (count: number) => `Diperbarui ${count} menit lalu`,
    updatedHoursAgo: (count: number) => `Diperbarui ${count} jam lalu`,
    updatedDaysAgo: (count: number) => `Diperbarui ${count} hari lalu`,
    lastUpdateInline: 'Pembaruan terakhir',
    dailyMove: 'Pergerakan harian',
    bias: 'Bias',
    sourceMode: 'Mode sumber data',
    shortNote: 'Catatan ringkas',
    dataPoints: (count: number) => `${count} titik data`,
    noCandle: 'Belum ada candle',
    spotMonitoring: 'Pemantauan spot',
    directPrimaryPrice: 'Harga utama langsung',
    cacheRefresh: 'Pembaruan cache',
    backupMarketSource: 'Sumber cadangan pasar',
    alphaVantageLive: 'Alpha Vantage langsung',
    coinGeckoLive: 'CoinGecko langsung',
    dataPending: 'Data menunggu',
    flat: 'Datar',
    waiting: 'Menunggu',
    spotOnly: 'Spot saja',
    defensiveBid: 'Bid defensif',
    lightPullback: 'Pullback ringan',
    stable: 'Stabil',
    activeRiskAppetite: 'Minat risiko aktif',
    improvingRiskAppetite: 'Minat risiko membaik',
    highPressure: 'Tekanan tinggi',
    weakeningRiskAppetite: 'Minat risiko melemah',
    selective: 'Selektif',
    healthyLeadership: 'Leadership sehat',
    constructiveBias: 'Bias konstruktif',
    defensiveBias: 'Bias defensif',
    equityPressure: 'Tekanan ekuitas',
    limitedConfirmation: 'Konfirmasi terbatas',
    domesticSupport: 'Dukungan domestik',
    cautiousSentiment: 'Sentimen hati-hati',
    liveChart: 'Grafik langsung',
    backupChart: 'Grafik cadangan',
    syncedChart: 'Grafik tersinkron',
    goldHistoryMissing: 'Riwayat spot emas belum tersedia.',
    thinMove: 'Pergerakan sangat tipis dalam periode ini',
    stockProxyDetail: 'Detail proxy saham',
    fallback: 'Fallback',
    noMarketData: 'Tidak ada sumber data pasar yang tampil. Refresh halaman atau cek API market di backend.',
    riskAssetBenchmark: 'Acuan aset berisiko',
    usEquityProxy: 'Proxy pasar saham AS',
    indonesiaEquityIndex: 'Indeks saham Indonesia',
    trend: 'Tren',
    partialLoadError: (error: string) => `Sebagian konteks pasar gagal dimuat: ${error}`,
    timeframe1D: '1 hari terakhir',
    timeframe1W: '7 hari terakhir',
    timeframe1M: '30 hari terakhir',
    timeframe3M: '90 hari terakhir',
    noteTitle: 'Catatan',
    evidenceTitle: 'Bukti',
    interpretationTitle: 'Interpretasi',
    portfolioImpactTitle: 'Dampak portofolio',
    estimatedImpactTitle: 'Dampak estimasi',
    meaningTitle: 'Makna',
    actionHintTitle: 'Petunjuk tindakan',
    confidenceTitle: 'Keyakinan',
    noNoteAvailable: 'Belum ada catatan yang bisa ditampilkan untuk kondisi ini.',
    mediumConfidence: 'Sedang',
    lowConfidence: 'Rendah'
  },
  en: {
    eyebrow: 'SUPPORTING CONTEXT',
    title: 'Market Summary',
    lead: 'Gold, Bitcoin, US equity indexes, and IHSG are shown as quick supporting context.',
    note: 'This summary helps frame today\'s market condition.',
    sourceStatus: 'DATA SOURCE STATUS',
    loadingContext: 'Loading market context...',
    waitingData: 'Waiting for data',
    allReady: 'All data sources ready',
    marketReady: 'Market summary is ready to use as context for today\'s read.',
    marketWaiting: 'Market summary is still waiting for the main data sources.',
    marketPartial: 'Some data sources are active. Use this as supporting context, not a standalone decision.',
    lastUpdate: 'LATEST UPDATE',
    coverage: 'COVERAGE',
    coverageValue: 'Gold, BTC, SPY, IHSG',
    coverageCaption: 'Core cross-market assets for daily context.',
    lastUpdateCaption: 'Shows whether the data is still relevant enough for today\'s read.',
    sourcesActive: (count: number) => `${count}/4 data sources active`,
    chartSourcesCaption: (count: number) => `${count} chart sources and 1 primary price feed available.`,
    chartCandleUnavailable: (title: string) => `${title} candle data is not available yet.`,
    updatedJustNow: 'Updated just now',
    updatedMinutesAgo: (count: number) => `Updated ${count} minutes ago`,
    updatedHoursAgo: (count: number) => `Updated ${count} hours ago`,
    updatedDaysAgo: (count: number) => `Updated ${count} days ago`,
    lastUpdateInline: 'Last update',
    dailyMove: 'Daily move',
    bias: 'Bias',
    sourceMode: 'Data source mode',
    shortNote: 'Quick note',
    dataPoints: (count: number) => `${count} data points`,
    noCandle: 'No candles yet',
    spotMonitoring: 'Spot monitoring',
    directPrimaryPrice: 'Primary live price',
    cacheRefresh: 'Cache refresh',
    backupMarketSource: 'Backup market source',
    alphaVantageLive: 'ALPHA VANTAGE LIVE',
    coinGeckoLive: 'COINGECKO LIVE',
    dataPending: 'DATA PENDING',
    flat: 'Flat',
    waiting: 'Waiting',
    spotOnly: 'Spot only',
    defensiveBid: 'Defensive bid',
    lightPullback: 'Light pullback',
    stable: 'Stable',
    activeRiskAppetite: 'Risk appetite active',
    improvingRiskAppetite: 'Risk appetite improving',
    highPressure: 'High pressure',
    weakeningRiskAppetite: 'Risk appetite weakening',
    selective: 'Selective',
    healthyLeadership: 'Healthy leadership',
    constructiveBias: 'Constructive bias',
    defensiveBias: 'Defensive bias',
    equityPressure: 'Equity pressure',
    limitedConfirmation: 'Limited confirmation',
    domesticSupport: 'Domestic support',
    cautiousSentiment: 'Cautious sentiment',
    liveChart: 'Live chart',
    backupChart: 'Backup chart',
    syncedChart: 'Synced chart',
    goldHistoryMissing: 'Gold spot history is not available yet.',
    thinMove: 'Movement is very thin in this period',
    stockProxyDetail: 'Stock proxy detail',
    fallback: 'Fallback',
    noMarketData: 'No market data sources are visible. Refresh the page or check the market API on the backend.',
    riskAssetBenchmark: 'Risk-asset benchmark',
    usEquityProxy: 'US equity proxy',
    indonesiaEquityIndex: 'Indonesian equity index',
    trend: 'Trend',
    partialLoadError: (error: string) => `Some market context failed to load: ${error}`,
    timeframe1D: 'Last 1 day',
    timeframe1W: 'Last 7 days',
    timeframe1M: 'Last 30 days',
    timeframe3M: 'Last 90 days',
    noteTitle: 'Note',
    evidenceTitle: 'Evidence',
    interpretationTitle: 'Interpretation',
    portfolioImpactTitle: 'Portfolio impact',
    estimatedImpactTitle: 'Estimated impact',
    meaningTitle: 'Meaning',
    actionHintTitle: 'Action hint',
    confidenceTitle: 'Confidence',
    noNoteAvailable: 'No note is available for this condition yet.',
    mediumConfidence: 'Medium',
    lowConfidence: 'Low'
  }
} as const

type MarketMovement = {
  absolute: number | null
  percent: number | null
  trend: 'up' | 'down' | 'flat'
}

type RangeMode = {
  isLowVolatility: boolean
  min: number
  max: number
  paddedMin: number
  paddedMax: number
}

const defaultGold: GoldCardData = {
  price: null,
  change: 0,
  updatedAt: '-'
}

const defaultSp500: CandlestickPoint[] = []
const defaultIhsg: CandlestickPoint[] = []
const timeframeOptions: Timeframe[] = ['1D', '1W', '1M', '3M']

const currencyUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const currencyIdr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

const compactNumber = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})

const normalizeSeries = (series: RawPoint[] | CandlestickPoint[] | undefined): CandlestickPoint[] => {
  if (!Array.isArray(series)) return []

  return series
    .map((point) => {
      const rawPoint = point as RawPoint
      if (
        point &&
        (typeof point.time === 'string' || typeof point.time === 'number') &&
        typeof point.open === 'number' &&
        typeof point.high === 'number' &&
        typeof point.low === 'number' &&
        typeof point.close === 'number'
      ) {
        return {
          time: point.time,
          open: point.open,
          high: point.high,
          low: point.low,
          close: point.close
        }
      }

      if (rawPoint && typeof rawPoint.date === 'string' && typeof rawPoint.value === 'number') {
        return {
          time: rawPoint.date,
          open: rawPoint.value,
          high: rawPoint.value,
          low: rawPoint.value,
          close: rawPoint.value
        }
      }

      return null
    })
    .filter((point): point is CandlestickPoint => point !== null)
}

const toChartData = (series: CandlestickPoint[]): CandlestickData<Time>[] =>
  series.map((point) => ({
    time: point.time as Time,
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close
  }))

const getDaysFromTimeframe = (timeframe: Timeframe) => {
  switch (timeframe) {
    case '1D':
      // We still need the previous candle so daily movement and bias can be derived.
      return 2
    case '1W':
      return 7
    case '1M':
      return 30
    case '3M':
      return 90
  }
}

const getTimeframeLabel = (
  timeframe: Timeframe,
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
) => {
  if (timeframe === '1D') return copy.timeframe1D
  if (timeframe === '1M') return copy.timeframe1M
  if (timeframe === '3M') return copy.timeframe3M
  return copy.timeframe1W
}

const formatFreshness = (
  value: string | number | null | undefined,
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
) => {
  if (!value) return copy.waiting

  const timestamp =
    typeof value === 'number'
      ? new Date(value).getTime()
      : /^\d{4}-\d{2}-\d{2}$/.test(String(value))
        ? new Date(`${value}T00:00:00`).getTime()
        : new Date(String(value)).getTime()

  if (Number.isNaN(timestamp)) return copy.waiting

  const diffMs = Date.now() - timestamp
  if (diffMs < 60 * 1000) return copy.updatedJustNow

  const diffMinutes = Math.floor(diffMs / (60 * 1000))
  if (diffMinutes < 60) return copy.updatedMinutesAgo(diffMinutes)

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return copy.updatedHoursAgo(diffHours)

  const diffDays = Math.floor(diffHours / 24)
  return copy.updatedDaysAgo(diffDays)
}

const getSeriesDelta = (series: CandlestickPoint[]): MarketMovement | null => {
  if (series.length < 2) return null

  const first = series[0]?.close
  const last = series[series.length - 1]?.close
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null

  const absolute = last - first
  const percent = first === 0 ? null : (absolute / first) * 100

  return {
    absolute,
    percent,
    trend: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'flat'
  }
}

const getRangeMode = (series: CandlestickPoint[]): RangeMode | null => {
  if (!series.length) return null

  const lows = series.map((point) => point.low).filter(Number.isFinite)
  const highs = series.map((point) => point.high).filter(Number.isFinite)
  if (!lows.length || !highs.length) return null

  const min = Math.min(...lows)
  const max = Math.max(...highs)
  const range = max - min
  const midpoint = (max + min) / 2
  const relativeRange = midpoint !== 0 ? range / midpoint : 0
  const padding = Math.max(range * 0.18, Math.abs(midpoint) * 0.00015, 0.5)
  const isLowVolatility = range > 0 && relativeRange <= 0.0025

  return {
    isLowVolatility,
    min,
    max,
    paddedMin: min - padding,
    paddedMax: max + padding
  }
}

const formatDeltaLabel = (value: number | null | undefined, suffix = '') => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${compactNumber.format(value)}${suffix}`
}

const getSourceLabel = (
  source: string | undefined,
  fallback: string | undefined,
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
) => {
  if (fallback === 'cached') return copy.cacheRefresh
  if (source === 'database') return 'Ting AI DB'
  if (source === 'yahoo-finance') return copy.backupMarketSource
  if (source === 'alphavantage') return copy.alphaVantageLive
  if (source === 'coingecko') return copy.coinGeckoLive
  return copy.dataPending
}

const getMovementText = (
  movement: MarketMovement | null,
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
) => {
  if (!movement) return '-'
  if (movement.trend === 'flat' || movement.absolute === 0) return copy.flat
  const absolute = formatDeltaLabel(movement.absolute)
  const percent = movement.percent !== null ? ` (${formatDeltaLabel(movement.percent, '%')})` : ''
  return `${absolute}${percent}`
}

const getSectorBias = (
  kind: ChartKind,
  movement: MarketMovement | null,
  decisionContext: DecisionContext | undefined,
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
) => {
  const marketRegime = decisionContext?.marketRegimeKey

  if (!movement) return kind === 'gold' ? copy.spotOnly : copy.waiting

  if (kind === 'gold') {
    if (movement.trend === 'up') return copy.defensiveBid
    if (movement.trend === 'down') return copy.lightPullback
    return copy.stable
  }

  if (kind === 'btc') {
    if (movement.trend === 'up' && marketRegime === 'risk_on') return copy.activeRiskAppetite
    if (movement.trend === 'up') return copy.improvingRiskAppetite
    if (movement.trend === 'down' && marketRegime === 'defensive') return copy.highPressure
    if (movement.trend === 'down') return copy.weakeningRiskAppetite
    return copy.selective
  }

  if (kind === 'sp500') {
    if (movement.trend === 'up' && marketRegime === 'risk_on') return copy.healthyLeadership
    if (movement.trend === 'up') return copy.constructiveBias
    if (movement.trend === 'down' && marketRegime === 'defensive') return copy.defensiveBias
    if (movement.trend === 'down') return copy.equityPressure
    return copy.limitedConfirmation
  }

  if (movement.trend === 'up') return copy.domesticSupport
  if (movement.trend === 'down') return copy.cautiousSentiment
  return languageNeutral(copy)
}

const languageNeutral = (copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']) =>
  copy === marketCopy.en ? 'Neutral' : 'Netral'

const getModeFeed = (
  kind: ChartKind,
  sourceLabel: string,
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
) => {
  if (kind === 'gold') return copy.directPrimaryPrice
  if (sourceLabel.toLowerCase().includes('live')) return copy.liveChart
  if (sourceLabel.toLowerCase().includes('cache')) return copy.cacheRefresh
  if (sourceLabel.toLowerCase().includes('backup') || sourceLabel.toLowerCase().includes('cadangan')) {
    return copy.backupChart
  }
  return copy.syncedChart
}

const getPortfolioRelevance = (decisionContext?: DecisionContext) => {
  if (!decisionContext) {
    return 'Untuk portofolio kamu, ini lebih berguna sebagai konteks tambahan daripada alasan untuk bergerak cepat.'
  }

  if (decisionContext.fitLevel === 'weak_fit' || decisionContext.userState === 'overexposed') {
    return 'Untuk portofolio kamu, tekanan kecil bisa terasa lebih cepat, jadi konteks ini penting dibaca dengan hati-hati.'
  }

  if (decisionContext.fitLevel === 'moderate_fit' || decisionContext.userState === 'watchful') {
    return 'Untuk portofolio kamu, konteks ini menegaskan bahwa selektivitas dan ukuran posisi masih lebih penting daripada bertindak cepat.'
  }

  return 'Untuk portofolio kamu, konteks ini membantu menjaga disiplin tanpa perlu memaksakan perubahan besar.'
}

const isOperationalFeedNote = (note: string) => {
  const normalized = note.trim().toLowerCase()
  if (!normalized) return false

  return (
    normalized.includes('fallback') ||
    normalized.includes('cache') ||
    normalized.includes('yahoo finance') ||
    normalized.includes('coingecko') ||
    normalized.includes('sumber data langsung') ||
    normalized.includes('chart data') ||
    normalized.includes('candle data') ||
    normalized.includes('data candle')
  )
}

type SectorNoteSection = {
  title: string
  text: string
}

const normalizeSectorNoteSections = (
  value: unknown,
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
): SectorNoteSection[] => {
  if (typeof value === 'string') {
    return [{ title: copy.noteTitle, text: value }]
  }

  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is SectorNoteSection => {
      if (!item || typeof item !== 'object') return false
      const candidate = item as Partial<SectorNoteSection>
      return typeof candidate.title === 'string' && typeof candidate.text === 'string'
    })
    .map((item) => ({
      title: item.title.trim() || copy.noteTitle,
      text: item.text.trim()
    }))
}

const renderStructuredNote = (
  sections: SectorNoteSection[],
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
) => (
  <div className="market-spot-note-text">
    {sections.map((section) => (
      <div
        key={section.title}
        className={`market-spot-note-block ${section.title === copy.actionHintTitle ? 'market-spot-note-block--focus' : ''} ${
          section.title === copy.portfolioImpactTitle ? 'market-spot-note-block--impact' : ''
        } ${section.title === copy.confidenceTitle ? 'market-spot-note-block--footnote' : ''}`.trim()}
      >
        <p
          className={`market-spot-note-block-title ${
            section.title === copy.actionHintTitle ? 'market-spot-note-block-title--focus' : ''
          } ${section.title === copy.portfolioImpactTitle ? 'market-spot-note-block-title--impact' : ''}`.trim()}
        >
          {section.title}
        </p>
        <p className="market-spot-note-block-text">{section.text}</p>
      </div>
    ))}
    {!sections.length ? (
      <div className="market-spot-note-block">
        <p className="market-spot-note-block-title">{copy.noteTitle}</p>
        <p className="market-spot-note-block-text">{copy.noNoteAvailable}</p>
      </div>
    ) : null}
  </div>
)

const getSectorNote = (
  kind: ChartKind,
  movement: MarketMovement | null,
  note: string,
  decisionContext: DecisionContext | undefined,
  copy: (typeof marketCopy)['id'] | (typeof marketCopy)['en']
) => {
  const timeframeLabel = copy.timeframe1M
  const portfolioWeight = 0.42
  const portfolioValue = 100000
  const movePct = movement?.percent ?? -3
  const impact = computePortfolioImpact(portfolioWeight, movePct / 100, portfolioValue)
  const hasOperationalNote = Boolean(note && isOperationalFeedNote(note))
  const noteContext =
    note && !hasOperationalNote && kind === 'gold'
      ? ` ${note.trim()}`
      : ''
  const assetLabel =
    kind === 'btc' ? 'BTC' : kind === 'sp500' ? 'S&P 500' : kind === 'ihsg' ? 'IHSG' : 'Gold'

  const evidence = movement
    ? copy === marketCopy.en
      ? `${assetLabel} moved ${movement.trend === 'up' ? 'higher' : movement.trend === 'down' ? 'lower' : 'flat'} ${formatDeltaLabel(movement.percent, '%')} across ${timeframeLabel}.`
      : `${assetLabel} bergerak ${movement.trend === 'up' ? 'naik' : movement.trend === 'down' ? 'turun' : 'datar'} ${formatDeltaLabel(movement.percent, '%')} dalam ${timeframeLabel}.`
    : copy === marketCopy.en
      ? `${assetLabel} does not have enough movement data to read cleanly in ${timeframeLabel}.${noteContext}`
      : `Data pergerakan ${assetLabel} belum cukup untuk dibaca tegas dalam ${timeframeLabel}.${noteContext}`

  const interpretation = copy === marketCopy.en
    ? kind === 'btc'
      ? movement?.trend === 'up'
        ? 'BTC is improving, so short-term risk appetite looks firmer.'
        : movement?.trend === 'down'
          ? 'BTC is weakening, so risk appetite still looks restrained.'
          : 'BTC is flat, so risk appetite is not giving a strong directional cue yet.'
      : kind === 'sp500'
        ? movement?.trend === 'up'
          ? 'US equities are improving, so leadership still looks constructive.'
          : movement?.trend === 'down'
            ? 'US equities are weakening, so broad equity support still looks fragile.'
            : 'US equities are flat, so momentum is still waiting for cleaner confirmation.'
        : kind === 'ihsg'
          ? movement?.trend === 'up'
            ? 'IHSG is improving, so local sentiment looks more constructive.'
            : movement?.trend === 'down'
              ? 'IHSG is weakening, so local sentiment still looks cautious.'
              : 'IHSG is flat, so domestic context is still not giving a strong cue.'
          : movement?.trend === 'up'
            ? 'Gold is strengthening, so defensive demand is still visible.'
            : movement?.trend === 'down'
              ? 'Gold is easing, so defensive demand is not accelerating right now.'
              : 'Gold is flat, so defensive preference has not shifted clearly.'
    : kind === 'btc'
      ? movement?.trend === 'up'
        ? 'BTC menguat, jadi selera risiko jangka pendek terlihat lebih sehat.'
        : movement?.trend === 'down'
          ? 'BTC melemah, jadi selera risiko masih terlihat tertahan.'
          : 'BTC datar, jadi pasar belum memberi bias risiko yang tegas.'
      : kind === 'sp500'
        ? movement?.trend === 'up'
          ? 'Ekuitas AS membaik, jadi kepemimpinan pasar terlihat lebih konstruktif.'
          : movement?.trend === 'down'
            ? 'Ekuitas AS melemah, jadi dukungan pasar saham masih terlihat rapuh.'
            : 'Ekuitas AS datar, jadi momentumnya masih menunggu konfirmasi yang lebih bersih.'
        : kind === 'ihsg'
          ? movement?.trend === 'up'
            ? 'IHSG menguat, jadi sentimen domestik terlihat lebih konstruktif.'
            : movement?.trend === 'down'
              ? 'IHSG melemah, jadi sentimen lokal masih terlihat berhati-hati.'
              : 'IHSG datar, jadi konteks domestik belum memberi arah yang tegas.'
          : movement?.trend === 'up'
            ? 'Emas menguat, jadi kebutuhan perlindungan masih terlihat.'
            : movement?.trend === 'down'
              ? 'Emas melemah, jadi permintaan defensif tidak sedang meningkat.'
              : 'Emas datar, jadi preferensi defensif belum berubah jelas.'

  const portfolioImpact = copy === marketCopy.en
    ? 'This move helps frame how sensitive the portfolio may be to the same condition.'
    : 'Pergerakan ini membantu membaca seberapa sensitif portofolio terhadap kondisi yang sama.'

  const impactMeaning = copy === marketCopy.en
    ? movement?.trend === 'up'
      ? 'The move shows how portfolio sensitivity can rise when a dominant asset moves in your favor.'
      : movement?.trend === 'down'
        ? 'The move tests how much the portfolio can be dragged when a dominant asset weakens.'
        : 'When price stays flat, concentration still matters because the outcome remains narrow.'
    : movement?.trend === 'up'
      ? 'Pergerakan ini menunjukkan sensitivitas portofolio saat aset dominan bergerak searah.'
      : movement?.trend === 'down'
        ? 'Pergerakan ini menguji seberapa besar portofolio ikut terseret saat aset dominan melemah.'
        : 'Saat pergerakan datar, konsentrasi tetap penting karena hasil akhir masih sempit.'

  const actionHint = copy === marketCopy.en
    ? kind === 'btc'
      ? 'Check whether this BTC move deserves more weight, or whether it only adds noise to an already concentrated portfolio.'
      : kind === 'sp500'
        ? 'Use this as a check on whether portfolio support is broad, or still tied to a narrow group of positions.'
        : kind === 'ihsg'
          ? 'Use this as a check on whether domestic exposure is still intentional for the current pace of the market.'
          : 'Use this to judge whether the portfolio already has enough defensive balance.'
    : kind === 'btc'
      ? 'Cek apakah pergerakan BTC ini memang layak diberi bobot lebih besar, atau justru hanya menambah noise pada portofolio yang sudah padat.'
      : kind === 'sp500'
        ? 'Gunakan ini untuk mengecek apakah dukungan portofolio cukup lebar, atau masih bertumpu pada sedikit posisi.'
        : kind === 'ihsg'
          ? 'Gunakan ini untuk mengecek apakah eksposur domestik memang masih sengaja dipertahankan untuk ritme pasar saat ini.'
          : 'Gunakan ini untuk menilai apakah portofolio sudah punya penyeimbang defensif yang cukup.'

  const confidence = movement ? copy.mediumConfidence : copy.lowConfidence

  return [
    { title: copy.evidenceTitle, text: evidence },
    { title: copy.interpretationTitle, text: interpretation },
    { title: copy.portfolioImpactTitle, text: portfolioImpact },
    { title: copy.estimatedImpactTitle, text: currencyUsd.format(Math.abs(impact)) },
    { title: copy.meaningTitle, text: impactMeaning },
    { title: copy.actionHintTitle, text: actionHint },
    { title: copy.confidenceTitle, text: confidence }
  ]
}

const createCandlestickChart = (
  container: HTMLDivElement,
  chartRef: React.MutableRefObject<IChartApi | null>,
  seriesRef: React.MutableRefObject<ISeriesApi<'Candlestick'> | null>
) => {
  const chart = createChart(container, {
    layout: {
      background: { type: ColorType.Solid, color: 'rgba(0,0,0,0)' },
      textColor: 'rgba(167,176,191,0.85)'
    },
    grid: {
      vertLines: { color: 'rgba(255,255,255,0.06)' },
      horzLines: { color: 'rgba(255,255,255,0.06)' }
    },
    rightPriceScale: {
      borderVisible: false
    },
    timeScale: {
      borderVisible: false,
      timeVisible: true,
      secondsVisible: false
    }
  })

  const series = chart.addCandlestickSeries({
    upColor: '#4ade80',
    downColor: '#f87171',
    wickUpColor: '#4ade80',
    wickDownColor: '#f87171',
    borderVisible: false
  })

  chartRef.current = chart
  seriesRef.current = series

  const resize = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect
    if (!rect || !chartRef.current) return
    chartRef.current.applyOptions({
      width: Math.floor(rect.width),
      height: Math.floor(rect.height)
    })
  })

  resize.observe(container)

  return () => {
    resize.disconnect()
    chart.remove()
    chartRef.current = null
    seriesRef.current = null
  }
}

export default function MarketDashboard({
  sectionId = 'market',
  gold = defaultGold,
  sp500 = defaultSp500,
  ihsg = defaultIhsg,
  decisionContext
}: MarketDashboardProps) {
  const language = decisionContext?.language === 'en' ? 'en' : 'id'
  const copy = marketCopy[language]
  const [marketLoading, setMarketLoading] = useState(true)
  const [marketError, setMarketError] = useState('')
  const [goldTimeframe, setGoldTimeframe] = useState<Timeframe>('1D')
  const [sp500Timeframe, setSp500Timeframe] = useState<Timeframe>('1D')
  const [btcTimeframe, setBtcTimeframe] = useState<Timeframe>('1D')
  const [ihsgTimeframe, setIhsgTimeframe] = useState<Timeframe>('1D')
  const [goldSeries, setGoldSeries] = useState<CandlestickPoint[]>([])
  const [sp500Series, setSp500Series] = useState<CandlestickPoint[]>(sp500)
  const [btcSeries, setBtcSeries] = useState<CandlestickPoint[]>([])
  const [ihsgSeries, setIhsgSeries] = useState<CandlestickPoint[]>(ihsg)
  const [goldNote, setGoldNote] = useState('')
  const [sp500Note, setSp500Note] = useState('')
  const [btcNote, setBtcNote] = useState('')
  const [ihsgNote, setIhsgNote] = useState('')
  const [goldSource, setGoldSource] = useState('database')
  const [sp500Source, setSp500Source] = useState('unknown')
  const [btcSource, setBtcSource] = useState('unknown')
  const [ihsgSource, setIhsgSource] = useState('unknown')
  const [goldFallback, setGoldFallback] = useState('')
  const [sp500Fallback, setSp500Fallback] = useState('')
  const [btcFallback, setBtcFallback] = useState('')
  const [ihsgFallback, setIhsgFallback] = useState('')

  const goldChartRef = useRef<IChartApi | null>(null)
  const btcChartRef = useRef<IChartApi | null>(null)
  const sp500ChartRef = useRef<IChartApi | null>(null)
  const ihsgChartRef = useRef<IChartApi | null>(null)
  const goldContainerRef = useRef<HTMLDivElement | null>(null)
  const btcContainerRef = useRef<HTMLDivElement | null>(null)
  const sp500ContainerRef = useRef<HTMLDivElement | null>(null)
  const ihsgContainerRef = useRef<HTMLDivElement | null>(null)
  const goldSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const btcSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const sp500SeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const ihsgSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const goldLastValue = goldSeries[goldSeries.length - 1]?.close
  const btcLastValue = btcSeries[btcSeries.length - 1]?.close
  const sp500LastValue = sp500Series[sp500Series.length - 1]?.close
  const ihsgLastValue = ihsgSeries[ihsgSeries.length - 1]?.close
  const goldLastTimestamp = goldSeries[goldSeries.length - 1]?.time
  const btcLastTimestamp = btcSeries[btcSeries.length - 1]?.time
  const sp500LastTimestamp = sp500Series[sp500Series.length - 1]?.time
  const ihsgLastTimestamp = ihsgSeries[ihsgSeries.length - 1]?.time

  const derivedGoldDelta = useMemo(() => getSeriesDelta(goldSeries), [goldSeries])
  const goldRangeMode = useMemo(() => getRangeMode(goldSeries), [goldSeries])
  const effectiveGoldPrice = gold.price ?? goldLastValue ?? null
  const effectiveGoldUpdatedAt = gold.updatedAt !== '-' ? gold.updatedAt : goldLastTimestamp ? String(goldLastTimestamp) : '-'
  const effectiveGoldChange = gold.price != null ? gold.change : (derivedGoldDelta?.absolute ?? 0)
  const hasGold = effectiveGoldPrice != null
  const trend = !hasGold ? 'flat' : effectiveGoldChange > 0 ? 'up' : effectiveGoldChange < 0 ? 'down' : 'flat'

  const goldDelta = useMemo<MarketMovement | null>(
    () =>
      hasGold
        ? {
            absolute: effectiveGoldChange,
            percent: gold.price != null ? null : (derivedGoldDelta?.percent ?? null),
            trend
          }
        : null,
    [derivedGoldDelta?.percent, effectiveGoldChange, gold.price, hasGold, trend]
  )
  const btcDelta = useMemo(() => getSeriesDelta(btcSeries), [btcSeries])
  const sp500Delta = useMemo(() => getSeriesDelta(sp500Series), [sp500Series])
  const ihsgDelta = useMemo(() => getSeriesDelta(ihsgSeries), [ihsgSeries])

  const marketFeedStatus = useMemo(() => {
    const available =
      Number(hasGold) + Number(btcSeries.length > 0) + Number(sp500Series.length > 0) + Number(ihsgSeries.length > 0)
    if (available === 4) return copy.allReady
    if (available === 0) return copy.waitingData
    return copy.sourcesActive(available)
  }, [btcSeries.length, copy, hasGold, ihsgSeries.length, sp500Series.length])
  const liveChartFeedCount = Number(btcSeries.length > 0) + Number(sp500Series.length > 0) + Number(ihsgSeries.length > 0)
  const marketOverview = useMemo(() => {
    if (marketFeedStatus === copy.allReady) {
      return copy.marketReady
    }
    if (marketFeedStatus === copy.waitingData) {
      return copy.marketWaiting
    }
    return copy.marketPartial
  }, [copy, marketFeedStatus])

  const lastSyncLabel = useMemo(() => {
    const candidates = [effectiveGoldUpdatedAt, goldLastTimestamp, btcLastTimestamp, sp500LastTimestamp, ihsgLastTimestamp].filter(Boolean)
    if (!candidates.length) return copy.waiting

    const normalized = candidates
      .map((value) =>
        typeof value === 'number'
          ? new Date(value).getTime()
          : /^\d{4}-\d{2}-\d{2}$/.test(String(value))
            ? new Date(`${value}T00:00:00`).getTime()
            : new Date(String(value)).getTime()
      )
      .filter((value) => Number.isFinite(value))

    if (!normalized.length) return copy.waiting
    return formatFreshness(Math.max(...normalized), copy)
  }, [btcLastTimestamp, copy, effectiveGoldUpdatedAt, goldLastTimestamp, ihsgLastTimestamp, sp500LastTimestamp])

  useEffect(() => {
    if (!goldContainerRef.current || goldChartRef.current) return
    return createCandlestickChart(goldContainerRef.current, goldChartRef, goldSeriesRef)
  }, [])

  useEffect(() => {
    if (!btcContainerRef.current || btcChartRef.current) return
    return createCandlestickChart(btcContainerRef.current, btcChartRef, btcSeriesRef)
  }, [])

  useEffect(() => {
    if (!sp500ContainerRef.current || sp500ChartRef.current) return
    return createCandlestickChart(sp500ContainerRef.current, sp500ChartRef, sp500SeriesRef)
  }, [])

  useEffect(() => {
    if (!ihsgContainerRef.current || ihsgChartRef.current) return
    return createCandlestickChart(ihsgContainerRef.current, ihsgChartRef, ihsgSeriesRef)
  }, [])

  useEffect(() => {
    let active = true
    setMarketLoading(true)
    setMarketError('')
    const url = `${API_URL}/api/market/gold?days=${getDaysFromTimeframe(goldTimeframe)}`

    void fetchWithSession(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await readResponseError(res, 'Request failed'))
        }
        return (await res.json()) as MarketSeriesResponse
      })
      .then((data) => {
        if (!active) return
        setGoldSeries(normalizeSeries(data.data))
        setGoldNote(data.note || '')
        setGoldSource(data.source || 'database')
        setGoldFallback(data.fallback || '')
      })
      .catch((error: unknown) => {
        if (!active) return
        setGoldSeries([])
        setGoldNote(error instanceof Error ? error.message : 'Data candle GOLD belum tersedia.')
        setGoldSource('unknown')
        setGoldFallback('')
        setMarketError(error instanceof Error ? error.message : 'Gagal memuat konteks pasar.')
      })
      .finally(() => {
        if (!active) return
        setMarketLoading(false)
      })

    return () => {
      active = false
    }
  }, [goldTimeframe])

  useEffect(() => {
    let active = true
    const url = `${API_URL}/api/market/sp500?days=${getDaysFromTimeframe(sp500Timeframe)}`

    void fetchWithSession(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await readResponseError(res, 'Request failed'))
        }
        return (await res.json()) as MarketSeriesResponse
      })
      .then((data) => {
        if (!active) return
        const normalized = normalizeSeries(data.data)
        setSp500Series(normalized.length ? normalized : normalizeSeries(sp500))
        setSp500Note(data.note || '')
        setSp500Source(data.source || 'unknown')
        setSp500Fallback(data.fallback || '')
      })
      .catch((error: unknown) => {
        if (!active) return
        setSp500Series(normalizeSeries(sp500))
        setSp500Note(error instanceof Error ? error.message : '')
        setSp500Source('unknown')
        setSp500Fallback('')
      })

    return () => {
      active = false
    }
  }, [sp500Timeframe, sp500])

  useEffect(() => {
    let active = true
    const url = `${API_URL}/api/market/btc?days=${getDaysFromTimeframe(btcTimeframe)}`

    void fetchWithSession(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await readResponseError(res, 'Request failed'))
        }
        return (await res.json()) as MarketSeriesResponse
      })
      .then((data) => {
        if (!active) return
        setBtcSeries(normalizeSeries(data.data))
        setBtcNote(data.note || '')
        setBtcSource(data.source || 'unknown')
        setBtcFallback(data.fallback || '')
      })
      .catch((error: unknown) => {
        if (!active) return
        setBtcSeries([])
        setBtcNote(error instanceof Error ? error.message : '')
        setBtcSource('unknown')
        setBtcFallback('')
      })

    return () => {
      active = false
    }
  }, [btcTimeframe])

  useEffect(() => {
    let active = true
    const url = `${API_URL}/api/market/ihsg?days=${getDaysFromTimeframe(ihsgTimeframe)}`

    void fetchWithSession(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await readResponseError(res, 'Request failed'))
        }
        return (await res.json()) as MarketSeriesResponse
      })
      .then((data) => {
        if (!active) return
        const normalized = normalizeSeries(data.data)
        setIhsgSeries(normalized.length ? normalized : normalizeSeries(ihsg))
        setIhsgNote(data.note || '')
        setIhsgSource(data.source || 'unknown')
        setIhsgFallback(data.fallback || '')
      })
      .catch((error: unknown) => {
        if (!active) return
        setIhsgSeries(normalizeSeries(ihsg))
        setIhsgNote(error instanceof Error ? error.message : '')
        setIhsgSource('unknown')
        setIhsgFallback('')
      })

    return () => {
      active = false
    }
  }, [ihsg, ihsgTimeframe])

  useEffect(() => {
    if (!goldSeriesRef.current) return
    goldSeriesRef.current.setData(toChartData(goldSeries))
    goldChartRef.current?.timeScale().fitContent()
  }, [goldRangeMode, goldSeries])

  useEffect(() => {
    if (!btcSeriesRef.current) return
    btcSeriesRef.current.setData(toChartData(btcSeries))
    btcChartRef.current?.timeScale().fitContent()
  }, [btcSeries])

  useEffect(() => {
    if (!sp500SeriesRef.current) return
    sp500SeriesRef.current.setData(toChartData(sp500Series))
    sp500ChartRef.current?.timeScale().fitContent()
  }, [sp500Series])

  useEffect(() => {
    if (!ihsgSeriesRef.current) return
    ihsgSeriesRef.current.setData(toChartData(ihsgSeries))
    ihsgChartRef.current?.timeScale().fitContent()
  }, [ihsgSeries])

  const renderChartCard = ({
    key,
    title,
    titleClassName = '',
    subtitle,
    value,
    note,
    freshness,
    movement,
    label,
    sourceLabel,
    timeframe,
    onTimeframeChange,
    containerRef,
    series
  }: {
    key: ChartKind
    title: string
    titleClassName?: string
    subtitle: string
    value: string
    note: string
    freshness: string
    movement: MarketMovement | null
    label: string
    sourceLabel: string
    timeframe: Timeframe
    onTimeframeChange: (frame: Timeframe) => void
    containerRef: React.RefObject<HTMLDivElement>
    series: CandlestickPoint[]
  }) => {
    const noteSections = normalizeSectorNoteSections(
      getSectorNote(key, movement, note, decisionContext, copy),
      copy
    )

    return (
    <div key={key} className="market-card market-chart-card">
      <div className="market-card-top">
        <div>
          <p className={`market-card-kicker ${titleClassName}`.trim()}>{title}</p>
          <p className="market-card-value">{value}</p>
          <p className="market-card-subtitle">{subtitle}</p>
          <p className="market-card-freshness">{`${freshness} | ${sourceLabel}`}</p>
        </div>
        <div className={`market-move-badge ${movement ? movement.trend : 'neutral'}`}>
          {movement
            ? `${formatDeltaLabel(movement.absolute)}${
                movement.percent !== null ? ` • ${formatDeltaLabel(movement.percent, '%')}` : ''
              }`
            : copy.trend}
        </div>
      </div>

      <div className="market-chart-body">
        <div className="market-spot-grid">
          <div className="market-spot-metric">
            <span className="market-spot-label">{copy.dailyMove}</span>
            <strong>{getMovementText(movement, copy)}</strong>
          </div>
          <div className="market-spot-metric">
            <span className="market-spot-label">{copy.bias}</span>
            <strong>{getSectorBias(key, movement, decisionContext, copy)}</strong>
          </div>
          <div className="market-spot-metric">
            <span className="market-spot-label">{copy.sourceMode}</span>
            <strong>{getModeFeed(key, sourceLabel, copy)}</strong>
          </div>
        </div>

        <div className="market-spot-note">
          <p className="market-spot-note-label">{copy.shortNote}</p>
          {renderStructuredNote(noteSections, copy)}
        </div>

        <div className="timeframe-toggle">
          {timeframeOptions.map((frame) => (
            <button
              key={frame}
              type="button"
              className={timeframe === frame ? 'active' : ''}
              onClick={() => onTimeframeChange(frame)}
            >
              {frame}
            </button>
          ))}
        </div>
        <div className="market-chart-wrap">
          <div className="tv-chart-shell">
            <div className="tv-chart tv-chart-lg" ref={containerRef} />
            {!series.length && <div className="chart-empty">{note || copy.chartCandleUnavailable(title)}</div>}
          </div>
        </div>
        <div className="market-card-meta">
          <span>{label}</span>
          <span>{series.length ? copy.dataPoints(series.length) : copy.noCandle}</span>
        </div>
      </div>
    </div>
    )
  }

  const renderGoldSpotCard = () => {
    const goldNoteSections = normalizeSectorNoteSections(
      getSectorNote('gold', goldDelta, goldNote, decisionContext, copy),
      copy
    )

    return (
    <div className="market-card market-chart-card market-spot-card">
      <div className="market-card-top">
        <div>
          <p className="market-card-kicker">EMAS (IDR)</p>
          <p className="market-card-value">{hasGold && effectiveGoldPrice !== null ? currencyIdr.format(effectiveGoldPrice) : '-'}</p>
          <p className="market-card-subtitle">{`${copy.lastUpdateInline}: ${hasGold ? effectiveGoldUpdatedAt : '-'}`}</p>
          <p className="market-card-freshness">{`${formatFreshness(gold.updatedAt, copy)} | ${getSourceLabel(goldSource, goldFallback, copy)}`}</p>
        </div>
        {goldDelta && goldDelta.absolute !== 0 ? (
          <div className={`market-move-badge ${goldDelta.trend}`}>{formatDeltaLabel(goldDelta.absolute)}</div>
        ) : null}
      </div>

      <div className="market-spot-body">
        <div className="market-spot-grid">
          <div className="market-spot-metric">
            <span className="market-spot-label">{copy.dailyMove}</span>
            <strong>
              {goldDelta ? (goldDelta.absolute === 0 ? copy.flat : formatDeltaLabel(goldDelta.absolute)) : '-'}
            </strong>
          </div>
          <div className="market-spot-metric">
            <span className="market-spot-label">{copy.bias}</span>
            <strong>
              {goldDelta ? (goldDelta.trend === 'up' ? copy.defensiveBid : goldDelta.trend === 'down' ? copy.lightPullback : copy.stable) : copy.spotOnly}
            </strong>
          </div>
          <div className="market-spot-metric">
            <span className="market-spot-label">{copy.sourceMode}</span>
            <strong>{copy.directPrimaryPrice}</strong>
          </div>
        </div>

        <div className="market-spot-note">
          <p className="market-spot-note-label">{copy.shortNote}</p>
          {renderStructuredNote(goldNoteSections, copy)}
        </div>

        <div className="market-chart-wrap market-chart-wrap-compact">
          <div className="tv-chart-shell tv-chart-shell-compact">
            <div className="tv-chart tv-chart-sm" ref={goldContainerRef} />
            {!goldSeries.length && <div className="chart-empty">{copy.goldHistoryMissing}</div>}
          </div>
        </div>
        {goldRangeMode?.isLowVolatility ? (
          <p className="market-chart-helper">{copy.thinMove}</p>
        ) : null}

        <div className="market-card-meta">
          <span>{copy.spotMonitoring}</span>
          <span>{goldFallback === 'cached' ? copy.cacheRefresh : copy.directPrimaryPrice}</span>
        </div>
      </div>
    </div>
    )
  }

  return (
    <section id={sectionId} className="market-dashboard-section">
      <div className="container container-wide market-dashboard-container">
        <div className="market-dashboard-head">
          <div className="eyebrow">{copy.eyebrow}</div>
          <h2>{copy.title}</h2>
          <p className="lead">{copy.lead}</p>
          <p className="card-note">{copy.note}</p>
        </div>

        <div className="market-secondary-note">
          <span className="market-secondary-note-label">{copy.sourceStatus}</span>
          <strong>
            {marketLoading
              ? copy.loadingContext
              : marketError
                ? copy.partialLoadError(marketError)
                : marketOverview}
          </strong>
        </div>

        <div className="market-status-grid">
          <div className="market-card market-status-card">
            <p className="market-status-label">{copy.sourceStatus}</p>
            <p className="market-status-value">{marketFeedStatus}</p>
            <p className="market-status-caption">{copy.chartSourcesCaption(liveChartFeedCount)}</p>
          </div>
          <div className="market-card market-status-card">
            <p className="market-status-label">{copy.lastUpdate}</p>
            <p className="market-status-value">{lastSyncLabel}</p>
            <p className="market-status-caption">{copy.lastUpdateCaption}</p>
          </div>
          <div className="market-card market-status-card">
            <p className="market-status-label">{copy.coverage}</p>
            <p className="market-status-value">{copy.coverageValue}</p>
            <p className="market-status-caption">{copy.coverageCaption}</p>
          </div>
        </div>

        <div className="market-card-grid">
          {renderGoldSpotCard()}

          {renderChartCard({
            key: 'btc',
            title: 'Bitcoin (BTC/USDT)',
            subtitle: copy.riskAssetBenchmark,
            value: btcLastValue ? currencyUsd.format(btcLastValue) : '-',
            note: btcNote,
            freshness: formatFreshness(btcLastTimestamp, copy),
            movement: btcDelta,
            label: getTimeframeLabel(btcTimeframe, copy),
            sourceLabel: getSourceLabel(btcSource, btcFallback, copy),
            timeframe: btcTimeframe,
            onTimeframeChange: setBtcTimeframe,
            containerRef: btcContainerRef,
            series: btcSeries
          })}
        </div>

        <details className="market-detail-fold">
          <summary>{copy.stockProxyDetail}</summary>
          <div className="market-card-grid market-detail-grid">
            {renderChartCard({
              key: 'sp500',
              title: 'Proxy S&P 500 (SPY)',
              titleClassName: 'market-card-kicker-alt',
              subtitle: copy.usEquityProxy,
              value: sp500LastValue ? currencyUsd.format(sp500LastValue) : '-',
              note: sp500Note,
              freshness: formatFreshness(sp500LastTimestamp, copy),
              movement: sp500Delta,
              label: getTimeframeLabel(sp500Timeframe, copy),
              sourceLabel: getSourceLabel(sp500Source, sp500Fallback, copy),
              timeframe: sp500Timeframe,
              onTimeframeChange: setSp500Timeframe,
              containerRef: sp500ContainerRef,
              series: sp500Series
            })}

            {renderChartCard({
              key: 'ihsg',
              title: 'IHSG (^JKSE)',
              titleClassName: 'market-card-kicker-alt',
              subtitle: copy.indonesiaEquityIndex,
              value: ihsgLastValue ? compactNumber.format(ihsgLastValue) : '-',
              note: ihsgNote,
              freshness: formatFreshness(ihsgLastTimestamp, copy),
              movement: ihsgDelta,
              label: getTimeframeLabel(ihsgTimeframe, copy),
              sourceLabel: getSourceLabel(ihsgSource, ihsgFallback, copy),
              timeframe: ihsgTimeframe,
              onTimeframeChange: setIhsgTimeframe,
              containerRef: ihsgContainerRef,
              series: ihsgSeries
            })}
          </div>
        </details>

        {!marketLoading && !goldSeries.length && !btcSeries.length && !sp500Series.length && !ihsgSeries.length ? (
          <div className="market-secondary-note">
            <span className="market-secondary-note-label">{copy.fallback}</span>
            <strong>{copy.noMarketData}</strong>
          </div>
        ) : null}
      </div>
    </section>
  )
}
