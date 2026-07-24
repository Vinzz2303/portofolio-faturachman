import React from 'react'
import { Link } from 'react-router-dom'
import { t } from './dashboardI18n'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
}

export default function AIReasoningPreview({ copy, decisionContext }: Props) {
  const situationText =
    decisionContext.marketRegimeKey === 'defensive'
      ? t('aiPreview_situation_defensive', copy.language)
      : decisionContext.marketRegimeKey === 'risk_on'
        ? t('aiPreview_situation_risk_on', copy.language)
        : t('aiPreview_situation_neutral', copy.language)

  return (
    <section className="card dashboard-card" id="ai-reasoning">
      <h3>{copy.aiReasoning}</h3>
      <div className="brief-section-list">
        <div className="brief-section-card">
          <span className="brief-section-label">{t('situationLabel', copy.language)}</span>
          <p>{situationText}</p>
        </div>
        <div className="brief-section-card">
          <span className="brief-section-label">{t('myConditionLabel', copy.language)}</span>
          <p>{decisionContext.portfolioFit}</p>
        </div>
        <div className="brief-section-card">
          <span className="brief-section-label">{copy.whatToWatch}</span>
          <p>{copy.freeTeaser}</p>
        </div>
      </div>
      <p className="card-note" style={{ marginTop: '0.75rem' }}>
        {copy.proTeaser}
      </p>
      <div className="hero-cta">
        <Link to="/ting-ai" className="btn dashboard-action-button">
          {decisionContext.planTier === 'pro'
            ? t('previewCta_pro', copy.language)
            : t('previewCta_free', copy.language)}
        </Link>
      </div>
    </section>
  )
}
