import type {
  ConcentrationLevel,
  ConfidenceLevel,
  DecisionConfidenceKey,
  DecisionSignalAgreementKey,
  DecisionTriggerKey,
  FitLevel,
  MarketRegimeKey,
  RiskLevelKey,
  SignalAgreement,
  UserState
} from './types'

type DecisionIntelligenceInput = {
  fitLevel: FitLevel
  userState: UserState
  marketRegime: MarketRegimeKey
  riskLevel: RiskLevelKey
  concentrationLevel?: ConcentrationLevel
  signalConflictLevel?: 'low' | 'moderate' | 'high'
  providerReliability?: 'healthy' | 'degraded' | 'fragile'
}

export type DecisionIntelligenceResult = {
  signalAgreementKey: DecisionSignalAgreementKey
  confidenceLevelKey: DecisionConfidenceKey
  triggerKeys: DecisionTriggerKey[]
}

const deriveSignalAgreement = ({
  fitLevel,
  userState,
  marketRegime
}: DecisionIntelligenceInput): SignalAgreement => {
  if (marketRegime === 'defensive' && (fitLevel === 'weak_fit' || userState === 'overexposed')) {
    return 'defensive'
  }

  if (marketRegime === 'risk_on' && fitLevel === 'good_fit' && userState === 'aligned') {
    return 'constructive'
  }

  if (fitLevel === 'good_fit' && userState === 'aligned') {
    return 'aligned'
  }

  return 'mixed'
}

const deriveConfidenceLevel = ({
  fitLevel,
  userState,
  riskLevel,
  concentrationLevel,
  signalConflictLevel,
  providerReliability
}: DecisionIntelligenceInput): ConfidenceLevel => {
  const isHighRisk = riskLevel === 'high'
  const isHighConcentration = concentrationLevel === 'high'

  if (
    fitLevel === 'weak_fit' ||
    userState === 'overexposed' ||
    signalConflictLevel === 'high' ||
    providerReliability === 'fragile' ||
    (isHighRisk && isHighConcentration)
  ) {
    return 'low'
  }

  if (
    fitLevel === 'good_fit' &&
    userState === 'aligned' &&
    riskLevel === 'moderate' &&
    concentrationLevel !== 'high' &&
    signalConflictLevel !== 'moderate' &&
    providerReliability !== 'degraded'
  ) {
    return 'high'
  }

  if (providerReliability === 'degraded' && fitLevel === 'good_fit' && userState === 'aligned') {
    return 'moderate'
  }

  return 'moderate'
}

const deriveTriggerKeys = (
  signalAgreement: SignalAgreement,
  confidenceLevel: ConfidenceLevel
): DecisionTriggerKey[] => {
  const baseKeys =
    signalAgreement === 'defensive'
      ? (['defensive_1', 'defensive_2'] as const)
      : signalAgreement === 'constructive'
        ? (['constructive_1', 'constructive_2'] as const)
        : signalAgreement === 'aligned'
          ? (['aligned_1', 'aligned_2'] as const)
          : (['mixed_1', 'mixed_2'] as const)

  const confidenceKeys =
    confidenceLevel === 'low'
      ? (['low_1', 'low_2'] as const)
      : confidenceLevel === 'high'
        ? (['high_1', 'high_2'] as const)
        : (['moderate_1', 'moderate_2'] as const)

  return [baseKeys[0], confidenceKeys[0], baseKeys[1]]
}

export function decisionIntelligenceEngine(
  input: DecisionIntelligenceInput
): DecisionIntelligenceResult {
  const signalAgreementKey = deriveSignalAgreement(input)
  const confidenceLevelKey = deriveConfidenceLevel(input)

  return {
    signalAgreementKey,
    confidenceLevelKey,
    triggerKeys: deriveTriggerKeys(signalAgreementKey, confidenceLevelKey)
  }
}
