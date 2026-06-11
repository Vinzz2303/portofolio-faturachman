/**
 * stockService.ts
 * Fetches stock data via backend API. No browser-side CORS proxy.
 * If backend is unavailable, returns error status (never fake data).
 */
import type { StockQuote } from '../services/yahooFinance'
import { getMarketQuote } from '../services/marketData'
import { derivePercentChange, sanitizeMarketPercent } from '../utils/marketFormatting'

export type MarketAssetType = 'CRYPTO' | 'COMMODITY' | 'INDEX' | 'EQUITY' | 'FX'

export interface DetailedStockData {
  symbol: string
  yahooSymbol: string
  name: string
  price: number
  previousClose: number
  changePercent: number
  currency: string
  status: 'live' | 'delayed' | 'fallback' | 'error'
  source: string
  fetchedAt?: string
  type?: MarketAssetType
  unit?: string
}

const STOCK_NAMES: Record<string, string> = {
  'BBCA.JK': 'Bank Central Asia Tbk.',
  'BBRI.JK': 'Bank Rakyat Indonesia Tbk.',
  'BMRI.JK': 'Bank Mandiri (Persero) Tbk.',
  'BBNI.JK': 'Bank Negara Indonesia Tbk.',
  'TLKM.JK': 'Telkom Indonesia Tbk.',
  'GOTO.JK': 'GoTo Gojek Tokopedia Tbk.',
  'ASII.JK': 'Astra International Tbk.',
  'ADRO.JK': 'Adaro Energy Indonesia Tbk.',
  'PTBA.JK': 'Bukit Asam Tbk.',
  'ANTM.JK': 'Aneka Tambang Tbk.',
  'ICBP.JK': 'Indofood CBP Sukses Makmur Tbk.',
  'INDF.JK': 'Indofood Sukses Makmur Tbk.',
  'UNVR.JK': 'Unilever Indonesia Tbk.',
  'GC=F': 'Gold (XAU)',
  'SI=F': 'Silver (XAG)',
  'CL=F': 'Crude Oil (WTI)',
  'BTC-USD': 'Bitcoin (BTC)',
  'ETH-USD': 'Ethereum (ETH)',
  'SOL-USD': 'Solana (SOL)',
  'BNB-USD': 'BNB',
  'XRP-USD': 'XRP',
}

const IDX_SYMBOLS = [
  'BBCA.JK', 'BBRI.JK', 'BMRI.JK', 'BBNI.JK', 'TLKM.JK',
  'GOTO.JK', 'ASII.JK', 'ADRO.JK', 'PTBA.JK', 'ANTM.JK',
  'ICBP.JK', 'INDF.JK', 'UNVR.JK',
  'GC=F', 'SI=F', 'CL=F',
  'BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD',
]

/**
 * Map portfolio/display symbols → Yahoo Finance API symbols.
 * Portfolio stores "XAU", "BTC", "BBCA.JK" etc.
 * Yahoo Finance needs "GC=F", "BTC-USD", "BBCA.JK".
 */
const SYMBOL_MAP: Record<string, string> = {
  'XAU': 'GC=F',
  'XAUUSD': 'GC=F',
  'GOLD': 'GC=F',
  'XAG': 'SI=F',
  'XAGUSD': 'SI=F',
  'SILVER': 'SI=F',
  'OIL': 'CL=F',
  'WTI': 'CL=F',
  'CRUDE': 'CL=F',
  'BTC': 'BTC-USD',
  'BITCOIN': 'BTC-USD',
  'ETH': 'ETH-USD',
  'ETHEREUM': 'ETH-USD',
  'SOL': 'SOL-USD',
  'SOLANA': 'SOL-USD',
  'BNB': 'BNB-USD',
  'XRP': 'XRP-USD',
}

function toYahooSymbol(symbol: string): string {
  const upper = symbol.toUpperCase()
  // Check explicit commodity/crypto map
  if (SYMBOL_MAP[upper]) return SYMBOL_MAP[upper]
  // Pass through as-is — caller (Portfolio.tsx) is responsible for correct symbol
  return symbol
}

function getAssetMeta(symbol: string): { type: MarketAssetType; unit: string } {
  if (['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD'].includes(symbol)) {
    return { type: 'CRYPTO', unit: 'coin' }
  }
  if (symbol === 'GC=F' || symbol === 'SI=F') {
    return { type: 'COMMODITY', unit: 'oz' }
  }
  if (symbol === 'CL=F') {
    return { type: 'COMMODITY', unit: 'barrel' }
  }
  if (symbol === 'USDIDR=X') {
    return { type: 'FX', unit: 'rate' }
  }
  if (symbol.startsWith('^')) {
    return { type: 'INDEX', unit: 'points' }
  }
  return { type: 'EQUITY', unit: 'share' }
}

export async function fetchStock(yahooSymbol: string): Promise<DetailedStockData> {
  const apiSymbol = toYahooSymbol(yahooSymbol)
  const name = STOCK_NAMES[apiSymbol] || STOCK_NAMES[yahooSymbol] || yahooSymbol
  const displaySymbol = yahooSymbol.replace('.JK', '')
  const now = new Date().toISOString()
  const assetMeta = getAssetMeta(apiSymbol)

  try {
    const quote = await getMarketQuote(apiSymbol)

    if (!quote) {
      return {
        symbol: displaySymbol,
        yahooSymbol,
        name,
        price: 0,
        previousClose: 0,
        changePercent: 0,
        currency: 'IDR',
        status: 'error',
        source: 'Unavailable',
        fetchedAt: now,
        ...assetMeta,
      }
    }

    const cleanChangePercent = sanitizeMarketPercent(quote.changePercent, 35)
      ?? derivePercentChange(quote.price, quote.prevClose, 35)

    return {
      symbol: displaySymbol,
      yahooSymbol,
      name,
      price: quote.price,
      previousClose: quote.prevClose,
      changePercent: cleanChangePercent ?? 0,
      currency: quote.currency,
      status: cleanChangePercent === null ? 'fallback' : 'delayed',
      source: 'Backend API',
      fetchedAt: now,
      type: quote.type ?? assetMeta.type,
      unit: quote.unit ?? assetMeta.unit,
    }
  } catch {
    return {
      symbol: displaySymbol,
      yahooSymbol,
      name,
      price: 0,
      previousClose: 0,
      changePercent: 0,
      currency: 'IDR',
      status: 'error',
      source: 'Unavailable',
      fetchedAt: now,
      ...assetMeta,
    }
  }
}

export async function fetchIndonesianStocks(): Promise<DetailedStockData[]> {
  const results = await Promise.allSettled(IDX_SYMBOLS.map(fetchStock))

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value

    const yahooSymbol = IDX_SYMBOLS[i]
    return {
      symbol: yahooSymbol.replace('.JK', ''),
      yahooSymbol,
      name: STOCK_NAMES[yahooSymbol] || yahooSymbol,
      price: 0,
      previousClose: 0,
      changePercent: 0,
      currency: 'IDR',
      status: 'error' as const,
      source: 'Unavailable',
      ...getAssetMeta(yahooSymbol),
    }
  })
}

/**
 * Legacy compatibility layer
 */
export async function fetchStocks(): Promise<StockQuote[]> {
  const data = await fetchIndonesianStocks()
  return data
    .filter(s => s.status !== 'error' && s.price > 0)
    .map(s => ({
      ticker: s.yahooSymbol,
      price: s.price,
      changePercent: s.changePercent,
      change: s.price - s.previousClose,
      prevClose: s.previousClose,
      currency: s.currency,
    }))
}
