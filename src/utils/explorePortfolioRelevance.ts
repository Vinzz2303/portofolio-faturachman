/**
 * explorePortfolioRelevance.ts
 * Generates portfolio-aware relevance insights for Explore Intelligence.
 */
import type { StoredPosition } from './portfolioStorage'
import type { NormalizedPortfolioHolding } from './portfolioSnapshot'
import type { LanguageCode } from './language'

export interface RelevanceItem {
  symbol: string
  relevanceLevel: 'high' | 'medium' | 'low'
  title: string
  description: string
  proLocked?: boolean
}

interface RelevanceInput {
  portfolioPositions: Array<StoredPosition | NormalizedPortfolioHolding>
  language: LanguageCode
  userPlan: string
  selectedTicker: string
}

function pct(n: number): string {
  return n.toFixed(1) + '%'
}

export function getPortfolioRelevance({ portfolioPositions, language, userPlan, selectedTicker }: RelevanceInput): RelevanceItem[] {
  if (!portfolioPositions.length) return []
  if (!selectedTicker) return []
  
  const isEn = language === 'en'
  const isFree = userPlan === 'free'

  const getRawWeight = (position: StoredPosition | NormalizedPortfolioHolding) => {
    const snapshotWeight = Number((position as NormalizedPortfolioHolding).allocationPercent)
    if (Number.isFinite(snapshotWeight) && snapshotWeight > 0) return snapshotWeight

    const marketValue = Number((position as NormalizedPortfolioHolding).marketValueIdr ?? (position as StoredPosition).currentValue)
    if (Number.isFinite(marketValue) && marketValue > 0) return marketValue

    const quantity = Number((position as StoredPosition).quantity ?? 0)
    const entryPrice = Number((position as StoredPosition).entryPrice ?? (position as NormalizedPortfolioHolding).avgBuyPrice ?? 0)
    const fallbackValue = quantity * entryPrice
    return Number.isFinite(fallbackValue) && fallbackValue > 0 ? fallbackValue : 0
  }

  const rawTotal = portfolioPositions.reduce((sum, position) => sum + getRawWeight(position), 0)
  if (rawTotal <= 0) return []

  const weighted = portfolioPositions.map(p => {
    const rawWeight = getRawWeight(p)
    const existingAllocation = Number((p as NormalizedPortfolioHolding).allocationPercent)
    const weight = Number.isFinite(existingAllocation) && existingAllocation > 0
      ? existingAllocation
      : (rawWeight / rawTotal) * 100
    return { ...p, rawWeight, weight }
  }).sort((a, b) => b.weight - a.weight)

  const results: RelevanceItem[] = []

  // Check if selected ticker is in portfolio
  // We do a loose match because selectedTicker might be 'BTC-USD' and portfolio might have 'BTC'
  const normalizedSelected = selectedTicker.replace('-USD', '').replace('^', '').toUpperCase()
  
  const exactMatch = weighted.find(p => p.symbol.toUpperCase() === normalizedSelected)

  if (exactMatch) {
    const isConcentrated = exactMatch.weight > 40
    let relevanceLevel: 'high' | 'medium' | 'low' = 'low'
    
    if (isConcentrated) {
      relevanceLevel = 'high'
      results.push({
        symbol: exactMatch.symbol,
        relevanceLevel,
        title: isEn ? `High Exposure to ${exactMatch.symbol}` : `Eksposur Tinggi ke ${exactMatch.symbol}`,
        description: isEn
          ? `You hold ${pct(exactMatch.weight)} of your portfolio in this asset. News and movements here will significantly impact your total wealth.`
          : `Aset ini mendominasi ${pct(exactMatch.weight)} portofolio Anda. Pergerakan berita dan harga di sini akan sangat berdampak pada total kekayaan Anda.`
      })
    } else if (exactMatch.weight > 15) {
      relevanceLevel = 'medium'
      results.push({
        symbol: exactMatch.symbol,
        relevanceLevel,
        title: isEn ? `Moderate Exposure to ${exactMatch.symbol}` : `Eksposur Moderat ke ${exactMatch.symbol}`,
        description: isEn
          ? `You hold ${pct(exactMatch.weight)} in this asset. It is a meaningful part of your strategy.`
          : `Anda memiliki porsi ${pct(exactMatch.weight)} di aset ini. Ini adalah bagian yang cukup signifikan dari strategi Anda.`
      })
    } else {
      relevanceLevel = 'low'
      results.push({
        symbol: exactMatch.symbol,
        relevanceLevel,
        title: isEn ? `Minor Exposure to ${exactMatch.symbol}` : `Eksposur Kecil ke ${exactMatch.symbol}`,
        description: isEn
          ? `You only hold ${pct(exactMatch.weight)} in this asset. Its direct impact is limited.`
          : `Anda hanya memegang ${pct(exactMatch.weight)} di aset ini. Dampak langsungnya cukup terbatas.`
      })
    }
  } else {
    // Ticker is not in portfolio. Let's do asset class correlation.
    const isCrypto = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'].includes(normalizedSelected)
    const isUS = ['SPY', 'QQQ'].includes(normalizedSelected)
    const isID = ['JKSE'].includes(normalizedSelected)

    // Check what the user holds
    const userHoldsCrypto = weighted.some(p => ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'].includes(p.symbol.toUpperCase()))
    const userHoldsUS = weighted.some(p => ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META'].includes(p.symbol.toUpperCase()))
    const userHoldsID = weighted.some(p => ['BBCA', 'BMRI', 'BBRI', 'TLKM', 'ASII', 'GOTO'].includes(p.symbol.toUpperCase()))

    if (isCrypto && userHoldsCrypto) {
      results.push({
        symbol: normalizedSelected,
        relevanceLevel: 'medium',
        title: isEn ? `Crypto Market Correlation` : `Korelasi Pasar Crypto`,
        description: isEn
          ? `You don't hold ${normalizedSelected} directly, but you hold other crypto assets. Crypto markets are highly correlated, so this chart's trend will likely pull your crypto holdings with it.`
          : `Anda tidak memegang ${normalizedSelected} secara langsung, tetapi Anda memiliki aset crypto lain. Pasar crypto sangat berkorelasi, pergerakan tren di sini kemungkinan besar akan menarik aset Anda.`
      })
    } else if (isUS && userHoldsUS) {
      results.push({
        symbol: normalizedSelected,
        relevanceLevel: 'high',
        title: isEn ? `US Market Beta` : `Beta Pasar AS`,
        description: isEn
          ? `You hold US tech/blue-chip stocks. This index (${normalizedSelected}) represents the broader market sentiment that will dictate the direction of your individual US stock holdings.`
          : `Anda memiliki saham teknologi/blue-chip AS. Indeks ini (${normalizedSelected}) mewakili sentimen pasar makro yang akan mendikte arah pergerakan saham AS Anda.`
      })
    } else if (isID && userHoldsID) {
      results.push({
        symbol: normalizedSelected,
        relevanceLevel: 'high',
        title: isEn ? `Domestic Market Beta` : `Beta Pasar Domestik`,
        description: isEn
          ? `You hold Indonesian equities. The IDX Composite (${normalizedSelected}) reflects foreign flow and domestic liquidity that will impact your local portfolio.`
          : `Anda memiliki saham Indonesia. IHSG (${normalizedSelected}) mencerminkan arus dana asing dan likuiditas domestik yang akan berdampak pada portofolio lokal Anda.`
      })
    } else {
      // No direct correlation found
      results.push({
        symbol: normalizedSelected,
        relevanceLevel: 'low',
        title: isEn ? `Diversification Opportunity` : `Peluang Diversifikasi`,
        description: isEn
          ? `You currently have no exposure to this asset class. Monitoring ${normalizedSelected} can help you spot opportunities to diversify your portfolio.`
          : `Anda saat ini tidak memiliki eksposur ke kelas aset ini. Memantau ${normalizedSelected} bisa membantu Anda mencari peluang untuk mendiversifikasi portofolio.`
      })
    }
  }

  // Handle Pro lock logic if multiple results are added in the future
  return results.map((item, i) => {
    if (isFree && i > 0) {
      return { ...item, proLocked: true }
    }
    return item
  })
}

