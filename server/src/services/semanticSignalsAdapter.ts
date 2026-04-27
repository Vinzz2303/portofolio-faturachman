import type { SemanticSignals } from '../types'
import { getFmpSignals } from './fmpAdapter'
import { getFredSignals } from './fredAdapter'
import { getPolygonSignals } from './polygonAdapter'

// Trust Pipeline - Collaboration Layer:
// This module combines specialized providers into one semantic contract.
// Providers stay replaceable; downstream logic only sees SemanticSignals.

const PROVIDER_CACHE_TTL_MS = Number(process.env.PROVIDER_CACHE_TTL_MS || 60000)

type SemanticSignalsAdapterInput = {
  fallback: Omit<SemanticSignals, 'meta'>
}

type CacheEntry = {
  expiresAt: number
  value: SemanticSignals
}

let semanticSignalsCache: CacheEntry | null = null

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
    expiresAt: Date.now() + PROVIDER_CACHE_TTL_MS
  }
}

const logAdapterResult = (signals: SemanticSignals) => {
  console.info(
    `[TRUST_PIPELINE] source=${signals.meta?.source || 'unknown'} latencyMs=${signals.meta?.latencyMs ?? -1} note=${signals.meta?.note || 'ok'}`
  )
}

export const getCollaborativeSemanticSignals = async ({
  fallback
}: SemanticSignalsAdapterInput): Promise<SemanticSignals> => {
  const cached = getCachedSignals()
  if (cached) return cached

  const startedAt = Date.now()

  const [polygonResult, fmpResult, fredResult] = await Promise.all([
    getPolygonSignals(),
    getFmpSignals(),
    getFredSignals()
  ])

  const polygonHealthy = polygonResult.provider === 'live' && !!polygonResult.signals
  const trustPenaltyNotes: string[] = []

  if (!polygonHealthy) {
    trustPenaltyNotes.push('Polygon breadth feed unavailable, using fallback market tone')
  }
  if (fmpResult.provider !== 'live') {
    trustPenaltyNotes.push('FMP screener feed degraded')
  }
  if (fredResult.provider !== 'live') {
    trustPenaltyNotes.push('FRED macro feed degraded')
  }

  const result: SemanticSignals = {
    breadthTone: polygonHealthy ? polygonResult.signals!.breadthTone : fallback.breadthTone,
    marketTone: polygonHealthy ? polygonResult.signals!.marketTone : fallback.marketTone,
    screenerTone: fmpResult.signals?.screenerTone ?? fallback.screenerTone,
    volatilityTrend: polygonHealthy ? polygonResult.signals!.volatilityTrend : fallback.volatilityTrend,
    macroPressure: fredResult.signals?.macroPressure ?? fallback.macroPressure,
    marketStress:
      fredResult.signals?.marketStress ??
      (polygonHealthy ? polygonResult.signals?.marketStress : null) ??
      fallback.marketStress,
    meta: {
      source:
        polygonHealthy ||
        fmpResult.provider === 'live' ||
        fredResult.provider === 'live'
          ? 'multi_provider'
          : 'fallback',
      ts: Date.now(),
      latencyMs: Date.now() - startedAt,
      note:
        [...trustPenaltyNotes, polygonResult.note, fmpResult.note, fredResult.note]
          .filter(Boolean)
          .join(' | ') || null,
      providers: {
        polygon: polygonResult.provider,
        fmp: fmpResult.provider,
        fred: fredResult.provider
      }
    }
  }

  setCachedSignals(result)
  logAdapterResult(result)
  return result
}
