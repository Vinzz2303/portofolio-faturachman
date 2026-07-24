import axios from 'axios'
import type {
  SemanticBreadthTone,
  SemanticMarketStress,
  SemanticMarketTone,
  SemanticProviderStatus,
  SemanticVolatilityTrend
} from '../types'

// Trust Pipeline - Raw Source Adapter:
// Polygon/Massive is used only as a market breadth and short-horizon pressure sensor.
// It must not leak raw snapshots downstream.
// Its responsibility is to summarize broad market movement into semantic state.

const POLYGON_API_KEY = process.env.POLYGON_API_KEY?.trim()
const POLYGON_API_URL = process.env.POLYGON_API_URL?.trim() || 'https://api.massive.com'
const PROVIDER_TIMEOUT_MS = Number(process.env.PROVIDER_TIMEOUT_MS || 1800)

type PolygonTickerSnapshot = {
  ticker?: string
  todaysChangePerc?: number | string
}

type PolygonSnapshotResponse = {
  tickers?: PolygonTickerSnapshot[]
  results?: PolygonTickerSnapshot[]
}

export type PolygonAdapterResult = {
  provider: SemanticProviderStatus
  latencyMs?: number
  note?: string | null
  signals?: {
    breadthTone: SemanticBreadthTone
    marketTone: SemanticMarketTone
    volatilityTrend: SemanticVolatilityTrend
    marketStress: SemanticMarketStress
  }
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = Number(value.replace('%', '').trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

export const getPolygonSignals = async (): Promise<PolygonAdapterResult> => {
  if (!POLYGON_API_KEY) {
    return {
      provider: 'fallback',
      note: 'POLYGON_API_KEY is not configured'
    }
  }

  const startedAt = Date.now()

  try {
    const response = await axios.get<PolygonSnapshotResponse>(
      `${POLYGON_API_URL.replace(/\/$/, '')}/v2/snapshot/locale/us/markets/stocks/tickers`,
      {
        timeout: PROVIDER_TIMEOUT_MS,
        params: {
          apiKey: POLYGON_API_KEY
        }
      }
    )

    const rawItems = response.data?.tickers || response.data?.results || []
    const changes = rawItems
      .map((item) => toNumber(item.todaysChangePerc))
      .filter((value): value is number => value !== null)

    if (changes.length < 20) {
      return {
        provider: 'unavailable',
        latencyMs: Date.now() - startedAt,
        note: 'Polygon snapshot did not return enough tickers'
      }
    }

    const advancers = changes.filter((value) => value > 0.15).length
    const decliners = changes.filter((value) => value < -0.15).length
    const avgChange = average(changes)
    const avgAbsChange = average(changes.map((value) => Math.abs(value)))

    let breadthTone: SemanticBreadthTone = 'mixed'
    if (decliners >= Math.max(advancers * 1.2, 100)) breadthTone = 'weakening'
    else if (advancers >= Math.max(decliners * 1.2, 100)) breadthTone = 'constructive'
    else if (Math.abs(advancers - decliners) <= Math.max(25, changes.length * 0.03)) breadthTone = 'limited'

    let marketTone: SemanticMarketTone = 'mixed'
    if (avgChange <= -0.35 || breadthTone === 'weakening') marketTone = 'defensive'
    else if (avgChange >= 0.35 || breadthTone === 'constructive') marketTone = 'constructive'

    let volatilityTrend: SemanticVolatilityTrend = 'stable'
    if (avgAbsChange >= 1.8 || (breadthTone === 'weakening' && decliners > advancers)) {
      volatilityTrend = 'rising'
    } else if (avgAbsChange <= 0.75 && marketTone !== 'defensive') {
      volatilityTrend = 'falling'
    }

    let marketStress: SemanticMarketStress = 'normal'
    if (
      marketTone === 'defensive' &&
      (avgAbsChange >= 1.4 || decliners >= Math.max(advancers * 1.35, 150))
    ) {
      marketStress = 'elevated'
    }

    return {
      provider: 'live',
      latencyMs: Date.now() - startedAt,
      note: null,
      signals: {
        breadthTone,
        marketTone,
        volatilityTrend,
        marketStress
      }
    }
  } catch (error) {
    return {
      provider: 'unavailable',
      latencyMs: Date.now() - startedAt,
      note: error instanceof Error ? error.message : 'Polygon unavailable'
    }
  }
}
