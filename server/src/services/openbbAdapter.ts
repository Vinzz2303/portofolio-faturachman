import axios from 'axios'
import type {
  SemanticMacroPressure,
  SemanticMarketStress,
  SemanticSignals,
  SemanticVolatilityTrend
} from '../types'

// Trust Pipeline - Adapter Layer:
// This module is the only place allowed to talk to OpenBB directly.
// Responsibility:
// 1. Treat external APIs as raw sensors
// 2. Normalize raw responses into SemanticSignals
// 3. Fail fast and fallback gracefully
// 4. Expose lightweight observability without leaking raw datasets downstream

const OPENBB_API_URL = process.env.OPENBB_API_URL?.trim()
const OPENBB_API_KEY = process.env.OPENBB_API_KEY?.trim()
const OPENBB_TIMEOUT_MS = Number(process.env.OPENBB_TIMEOUT_MS || 1800)
const OPENBB_CACHE_TTL_MS = Number(process.env.OPENBB_CACHE_TTL_MS || 60000)

type OpenbbAdapterInput = {
  fallback: Omit<SemanticSignals, 'meta'>
}

type CacheEntry = {
  expiresAt: number
  value: SemanticSignals
}

let semanticSignalsCache: CacheEntry | null = null

const normalizeText = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const toVolatilityTrend = (value: unknown): SemanticVolatilityTrend | null => {
  const normalized = normalizeText(value)
  if (!normalized) return null
  if (
    normalized.includes('rise') ||
    normalized.includes('rising') ||
    normalized.includes('higher') ||
    normalized.includes('up')
  ) {
    return 'rising'
  }
  if (
    normalized.includes('fall') ||
    normalized.includes('falling') ||
    normalized.includes('lower') ||
    normalized.includes('down')
  ) {
    return 'falling'
  }
  if (normalized.includes('stable') || normalized.includes('flat') || normalized.includes('neutral')) {
    return 'stable'
  }
  return null
}

const toMacroPressure = (value: unknown): SemanticMacroPressure | null => {
  const normalized = normalizeText(value)
  if (!normalized) return null
  if (
    normalized.includes('tight') ||
    normalized.includes('restrict') ||
    normalized.includes('hawk') ||
    normalized.includes('pressure')
  ) {
    return 'tightening'
  }
  if (
    normalized.includes('ease') ||
    normalized.includes('easing') ||
    normalized.includes('support') ||
    normalized.includes('relax')
  ) {
    return 'easing'
  }
  if (normalized.includes('neutral') || normalized.includes('stable')) return 'neutral'
  return null
}

const toMarketStress = (value: unknown): SemanticMarketStress | null => {
  const normalized = normalizeText(value)
  if (!normalized) return null
  if (
    normalized.includes('elevated') ||
    normalized.includes('high') ||
    normalized.includes('stress') ||
    normalized.includes('fragile')
  ) {
    return 'elevated'
  }
  if (normalized.includes('normal') || normalized.includes('contained') || normalized.includes('calm')) {
    return 'normal'
  }
  return null
}

const pickNestedValue = (payload: Record<string, unknown>, paths: string[][]): unknown => {
  for (const path of paths) {
    let current: unknown = payload
    let found = true
    for (const key of path) {
      if (!current || typeof current !== 'object' || !(key in (current as Record<string, unknown>))) {
        found = false
        break
      }
      current = (current as Record<string, unknown>)[key]
    }
    if (found && current != null) return current
  }
  return null
}

const buildHeaders = () =>
  OPENBB_API_KEY
    ? {
        Authorization: `Bearer ${OPENBB_API_KEY}`
      }
    : undefined

const fetchSignalPayload = async (path: string) => {
  if (!OPENBB_API_URL) return null
  const response = await axios.get(`${OPENBB_API_URL.replace(/\/$/, '')}${path}`, {
    timeout: OPENBB_TIMEOUT_MS,
    headers: buildHeaders()
  })
  return response.data as Record<string, unknown>
}

const withMeta = (
  signals: Omit<SemanticSignals, 'meta'>,
  meta: SemanticSignals['meta']
): SemanticSignals => ({
  ...signals,
  meta
})

const getCachedSignals = () => {
  if (!semanticSignalsCache) return null
  if (semanticSignalsCache.expiresAt < Date.now()) {
    semanticSignalsCache = null
    return null
  }
  return semanticSignalsCache.value
}

const setCachedSignals = (value: SemanticSignals) => {
  semanticSignalsCache = {
    value,
    expiresAt: Date.now() + OPENBB_CACHE_TTL_MS
  }
}

const logAdapterResult = (signals: SemanticSignals) => {
  console.info(
    `[OPENBB_ADAPTER] source=${signals.meta?.source || 'unknown'} latencyMs=${signals.meta?.latencyMs ?? -1} note=${signals.meta?.note || 'ok'}`
  )
}

export const getOpenbbSemanticSignals = async ({
  fallback
}: OpenbbAdapterInput): Promise<SemanticSignals> => {
  const cached = getCachedSignals()
  if (cached) return cached

  if (!OPENBB_API_URL) {
    const result = withMeta(fallback, {
      source: 'fallback',
      ts: Date.now(),
      note: 'OPENBB_API_URL is not configured'
    })
    logAdapterResult(result)
    return result
  }

  const startedAt = Date.now()

  try {
    const [volatilityResult, macroResult] = await Promise.allSettled([
      fetchSignalPayload('/api/v1/market/volatility'),
      fetchSignalPayload('/api/v1/macro/pressure')
    ])

    const volatilityPayload = volatilityResult.status === 'fulfilled' ? volatilityResult.value : null
    const macroPayload = macroResult.status === 'fulfilled' ? macroResult.value : null

    const result = withMeta(
      {
        breadthTone: fallback.breadthTone,
        marketTone: fallback.marketTone,
        screenerTone: fallback.screenerTone,
        volatilityTrend:
          toVolatilityTrend(
            pickNestedValue(volatilityPayload || {}, [
              ['volatilityTrend'],
              ['volatility', 'trend'],
              ['data', 'volatilityTrend'],
              ['results', 'volatilityTrend']
            ])
          ) ?? fallback.volatilityTrend,
        macroPressure:
          toMacroPressure(
            pickNestedValue(macroPayload || {}, [
              ['macroPressure'],
              ['macro', 'pressure'],
              ['data', 'macroPressure'],
              ['results', 'macroPressure']
            ])
          ) ?? fallback.macroPressure,
        marketStress:
          toMarketStress(
            pickNestedValue(macroPayload || {}, [
              ['marketStress'],
              ['stress', 'state'],
              ['data', 'marketStress'],
              ['results', 'marketStress']
            ])
          ) ?? fallback.marketStress
      },
      {
        source: 'openbb',
        ts: Date.now(),
        latencyMs: Date.now() - startedAt,
        note: null
      }
    )

    setCachedSignals(result)
    logAdapterResult(result)
    return result
  } catch (error) {
    const result = withMeta(fallback, {
      source: 'fallback',
      ts: Date.now(),
      latencyMs: Date.now() - startedAt,
      note: error instanceof Error ? error.message : 'OpenBB unavailable'
    })
    logAdapterResult(result)
    return result
  }
}
