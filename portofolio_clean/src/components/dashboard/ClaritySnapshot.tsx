import React from 'react'
import { t } from './dashboardI18n'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
}

export default function ClaritySnapshot({ copy, decisionContext }: Props) {
  const confidenceValue = t(
    `confidence_${decisionContext.decisionIntelligence.confidenceLevel}` as
      | 'confidence_low'
      | 'confidence_moderate'
      | 'confidence_high',
    copy.language
  )

  return (
    <section className="card dashboard-card" id="clarity-snapshot">
      <div className="dashboard-summary-head" style={{ marginBottom: '0.2rem' }}>
        <div>
          <p className="dashboard-summary-kicker">{copy.claritySnapshot}</p>
          <h3 style={{ fontSize: '1.1rem' }}>{copy.heroSummary}</h3>
        </div>
      </div>

      <div className="dashboard-stat-row" style={{ marginTop: '0.9rem' }}>
        <div className="dashboard-stat-pill">
          <span className="dashboard-stat-label">{copy.marketConditionLabel}</span>
          <strong>{decisionContext.marketRegime}</strong>
        </div>
        <div className="dashboard-stat-pill">
          <span className="dashboard-stat-label">{copy.riskLevelLabel}</span>
          <strong>{decisionContext.riskLevel}</strong>
        </div>
        <div className="dashboard-stat-pill">
          <span className="dashboard-stat-label">{copy.portfolioFitLabel}</span>
          <strong>{decisionContext.userStatus}</strong>
        </div>
        <div className="dashboard-stat-pill">
          <span className="dashboard-stat-label">{copy.confidenceLabel}</span>
          <strong>{confidenceValue}</strong>
        </div>
      </div>
    </section>
  )
}
