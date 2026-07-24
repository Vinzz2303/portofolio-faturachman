import { resolveMarketQuote } from './marketQuoteService'
import { getFredSignals } from './fredAdapter'
import type {
  SemanticSignals,
  SemanticVolatilityTrend
} from '../types'

// Trust Pipeline - Native Adapter Layer:
// Replaced Python OpenBB microservice with native Node.js fetchers.
// Responsibility:
// 1. Fetch VIX directly via Yahoo Finance for volatility trend.
// 2. Fetch FRED data via fredAdapter for macro pressure.
// 3. Normalize into SemanticSignals.

export const getOpenbbSemanticSignals = async ({
  fallback
}: { fallback: Omit<SemanticSignals, 'meta'> }): Promise<SemanticSignals> => {
  const startedAt = Date.now()
  try {
    const [vix, fred] = await Promise.all([
      resolveMarketQuote('^VIX'),
      getFredSignals()
    ])

    let volatilityTrend: SemanticVolatilityTrend = fallback.volatilityTrend
    if (vix && vix.changePercent !== null) {
       if (vix.changePercent > 5) volatilityTrend = 'rising'
       else if (vix.changePercent < -5) volatilityTrend = 'falling'
       else volatilityTrend = 'stable'
    }
    
    const result: SemanticSignals = {
      breadthTone: fallback.breadthTone,
      marketTone: fallback.marketTone,
      screenerTone: fallback.screenerTone,
      volatilityTrend,
      macroPressure: fred.signals?.macroPressure || fallback.macroPressure,
      marketStress: fred.signals?.marketStress || fallback.marketStress,
      meta: {
        source: 'native_openbb',
        ts: Date.now(),
        latencyMs: Date.now() - startedAt,
        note: fred.note || null
      }
    }

    console.info(`[NATIVE_OPENBB_ADAPTER] latencyMs=${result.meta?.latencyMs} volatility=${volatilityTrend} macro=${result.macroPressure} stress=${result.marketStress}`)
    return result
  } catch (error) {
     const result: SemanticSignals = {
       ...fallback,
       meta: {
         source: 'fallback',
         ts: Date.now(),
         latencyMs: Date.now() - startedAt,
         note: error instanceof Error ? error.message : 'Native adapter error'
       }
     }
     console.error(`[NATIVE_OPENBB_ADAPTER] Error: ${result.meta?.note}`)
     return result
  }
}
