import type { LanguageCode } from './language'
import { getAssetTypeLabel, normalizeDisplaySymbol } from './assetNormalization'
import { isIdxSymbol, type NormalizedPortfolioHolding, type NormalizedPortfolioSnapshot } from './portfolioSnapshot'

export type PortfolioActionWatchlistItem = {
  symbol: string
  name: string
  allocationPercent: number
  assetType: string
  title: string
  reason: string
  whatToWatch: string
  riskTag: string
  badges: string[]
  dataStatus: 'delayed' | 'cached' | 'unavailable' | 'limited'
  source: string
}

const normalizeAssetType = (assetType?: string | null) => (assetType || '').toLowerCase()

const isGoldHolding = (holding: NormalizedPortfolioHolding) => {
  const symbol = holding.symbol.toUpperCase()
  const assetType = normalizeAssetType(holding.assetType)
  return symbol === 'XAU' || symbol.includes('XAU') || symbol.includes('GOLD') || assetType === 'gold' || assetType === 'commodity'
}

const isCryptoHolding = (holding: NormalizedPortfolioHolding) =>
  normalizeAssetType(holding.assetType) === 'crypto' || /^(BTC|ETH|SOL|BNB|XRP)/i.test(holding.symbol)

const isUsStockHolding = (holding: NormalizedPortfolioHolding) => {
  const assetType = normalizeAssetType(holding.assetType)
  return (assetType === 'stock' || assetType === 'us_stock') && !isIdxSymbol(holding.symbol) && holding.exchange !== 'IDX'
}

const hasMarketData = (holding: NormalizedPortfolioHolding) =>
  Boolean(holding.currentPrice || holding.marketValueIdr) &&
  holding.supportStatus !== 'data_limited' &&
  holding.source !== 'manual'

const pct = (value: number, language: LanguageCode) =>
  new Intl.NumberFormat(language === 'en' ? 'en-US' : 'id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)

const getSensitivity = (holding: NormalizedPortfolioHolding, language: LanguageCode) => {
  if (isCryptoHolding(holding)) {
    return language === 'en'
      ? 'Monitor crypto volatility, liquidity, and broad risk appetite.'
      : 'Pantau volatilitas crypto, likuiditas, dan risk appetite pasar.'
  }

  if (isGoldHolding(holding)) {
    return language === 'en'
      ? 'Monitor USD direction, bond yields, and safe-haven sentiment.'
      : 'Pantau arah USD, imbal hasil obligasi, dan sentimen safe haven.'
  }

  if (isIdxSymbol(holding.symbol) || holding.exchange === 'IDX') {
    return language === 'en'
      ? 'Monitor IHSG, sector movement, and domestic risk sentiment.'
      : 'Pantau IHSG, pergerakan sektor, dan sentimen risiko domestik.'
  }

  if (isUsStockHolding(holding)) {
    return language === 'en'
      ? 'Monitor US market direction, rates, and sector sentiment.'
      : 'Pantau arah US market, suku bunga, dan sentimen sektornya.'
  }

  return language === 'en'
    ? 'Monitor market context and whether this exposure is becoming more dominant.'
    : 'Pantau konteks market dan apakah eksposur ini makin dominan.'
}

const getRiskTag = (holding: NormalizedPortfolioHolding, isLargest: boolean, language: LanguageCode) => {
  if (holding.allocationPercent > 40) return language === 'en' ? 'High concentration' : 'Konsentrasi tinggi'
  if (isCryptoHolding(holding)) return language === 'en' ? 'High volatility' : 'Volatilitas tinggi'
  if (isGoldHolding(holding)) return language === 'en' ? 'USD/yield sensitive' : 'Sensitif ke USD/yield'
  if (isIdxSymbol(holding.symbol) || holding.exchange === 'IDX') return language === 'en' ? 'IHSG/sector sensitive' : 'Sensitif ke IHSG/sektor'
  if (isLargest) return language === 'en' ? 'Largest weight' : 'Bobot terbesar'
  return language === 'en' ? 'Portfolio exposure' : 'Eksposur portofolio'
}

const getDataStatus = (holding: NormalizedPortfolioHolding): PortfolioActionWatchlistItem['dataStatus'] => {
  if (!hasMarketData(holding)) return 'unavailable'
  if (holding.supportStatus === 'data_limited') return 'limited'
  return 'delayed'
}

export const buildPortfolioActionWatchlist = (
  snapshot: NormalizedPortfolioSnapshot,
  language: LanguageCode,
  maxItems = 5
): PortfolioActionWatchlistItem[] => {
  if (!snapshot.hasPortfolio || !snapshot.holdings.length) return []

  const sorted = [...snapshot.holdings]
    .filter((holding) => holding.allocationPercent > 0)
    .sort((a, b) => b.allocationPercent - a.allocationPercent)

  return sorted.slice(0, maxItems).map((holding, index) => {
    const isLargest = index === 0
    const formattedWeight = pct(holding.allocationPercent, language)
    const dataStatus = getDataStatus(holding)
    const riskTag = getRiskTag(holding, isLargest, language)
    const displaySymbol = normalizeDisplaySymbol(holding.symbol)
    const inferredAssetType = holding.assetType || 'other'
    const badges = [
      isLargest ? (language === 'en' ? 'Largest weight' : 'Bobot terbesar') : '',
      holding.allocationPercent > 40 ? (language === 'en' ? 'High concentration' : 'Konsentrasi tinggi') : '',
      isCryptoHolding(holding) ? (language === 'en' ? 'High volatility' : 'Volatilitas tinggi') : '',
      getAssetTypeLabel(inferredAssetType, language),
      dataStatus === 'delayed' ? (language === 'en' ? 'Delayed data' : 'Data tertunda') : '',
      dataStatus === 'unavailable' || dataStatus === 'limited' ? (language === 'en' ? 'Limited data' : 'Data terbatas') : '',
    ].filter(Boolean)

    const title = isLargest
      ? language === 'en'
        ? `${displaySymbol} matters most to your portfolio`
        : `${displaySymbol} paling memengaruhi portofolio`
      : language === 'en'
      ? `${displaySymbol} is worth monitoring`
      : `${displaySymbol} perlu dipantau`

    const reason = dataStatus === 'unavailable'
      ? language === 'en'
        ? `Its weight is ${formattedWeight}%, but market data is not available yet. Read it as portfolio exposure, not a live price signal.`
        : `Bobotnya ${formattedWeight}%, tapi data market belum tersedia. Baca ini sebagai eksposur portofolio, bukan sinyal harga live.`
      : language === 'en'
      ? `${displaySymbol} weighs ${formattedWeight}% of your portfolio, so its movement can affect your total exposure.`
      : `Bobot ${displaySymbol} adalah ${formattedWeight}%, sehingga pergerakannya bisa terasa ke total portofolio.`

    return {
      symbol: holding.symbol,
      name: holding.name || displaySymbol,
      allocationPercent: holding.allocationPercent,
      assetType: inferredAssetType,
      title,
      reason,
      whatToWatch: getSensitivity(holding, language),
      riskTag,
      badges,
      dataStatus,
      source: holding.source || snapshot.dataSource,
    }
  })
}

export const formatActionWatchlistForCopilot = (
  items: PortfolioActionWatchlistItem[],
  language: LanguageCode
) => {
  if (!items.length) return ''
  const prefix = language === 'en' ? 'Personal watchlist' : 'Pantauan pribadi'
  return `${prefix}: ${items
    .slice(0, 5)
    .map((item) => `${normalizeDisplaySymbol(item.symbol)} ${item.allocationPercent.toFixed(1)}% - ${item.riskTag}; ${item.whatToWatch}`)
    .join(' | ')}`
}
