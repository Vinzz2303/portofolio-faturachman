import type {
  DecisionContextMarketContextInput,
  DecisionContextMarketInput,
  DecisionContextTechnicalInput,
  Language,
  MacroRelationState,
  MarketRegimeKey,
  RiskLevelKey,
  ScreenerInsightState,
  TechnicalPostureState
} from './types'
import { t } from './dashboardI18n'

// Trust Pipeline - UI Synthesis Layer:
// This module consumes semantic signals and existing context only.
// It translates them into short, explainable summaries for AdvancedTab.
// It must not depend on raw provider payloads or expose raw indicators to the UI.

type AdvancedContextEngineInput = {
  market?: DecisionContextMarketInput[]
  technicals?: DecisionContextTechnicalInput[]
  marketContext?: DecisionContextMarketContextInput
  marketRegime: MarketRegimeKey
  riskLevel: RiskLevelKey
  language: Language
}

export type AdvancedContextEngineResult = {
  screenerInsight: {
    state: ScreenerInsightState
    summary: string
    detail: string
  }
  technicalPosture: {
    state: TechnicalPostureState
    summary: string
    detail: string
  }
  macroRelation: {
    state: MacroRelationState
    summary: string
    detail: string
  }
}

type VolatilityTrend = 'rising' | 'falling' | 'stable'
type MacroPressure = 'tightening' | 'easing' | 'neutral'
type MarketStress = 'elevated' | 'normal'

const normalizeContextText = (...values: Array<string | undefined>) =>
  values
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const deriveVolatilityTrend = (
  technicals: DecisionContextTechnicalInput[] = [],
  marketContext?: DecisionContextMarketContextInput
): VolatilityTrend => {
  if (marketContext?.semanticSignals?.meta?.source) {
    return marketContext.semanticSignals.volatilityTrend
  }

  const contextText = normalizeContextText(
    marketContext?.stressState,
    marketContext?.watchLevel,
    marketContext?.riskTone
  )
  const avgVolatility =
    technicals.length > 0
      ? technicals.reduce((sum, item) => sum + Math.abs(item.volatility ?? 0), 0) / technicals.length
      : 0

  if (
    avgVolatility >= 1.25 ||
    contextText.includes('elevated') ||
    contextText.includes('high') ||
    contextText.includes('fragile') ||
    contextText.includes('pressure')
  ) {
    return 'rising'
  }

  if (
    avgVolatility <= 0.45 ||
    contextText.includes('calm') ||
    contextText.includes('stable') ||
    contextText.includes('mereda') ||
    contextText.includes('normal')
  ) {
    return 'falling'
  }

  return 'stable'
}

const deriveMacroPressure = (
  marketContext?: DecisionContextMarketContextInput
): MacroPressure => {
  if (marketContext?.semanticSignals?.meta?.source) {
    return marketContext.semanticSignals.macroPressure
  }

  const contextText = normalizeContextText(
    marketContext?.macroContext,
    marketContext?.headlinePressure,
    marketContext?.riskTone
  )

  if (
    contextText.includes('tight') ||
    contextText.includes('restrict') ||
    contextText.includes('pressure') ||
    contextText.includes('hawk') ||
    contextText.includes('menekan')
  ) {
    return 'tightening'
  }

  if (
    contextText.includes('ease') ||
    contextText.includes('support') ||
    contextText.includes('membaik') ||
    contextText.includes('mereda')
  ) {
    return 'easing'
  }

  return 'neutral'
}

const deriveMarketStress = (
  marketContext?: DecisionContextMarketContextInput
): MarketStress => {
  if (marketContext?.semanticSignals?.meta?.source) {
    return marketContext.semanticSignals.marketStress
  }

  const contextText = normalizeContextText(
    marketContext?.stressState,
    marketContext?.watchLevel,
    marketContext?.riskTone
  )

  if (
    contextText.includes('elevated') ||
    contextText.includes('high') ||
    contextText.includes('stress') ||
    contextText.includes('fragile') ||
    contextText.includes('waspada')
  ) {
    return 'elevated'
  }

  return 'normal'
}

const deriveScreenerInsightState = (
  market: DecisionContextMarketInput[] = [],
  marketContext?: DecisionContextMarketContextInput
): ScreenerInsightState => {
  const semanticTone = marketContext?.semanticSignals?.screenerTone
  const breadthTone = marketContext?.semanticSignals?.breadthTone

  if (semanticTone === 'weakening' || breadthTone === 'weakening') return 'weakening'
  if (semanticTone === 'broad_strength') return 'broad_strength'
  if (semanticTone === 'selective_strength') {
    return 'selective_strength'
  }
  if (breadthTone === 'constructive') return 'broad_strength'
  if (breadthTone === 'limited') return 'breadth_limited'

  const valid = market.filter((item) => !item.error)
  const negativeSignals = valid.filter((item) => (item.delta ?? 0) < 0).length
  const positiveSignals = valid.filter((item) => (item.delta ?? 0) > 0).length

  if (negativeSignals >= Math.max(2, positiveSignals + 1)) return 'weakening'
  if (positiveSignals >= Math.max(2, negativeSignals + 1)) return 'selective_strength'
  return 'breadth_limited'
}

const deriveTechnicalPostureState = (
  technicals: DecisionContextTechnicalInput[] = [],
  riskLevel: RiskLevelKey,
  marketContext?: DecisionContextMarketContextInput
): TechnicalPostureState => {
  const elevatedRisk = String(riskLevel) !== 'moderate'
  const semanticMarketTone = marketContext?.semanticSignals?.marketTone
  const semanticVolatility = marketContext?.semanticSignals?.volatilityTrend
  const upCount = technicals.filter((item) => item.trend === 'up').length
  const downCount = technicals.filter((item) => item.trend === 'down').length
  const hasRisingVolatility = technicals.some(
    (item) => typeof item.volatility === 'number' && item.volatility >= 1.25
  )

  if (semanticMarketTone === 'defensive' && semanticVolatility === 'rising') return 'weakening'
  if (semanticMarketTone === 'constructive' && semanticVolatility !== 'rising' && upCount >= downCount) {
    return 'improving'
  }
  if ((downCount > upCount && downCount > 0) || elevatedRisk) return 'weakening'
  if (upCount > downCount && !elevatedRisk && !hasRisingVolatility) return 'improving'
  return 'mixed'
}

const deriveMacroRelationState = (
  marketRegime: MarketRegimeKey,
  riskLevel: RiskLevelKey,
  marketContext?: DecisionContextMarketContextInput
): MacroRelationState => {
  const elevatedRisk = String(riskLevel) !== 'moderate'
  const macroPressure = marketContext?.semanticSignals?.macroPressure
  if (macroPressure === 'tightening') return 'restrictive'
  if (macroPressure === 'easing' && marketRegime === 'risk_on') return 'supportive'
  if (marketRegime === 'defensive' || elevatedRisk) return 'restrictive'
  if (marketRegime === 'risk_on' && !elevatedRisk) return 'supportive'
  return 'neutral'
}

export function advancedContextEngine({
  market,
  technicals,
  marketContext,
  marketRegime,
  riskLevel,
  language
}: AdvancedContextEngineInput): AdvancedContextEngineResult {
  const screenerState = deriveScreenerInsightState(market, marketContext)
  const technicalState = deriveTechnicalPostureState(technicals, riskLevel, marketContext)
  const macroState = deriveMacroRelationState(marketRegime, riskLevel, marketContext)
  const volatilityTrend = deriveVolatilityTrend(technicals, marketContext)
  const macroPressure = deriveMacroPressure(marketContext)
  const marketStress = deriveMarketStress(marketContext)

  const screenerSummary =
    macroPressure === 'tightening' || marketStress === 'elevated'
      ? `${t(`advancedScreener_${screenerState}` as const, language)} ${t('advancedContext_holdback', language)}`
      : macroPressure === 'easing'
        ? `${t(`advancedScreener_${screenerState}` as const, language)} ${t('advancedContext_support_building', language)}`
        : `${t(`advancedScreener_${screenerState}` as const, language)} ${t('advancedContext_confirmation_limited', language)}`

  const technicalSummary =
    technicalState === 'improving' && macroPressure === 'tightening'
      ? `${t(`advancedTechnical_${technicalState}` as const, language)} ${t('advancedTechnical_butMacroRestrictive', language)}`
      : technicalState === 'weakening' && macroPressure === 'easing'
        ? `${t(`advancedTechnical_${technicalState}` as const, language)} ${t('advancedTechnical_supportNotBroken', language)}`
        : technicalState === 'mixed' || volatilityTrend === 'rising'
          ? `${t(`advancedTechnical_${technicalState}` as const, language)} ${t('advancedTechnical_confirmationLimited', language)}`
          : `${t(`advancedTechnical_${technicalState}` as const, language)} ${t('advancedTechnical_followThroughWatch', language)}`

  const macroSummary =
    macroState === 'supportive' && marketStress === 'elevated'
      ? `${t(`advancedMacro_${macroState}` as const, language)} ${t('advancedMacro_stressStillHigh', language)}`
      : macroState === 'restrictive' && volatilityTrend === 'falling'
        ? `${t(`advancedMacro_${macroState}` as const, language)} ${t('advancedMacro_pressureEasing', language)}`
        : macroState === 'neutral'
          ? `${t(`advancedMacro_${macroState}` as const, language)} ${t('advancedMacro_otherSignalsLead', language)}`
          : t(`advancedMacro_${macroState}` as const, language)

  const screenerDetail =
    screenerState === 'weakening'
      ? t('advancedScreenerDetail_weakening', language)
      : screenerState === 'broad_strength'
        ? t('advancedScreenerDetail_broad_strength', language)
        : screenerState === 'selective_strength'
          ? t('advancedScreenerDetail_selective_strength', language)
          : t('advancedScreenerDetail_breadth_limited', language)

  const technicalDetail =
    technicalState === 'improving'
      ? t('advancedTechnicalDetail_improving', language)
      : technicalState === 'weakening'
        ? t('advancedTechnicalDetail_weakening', language)
        : t('advancedTechnicalDetail_mixed', language)

  const macroDetail =
    macroState === 'supportive'
      ? t('advancedMacroDetail_supportive', language)
      : macroState === 'restrictive'
        ? t('advancedMacroDetail_restrictive', language)
        : t('advancedMacroDetail_neutral', language)

  return {
    screenerInsight: {
      state: screenerState,
      summary: screenerSummary,
      detail: screenerDetail
    },
    technicalPosture: {
      state: technicalState,
      summary: technicalSummary,
      detail: technicalDetail
    },
    macroRelation: {
      state: macroState,
      summary: macroSummary,
      detail: macroDetail
    }
  }
}
