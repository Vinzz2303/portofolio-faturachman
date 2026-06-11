import type {
  ConcentrationLevel,
  DecisionContext,
  DecisionContextInput,
  DecisionContextTechnicalInput,
  Language,
  MarketRegimeKey,
  PortfolioFitCopyKey,
  RiskLevelKey
} from './types'
import { actionableInsightEngine } from './actionableInsightEngine'
import { advancedContextEngine } from './advancedContextEngine'
import { decisionIntelligenceEngine } from './decisionIntelligenceEngine'
import { t } from './dashboardI18n'
import { portfolioFitEngine, type PortfolioExposureType } from './portfolioFitEngine'

const normalizeText = (value: string) => value.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
const normalizeOptionalText = (value?: string) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function normalizeInsightSummary(summary: string): string[] {
  if (!summary) return []
  const cleaned = normalizeText(summary)
  return cleaned.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3)
}

export function mapTechnicalsToInsights(
  technicals: DecisionContextTechnicalInput[] = [],
  language: Language = 'id'
): string[] {
  const insights: string[] = []

  if (technicals.some((item) => typeof item.rsi === 'number' && item.rsi < 30)) {
    insights.push(t('screenerInsightText', language))
  }

  if (technicals.some((item) => typeof item.volatility === 'number' && item.volatility >= 1)) {
    insights.push(t('technicalInsightText', language))
  }

  if (
    technicals.filter((item) => item.trend === 'down').length >=
    Math.max(1, Math.ceil(technicals.length / 2))
  ) {
    insights.push(t('macroInsightText', language))
  }

  return insights.slice(0, 3)
}

const deriveExposureType = (
  input: DecisionContextInput,
  marketRegimeKey: MarketRegimeKey
): PortfolioExposureType => {
  if (input.portfolio?.exposureType) return input.portfolio.exposureType

  const exposureText = `${input.portfolio?.exposure || ''} ${input.portfolio?.assetMix || ''} ${input.portfolio?.regionBias || ''}`.toLowerCase()

  if (exposureText.includes('defensive')) return 'defensive'
  if (exposureText.includes('income')) return 'income'
  if (exposureText.includes('high-beta') || exposureText.includes('high beta')) return 'high-beta'
  if (exposureText.includes('growth') || exposureText.includes('tech')) return 'growth'
  if (exposureText.includes('balanced') || exposureText.includes('diversified')) return 'balanced'

  return marketRegimeKey === 'defensive' ? 'growth' : 'balanced'
}

const deriveConcentrationLevel = (
  input: DecisionContextInput,
  marketSignalsCount: number,
  negativeSignals: number
): ConcentrationLevel => {
  if (input.portfolio?.concentrationLevel) return input.portfolio.concentrationLevel

  const concentrationText = `${input.portfolio?.concentration || ''}`.toLowerCase()
  if (concentrationText.includes('high')) return 'high'
  if (concentrationText.includes('moderate')) return 'moderate'
  if (concentrationText.includes('low')) return 'low'

  if (negativeSignals >= Math.ceil(Math.max(marketSignalsCount, 1) / 2)) return 'high'
  if (marketSignalsCount > 0) return 'moderate'
  return 'low'
}

const deriveMarketRegimeKey = (negativeSignals: number, positiveSignals: number): MarketRegimeKey => {
  if (negativeSignals > positiveSignals) return 'defensive'
  if (positiveSignals > negativeSignals) return 'risk_on'
  return 'neutral'
}

const deriveRiskLevelKey = (negativeSignals: number, positiveSignals: number): RiskLevelKey => {
  if (negativeSignals > positiveSignals) return 'high'
  if (positiveSignals > negativeSignals) return 'elevated'
  return 'moderate'
}

const deriveSignalConflictLevel = (input: DecisionContextInput): 'low' | 'moderate' | 'high' => {
  const semanticSignals = input.marketContext?.semanticSignals
  if (!semanticSignals) return 'low'

  let conflicts = 0

  if (semanticSignals.marketTone === 'constructive' && semanticSignals.macroPressure === 'tightening') {
    conflicts += 1
  }

  if (semanticSignals.marketTone === 'defensive' && semanticSignals.macroPressure === 'easing') {
    conflicts += 1
  }

  if (
    semanticSignals.screenerTone === 'broad_strength' &&
    (semanticSignals.breadthTone === 'weakening' || semanticSignals.marketStress === 'elevated')
  ) {
    conflicts += 1
  }

  if (
    semanticSignals.screenerTone === 'weakening' &&
    semanticSignals.marketTone === 'constructive' &&
    semanticSignals.marketStress === 'normal'
  ) {
    conflicts += 1
  }

  if (conflicts >= 2) return 'high'
  if (conflicts === 1) return 'moderate'
  return 'low'
}

const deriveProviderReliability = (
  input: DecisionContextInput
): 'healthy' | 'degraded' | 'fragile' => {
  const semanticMeta = input.marketContext?.semanticSignals?.meta
  const providers = semanticMeta?.providers

  if (!semanticMeta || !providers) return 'healthy'

  const unavailableCount = Object.values(providers).filter((status) => status === 'unavailable').length
  const fallbackCount = Object.values(providers).filter((status) => status === 'fallback').length
  const polygonUnavailable = providers.polygon === 'unavailable'

  if (semanticMeta.source === 'fallback') return 'fragile'
  if (polygonUnavailable && unavailableCount >= 1) return 'fragile'
  if (unavailableCount >= 2 || fallbackCount >= 2) return 'fragile'
  if (unavailableCount === 1 || fallbackCount === 1) return 'degraded'
  return 'healthy'
}

const deriveReasoningImplication = (
  fitLevel: DecisionContext['fitLevel'],
  language: Language
) => {
  if (fitLevel === 'good_fit') return t('reasoningImplication_good', language)
  if (fitLevel === 'weak_fit') return t('reasoningImplication_weak', language)
  return t('reasoningImplication_moderate', language)
}

const deriveDecisionSummary = (
  signalAgreement: DecisionContext['decisionIntelligence']['signalAgreement'],
  confidenceLevel: DecisionContext['decisionIntelligence']['confidenceLevel'],
  language: Language
) => {
  const confidenceSuffix =
    confidenceLevel === 'high'
      ? 'high'
      : confidenceLevel === 'low'
        ? 'low'
        : 'moderate'

  return t(
    `decisionSummary_${signalAgreement}_${confidenceSuffix}` as const,
    language
  )
}

export function deriveDecisionContext(input: DecisionContextInput): DecisionContext {
  const language = input.language ?? 'id'
  const summaryInsights = normalizeInsightSummary(input.summary || '')
  const technicalInsights = mapTechnicalsToInsights(input.technicals || [], language)
  const overnightChange = [...summaryInsights, ...technicalInsights].slice(0, 3)

  const marketSignals = (input.market || []).filter((item) => !item.error)
  const negativeSignals = marketSignals.filter((item) => (item.delta ?? 0) < 0).length
  const positiveSignals = marketSignals.filter((item) => (item.delta ?? 0) > 0).length

  const marketRegimeKey = deriveMarketRegimeKey(negativeSignals, positiveSignals)
  const riskLevelKey = deriveRiskLevelKey(negativeSignals, positiveSignals)

  const exposureType = deriveExposureType(input, marketRegimeKey)
  const concentrationLevel = deriveConcentrationLevel(input, marketSignals.length, negativeSignals)
  const portfolioExposure = normalizeOptionalText(input.portfolio?.exposure)
  const portfolioAssetMix = normalizeOptionalText(input.portfolio?.assetMix)
  const portfolioRegionBias = normalizeOptionalText(input.portfolio?.regionBias)
  const portfolioConcentration = normalizeOptionalText(input.portfolio?.concentration)

  const portfolioFitResult = portfolioFitEngine({
    marketRegime: marketRegimeKey,
    riskLevel: riskLevelKey,
    exposureType,
    concentrationLevel
  })

  const portfolioFitCopyKey: PortfolioFitCopyKey =
    portfolioFitResult.fitLevel === 'good_fit' ? 'aligned' : 'attention'

  const portfolioFit =
    portfolioAssetMix || portfolioRegionBias || portfolioExposure
      ? portfolioExposure || t(`portfolioFit_${portfolioFitCopyKey}` as const, language)
      : t(`portfolioFit_${portfolioFitCopyKey}` as const, language)

  const concentrationRisk =
    portfolioConcentration ||
    (concentrationLevel === 'high' ? t('concentrationRisk_default', language) : undefined)

  const userState =
    portfolioFitResult.fitLevel === 'weak_fit'
      ? 'overexposed'
      : portfolioFitResult.fitLevel === 'moderate_fit' || concentrationLevel === 'high'
        ? 'watchful'
        : 'aligned'
  const signalConflictLevel = deriveSignalConflictLevel(input)
  const providerReliability = deriveProviderReliability(input)

  const actionableInsightResult = actionableInsightEngine({
    fitLevel: portfolioFitResult.fitLevel,
    userState,
    marketRegime: marketRegimeKey,
    riskLevel: riskLevelKey,
    concentrationLevel
  })

  const decisionIntelligenceResult = decisionIntelligenceEngine({
    fitLevel: portfolioFitResult.fitLevel,
    userState,
    marketRegime: marketRegimeKey,
    riskLevel: riskLevelKey,
    concentrationLevel,
    signalConflictLevel,
    providerReliability
  })

  const advancedContextResult = advancedContextEngine({
    market: input.market,
    technicals: input.technicals,
    marketContext: input.marketContext,
    marketRegime: marketRegimeKey,
    riskLevel: riskLevelKey,
    language
  })

  const reasoningImplication = deriveReasoningImplication(portfolioFitResult.fitLevel, language)
  const decisionSummary = deriveDecisionSummary(
    decisionIntelligenceResult.signalAgreementKey,
    decisionIntelligenceResult.confidenceLevelKey,
    language
  )

  return {
    language,
    marketRegimeKey,
    riskLevelKey,
    marketRegime: t(`marketRegime_${marketRegimeKey}` as const, language),
    riskLevel: t(`riskLevel_${riskLevelKey}` as const, language),
    overnightChange,
    fitLevel: portfolioFitResult.fitLevel,
    concentrationLevel,
    userStatus: t(`userStatus_${portfolioFitResult.userStatusKey}` as const, language),
    portfolioFit,
    concentrationRisk,
    userState,
    mainImplication: t(`implication_${portfolioFitResult.mainImplicationKey}` as const, language),
    reasoningImplication,
    decisionSummary,
    actionableInsight: {
      actionStance: actionableInsightResult.actionStanceKey,
      actionSummary: t(`actionSummary_${actionableInsightResult.actionSummaryKey}` as const, language),
      actionBullets: actionableInsightResult.actionBulletKeys.map((key) =>
        t(`actionBullet_${key}` as const, language)
      )
    },
    decisionIntelligence: {
      signalAgreement: decisionIntelligenceResult.signalAgreementKey,
      confidenceLevel: decisionIntelligenceResult.confidenceLevelKey,
      triggerGuidance: decisionIntelligenceResult.triggerKeys.map((key) =>
        t(`trigger_${key}` as const, language)
      )
    },
    advancedContextSynthesis: advancedContextResult,
    planTier: input.planTier
  }
}
