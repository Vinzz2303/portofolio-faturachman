import React from 'react'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
}

export default function SecondaryContextAccordion({ copy, decisionContext }: Props) {
  return (
    <details className="card dashboard-card">
      <summary className="hero-list" style={{ cursor: 'pointer' }}>
        {copy.secondaryContext}
      </summary>
      <div style={{ marginTop: '1rem' }}>
        <div className="brief-section-list">
          <div className="brief-section-card">
            <span className="brief-section-label">{copy.whatChanged}</span>
            <p>{decisionContext.overnightChange[0] || copy.noInsight}</p>
          </div>
          <div className="brief-section-card">
            <span className="brief-section-label">{copy.whatToWatch}</span>
            <p>{decisionContext.overnightChange[1] || decisionContext.mainImplication}</p>
          </div>
        </div>
      </div>
    </details>
  )
}

