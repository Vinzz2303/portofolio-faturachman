import axios from 'axios'
import type {
  SemanticMacroPressure,
  SemanticMarketStress,
  SemanticProviderStatus
} from '../types'

// Trust Pipeline - Raw Source Adapter:
// FRED is used for slow-moving macro and financial-stress context.
// It is intentionally narrow: the output is semantic pressure/state, not raw series data.

const FRED_API_KEY = process.env.FRED_API_KEY?.trim()
const FRED_API_URL = process.env.FRED_API_URL?.trim() || 'https://api.stlouisfed.org'
const PROVIDER_TIMEOUT_MS = Number(process.env.PROVIDER_TIMEOUT_MS || 1800)
const FRED_MACRO_PRESSURE_SERIES_ID = process.env.FRED_MACRO_PRESSURE_SERIES_ID?.trim() || 'DFF'
const FRED_MARKET_STRESS_SERIES_ID = process.env.FRED_MARKET_STRESS_SERIES_ID?.trim() || 'STLFSI2'

type FredObservation = {
  value?: string
}

type FredSeriesResponse = {
  observations?: FredObservation[]
}

export type FredAdapterResult = {
  provider: SemanticProviderStatus
  latencyMs?: number
  note?: string | null
  signals?: {
    macroPressure: SemanticMacroPressure
    marketStress: SemanticMarketStress
  }
}

const toNumber = (value?: string) => {
  if (!value || value === '.') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const getSeriesObservations = async (seriesId: string) => {
  const response = await axios.get<FredSeriesResponse>(
    `${FRED_API_URL.replace(/\/$/, '')}/fred/series/observations`,
    {
      timeout: PROVIDER_TIMEOUT_MS,
      params: {
        series_id: seriesId,
        api_key: FRED_API_KEY,
        file_type: 'json',
        sort_order: 'desc',
        limit: 2
      }
    }
  )

  return response.data?.observations || []
}

export const getFredSignals = async (): Promise<FredAdapterResult> => {
  if (!FRED_API_KEY) {
    return {
      provider: 'fallback',
      note: 'FRED_API_KEY is not configured'
    }
  }

  const startedAt = Date.now()

  try {
    const [macroRows, stressRows] = await Promise.all([
      getSeriesObservations(FRED_MACRO_PRESSURE_SERIES_ID),
      getSeriesObservations(FRED_MARKET_STRESS_SERIES_ID)
    ])

    const macroLatest = toNumber(macroRows[0]?.value)
    const macroPrevious = toNumber(macroRows[1]?.value)
    const stressLatest = toNumber(stressRows[0]?.value)
    const stressPrevious = toNumber(stressRows[1]?.value)

    if (macroLatest === null || macroPrevious === null || stressLatest === null) {
      return {
        provider: 'unavailable',
        latencyMs: Date.now() - startedAt,
        note: 'FRED observations were incomplete'
      }
    }

    const macroDelta = macroLatest - macroPrevious
    const stressDelta = stressPrevious === null ? 0 : stressLatest - stressPrevious

    let macroPressure: SemanticMacroPressure = 'neutral'
    if (macroDelta >= 0.02) macroPressure = 'tightening'
    else if (macroDelta <= -0.02) macroPressure = 'easing'

    let marketStress: SemanticMarketStress = 'normal'
    if (stressLatest >= 0.5 || stressDelta >= 0.1) marketStress = 'elevated'

    return {
      provider: 'live',
      latencyMs: Date.now() - startedAt,
      note: null,
      signals: {
        macroPressure,
        marketStress
      }
    }
  } catch (error) {
    return {
      provider: 'unavailable',
      latencyMs: Date.now() - startedAt,
      note: error instanceof Error ? error.message : 'FRED unavailable'
    }
  }
}
