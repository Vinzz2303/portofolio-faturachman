import React from 'react'
import { t } from './dashboardI18n'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
}

export default function PortfolioPreview({ copy, decisionContext }: Props) {
  return (
    <section className="card dashboard-card" id="portfolio-insight">
      <h3>{copy.portfolioFit}</h3>
      <p className="card-note">{decisionContext.portfolioFit}</p>
      <p className="card-note" style={{ marginTop: '0.5rem' }}>
        {decisionContext.concentrationRisk ?? copy.freeTeaser}
      </p>
      <div className="brief-section-list" style={{ marginTop: '0.9rem' }}>
        <div className="brief-section-card">
          <span className="brief-section-label">{copy.nextStep}</span>
          <p>
            <strong>{t(`stance_${decisionContext.actionableInsight.actionStance}` as const, copy.language)}</strong>
          </p>
          <p style={{ marginTop: '0.45rem' }}>{decisionContext.actionableInsight.actionSummary}</p>
        </div>
      </div>
    </section>
  )
}
