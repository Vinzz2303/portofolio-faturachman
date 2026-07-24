import type {
  ConcentrationLevel,
  ExposureLevel,
  RiskLevel,
  TingAIOutput
} from '../../tingai/types'

const SESSION_KEY = 'ting-ai.dashboard-insight.change-awareness.v1'

export type InsightSnapshot = {
  dominantAsset: string
  riskLevel: RiskLevel
  marketExposure: ExposureLevel
  concentrationLevel: ConcentrationLevel
  capturedAt: number
}

export type InsightChangeDriver = 'risk' | 'exposure' | 'concentration' | 'mixed' | 'stable'

export type InsightChangeAwareness = {
  direction: 'improved' | 'worsened' | 'steady'
  driver: InsightChangeDriver
}

function scoreLevel(level: RiskLevel | ExposureLevel | ConcentrationLevel) {
  switch (level) {
    case 'High':
      return 3
    case 'Medium':
      return 2
    case 'Low':
      return 1
  }
}

export function createInsightSnapshot(data: TingAIOutput): InsightSnapshot {
  return {
    dominantAsset: data.portfolio_overview.dominant_asset,
    riskLevel: data.impact_on_portfolio.risk_level,
    marketExposure: data.portfolio_overview.market_exposure,
    concentrationLevel: data.portfolio_overview.concentration_level,
    capturedAt: Date.now()
  }
}

export function readStoredInsightSnapshot(): InsightSnapshot | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as InsightSnapshot
    if (
      !parsed ||
      typeof parsed.dominantAsset !== 'string' ||
      typeof parsed.capturedAt !== 'number'
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function storeInsightSnapshot(snapshot: InsightSnapshot) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore session storage issues to keep the dashboard resilient.
  }
}

export function compareInsightSnapshots(
  previous: InsightSnapshot,
  current: InsightSnapshot
): InsightChangeAwareness {
  const riskDelta = scoreLevel(current.riskLevel) - scoreLevel(previous.riskLevel)
  const exposureDelta = scoreLevel(current.marketExposure) - scoreLevel(previous.marketExposure)
  const concentrationDelta =
    scoreLevel(current.concentrationLevel) - scoreLevel(previous.concentrationLevel)

  const weightedDelta = riskDelta * 3 + exposureDelta * 2 + concentrationDelta

  if (weightedDelta >= 2 || riskDelta >= 1) {
    return {
      direction: 'worsened',
      driver:
        riskDelta > 0
          ? 'risk'
          : exposureDelta > 0
            ? 'exposure'
            : concentrationDelta > 0
              ? 'concentration'
              : 'mixed'
    }
  }

  if (weightedDelta <= -2 || riskDelta <= -1) {
    return {
      direction: 'improved',
      driver:
        riskDelta < 0
          ? 'risk'
          : exposureDelta < 0
            ? 'exposure'
            : concentrationDelta < 0
              ? 'concentration'
              : 'mixed'
    }
  }

  return {
    direction: 'steady',
    driver:
      previous.dominantAsset === current.dominantAsset &&
      previous.riskLevel === current.riskLevel &&
      previous.marketExposure === current.marketExposure &&
      previous.concentrationLevel === current.concentrationLevel
        ? 'stable'
        : 'mixed'
  }
}
