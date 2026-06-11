import React from 'react'
import { t } from './dashboardI18n'
import type { DashboardCopy, DecisionContext, FitLevel } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
}

const fitContent: Record<
  FitLevel,
  {
    explanationKey: 'portfolioWhy_good' | 'portfolioWhy_moderate' | 'portfolioWhy_weak'
    primaryReasoningKey:
      | 'portfolioPosture_good'
      | 'portfolioPosture_moderate'
      | 'portfolioPosture_weak'
  }
> = {
  good_fit: {
    explanationKey: 'portfolioWhy_good',
    primaryReasoningKey: 'portfolioPosture_good'
  },
  moderate_fit: {
    explanationKey: 'portfolioWhy_moderate',
    primaryReasoningKey: 'portfolioPosture_moderate'
  },
  weak_fit: {
    explanationKey: 'portfolioWhy_weak',
    primaryReasoningKey: 'portfolioPosture_weak'
  }
}

const defaultFitContent = fitContent.moderate_fit

export default function PortfolioInsightFull({ copy, decisionContext }: Props) {
  const resolvedFitContent = fitContent[decisionContext.fitLevel] ?? defaultFitContent

  const secondaryReasoning =
    decisionContext.concentrationRisk?.trim() ||
    (decisionContext.userState === 'overexposed'
      ? t('exposureNote_overexposed', copy.language)
      : decisionContext.userState === 'watchful'
        ? t('exposureNote_watchful', copy.language)
        : t('exposureNote_aligned', copy.language))

  return (
    <section className="card dashboard-card" id="portfolio-insight-full">
      <h3>{copy.portfolioFit}</h3>
      <p className="card-note">{decisionContext.portfolioFit}</p>

      <div className="brief-section-list" style={{ marginTop: '0.9rem' }}>
        <div className="brief-section-card">
          <span className="brief-section-label">{t('fitLevelLabel', copy.language)}</span>
          <p>{t(`fitLevel_${decisionContext.fitLevel}` as const, copy.language)}</p>
        </div>
        <div className="brief-section-card">
          <span className="brief-section-label">{t('userStatusLabel', copy.language)}</span>
          <p>{decisionContext.userStatus}</p>
        </div>
        <div className="brief-section-card">
          <span className="brief-section-label">{copy.actionStance}</span>
          <p>{t(`stance_${decisionContext.actionableInsight.actionStance}` as const, copy.language)}</p>
        </div>
      </div>

      <div className="brief-section-list" style={{ marginTop: '0.9rem' }}>
        <div className="brief-section-card">
          <span className="brief-section-label">{t('whyItFitsLabel', copy.language)}</span>
          <p>{t(resolvedFitContent.explanationKey, copy.language)}</p>
        </div>
      </div>

      <div className="brief-section-list" style={{ marginTop: '0.9rem' }}>
        <div className="brief-section-card">
          <span className="brief-section-label">{copy.actionSummary}</span>
          <p>{decisionContext.actionableInsight.actionSummary}</p>
        </div>
      </div>

      <div className="brief-section-list" style={{ marginTop: '0.9rem' }}>
        <div className="brief-section-card">
          <span className="brief-section-label">{t('portfolioPostureLabel', copy.language)}</span>
          <p>{t(resolvedFitContent.primaryReasoningKey, copy.language)}</p>
        </div>
        <div className="brief-section-card">
          <span className="brief-section-label">{t('exposureNoteLabel', copy.language)}</span>
          <p>{secondaryReasoning}</p>
        </div>
      </div>

      <div className="brief-section-list" style={{ marginTop: '0.9rem' }}>
        <div className="brief-section-card">
          <span className="brief-section-label">{copy.actionFocus}</span>
          <ul className="summary-list" style={{ marginTop: '0.65rem' }}>
            {decisionContext.actionableInsight.actionBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
