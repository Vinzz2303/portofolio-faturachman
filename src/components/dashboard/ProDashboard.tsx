import React from 'react'
import type { CandlestickPoint, GoldCardData, InstrumentSummary } from '../../types'
import TodayStatusHero from './TodayStatusHero'
import ClaritySnapshot from './ClaritySnapshot'
import ContextLayer from './ContextLayer'
import NewsIntelligence from './NewsIntelligence'
import TodayInsightSummary from './TodayInsightSummary'
import PortfolioInsightFull from './PortfolioInsightFull'
import AIReasoningFull from './AIReasoningFull'
import AdvancedTab from './AdvancedTab'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
  loading: boolean
  error: string
  insights: string[]
  gold?: GoldCardData
  sp500?: CandlestickPoint[]
  ihsg?: CandlestickPoint[]
  summary: string
  instruments?: {
    ANTAM?: InstrumentSummary
    SP500?: InstrumentSummary
    IHSG?: InstrumentSummary
    BTC?: InstrumentSummary
  }
  headlines?: import('../../types').MarketHeadline[]
}

export default function ProDashboard({
  copy,
  decisionContext,
  loading,
  error,
  insights,
  gold,
  sp500,
  ihsg,
  summary,
  instruments,
  headlines
}: Props) {
  return (
    <>
      <TodayStatusHero copy={copy} decisionContext={decisionContext} />
      <ClaritySnapshot copy={copy} decisionContext={decisionContext} />
      <ContextLayer copy={copy} summary={summary} instruments={instruments} />
      <NewsIntelligence copy={copy} headlines={headlines} />
      <TodayInsightSummary
        copy={copy}
        decisionContext={decisionContext}
        insights={insights}
        loading={loading}
        error={error}
        mode="pro"
      />
      <PortfolioInsightFull copy={copy} decisionContext={decisionContext} />
      <AIReasoningFull copy={copy} decisionContext={decisionContext} />
      <AdvancedTab copy={copy} decisionContext={decisionContext} gold={gold} sp500={sp500} ihsg={ihsg} />
    </>
  )
}
