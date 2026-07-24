import React from 'react'
import { t } from './dashboardI18n'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
}

export default function AIReasoningFull({ copy, decisionContext }: Props) {
  const situationText =
    decisionContext.marketRegimeKey === 'defensive'
      ? t('aiFull_situation_defensive', copy.language)
      : decisionContext.marketRegimeKey === 'risk_on'
        ? t('aiFull_situation_risk_on', copy.language)
        : t('aiFull_situation_neutral', copy.language)

  const myConditionText =
    decisionContext.fitLevel === 'good_fit'
      ? t('aiFull_condition_good', copy.language, { userStatus: decisionContext.userStatus })
      : decisionContext.fitLevel === 'moderate_fit'
        ? t('aiFull_condition_moderate', copy.language, { userStatus: decisionContext.userStatus })
        : t('aiFull_condition_weak', copy.language, { userStatus: decisionContext.userStatus })

  const watchText =
    decisionContext.concentrationRisk ||
    (decisionContext.fitLevel === 'good_fit'
      ? t('aiFull_watch_good', copy.language)
      : decisionContext.fitLevel === 'moderate_fit'
        ? t('aiFull_watch_moderate', copy.language)
        : t('aiFull_watch_weak', copy.language))

  return (
    <section className="card dashboard-card" id="ai-reasoning-full">
      <h3>{copy.aiReasoning}</h3>
      <div className="brief-section-list">
        <div className="brief-section-card">
          <span className="brief-section-label">{t('situationLabel', copy.language)}</span>
          <p>{situationText}</p>
        </div>
        <div className="brief-section-card">
          <span className="brief-section-label">{t('myConditionLabel', copy.language)}</span>
          <p>{myConditionText}</p>
        </div>
        <div className="brief-section-card">
          <span className="brief-section-label">{t('implicationLabel', copy.language)}</span>
          <p>{decisionContext.reasoningImplication}</p>
        </div>
        <div className="brief-section-card">
          <span className="brief-section-label">{copy.whatToWatch}</span>
          <p>{watchText}</p>
        </div>
      </div>
    </section>
  )
}
