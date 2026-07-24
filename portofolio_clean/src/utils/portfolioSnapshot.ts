import type { PortfolioSummaryResponse } from '../types'
import { inferAssetTypeFromInput } from './assetNormalization'

export const PORTFOLIO_POSITIONS_KEY = 'tingai_portfolio_positions_v2'
export const PORTFOLIO_SNAPSHOT_KEY = 'tingai_portfolio_snapshot_v2_2_8'

export type PortfolioSnapshotMode = 'allocation_only' | 'real_pnl'
export type PortfolioSnapshotSource = 'user_portfolio' | 'demo' | 'empty'

export type NormalizedPortfolioHolding = {
  symbol: string
  name?: string
  assetType?: string
  allocationPercent: number
  quantity?: number
  currentPrice?: number | null
  currentPriceCurrency?: string | null
  marketValueIdr?: number | null
  avgBuyPrice?: number | null
  avgBuyPriceCurrency?: string | null
  costBasisIdr?: number | null
  pnlIdr?: number | null
  pnlPercent?: number | null
  currency?: string | null
  exchange?: string | null
  source?: string | null
  supportStatus?: string | null
}

export type NormalizedPortfolioSnapshot = {
  holdings: NormalizedPortfolioHolding[]
  totalValueIdr: number | null
  totalCostBasisIdr: number | null
  hasPortfolio: boolean
  hasRealPnLData: boolean
  mode: PortfolioSnapshotMode
  updatedAt: string | null
  dataSource: PortfolioSnapshotSource
}

export const emptyPortfolioSnapshot = (): NormalizedPortfolioSnapshot => ({
  holdings: [],
  totalValueIdr: null,
  totalCostBasisIdr: null,
  hasPortfolio: false,
  hasRealPnLData: false,
  mode: 'allocation_only',
  updatedAt: null,
  dataSource: 'empty',
})

const safeNumber = (value: unknown): number | null => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

const fallbackUsdIdrRate = 17150

export const isIdxSymbol = (symbol?: string | null) =>
  Boolean(symbol) && /\.JK$/i.test(symbol || '')

export const inferAssetCurrency = (payload: {
  symbol?: string | null
  assetType?: string | null
  region?: string | null
  currency?: string | null
}) => {
  if (payload.currency === 'IDR' || payload.currency === 'USD') return payload.currency
  if (isIdxSymbol(payload.symbol)) return 'IDR'
  if (payload.region === 'ID') return 'IDR'
  if (payload.assetType === 'crypto' || payload.assetType === 'commodity' || payload.assetType === 'gold') return 'USD'
  return 'USD'
}

export const formatAssetCurrency = (
  value: number | null | undefined,
  currency?: string | null,
  assetType?: string | null,
  symbol?: string | null
) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-'
  const resolvedCurrency = inferAssetCurrency({ symbol, assetType, currency })
  const locale = resolvedCurrency === 'IDR' ? 'id-ID' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: resolvedCurrency,
    maximumFractionDigits: resolvedCurrency === 'IDR' ? 0 : 2,
  }).format(value)
}

export const hasUsableUserPortfolioPositions = () => {
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_POSITIONS_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
  } catch {
    return false
  }
}

const normalizeSymbol = (symbol?: string | null) => (symbol || '').trim().toUpperCase()

const snapshotFromStoredPositions = (): NormalizedPortfolioSnapshot => {
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_POSITIONS_KEY)
    if (!raw) return emptyPortfolioSnapshot()
    const parsed = JSON.parse(raw) as any[]
    if (!Array.isArray(parsed) || !parsed.length) return emptyPortfolioSnapshot()

    const rawHoldings = parsed
      .map((position) => {
        const symbol = normalizeSymbol(position.symbol)
        const inferredAssetType = position.assetType === 'stock' && (position.region === 'ID' || isIdxSymbol(symbol))
          ? 'indonesian_stock'
          : position.assetType || inferAssetTypeFromInput(symbol)
        const quantity = Number(position.quantity || 0)
        const currentValue = safeNumber(position.currentValue)
        const entryPrice = safeNumber(position.entryPrice)
        const entryCurrency = inferAssetCurrency({
          symbol,
          assetType: inferredAssetType,
          region: position.region,
          currency: position.entryCurrency || position.assetCurrency,
        })
        const fallbackCostBasis = quantity > 0 && entryPrice !== null
          ? quantity * entryPrice * (entryCurrency === 'USD' ? fallbackUsdIdrRate : 1)
          : null
        const marketValueIdr = currentValue !== null && currentValue > 0
          ? currentValue
          : fallbackCostBasis

        return {
          symbol,
          name: position.name || symbol,
          assetType: inferredAssetType,
          quantity,
          currentPrice: safeNumber(position.currentPrice),
          currentPriceCurrency: inferAssetCurrency({
            symbol,
            assetType: inferredAssetType,
            region: position.region,
            currency: position.assetCurrency,
          }),
          marketValueIdr,
          currency: inferAssetCurrency({
            symbol,
            assetType: inferredAssetType,
            region: position.region,
            currency: position.assetCurrency,
          }),
          exchange: position.region === 'ID' || isIdxSymbol(symbol) ? 'IDX' : undefined,
          source: 'stored_position',
          supportStatus: 'allocation_only',
        }
      })
      .filter((holding) => holding.symbol)

    const totalValueIdr = rawHoldings.reduce((sum, holding) => sum + (holding.marketValueIdr || 0), 0)
    const holdings = rawHoldings.map((holding) => ({
      ...holding,
      allocationPercent: totalValueIdr > 0 && holding.marketValueIdr
        ? (holding.marketValueIdr / totalValueIdr) * 100
        : 0,
      avgBuyPrice: null,
      avgBuyPriceCurrency: null,
      costBasisIdr: null,
      pnlIdr: null,
      pnlPercent: null,
    }))

    return {
      holdings,
      totalValueIdr: totalValueIdr > 0 ? totalValueIdr : null,
      totalCostBasisIdr: null,
      hasPortfolio: holdings.length > 0,
      hasRealPnLData: false,
      mode: 'allocation_only',
      updatedAt: new Date().toISOString(),
      dataSource: 'user_portfolio',
    }
  } catch {
    return emptyPortfolioSnapshot()
  }
}

export const readPortfolioSnapshot = (): NormalizedPortfolioSnapshot => {
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_SNAPSHOT_KEY)
    if (!raw) return snapshotFromStoredPositions()
    const parsed = JSON.parse(raw) as Partial<NormalizedPortfolioSnapshot>
    if (!Array.isArray(parsed.holdings) || !parsed.holdings.length) return snapshotFromStoredPositions()

    const holdings = parsed.holdings.map((holding) => ({
      ...holding,
      symbol: normalizeSymbol(holding.symbol),
      assetType: holding.assetType === 'stock' && (holding.exchange === 'IDX' || isIdxSymbol(holding.symbol))
        ? 'indonesian_stock'
        : holding.assetType || inferAssetTypeFromInput(holding.symbol),
      exchange: holding.exchange || (isIdxSymbol(holding.symbol) || inferAssetTypeFromInput(holding.symbol) === 'indonesian_stock' ? 'IDX' : undefined),
    }))

    return {
      holdings,
      totalValueIdr: safeNumber(parsed.totalValueIdr),
      totalCostBasisIdr: safeNumber(parsed.totalCostBasisIdr),
      hasPortfolio: parsed.hasPortfolio === true,
      hasRealPnLData: parsed.hasRealPnLData === true,
      mode: parsed.mode === 'real_pnl' ? 'real_pnl' : 'allocation_only',
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      dataSource: parsed.dataSource === 'demo' || parsed.dataSource === 'user_portfolio' ? parsed.dataSource : 'empty',
    }
  } catch {
    return snapshotFromStoredPositions()
  }
}

export const writePortfolioSnapshot = (snapshot: NormalizedPortfolioSnapshot) => {
  try {
    window.localStorage.setItem(PORTFOLIO_SNAPSHOT_KEY, JSON.stringify(snapshot))
    window.dispatchEvent(new Event('tingai-portfolio-snapshot'))
  } catch {
    // Keep portfolio UI usable even when storage is unavailable.
  }
}

export const toPortfolioSummaryResponse = (
  snapshot: NormalizedPortfolioSnapshot
): PortfolioSummaryResponse | null => {
  if (!snapshot.hasPortfolio) return null

  return {
    summary: {
      totalCurrentValue: snapshot.totalValueIdr || 0,
      totalInvested: snapshot.totalCostBasisIdr || 0,
      totalPnl: snapshot.hasRealPnLData && snapshot.totalValueIdr !== null && snapshot.totalCostBasisIdr !== null
        ? snapshot.totalValueIdr - snapshot.totalCostBasisIdr
        : 0,
      totalPnlPct: snapshot.hasRealPnLData && snapshot.totalValueIdr !== null && snapshot.totalCostBasisIdr && snapshot.totalCostBasisIdr > 0
        ? ((snapshot.totalValueIdr - snapshot.totalCostBasisIdr) / snapshot.totalCostBasisIdr) * 100
        : null,
      totalHoldings: snapshot.holdings.length,
      displayCurrency: 'IDR',
    },
    holdings: snapshot.holdings.map((holding, index) => ({
      id: index + 1,
      assetId: index + 1,
      symbol: holding.symbol,
      name: holding.name || holding.symbol,
      assetType: holding.assetType as any,
      region: holding.exchange === 'IDX' || isIdxSymbol(holding.symbol) ? 'ID' : 'GLOBAL',
      quantity: holding.quantity || 0,
      entryPrice: holding.avgBuyPrice || 0,
      investedAmount: holding.costBasisIdr || 0,
      investedAmountDisplay: holding.costBasisIdr,
      latestPrice: holding.currentPrice,
      currentValue: holding.marketValueIdr || 0,
      pnl: snapshot.hasRealPnLData ? holding.pnlIdr ?? null : null,
      pnlPct: snapshot.hasRealPnLData ? holding.pnlPercent ?? null : null,
      quoteCurrency: holding.currentPriceCurrency || holding.currency || 'IDR',
      displayCurrency: 'IDR',
      trend: holding.pnlIdr === null || holding.pnlIdr === undefined ? 'flat' : holding.pnlIdr > 0 ? 'up' : holding.pnlIdr < 0 ? 'down' : 'flat',
      notes: null,
      openedAt: null,
    })),
  }
}
