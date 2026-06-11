/**
 * yahooFinance.ts
 * Now routes through backend API instead of browser-side CORS proxies.
 * Kept for backward compatibility with components that import from this file.
 */

import { getMarketQuote, getMarketHistory as getBackendHistory } from './marketData'
import type { MarketQuote, MarketHistoryPoint } from './marketData'

export interface StockQuote {
  ticker:        string
  price:         number
  change:        number
  changePercent: number
  prevClose:     number
  currency:      string
}

export interface ChartPoint { date: string; close: number }

// ── Quote ────────────────────────────────────────────────────────────────────
export async function fetchQuote(ticker: string): Promise<StockQuote> {
  const quote = await getMarketQuote(ticker)
  if (!quote) {
    throw new Error(`Quote unavailable for ${ticker}`)
  }

  return {
    ticker,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    prevClose: quote.prevClose,
    currency: quote.currency,
  }
}

// ── History ──────────────────────────────────────────────────────────────────
export async function fetchHistory(
  ticker: string,
  range = '1mo',
  locale = 'id-ID'
): Promise<ChartPoint[]> {
  const data = await getBackendHistory(ticker, range)

  if (!data.length) return []

  return data.map(p => ({
    date: new Date(p.time).toLocaleDateString(locale, { day: '2-digit', month: 'short' }),
    close: p.price,
  })).filter(p => p.close > 0)
}

// ── Batch quotes ─────────────────────────────────────────────────────────────
export async function fetchMultiQuote(tickers: string[]): Promise<StockQuote[]> {
  const results = await Promise.allSettled(tickers.map(fetchQuote))
  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
    .map(r => r.value)
}
