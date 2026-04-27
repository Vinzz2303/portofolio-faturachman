import type { InvestmentMeta, PortfolioHoldingItem, PortfolioSummaryResponse, TingRawInsight } from '../types'
import { analyzeTingAI } from './analyzer'
import type { TingAIInput, TingAIOutput } from './types'

const currencyFormatters = new Map<string, Intl.NumberFormat>()

function getCurrencyFormatter(currency: string) {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'IDR' ? 0 : 2
      })
    )
  }

  return currencyFormatters.get(currency)!
}

function formatPortfolioValue(value: number, currency: string) {
  if (!Number.isFinite(value) || value <= 0) return currency === 'IDR' ? 'Rp0' : '$0'
  return getCurrencyFormatter(currency).format(value)
}

function normalizeText(value?: string | null) {
  return (value || '').toLowerCase()
}

function holdingValue(holding: PortfolioHoldingItem) {
  return (
    holding.currentValue ??
    holding.investedAmountDisplay ??
    holding.investedAmount ??
    holding.latestPrice ??
    0
  )
}

function mean(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, item) => sum + item, 0) / values.length
}

function deriveMarketSentiment(meta: InvestmentMeta | null, avgPct: number): TingAIInput['market']['market_sentiment'] {
  const text = [
    meta?.context?.riskTone,
    meta?.context?.stressState,
    meta?.context?.macroContext,
    meta?.context?.headlinePressure,
    meta?.context?.overnightContext,
    meta?.context?.semanticSignals?.marketTone
  ]
    .map((item) => normalizeText(item))
    .join(' ')

  if (
    text.includes('defensive') ||
    text.includes('pressure') ||
    text.includes('elevated') ||
    text.includes('fragile') ||
    text.includes('tight') ||
    avgPct <= -0.45
  ) {
    return 'Negatif'
  }

  if (
    text.includes('constructive') ||
    text.includes('support') ||
    text.includes('membaik') ||
    text.includes('broad_strength') ||
    avgPct >= 0.45
  ) {
    return 'Positif'
  }

  return 'Netral'
}

function deriveTrend(avgPct: number): TingAIInput['market']['trend'] {
  if (avgPct >= 0.35) return 'Naik'
  if (avgPct <= -0.35) return 'Menurun'
  return 'Sideways'
}

function deriveVolatility(meta: InvestmentMeta | null, pctValues: number[]): TingAIInput['market']['volatility'] {
  const text = [
    meta?.context?.stressState,
    meta?.context?.watchLevel,
    meta?.context?.semanticSignals?.marketStress,
    meta?.context?.semanticSignals?.volatilityTrend
  ]
    .map((item) => normalizeText(item))
    .join(' ')

  const maxAbsPct = Math.max(...pctValues.map((value) => Math.abs(value)), 0)

  if (
    text.includes('elevated') ||
    text.includes('rising') ||
    text.includes('high') ||
    text.includes('fragile') ||
    maxAbsPct >= 2
  ) {
    return 'Tinggi'
  }

  if (text.includes('stable') || text.includes('normal') || maxAbsPct < 0.6) {
    return 'Rendah'
  }

  return 'Sedang'
}

function deriveFearGreed(
  meta: InvestmentMeta | null,
  sentiment: TingAIInput['market']['market_sentiment'],
  avgPct: number
): TingAIInput['market']['fear_greed'] {
  const text = [
    meta?.context?.riskTone,
    meta?.context?.headlinePressure,
    meta?.context?.stressState,
    meta?.context?.semanticSignals?.marketTone,
    meta?.context?.semanticSignals?.marketStress
  ]
    .map((item) => normalizeText(item))
    .join(' ')

  if (text.includes('extreme greed') || text.includes('euphoria') || avgPct >= 2.2) {
    return 'Extreme Greed'
  }

  if (text.includes('extreme fear') || text.includes('panic') || avgPct <= -2.2) {
    return 'Extreme Fear'
  }

  if (sentiment === 'Positif' && avgPct >= 0.9) return 'Greed'
  if (sentiment === 'Negatif' && avgPct <= -0.9) return 'Fear'
  return 'Neutral'
}

function deriveEvents(meta: InvestmentMeta | null) {
  const watchItems = (meta?.context?.watchItems || []).map((item) => `${item.label}: ${item.detail}`)
  const drivers = (meta?.context?.drivers || []).map((item) => `${item.label}: ${item.detail}`)
  const headlines = (meta?.context?.headlines || []).map((item) => item.title)

  const events = [...watchItems, ...drivers, ...headlines]
    .map((item) => item.trim())
    .filter(Boolean)

  return events.slice(0, 3)
}

export function buildDashboardTingAIOutput(
  portfolio: PortfolioSummaryResponse | null,
  meta: InvestmentMeta | null
): TingAIOutput | null {
  const holdings = portfolio?.holdings || []
  if (!holdings.length) return null

  const displayCurrency = portfolio?.summary?.displayCurrency || 'USD'
  const enrichedHoldings = holdings
    .map((holding) => ({
      holding,
      value: holdingValue(holding)
    }))
    .filter((item) => Number.isFinite(item.value) && item.value > 0)

  if (!enrichedHoldings.length) return null

  const totalValue = enrichedHoldings.reduce((sum, item) => sum + item.value, 0)
  const dominant = enrichedHoldings.reduce((largest, item) => (item.value > largest.value ? item : largest))

  const allocation = enrichedHoldings
    .map((item) => ({
      asset: item.holding.symbol,
      percentage: Number(((item.value / totalValue) * 100).toFixed(1))
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const instruments = Object.values(meta?.instruments || {}).filter(
    (item): item is NonNullable<typeof item> => Boolean(item && !item.error)
  )
  const pctValues = instruments
    .map((item) => item.pct)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
  const avgPct = mean(pctValues)

  const marketSentiment = deriveMarketSentiment(meta, avgPct)
  const trend = deriveTrend(avgPct)
  const volatility = deriveVolatility(meta, pctValues)
  const fearGreed = deriveFearGreed(meta, marketSentiment, avgPct)

  const input: TingAIInput = {
    user: {
      portfolio_value: formatPortfolioValue(portfolio?.summary?.totalCurrentValue || totalValue, displayCurrency),
      dominant_asset: dominant.holding.symbol,
      allocation,
      risk_budget: 'Sedang',
      horizon: 'Menengah'
    },
    market: {
      market_sentiment: marketSentiment,
      fear_greed: fearGreed,
      trend,
      volatility,
      news_sentiment: marketSentiment,
      events: deriveEvents(meta)
    }
  }

  return analyzeTingAI(input)
}

const getRiskLabel = (level: TingAIOutput['impact_on_portfolio']['risk_level']) => {
  switch (level) {
    case 'High':
      return 'tinggi'
    case 'Medium':
      return 'sedang'
    case 'Low':
      return 'rendah'
  }
}

export function buildRawDashboardInsight(data: TingAIOutput): TingRawInsight {
  const dominantAsset = data.portfolio_overview.dominant_asset
  const riskLabel = getRiskLabel(data.impact_on_portfolio.risk_level)
  const concentrationPoint =
    data.evidence.find((item) => item.label === 'Konsentrasi Portofolio')?.value ||
    `${dominantAsset} menjadi posisi paling dominan.`

  return {
    insightUtama: `${dominantAsset} masih menjadi titik utama portofolio dengan profil risiko ${riskLabel}.`,
    alasan: [concentrationPoint, data.market_summary].filter(Boolean).slice(0, 2),
    risiko: data.impact_on_portfolio.impact_points.slice(0, 2),
    arahan:
      data.options_to_consider[0]?.description ||
      'Pikirkan kembali keseimbangan alokasi agar risiko tidak terlalu bertumpu pada satu posisi.'
  }
}
