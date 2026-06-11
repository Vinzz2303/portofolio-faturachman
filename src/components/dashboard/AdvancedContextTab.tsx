import React from 'react'
import MarketDashboard from '../MarketDashboard'
import { t } from './dashboardI18n'
import type { DashboardCopy, DecisionContext } from './types'
import type { CandlestickPoint, GoldCardData } from '../../types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
  gold?: GoldCardData
  sp500?: CandlestickPoint[]
}

export default function AdvancedContextTab({ copy, decisionContext, gold, sp500 }: Props) {
  return (
    <details className="card dashboard-card">
      <summary className="hero-list" style={{ cursor: 'pointer' }}>
        {copy.advancedContext}
      </summary>
      <div style={{ marginTop: '1rem' }}>
        <div className="brief-section-list">
          <div className="brief-section-card">
            <span className="brief-section-label">{copy.todayInsight}</span>
            <p>{decisionContext.mainImplication}</p>
          </div>
          <div className="brief-section-card">
            <span className="brief-section-label">{copy.secondaryContext}</span>
            <p>{copy.secondaryContext}</p>
          </div>
        </div>
        <details className="market-detail-fold">
          <summary>{t('showDataDetailLabel', copy.language)}</summary>
          <div style={{ marginTop: '1rem' }}>
            <MarketDashboard gold={gold} sp500={sp500} />
          </div>
        </details>
      </div>
    </details>
  )
}
