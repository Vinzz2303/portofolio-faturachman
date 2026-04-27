import React, { useState } from 'react'
import type { CandlestickPoint, GoldCardData } from '../../types'
import MarketDashboard from '../MarketDashboard'
import { t } from './dashboardI18n'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
  gold?: GoldCardData
  sp500?: CandlestickPoint[]
  ihsg?: CandlestickPoint[]
}

const insightLines = (decisionContext: DecisionContext) => {
  const lines = [decisionContext.reasoningImplication]

  if (decisionContext.userState === 'overexposed') {
    lines.push(t('advancedLine_overexposed', decisionContext.language))
  } else if (decisionContext.userState === 'watchful') {
    lines.push(t('advancedLine_watchful', decisionContext.language))
  } else {
    lines.push(t('advancedLine_aligned', decisionContext.language))
  }

  return lines.slice(0, 2)
}

export default function AdvancedTab({ copy, decisionContext, gold, sp500, ihsg }: Props) {
  const [isDataOpen, setIsDataOpen] = useState(false)

  return (
    <details className="card dashboard-card">
      <summary className="hero-list" style={{ cursor: 'pointer' }}>
        {copy.advancedContext}
      </summary>

      <div style={{ marginTop: '1rem' }}>
        <div className="brief-section-list">
          <div className="brief-section-card">
            <span className="brief-section-label">{t('decisionIntelligenceLabel', copy.language)}</span>
            <p style={{ marginTop: '0.65rem' }}>{decisionContext.decisionSummary}</p>
          </div>
          <div className="brief-section-card">
            <span className="brief-section-label">{t('signalAgreementLabel', copy.language)}</span>
            <p>
              {t(
                `signalAgreement_${decisionContext.decisionIntelligence.signalAgreement}` as const,
                copy.language
              )}
            </p>
          </div>
          <div className="brief-section-card">
            <span className="brief-section-label">{t('confidenceLevelLabel', copy.language)}</span>
            <p>
              {t(
                `confidence_${decisionContext.decisionIntelligence.confidenceLevel}` as const,
                copy.language
              )}
            </p>
          </div>
        </div>

        <div className="brief-section-list" style={{ marginTop: '1rem' }}>
          <div className="brief-section-card">
            <span className="brief-section-label">{t('triggerGuidanceLabel', copy.language)}</span>
            <ul className="summary-list" style={{ marginTop: '0.65rem' }}>
              {decisionContext.decisionIntelligence.triggerGuidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="brief-section-list" style={{ marginTop: '1rem' }}>
          <div className="brief-section-card">
            <span className="brief-section-label">{t('insightHighlightsLabel', copy.language)}</span>
            <ul className="summary-list" style={{ marginTop: '0.65rem' }}>
              {insightLines(decisionContext).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="brief-section-card">
            <span className="brief-section-label">{t('insightModeLabel', copy.language)}</span>
            <p>{t('insightModeText', copy.language)}</p>
          </div>
        </div>

        <details className="market-detail-fold" style={{ marginTop: '1rem' }}>
          <summary>{t('screenerLabel', copy.language)}</summary>
          <div className="brief-section-list" style={{ marginTop: '1rem' }}>
            <div className="brief-section-card">
              <span className="brief-section-label">{t('screenerSummaryLabel', copy.language)}</span>
              <p>{decisionContext.advancedContextSynthesis.screenerInsight.summary}</p>
            </div>
            <div className="brief-section-card">
              <span className="brief-section-label">{t('screenerInsightLabel', copy.language)}</span>
              <p>{decisionContext.advancedContextSynthesis.screenerInsight.detail}</p>
            </div>
          </div>
        </details>

        <details className="market-detail-fold" style={{ marginTop: '0.85rem' }}>
          <summary>{t('technicalLabel', copy.language)}</summary>
          <div className="brief-section-list" style={{ marginTop: '1rem' }}>
            <div className="brief-section-card">
              <span className="brief-section-label">{t('technicalPostureLabel', copy.language)}</span>
              <p>{decisionContext.advancedContextSynthesis.technicalPosture.summary}</p>
            </div>
            <div className="brief-section-card">
              <span className="brief-section-label">{t('technicalInsightLabel', copy.language)}</span>
              <p>{decisionContext.advancedContextSynthesis.technicalPosture.detail}</p>
            </div>
          </div>
        </details>

        <details className="market-detail-fold" style={{ marginTop: '0.85rem' }}>
          <summary>{t('macroLabel', copy.language)}</summary>
          <div className="brief-section-list" style={{ marginTop: '1rem' }}>
            <div className="brief-section-card">
              <span className="brief-section-label">{t('macroRelationLabel', copy.language)}</span>
              <p>{decisionContext.advancedContextSynthesis.macroRelation.summary}</p>
            </div>
            <div className="brief-section-card">
              <span className="brief-section-label">{t('macroInsightLabel', copy.language)}</span>
              <p>{decisionContext.advancedContextSynthesis.macroRelation.detail}</p>
            </div>
          </div>
        </details>

        <details className="market-detail-fold" style={{ marginTop: '0.85rem' }} onToggle={(event) => setIsDataOpen(event.currentTarget.open)}>
          <summary>{t('showDataDetailLabel', copy.language)}</summary>
          <div style={{ marginTop: '1rem' }}>
            {isDataOpen ? (
              <MarketDashboard gold={gold} sp500={sp500} ihsg={ihsg} decisionContext={decisionContext} />
            ) : null}
          </div>
        </details>
      </div>
    </details>
  )
}
