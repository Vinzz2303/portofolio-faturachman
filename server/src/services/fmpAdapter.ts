import axios from 'axios'
import type {
  SemanticBreadthTone,
  SemanticProviderStatus,
  SemanticScreenerTone
} from '../types'

// Trust Pipeline - Raw Source Adapter:
// FMP is used as a lightweight screener and movers sensor.
// It helps identify whether strength is broad, selective, or still fragile.

const FMP_API_KEY = process.env.FMP_API_KEY?.trim()
const FMP_API_URL = process.env.FMP_API_URL?.trim() || 'https://financialmodelingprep.com'
const PROVIDER_TIMEOUT_MS = Number(process.env.PROVIDER_TIMEOUT_MS || 1800)

type FmpMoverItem = {
  changePercentage?: number | string
  changesPercentage?: number | string
}

export type FmpAdapterResult = {
  provider: SemanticProviderStatus
  latencyMs?: number
  note?: string | null
  signals?: {
    screenerTone: SemanticScreenerTone
    breadthToneSupport: SemanticBreadthTone
  }
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[()%]/g, '').trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

const fetchList = async (path: string) => {
  const response = await axios.get<FmpMoverItem[]>(`${FMP_API_URL.replace(/\/$/, '')}${path}`, {
    timeout: PROVIDER_TIMEOUT_MS,
    params: {
      apikey: FMP_API_KEY
    }
  })
  return Array.isArray(response.data) ? response.data : []
}

export const getFmpSignals = async (): Promise<FmpAdapterResult> => {
  if (!FMP_API_KEY) {
    return {
      provider: 'fallback',
      note: 'FMP_API_KEY is not configured'
    }
  }

  const startedAt = Date.now()

  try {
    const [actives, gainers, losers] = await Promise.all([
      fetchList('/stable/most-actives'),
      fetchList('/stable/biggest-gainers'),
      fetchList('/stable/biggest-losers')
    ])

    const activeChanges = actives
      .map((item) => toNumber(item.changePercentage ?? item.changesPercentage))
      .filter((value): value is number => value !== null)
    const gainersChanges = gainers
      .map((item) => toNumber(item.changePercentage ?? item.changesPercentage))
      .filter((value): value is number => value !== null)
    const losersChanges = losers
      .map((item) => toNumber(item.changePercentage ?? item.changesPercentage))
      .filter((value): value is number => value !== null)

    if (!gainersChanges.length || !losersChanges.length) {
      return {
        provider: 'unavailable',
        latencyMs: Date.now() - startedAt,
        note: 'FMP mover lists were incomplete'
      }
    }

    const avgGainer = average(gainersChanges)
    const avgLoser = average(losersChanges.map((value) => Math.abs(value)))
    const activePositive = activeChanges.filter((value) => value > 0).length
    const activeNegative = activeChanges.filter((value) => value < 0).length

    let screenerTone: SemanticScreenerTone = 'mixed'
    if (avgLoser >= avgGainer * 1.15 && activeNegative >= activePositive) screenerTone = 'weakening'
    else if (avgGainer >= avgLoser * 1.4 && activePositive >= activeNegative * 1.15) {
      screenerTone = 'broad_strength'
    } else if (avgGainer >= avgLoser || activePositive > 0) {
      screenerTone = 'selective_strength'
    }

    let breadthToneSupport: SemanticBreadthTone = 'mixed'
    if (screenerTone === 'weakening') breadthToneSupport = 'weakening'
    else if (screenerTone === 'broad_strength') breadthToneSupport = 'constructive'
    else if (screenerTone === 'selective_strength') breadthToneSupport = 'limited'

    return {
      provider: 'live',
      latencyMs: Date.now() - startedAt,
      note: null,
      signals: {
        screenerTone,
        breadthToneSupport
      }
    }
  } catch (error) {
    return {
      provider: 'unavailable',
      latencyMs: Date.now() - startedAt,
      note: error instanceof Error ? error.message : 'FMP unavailable'
    }
  }
}
