import React from 'react'
import type { InstrumentSummary } from '../../types'
import type { DashboardCopy } from './types'

type Props = {
  copy: DashboardCopy
  summary: string
  instruments?: {
    ANTAM?: InstrumentSummary
    SP500?: InstrumentSummary
    IHSG?: InstrumentSummary
    BTC?: InstrumentSummary
  }
}

const currencyUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const currencyIdr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

const decimalCompact = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2
})

function formatValue(kind: 'gold' | 'btc' | 'sp500' | 'ihsg', value?: number) {
  if (typeof value !== 'number') return '...'
  if (kind === 'gold') return currencyIdr.format(value)
  if (kind === 'ihsg') return decimalCompact.format(value)
  return currencyUsd.format(value)
}

function formatDelta(value: number | undefined, copy: DashboardCopy) {
  if (typeof value !== 'number') return copy.contextWaiting
  const sign = value > 0 ? '+' : value < 0 ? '' : ''
  return `${sign}${value.toFixed(2)}`
}

function formatUpdatedAt(value: string | undefined, copy: DashboardCopy) {
  if (!value) return copy.contextWaiting
  return value
}

export default function ContextLayer({ copy, summary, instruments }: Props) {
  const cards = [
    {
      label: copy.goldLabel,
      value: formatValue('gold', instruments?.ANTAM?.latestPrice),
      delta: formatDelta(instruments?.ANTAM?.delta, copy),
      updatedAt: formatUpdatedAt(instruments?.ANTAM?.latestDate, copy)
    },
    {
      label: copy.bitcoinLabel,
      value: formatValue('btc', instruments?.BTC?.latestPrice),
      delta: formatDelta(instruments?.BTC?.delta, copy),
      updatedAt: formatUpdatedAt(instruments?.BTC?.latestDate, copy)
    },
    {
      label: copy.usIndexLabel,
      value: formatValue('sp500', instruments?.SP500?.latestPrice),
      delta: formatDelta(instruments?.SP500?.delta, copy),
      updatedAt: formatUpdatedAt(instruments?.SP500?.latestDate, copy)
    },
    {
      label: copy.ihsgLabel,
      value: formatValue('ihsg', instruments?.IHSG?.latestPrice),
      delta: formatDelta(instruments?.IHSG?.delta, copy),
      updatedAt: formatUpdatedAt(instruments?.IHSG?.latestDate, copy)
    }
  ]

  return (
    <section className="card dashboard-card" id="context-layer">
      <div className="dashboard-summary-head context-layer-head">
        <div>
          <p className="dashboard-summary-kicker">{copy.contextLayer}</p>
          <h3 style={{ fontSize: '1.06rem' }}>{copy.marketSummary}</h3>
          <p className="summary-text context-layer-summary">{summary.trim() || copy.contextLayerLead}</p>
        </div>
      </div>

      <div className="context-layer-grid">
        {cards.map((card) => (
          <div key={card.label} className="context-layer-card">
            <span className="dashboard-stat-label">{card.label}</span>
            <strong className="context-layer-value">{card.value}</strong>
            <span className="context-layer-meta">{copy.changeLabel}: {card.delta}</span>
            <span className="context-layer-meta">{copy.lastUpdateLabel}: {card.updatedAt}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
