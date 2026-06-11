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
}

function pct(n: number): string {
  return n.toFixed(1) + '%'
}

export function getPortfolioRelevance({ portfolioPositions, language, userPlan }: RelevanceInput): RelevanceItem[] {
  if (!portfolioPositions.length) return []
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

  const topHolding = weighted[0]
  const results: RelevanceItem[] = []

  for (let i = 0; i < Math.min(weighted.length, 3); i++) {
    const pos = weighted[i]
    const isTop = i === 0
    const isConcentrated = pos.weight > 40

    let title: string
    let description: string
    let relevanceLevel: 'high' | 'medium' | 'low'

    if (isTop && isConcentrated) {
      relevanceLevel = 'high'
      title = isEn
        ? `${pos.symbol} is your largest holding`
        : `${pos.symbol} adalah holding terbesar kamu`
      description = isEn
        ? `Because it makes up ${pct(pos.weight)} of your portfolio, movement in this asset may have a larger impact on your total value.`
        : `Karena porsinya ${pct(pos.weight)}, perubahan di aset ini dapat memberi dampak besar ke nilai portofolio.`
    } else if (isTop) {
      relevanceLevel = 'high'
      title = isEn
        ? `${pos.symbol} is your top position`
        : `${pos.symbol} adalah posisi utama kamu`
      description = isEn
        ? `It represents ${pct(pos.weight)} of your portfolio. Monitor closely for significant moves.`
        : `Aset ini mewakili ${pct(pos.weight)} portofolio. Pantau pergerakan signifikannya.`
    } else if (pos.weight > 20) {
      relevanceLevel = 'medium'
      title = isEn
        ? `${pos.symbol} — significant position`
        : `${pos.symbol} — posisi signifikan`
      description = isEn
        ? `At ${pct(pos.weight)} of your portfolio, changes here can meaningfully affect your overall returns.`
        : `Dengan porsi ${pct(pos.weight)}, perubahan aset ini cukup berpengaruh ke eksposur portofolio.`
    } else {
      relevanceLevel = 'low'
      title = isEn
        ? `${pos.symbol} — minor exposure`
        : `${pos.symbol} — eksposur kecil`
      description = isEn
        ? `Makes up ${pct(pos.weight)} of your portfolio. Limited impact on overall value.`
        : `Porsi ${pct(pos.weight)} dari portofolio. Dampak terbatas ke nilai keseluruhan.`
    }

    // For free users, lock detailed description after first item
    if (isFree && i > 0) {
      results.push({ symbol: pos.symbol, relevanceLevel, title, description, proLocked: true })
    } else {
      results.push({ symbol: pos.symbol, relevanceLevel, title, description })
    }
  }

  return results
}
