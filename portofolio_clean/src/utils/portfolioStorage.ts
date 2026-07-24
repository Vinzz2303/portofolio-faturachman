/**
 * portfolioStorage.ts
 * Single source of truth for reading portfolio positions from localStorage.
 * Used by KomandoPagi, Dashboard, ExploreIntelligence, and any component
 * that needs portfolio state without being inside Portfolio.tsx.
 */

import {
  PORTFOLIO_POSITIONS_KEY,
  readPortfolioSnapshot,
  toPortfolioSummaryResponse,
} from './portfolioSnapshot'

export const PORTFOLIO_STORAGE_KEY = PORTFOLIO_POSITIONS_KEY

export interface StoredPosition {
  id: string
  symbol: string
  name: string
  assetType: 'stock' | 'crypto' | 'commodity'
  assetCurrency?: 'IDR' | 'USD'
  region: 'ID' | 'GLOBAL'
  quantity: number
  entryPrice: number
  entryCurrency: 'IDR' | 'USD'
  currentValue?: number
  currentPrice?: number
  pnl?: number
  pnlPct?: number
}

/** Default demo positions — mirrors Portfolio.tsx DEFAULT_POSITIONS.
 *  Used as fallback so all pages show consistent data before user customizes. */
export const DEFAULT_STORED_POSITIONS: StoredPosition[] = [
  {
    id: 'pos-init-1', symbol: 'XAU', name: 'Gold (XAU/USD)',
    assetType: 'commodity', assetCurrency: 'USD', region: 'GLOBAL',
    quantity: 2.5, entryPrice: 38234399, entryCurrency: 'IDR'
  },
  {
    id: 'pos-init-2', symbol: 'BTC', name: 'Bitcoin',
    assetType: 'crypto', assetCurrency: 'USD', region: 'GLOBAL',
    quantity: 0.08, entryPrice: 96500, entryCurrency: 'USD'
  },
  {
    id: 'pos-init-3', symbol: 'BBCA.JK', name: 'Bank Central Asia',
    assetType: 'stock', assetCurrency: 'IDR', region: 'ID',
    quantity: 5000, entryPrice: 8500, entryCurrency: 'IDR'
  },
  {
    id: 'pos-init-4', symbol: 'BMRI.JK', name: 'Bank Mandiri',
    assetType: 'stock', assetCurrency: 'IDR', region: 'ID',
    quantity: 10000, entryPrice: 6000, entryCurrency: 'IDR'
  },
]

export function getPortfolioStorage(): StoredPosition[] {
  try {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return []
    return parsed as StoredPosition[]
  } catch {
    return []
  }
}

// Async-compatible alias for Dashboard.tsx (which expects PortfolioSummaryResponse)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCurrentPortfolioSnapshot = (): Promise<any> =>
  Promise.resolve(toPortfolioSummaryResponse(readPortfolioSnapshot()))
