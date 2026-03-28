export type MarketInstrument = 'ANTAM' | 'SP500' | 'XAUUSD'

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

export type InvestmentMeta = {
  usedGroq: boolean
  antamLiveError: string | null
  instruments: {
    ANTAM: InstrumentSummary
    SP500: InstrumentSummary
  }
}

export type InvestmentSummaryResult = {
  summary: string
  meta: InvestmentMeta
}

export type AuthTokenPayload = {
  id: number
  fullname: string
  email: string
  iat?: number
  exp?: number
}
