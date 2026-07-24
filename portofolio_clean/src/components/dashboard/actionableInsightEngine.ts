import type {
  ActionBulletKey,
  ActionStance,
  ActionSummaryKey,
  ConcentrationLevel,
  FitLevel,
  MarketRegimeKey,
  UserState
} from './types'

type ActionableInsightInput = {
  fitLevel: FitLevel
  userState: UserState
  marketRegime: MarketRegimeKey
  riskLevel: 'high' | 'elevated' | 'moderate'
  concentrationLevel?: ConcentrationLevel
}

export type ActionableInsightResult = {
  actionStanceKey: ActionStance
  actionSummaryKey: ActionSummaryKey
  actionBulletKeys: ActionBulletKey[]
}

export function actionableInsightEngine({
  fitLevel,
  userState,
  marketRegime,
  riskLevel,
  concentrationLevel
}: ActionableInsightInput): ActionableInsightResult {
  const isSupportiveRegime = marketRegime === 'risk_on' || marketRegime === 'neutral'
  const isElevatedRisk = riskLevel === 'high' || riskLevel === 'elevated'
  const isHighConcentration = concentrationLevel === 'high'

  if (isHighConcentration && (userState !== 'aligned' || isElevatedRisk)) {
    return {
      actionStanceKey: 'reduce_concentration',
      actionSummaryKey: 'reduce_concentration',
      actionBulletKeys: [
        'reduce_concentration_1',
        'reduce_concentration_2',
        'reduce_concentration_3'
      ]
    }
  }

  if (fitLevel === 'weak_fit' || userState === 'overexposed') {
    return {
      actionStanceKey: 'tighten_risk',
      actionSummaryKey: 'tighten_risk',
      actionBulletKeys: ['tighten_risk_1', 'tighten_risk_2', 'tighten_risk_3']
    }
  }

  if (fitLevel === 'moderate_fit' || userState === 'watchful' || isElevatedRisk) {
    return {
      actionStanceKey: 'be_selective',
      actionSummaryKey: 'be_selective',
      actionBulletKeys: ['be_selective_1', 'be_selective_2', 'be_selective_3']
    }
  }

  if (fitLevel === 'good_fit' && userState === 'aligned' && isSupportiveRegime) {
    return {
      actionStanceKey: 'hold_steady',
      actionSummaryKey: 'hold_steady',
      actionBulletKeys: ['hold_steady_1', 'hold_steady_2', 'hold_steady_3']
    }
  }

  return {
    actionStanceKey: 'be_selective',
    actionSummaryKey: 'default',
    actionBulletKeys: ['default_1', 'default_2']
  }
}
