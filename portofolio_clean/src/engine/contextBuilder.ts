import type { AssetWeight, MarketCondition } from './insightEngine'
import type { ConfidenceScore } from './trustLayer'

export type ConcentrationLevel = 'high' | 'medium' | 'low'
export type MacroPressure = 'tightening' | 'easing' | 'neutral'
export type Stance = 'risk_pressure' | 'neutral' | 'supportive'

export type EngineContext = {
  dominantAsset: string | null
  dominantWeight: number
  concentrationLevel: ConcentrationLevel
  volatility: string
  macroPressure: MacroPressure
  stance: Stance
  trustLevel: ConfidenceScore['confidence']
}

function deriveMacroPressure(market: MarketCondition): MacroPressure {
  if (market.macroPressure === 'tightening' || market.macroPressure === 'easing' || market.macroPressure === 'neutral') {
    return market.macroPressure
  }

  if (market.trend === 'down') return 'tightening'
  if (market.trend === 'up') return 'easing'
  return 'neutral'
}

function deriveStance(
  concentrationLevel: ConcentrationLevel,
  volatility: string,
  macroPressure: MacroPressure
): Stance {
  const pressureScore =
    (concentrationLevel === 'high' ? 2 : concentrationLevel === 'medium' ? 1 : 0) +
    (volatility === 'high' ? 2 : volatility === 'medium' ? 1 : 0) +
    (macroPressure === 'tightening' ? 2 : macroPressure === 'neutral' ? 1 : 0)

  if (pressureScore >= 4) return 'risk_pressure'
  if (pressureScore <= 1 && macroPressure === 'easing') return 'supportive'
  return 'neutral'
}

export function buildEngineContext(
  portfolio: AssetWeight[],
  market: MarketCondition,
  trust: ConfidenceScore
): EngineContext {
  let dominantAsset = null
  let maxWeight = 0

  for (const item of portfolio) {
    if (item.weight > maxWeight) {
      maxWeight = item.weight
      dominantAsset = item.asset
    }
  }

  let concentrationLevel: ConcentrationLevel = 'low'
  if (maxWeight >= 40) concentrationLevel = 'high'
  else if (maxWeight >= 20) concentrationLevel = 'medium'

  const volatility = market.volatility || 'medium'
  const macroPressure = deriveMacroPressure(market)

  return {
    dominantAsset,
    dominantWeight: maxWeight,
    concentrationLevel,
    volatility,
    macroPressure,
    stance: deriveStance(concentrationLevel, volatility, macroPressure),
    trustLevel: trust.confidence || 'MEDIUM'
  }
}
