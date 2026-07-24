/**
 * marketOverviewService.ts
 * Fetch market overview data for empty portfolio state
 * 
 * PRINCIPLE: No fake data. Ever.
 * - If API succeeds: show real quotes
 * - If API fails: show empty state with honest "data unavailable" message
 * - If cached data exists: show cache with clear label
 * - Never show hardcoded dummy prices (IHSG 7500, BTC 42K, etc.)
 */

import { API_URL } from './api'

export type MarketQuote = {
  symbol: string
  name: string
  price: number | null          // null if unavailable
  change: number | null
  changePercent: number | null
  timestamp: number
  source: 'live' | 'cache'      // no 'fallback' with fake data
}

export type MarketOverview = {
  quotes: Record<string, MarketQuote | null>
  loaded: boolean               // true only if API succeeded
  error: string | null
  lastUpdate: number
  hasCachedData: boolean        // true if showing previous cached data
}

/**
 * Fetch market quotes from backend
 * Returns:
 * - Real data if API succeeds
 * - Empty quotes (null values) if API fails or timeout
 * - Never returns dummy/fake prices
 */
async function fetchMarketQuotes(): Promise<Record<string, MarketQuote | null>> {
  try {
    const response = await fetch(`${API_URL}/api/market/quotes?symbols=IHSG,BTC,XAUUSD,SP500,USDIDR`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000), // 5s timeout
    })

    if (!response.ok) {
      throw new Error(`Market API returned ${response.status}`)
    }

    const data = await response.json()
    if (!data.ok) {
      throw new Error(data.error || `Market API returned ${response.status}`)
    }

    const record: Record<string, MarketQuote> = {}
    if (Array.isArray(data.quotes)) {
      data.quotes.forEach((q: any) => {
        const sym = q.symbol || q.displaySymbol
        record[sym] = {
          symbol: sym,
          name: q.name || sym,
          price: q.price,
          change: null, // Note: backend only returns changePercent
          changePercent: q.changePercent,
          timestamp: q.lastUpdated ? new Date(q.lastUpdated).getTime() : Date.now(),
          source: q.dataStatus === 'cached' ? 'cache' : 'live'
        }
      })
    }
    return record
  } catch (error) {
    console.warn('Market quote fetch failed (no fallback dummy data):', error)
    // Return empty quotes (null values) - NOT fake data
    // This signals to UI that data is unavailable
    return {}
  }
}

/**
 * Fetch market overview for empty portfolio state
 * Principle: No fake data
 * 
 * Returns:
 * - loaded: true only if real API data received
 * - quotes: empty object if API failed (UI shows "unavailable")
 * - hasCachedData: true if using previously cached real data
 */
export async function fetchMarketOverview(): Promise<MarketOverview> {
  const startTime = Date.now()

  try {
    const quotes = await fetchMarketQuotes()
    
    // Check if we got real data from API
    const hasRealData = Object.keys(quotes).length > 0 && 
                        Object.values(quotes).some(q => q !== null)
    
    return {
      quotes,
      loaded: hasRealData,         // true only if got real data
      error: null,
      lastUpdate: startTime,
      hasCachedData: false,
    }
  } catch (error) {
    console.error('Market overview error:', error)
    return {
      quotes: {},                   // empty, not fallback dummies
      loaded: false,
      error: String(error),
      lastUpdate: startTime,
      hasCachedData: false,
    }
  }
}

/**
 * Format percentage for display
 * Returns "—" if value is null (data unavailable)
 * Positive: +1.23% (green), Negative: -1.23% (red)
 */
export function formatChangePercent(changePercent: number | null): string {
  if (changePercent === null || changePercent === undefined) {
    return '—'  // Honest display when unavailable
  }
  const sign = changePercent >= 0 ? '+' : ''
  return `${sign}${changePercent.toFixed(2)}%`
}

/**
 * Format price for display
 * Returns "—" if price is null (data unavailable)
 * Different formats per symbol
 */
export function formatPrice(symbol: string, price: number | null): string {
  if (price === null || price === undefined) {
    return '—'  // Honest display when unavailable
  }
  
  switch (symbol) {
    case 'XAUUSD':
      return `$${price.toFixed(0)}`
    case 'BTC':
      return `$${price.toFixed(0)}`
    case 'SP500':
      return `${price.toFixed(0)}`
    case 'IHSG':
      return `${Math.round(price).toLocaleString('id-ID')}`
    case 'USDIDR':
      return `Rp ${Math.round(price).toLocaleString('id-ID')}`
    default:
      return `${price.toFixed(2)}`
  }
}

/**
 * Get color for change indicator
 * Returns gray if changePercent is null (data unavailable)
 * Green for positive, Red for negative
 */
export function getChangeColor(changePercent: number | null): string {
  if (changePercent === null || changePercent === undefined) {
    return '#94a3b8'  // Gray/neutral when unavailable
  }
  if (changePercent > 0.5) return '#34d399' // emerald (positive)
  if (changePercent < -0.5) return '#f87171' // red (negative)
  return '#94a3b8' // slate (neutral)
}
