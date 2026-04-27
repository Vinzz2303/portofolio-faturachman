export type Language = 'id' | 'en'
export type MarketRegimeKey = 'defensive' | 'risk_on' | 'neutral'
export type RiskLevelKey = 'high' | 'elevated' | 'moderate'
export type FitLevel = 'good_fit' | 'moderate_fit' | 'weak_fit'
export type UserState = 'aligned' | 'overexposed' | 'watchful'
export type ConcentrationLevel = 'low' | 'moderate' | 'high'
export type UserStatusKey =
  | 'overexposed'
  | 'watchful'
  | 'defensive_tilt'
  | 'concentrated'
  | 'reasonably_aligned'
  | 'selective'
export type MainImplicationKey =
  | 'aggressive_regime'
  | 'growth_pressure'
  | 'defensive_tilt'
  | 'concentrated'
  | 'reasonably_aligned'
  | 'selective'
export type PortfolioFitCopyKey = 'aligned' | 'attention'
export type ConcentrationRiskKey = 'default'
export type ActionStance = 'hold_steady' | 'be_selective' | 'tighten_risk' | 'reduce_concentration'
export type ActionSummaryKey =
  | 'reduce_concentration'
  | 'tighten_risk'
  | 'be_selective'
  | 'hold_steady'
  | 'default'
export type ActionBulletKey =
  | 'reduce_concentration_1'
  | 'reduce_concentration_2'
  | 'reduce_concentration_3'
  | 'tighten_risk_1'
  | 'tighten_risk_2'
  | 'tighten_risk_3'
  | 'be_selective_1'
  | 'be_selective_2'
  | 'be_selective_3'
  | 'hold_steady_1'
  | 'hold_steady_2'
  | 'hold_steady_3'
  | 'default_1'
  | 'default_2'

export type SignalAgreement = 'aligned' | 'mixed' | 'defensive' | 'constructive'
export type ConfidenceLevel = 'low' | 'moderate' | 'high'
export type DecisionSignalAgreementKey = SignalAgreement
export type DecisionConfidenceKey = ConfidenceLevel
export type DecisionTriggerKey =
  | 'defensive_1'
  | 'defensive_2'
  | 'mixed_1'
  | 'mixed_2'
  | 'constructive_1'
  | 'constructive_2'
  | 'aligned_1'
  | 'aligned_2'
  | 'low_1'
  | 'low_2'
  | 'moderate_1'
  | 'moderate_2'
  | 'high_1'
  | 'high_2'

export type ScreenerInsightState =
  | 'weakening'
  | 'selective_strength'
  | 'broad_strength'
  | 'breadth_limited'
export type TechnicalPostureState = 'improving' | 'weakening' | 'mixed'
export type MacroRelationState = 'supportive' | 'neutral' | 'restrictive'

export type AdvancedContextSynthesis = {
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

export type DecisionIntelligence = {
  signalAgreement: SignalAgreement
  confidenceLevel: ConfidenceLevel
  triggerGuidance: string[]
}

export type ActionableInsight = {
  actionStance: ActionStance
  actionSummary: string
  actionBullets: string[]
}

export type DecisionContext = {
  language: Language
  marketRegimeKey: MarketRegimeKey
  riskLevelKey: RiskLevelKey
  marketRegime: string
  riskLevel: string
  overnightChange: string[]
  fitLevel: FitLevel
  concentrationLevel: ConcentrationLevel
  userStatus: string
  portfolioFit: string
  concentrationRisk?: string
  userState: UserState
  mainImplication: string
  reasoningImplication: string
  decisionSummary: string
  actionableInsight: ActionableInsight
  decisionIntelligence: DecisionIntelligence
  advancedContextSynthesis: AdvancedContextSynthesis
  planTier: 'free' | 'pro'
}

export type DecisionContextPlanTier = DecisionContext['planTier']

export type DecisionContextMarketInput = {
  symbol: string
  delta?: number
  error?: string | null
}

export type DecisionContextTechnicalInput = {
  symbol: string
  rsi?: number
  trend?: 'up' | 'down' | 'flat'
  volatility?: number
  yield?: number
}

export type DecisionContextPortfolioInput = {
  exposure?: string
  concentration?: string
  regionBias?: string
  assetMix?: string
  exposureType?: 'defensive' | 'balanced' | 'growth' | 'income' | 'high-beta'
  concentrationLevel?: ConcentrationLevel
}

export type DecisionContextMarketContextInput = {
  riskTone?: string
  stressState?: string
  macroContext?: string
  headlinePressure?: string
  watchLevel?: string
  semanticSignals?: {
    breadthTone: 'weakening' | 'limited' | 'constructive' | 'mixed'
    marketTone: 'defensive' | 'constructive' | 'mixed'
    screenerTone: 'weakening' | 'selective_strength' | 'broad_strength' | 'mixed'
    volatilityTrend: 'rising' | 'stable' | 'falling'
    macroPressure: 'tightening' | 'easing' | 'neutral'
    marketStress: 'elevated' | 'normal'
    meta?: {
      source: 'multi_provider' | 'openbb' | 'fallback'
      ts: number
      latencyMs?: number
      note?: string | null
      providers?: {
        polygon: 'live' | 'fallback' | 'unavailable'
        fmp: 'live' | 'fallback' | 'unavailable'
        fred: 'live' | 'fallback' | 'unavailable'
      }
    }
  }
}

export type DecisionContextInput = {
  summary?: string
  market?: DecisionContextMarketInput[]
  technicals?: DecisionContextTechnicalInput[]
  marketContext?: DecisionContextMarketContextInput
  portfolio?: DecisionContextPortfolioInput
  planTier: DecisionContextPlanTier
  language?: Language
}

export type DashboardCopy = {
  language: Language
  heroTitle: string
  heroLead: string
  marketLabel: string
  riskLabel: string
  youLabel: string
  planLabel: string
  todayInsight: string
  portfolioFit: string
  aiReasoning: string
  advancedContext: string
  heroSummary: string
  contextLayer: string
  contextLayerLead: string
  contextWaiting: string
  goldLabel: string
  bitcoinLabel: string
  usIndexLabel: string
  ihsgLabel: string
  lastUpdateLabel: string
  changeLabel: string
  newsIntelligence: string
  newsIntelligenceLead: string
  relevanceFresh: string
  relevanceLikelyPricedIn: string
  relevanceNoise: string
  relevanceHigh: string
  relevanceLabel: string
  askTingAi: string
  askTingAiLead: string
  askTingAiPlaceholder: string
  askTingAiDisabled: string
  askPromptOne: string
  askPromptTwo: string
  askPromptThree: string
  askPromptFour: string
  loadingBrief: string
  noInsight: string
  freeTeaser: string
  proTeaser: string
  secondaryContext: string
  claritySnapshot: string
  marketConditionLabel: string
  riskLevelLabel: string
  portfolioFitLabel: string
  confidenceLabel: string
  whatChanged: string
  whatToWatch: string
  nextStep: string
  actionStance: string
  actionSummary: string
  actionFocus: string
  changeAwareness: string
  conditionMostlyUnchanged: string
  mainPoint: string
  tradeOff: string
  basedOn: string
  viewFullExplanation: string
  optional: string
  allocationWeight: string
  pressureLevel: string
  nextSensibleAction: string
  nextSensibleActionText: string
  whyCheckAgain: string
  marketSummary: string
  insightBadgeLabel: string
  portfolioAware: string
  portfolioPending: string
}
