export type NormalizedAssetType =
  | 'indonesian_stock'
  | 'us_stock'
  | 'crypto'
  | 'gold'
  | 'cash'
  | 'mutual_fund'
  | 'other'

const IDX_TICKERS = new Set([
  'BBCA',
  'BMRI',
  'BBRI',
  'BBNI',
  'TLKM',
  'ANTM',
  'BUMI',
  'GOTO',
  'ASII',
  'BRIS',
  'UNTR',
  'MDKA',
  'PGAS',
  'INCO',
  'KLBF',
  'INDF',
  'ICBP',
  'AMMN',
  'BRPT',
  'ADRO',
  'PTBA',
  'ITMG',
  'UNVR',
  'MDKA',
  'MEDC',
  'EMTK',
  'BUKA',
  'WIFI',
  'PANI',
])

const US_TICKERS = new Set(['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'GOOGL', 'GOOG', 'META', 'NFLX', 'SPY', 'QQQ'])
const CRYPTO_SYMBOLS = new Set(['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX'])

const safeSymbol = (symbol?: string | null) => (symbol || '').trim()

export const normalizeDisplaySymbol = (symbol?: string | null) => {
  const original = safeSymbol(symbol)
  if (!original) return original
  const upper = original.toUpperCase()

  if (/^[A-Z0-9_-]+\.JK$/i.test(original)) {
    const withoutSuffix = upper.replace(/\.JK$/i, '')
    return withoutSuffix || original
  }
  if (/^[A-Z0-9]+-USD$/i.test(upper)) return upper.replace(/-USD$/i, '')
  if (upper === 'XAUUSD' || upper === 'XAU/USD' || upper === 'GC=F' || upper === 'GOLD') return 'XAU'

  return original
}

export const inferAssetTypeFromInput = (input?: string | null): NormalizedAssetType => {
  const upper = safeSymbol(input).toUpperCase()
  if (!upper) return 'other'
  const compact = upper.replace(/\s+/g, '')
  const bareIdx = compact.replace(/\.JK$/i, '')
  const bareUsdPair = compact.replace(/-USD$/i, '')

  if (/\.JK$/i.test(compact) || IDX_TICKERS.has(bareIdx)) return 'indonesian_stock'
  if (CRYPTO_SYMBOLS.has(compact) || CRYPTO_SYMBOLS.has(bareUsdPair) || /CRYPTO|KRIPTO|BITCOIN|ETHEREUM/.test(compact)) return 'crypto'
  if (/XAU|GOLD|EMAS|GC=F/.test(compact)) return 'gold'
  if (/^(USD|IDR|CASH|KAS|RUPIAH|DOLLAR|DOLAR)$/.test(compact)) return 'cash'
  if (US_TICKERS.has(compact)) return 'us_stock'
  return 'other'
}

export const getAssetTypeLabel = (assetType?: string | null, language: 'id' | 'en' = 'id') => {
  const normalized = (assetType || '').toLowerCase()
  if (normalized === 'indonesian_stock') return language === 'en' ? 'Indonesian Stock' : 'Saham Indonesia'
  if (normalized === 'us_stock' || normalized === 'stock') return language === 'en' ? 'US Stock' : 'Saham US'
  if (normalized === 'crypto') return 'Crypto'
  if (normalized === 'gold' || normalized === 'commodity') return language === 'en' ? 'Gold/XAU' : 'Emas/XAU'
  if (normalized === 'cash') return 'Cash'
  if (normalized === 'mutual_fund') return language === 'en' ? 'Mutual Fund' : 'Reksadana'
  return language === 'en' ? 'Other' : 'Lainnya'
}

export const assetTypeLabel = getAssetTypeLabel
