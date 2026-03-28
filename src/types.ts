import type { ReactNode } from 'react'

export type SectionProps = {
  sectionId: string
}

export type AiRole = 'system' | 'user' | 'assistant'

export type AiMessage = {
  role: AiRole
  content: string
}

export type InstrumentSummary = {
  instrument: string
  latestDate?: string
  previousDate?: string
  latestPrice?: number
  previousPrice?: number
  delta?: number
  pct?: number
  unit?: string
  error?: string
}

export type InvestmentMeta = {
  usedGroq?: boolean
  antamLiveError?: string | null
  instruments?: {
    ANTAM?: InstrumentSummary
    SP500?: InstrumentSummary
  }
}

export type InvestmentSummaryResponse = {
  summary?: string
  meta?: InvestmentMeta | null
}

export type CandlestickPoint = {
  time: string | number
  open: number
  high: number
  low: number
  close: number
}

export type MarketSeriesResponse = {
  data?: CandlestickPoint[]
  note?: string
}

export type AntamCardData = {
  price: number | null
  change: number
  updatedAt: string
}

export type GoldCardData = {
  price: number | null
  change: number
  updatedAt: string
}

export type LoginResponse = {
  token?: string
  user?: {
    id?: number
    fullname?: string
    email?: string
  }
}

export type LocalUserProfile = {
  fullname: string
  email: string
}

export type ProtectedRouteProps = {
  children: ReactNode
}
