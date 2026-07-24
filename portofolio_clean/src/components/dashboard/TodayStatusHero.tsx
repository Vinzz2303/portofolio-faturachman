import React from 'react'
import { t } from './dashboardI18n'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
}

export default function TodayStatusHero({ copy, decisionContext }: Props) {
  return (
    <section className="card dashboard-card">
      <div className="dashboard-summary-head">
        <div>
          <p className="dashboard-summary-kicker">{copy.heroTitle}</p>
          <h3>{t('claritySnapshot', copy.language)}</h3>
          <p className="summary-text">{t('heroSummary', copy.language)}</p>
        </div>
        <div className="dashboard-summary-badge">
          {decisionContext.planTier === 'pro'
            ? t('planPro', copy.language)
            : t('planFree', copy.language)}
        </div>
      </div>

      <div className="dashboard-stat-row">
        <div className="dashboard-stat-pill">
          <span className="dashboard-stat-label">{copy.marketLabel}</span>
          <strong>{decisionContext.marketRegime}</strong>
        </div>
        <div className="dashboard-stat-pill">
          <span className="dashboard-stat-label">{copy.riskLabel}</span>
          <strong>{decisionContext.riskLevel}</strong>
        </div>
        <div className="dashboard-stat-pill">
          <span className="dashboard-stat-label">{copy.youLabel}</span>
          <strong>{decisionContext.userStatus}</strong>
        </div>
      </div>

      <div className="brief-context-line">
        <span className="brief-context-label">{t('mainImplicationLabel', copy.language)}</span>
        <strong>{decisionContext.mainImplication}</strong>
      </div>
    </section>
  )
}
