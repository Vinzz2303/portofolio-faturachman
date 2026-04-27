import React from 'react'
import type { DashboardCopy, DecisionContext } from './types'

type Props = {
  copy: DashboardCopy
  decisionContext: DecisionContext
  insights: string[]
  loading: boolean
  error: string
  mode: 'free' | 'pro'
}

export default function TodayInsightSummary({ copy, decisionContext, insights, loading, error, mode }: Props) {
  return (
    <section className="card dashboard-card" id="today-insight">
      <h3>{copy.todayInsight}</h3>
      {loading && <p className="card-note">{copy.loadingBrief}</p>}
      {error && <p className="card-note warn">{error}</p>}
      {!loading && !error && (
        <>
          {insights.length ? (
            <ul className="summary-list">
              {insights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="card-note summary-text">{copy.noInsight}</p>
          )}
          <p className="card-note" style={{ marginTop: '0.75rem' }}>
            {decisionContext.mainImplication}
          </p>
          <p className="card-note" style={{ marginTop: '0.5rem' }}>
            {mode === 'pro' ? copy.proTeaser : copy.freeTeaser}
          </p>
        </>
      )}
    </section>
  )
}

