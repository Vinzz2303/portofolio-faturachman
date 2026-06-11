export type MarketInstrument = 'ANTAM' | 'SP500' | 'XAUUSD' | 'IHSG'

export type MarketPoint = {
  time: string | number
  open: number
  high: number
  low: number
  close: number
}

export type InstrumentSummary = {
  instrument: string
  latestDate?: string | null
  previousDate?: string | null
  latestPrice?: number
  previousPrice?: number
  delta?: number
  pct?: number
  unit?: string
  source?: string
  error?: string
}

export type BriefSection = {
  title: 'What Changed' | 'Why It Matters' | 'What To Watch'
  body: string
}

export type MarketDriver = {
  label: string
  signal: 'bullish' | 'bearish' | 'mixed' | 'neutral'
  detail: string
}

export type MarketWatchItem = {
  label: string
  detail: string
  priority: 'high' | 'medium' | 'low'
}

export type MarketHeadline = {
  title: string
  source: string
  url: string
  publishedAt: string
  whyItMatters: string
  theme: 'macro' | 'rates' | 'dollar' | 'equities' | 'commodities' | 'crypto' | 'geopolitics' | 'other'
  relevance: 'high' | 'medium' | 'low'
}

// Trust Pipeline: normalized semantic state that all raw data adapters must emit.
// Downstream layers must consume this shape only and never depend on raw API payloads.
export type SemanticVolatilityTrend = 'rising' | 'stable' | 'falling'
export type SemanticMacroPressure = 'tightening' | 'easing' | 'neutral'
export type SemanticMarketStress = 'elevated' | 'normal'
export type SemanticBreadthTone = 'weakening' | 'limited' | 'constructive' | 'mixed'
export type SemanticMarketTone = 'defensive' | 'constructive' | 'mixed'
export type SemanticScreenerTone = 'weakening' | 'selective_strength' | 'broad_strength' | 'mixed'
export type SemanticProviderStatus = 'live' | 'fallback' | 'unavailable'

export type SemanticSignals = {
  breadthTone: SemanticBreadthTone
  marketTone: SemanticMarketTone
  screenerTone: SemanticScreenerTone
  volatilityTrend: SemanticVolatilityTrend
  macroPressure: SemanticMacroPressure
  marketStress: SemanticMarketStress
  meta?: {
    source: 'multi_provider' | 'openbb' | 'fallback'
    ts: number
    latencyMs?: number
    note?: string | null
    providers?: {
      polygon: SemanticProviderStatus
      fmp: SemanticProviderStatus
      fred: SemanticProviderStatus
    }
  }
}

export type MarketContext = {
  riskTone: string
  regime: string
  conviction: string
  stressState: string
  macroContext: string
  geopoliticContext: string
  externalContext: string
  externalWhyItMatters: string
  headlinePressure: string
  watchLevel: string
  overnightContext: string
  drivers: MarketDriver[]
  macroSignals: MarketDriver[]
  stressDrivers: string[]
  headlines: MarketHeadline[]
  watchItems: MarketWatchItem[]
  semanticSignals?: SemanticSignals
}

export type InvestmentMeta = {
  usedGroq: boolean
  antamLiveError: string | null
  instruments: {
    ANTAM: InstrumentSummary
    SP500: InstrumentSummary
    IHSG?: InstrumentSummary
    BTC?: InstrumentSummary
  }
  briefing: BriefSection[]
  context: MarketContext
}

export type InvestmentSummaryResult = {
  summary: string
  meta: InvestmentMeta
}

export type AuthTokenPayload = {
  id: number
  fullname: string
  email: string
  emailVerified?: boolean
  iat?: number
  exp?: number
}

export type AssetType = 'stock' | 'index' | 'crypto' | 'commodity'
