/**
 * morningCommandModel.ts
 * Pure logic layer for Morning Command.
 * Derives risk state from portfolio intelligence — zero UI code.
 */

import type { RiskStateKey } from './morningCommandI18n'
import { getPortfolioIntelligence } from './portfolioIntelligence'
import { readPortfolioSnapshot, toPortfolioSummaryResponse } from './portfolioSnapshot'
import type { LanguageCode } from './language'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface MorningCommandState {
  riskLevel: RiskLevel
  stateKey: RiskStateKey
  hasPortfolio: boolean
  topAssetLabel: string
  concentrationPct: number
  assetCount: number
}

/**
 * Map portfolioTone from intelligence to our tristate risk model.
 */
const toneToRiskLevel = (tone: string): RiskLevel => {
  switch (tone) {
    case 'bearish':
    case 'volatile':
      return 'high'
    case 'cautious':
      return 'medium'
    case 'neutral':
    case 'bullish':
    default:
      return 'low'
  }
}

const riskLevelToStateKey = (level: RiskLevel): RiskStateKey => {
  switch (level) {
    case 'high':
      return 'riskRising'
    case 'medium':
      return 'riskWatch'
    case 'low':
    default:
      return 'riskCalm'
  }
}

/**
 * Compute the morning command state from stored portfolio data.
 * This is the single function the UI calls.
 */
export const computeMorningCommandState = (language: LanguageCode): MorningCommandState => {
  const snapshot = readPortfolioSnapshot()

  if (!snapshot.hasPortfolio || !snapshot.holdings.length) {
    return {
      riskLevel: 'low',
      stateKey: 'riskCalm',
      hasPortfolio: false,
      topAssetLabel: '',
      concentrationPct: 0,
      assetCount: 0,
    }
  }

  const normalizedPortfolio = toPortfolioSummaryResponse(snapshot)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const intelligence = getPortfolioIntelligence(normalizedPortfolio as any, language)

  const tone = intelligence?.portfolioTone ?? 'neutral'
  const riskLevel = toneToRiskLevel(tone)
  const stateKey = riskLevelToStateKey(riskLevel)
  const topAssetLabel = intelligence?.largestPosition?.label ?? ''
  const concentrationPct = intelligence?.largestPosition?.weight ?? 0
  const assetCount = intelligence?.allocation?.length ?? 0

  return {
    riskLevel,
    stateKey,
    hasPortfolio: true,
    topAssetLabel,
    concentrationPct,
    assetCount,
  }
}
