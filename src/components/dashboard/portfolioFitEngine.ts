import type {
  ConcentrationLevel,
  FitLevel,
  MainImplicationKey,
  MarketRegimeKey,
  RiskLevelKey,
  UserStatusKey
} from './types'

export type PortfolioExposureType =
  | 'defensive'
  | 'balanced'
  | 'growth'
  | 'income'
  | 'high-beta'

export type PortfolioFitInput = {
  marketRegime: MarketRegimeKey
  riskLevel: RiskLevelKey
  exposureType: PortfolioExposureType
  concentrationLevel: ConcentrationLevel
}

export type PortfolioFitResult = {
  fitLevel: FitLevel
  userStatusKey: UserStatusKey
  mainImplicationKey: MainImplicationKey
}

export function portfolioFitEngine({
  marketRegime,
  riskLevel,
  exposureType,
  concentrationLevel
}: PortfolioFitInput): PortfolioFitResult {
  const isDefensiveRegime = marketRegime === 'defensive'
  const isRiskOnRegime = marketRegime === 'risk_on'
  const isHighRisk = riskLevel === 'high'
  const isElevatedRisk = riskLevel === 'elevated'

  if (isDefensiveRegime && (exposureType === 'growth' || exposureType === 'high-beta')) {
    if (concentrationLevel === 'high' || isHighRisk) {
      return {
        fitLevel: 'weak_fit',
        userStatusKey: 'overexposed',
        mainImplicationKey: 'aggressive_regime'
      }
    }

    return {
      fitLevel: 'weak_fit',
      userStatusKey: 'watchful',
      mainImplicationKey: 'growth_pressure'
    }
  }

  if (isRiskOnRegime && exposureType === 'defensive') {
    return {
      fitLevel: 'moderate_fit',
      userStatusKey: 'defensive_tilt',
      mainImplicationKey: 'defensive_tilt'
    }
  }

  if ((isHighRisk || isElevatedRisk) && concentrationLevel === 'high') {
    return {
      fitLevel: 'moderate_fit',
      userStatusKey: 'concentrated',
      mainImplicationKey: 'concentrated'
    }
  }

  if (exposureType === 'balanced' && concentrationLevel !== 'high') {
    return {
      fitLevel: 'good_fit',
      userStatusKey: 'reasonably_aligned',
      mainImplicationKey: 'reasonably_aligned'
    }
  }

  return {
    fitLevel: 'moderate_fit',
    userStatusKey: 'selective',
    mainImplicationKey: 'selective'
  }
}
