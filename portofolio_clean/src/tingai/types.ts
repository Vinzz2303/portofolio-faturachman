export interface PortfolioAllocation {
  asset: string
  percentage: number
}

export interface UserPortfolio {
  portfolio_value: string
  dominant_asset: string
  allocation: PortfolioAllocation[]
  risk_budget: string
  horizon: string
}

export interface MarketContext {
  market_sentiment: 'Positif' | 'Netral' | 'Negatif'
  fear_greed: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'
  trend: 'Naik' | 'Sideways' | 'Menurun'
  volatility: 'Rendah' | 'Sedang' | 'Tinggi'
  news_sentiment: 'Positif' | 'Netral' | 'Negatif'
  events: string[]
}

export interface TingAIInput {
  user: UserPortfolio
  market: MarketContext
}

export type ConcentrationLevel = 'Low' | 'Medium' | 'High'
export type ExposureLevel = 'Low' | 'Medium' | 'High'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type Tone = 'positive' | 'neutral' | 'negative'
export type ConfidenceLevel = 'Low' | 'Medium' | 'High'

export interface PortfolioOverview {
  portfolio_value: string
  dominant_asset: string
  concentration_level: ConcentrationLevel
  market_exposure: ExposureLevel
}

export interface Impact {
  summary: string
  risk_level: RiskLevel
  impact_points: string[]
}

export interface ScenarioOption {
  label: string
  risk_level: RiskLevel
  points: string[]
}

export interface ScenarioAnalysis {
  enter_now: ScenarioOption
  wait: ScenarioOption
}

export interface OptionToConsider {
  title: string
  description: string
}

export interface EvidenceItem {
  label: string
  value: string
  tone: Tone
}

export interface ConfidenceInfo {
  level: ConfidenceLevel
  reason: string
}

export interface TingAIOutput {
  market_summary: string
  portfolio_overview: PortfolioOverview
  impact_on_portfolio: Impact
  scenario_analysis: ScenarioAnalysis
  options_to_consider: OptionToConsider[]
  evidence: EvidenceItem[]
  confidence: ConfidenceInfo
  disclaimer: string
}

export interface AnalysisContext {
  portfolio: UserPortfolio
  market: MarketContext
  dominantAllocation: number
  hasDataGaps: boolean
}
