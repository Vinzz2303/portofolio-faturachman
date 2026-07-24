import type { LanguageCode } from './language'
import { normalizeDisplaySymbol } from './assetNormalization'
import { isIdxSymbol, type NormalizedPortfolioHolding, type NormalizedPortfolioSnapshot } from './portfolioSnapshot'

export const RISK_BUDGET_STORAGE_KEY = 'tingai_risk_budget_v2_3_1'

export type RiskBudgetConfig = {
  maxSingleAssetPercent: number
  maxCryptoPercent: number
  maxGoldPercent: number
  maxIndonesianStockPercent: number
  maxUSStockPercent: number
  maxManualOrDataLimitedPercent: number
  maxSpeculativeStockPercent: number
  updatedAt: string
}

export type RiskBudgetBreach = {
  type: 'single_asset' | 'category' | 'data_limited' | 'speculative'
  label: string
  currentPercent: number
  limitPercent: number
  severity: 'low' | 'medium' | 'high'
  explanation: string
}

export type RiskBudgetEvaluation = {
  status: 'safe' | 'watch' | 'exceeded'
  summary: string
  breaches: RiskBudgetBreach[]
  watchItems: string[]
}

export const defaultRiskBudget = (): RiskBudgetConfig => ({
  maxSingleAssetPercent: 40,
  maxCryptoPercent: 50,
  maxGoldPercent: 50,
  maxIndonesianStockPercent: 70,
  maxUSStockPercent: 70,
  maxManualOrDataLimitedPercent: 25,
  maxSpeculativeStockPercent: 20,
  updatedAt: new Date().toISOString(),
})

const fields: Array<keyof Omit<RiskBudgetConfig, 'updatedAt'>> = [
  'maxSingleAssetPercent',
  'maxCryptoPercent',
  'maxGoldPercent',
  'maxIndonesianStockPercent',
  'maxUSStockPercent',
  'maxManualOrDataLimitedPercent',
  'maxSpeculativeStockPercent',
]

const cleanPercent = (value: unknown, fallback: number) => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return fallback
  return Math.min(Math.max(numberValue, 0), 100)
}

export const readRiskBudget = (): RiskBudgetConfig => {
  const defaults = defaultRiskBudget()
  try {
    const raw = window.localStorage.getItem(RISK_BUDGET_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<RiskBudgetConfig>
    return fields.reduce(
      (budget, field) => ({
        ...budget,
        [field]: cleanPercent(parsed[field], defaults[field]),
      }),
      {
        ...defaults,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : defaults.updatedAt,
      }
    )
  } catch {
    return defaults
  }
}

export const saveRiskBudget = (config: RiskBudgetConfig) => {
  const sanitized = fields.reduce(
    (budget, field) => ({
      ...budget,
      [field]: cleanPercent(config[field], defaultRiskBudget()[field]),
    }),
    { ...config, updatedAt: new Date().toISOString() }
  )
  window.localStorage.setItem(RISK_BUDGET_STORAGE_KEY, JSON.stringify(sanitized))
  window.dispatchEvent(new Event('tingai-risk-budget'))
  return sanitized
}

const assetType = (holding: NormalizedPortfolioHolding) => (holding.assetType || '').toLowerCase()
const isCrypto = (holding: NormalizedPortfolioHolding) =>
  assetType(holding) === 'crypto' || /^(BTC|ETH|SOL|BNB|XRP)/i.test(holding.symbol)
const isGold = (holding: NormalizedPortfolioHolding) => {
  const symbol = holding.symbol.toUpperCase()
  return symbol.includes('XAU') || symbol.includes('GOLD') || assetType(holding) === 'gold' || assetType(holding) === 'commodity'
}
const isIndonesianStock = (holding: NormalizedPortfolioHolding) =>
  isIdxSymbol(holding.symbol) || holding.exchange === 'IDX' || assetType(holding) === 'indonesian_stock'
const isUSStock = (holding: NormalizedPortfolioHolding) =>
  assetType(holding) === 'stock' && !isIndonesianStock(holding)
const isDataLimited = (holding: NormalizedPortfolioHolding) =>
  holding.source === 'manual' || holding.supportStatus === 'data_limited' || holding.supportStatus === 'allocation_only'

const speculativeSymbols = new Set(['GOTO', 'GOTO.JK', 'BUKA', 'BUKA.JK', 'WIFI', 'WIFI.JK', 'PANI', 'PANI.JK'])
const isSpeculativeStock = (holding: NormalizedPortfolioHolding) =>
  speculativeSymbols.has(holding.symbol.toUpperCase()) ||
  (assetType(holding).includes('speculative') || assetType(holding).includes('growth'))

const sumAllocation = (
  holdings: NormalizedPortfolioHolding[],
  predicate: (holding: NormalizedPortfolioHolding) => boolean
) => holdings.filter(predicate).reduce((sum, holding) => sum + (holding.allocationPercent || 0), 0)

const severity = (currentPercent: number, limitPercent: number): RiskBudgetBreach['severity'] => {
  const excess = currentPercent - limitPercent
  if (excess >= 15) return 'high'
  if (excess >= 5) return 'medium'
  return 'low'
}

const fmt = (value: number) => value.toFixed(1)

const breachText = (
  label: string,
  currentPercent: number,
  limitPercent: number,
  language: LanguageCode
) =>
  language === 'en'
    ? `${label} is at ${fmt(currentPercent)}%, above your ${fmt(limitPercent)}% personal limit. This means the portfolio is more sensitive to that exposure than your risk budget allows.`
    : `${label} berada di ${fmt(currentPercent)}%, melewati batas pribadi ${fmt(limitPercent)}%. Ini membuat portofolio lebih sensitif terhadap eksposur tersebut dibanding batas risiko yang kamu tetapkan.`

const addBreach = (
  breaches: RiskBudgetBreach[],
  payload: Omit<RiskBudgetBreach, 'severity' | 'explanation'>,
  language: LanguageCode
) => {
  if (payload.currentPercent <= payload.limitPercent) return
  breaches.push({
    ...payload,
    severity: severity(payload.currentPercent, payload.limitPercent),
    explanation: breachText(payload.label, payload.currentPercent, payload.limitPercent, language),
  })
}

export const evaluateRiskBudget = (
  snapshot: NormalizedPortfolioSnapshot,
  budget: RiskBudgetConfig,
  language: LanguageCode
): RiskBudgetEvaluation => {
  if (!snapshot.hasPortfolio || !snapshot.holdings.length) {
    return {
      status: 'safe',
      summary: language === 'en'
        ? 'Risk budget will activate after portfolio assets are available.'
        : 'Risk budget akan aktif setelah aset portofolio tersedia.',
      breaches: [],
      watchItems: [],
    }
  }

  const holdings = [...snapshot.holdings].sort((a, b) => b.allocationPercent - a.allocationPercent)
  const largest = holdings[0]
  const breaches: RiskBudgetBreach[] = []

  addBreach(breaches, {
    type: 'single_asset',
    label: language === 'en' ? 'Single-asset concentration' : 'Konsentrasi aset tunggal',
    currentPercent: largest?.allocationPercent || 0,
    limitPercent: budget.maxSingleAssetPercent,
  }, language)

  addBreach(breaches, {
    type: 'category',
    label: language === 'en' ? 'Crypto exposure' : 'Eksposur crypto',
    currentPercent: sumAllocation(holdings, isCrypto),
    limitPercent: budget.maxCryptoPercent,
  }, language)

  addBreach(breaches, {
    type: 'category',
    label: language === 'en' ? 'Gold/XAU exposure' : 'Eksposur emas/XAU',
    currentPercent: sumAllocation(holdings, isGold),
    limitPercent: budget.maxGoldPercent,
  }, language)

  addBreach(breaches, {
    type: 'category',
    label: language === 'en' ? 'Indonesian stock exposure' : 'Eksposur saham Indonesia',
    currentPercent: sumAllocation(holdings, isIndonesianStock),
    limitPercent: budget.maxIndonesianStockPercent,
  }, language)

  addBreach(breaches, {
    type: 'category',
    label: language === 'en' ? 'US stock exposure' : 'Eksposur saham US',
    currentPercent: sumAllocation(holdings, isUSStock),
    limitPercent: budget.maxUSStockPercent,
  }, language)

  addBreach(breaches, {
    type: 'data_limited',
    label: language === 'en' ? 'Limited data assets' : 'Data terbatas',
    currentPercent: sumAllocation(holdings, isDataLimited),
    limitPercent: budget.maxManualOrDataLimitedPercent,
  }, language)

  addBreach(breaches, {
    type: 'speculative',
    label: language === 'en' ? 'Speculative stocks' : 'Saham spekulatif',
    currentPercent: sumAllocation(holdings, isSpeculativeStock),
    limitPercent: budget.maxSpeculativeStockPercent,
  }, language)

  const hasHigh = breaches.some((breach) => breach.severity === 'high')
  const status: RiskBudgetEvaluation['status'] = breaches.length === 0 ? 'safe' : hasHigh || breaches.length >= 2 ? 'exceeded' : 'watch'
  const summary = status === 'safe'
    ? language === 'en'
      ? 'Portfolio composition is still within the current risk budget.'
      : 'Komposisi portofolio masih dalam batas risk budget saat ini.'
    : status === 'watch'
    ? language === 'en'
      ? 'Some exposures are close to or slightly above your personal risk limits.'
      : 'Beberapa eksposur mulai mendekati atau melewati batas risiko pribadi.'
    : language === 'en'
    ? 'Risk budget is exceeded. This is a sensitivity warning, not a transaction instruction.'
    : 'Risk budget terlampaui. Ini peringatan sensitivitas, bukan instruksi transaksi.'

  const watchItems = breaches.length
    ? breaches.slice(0, 3).map((breach) =>
        language === 'en'
          ? `Review ${breach.label.toLowerCase()} at ${fmt(breach.currentPercent)}%.`
          : `Review ${breach.label.toLowerCase()} di ${fmt(breach.currentPercent)}%.`
      )
    : holdings.slice(0, 2).map((holding) =>
        language === 'en'
          ? `Keep monitoring ${normalizeDisplaySymbol(holding.symbol)} because its weight is ${fmt(holding.allocationPercent)}%.`
          : `Tetap pantau ${normalizeDisplaySymbol(holding.symbol)} karena bobotnya ${fmt(holding.allocationPercent)}%.`
      )

  return { status, summary, breaches, watchItems }
}

export const formatRiskBudgetForCopilot = (
  evaluation: RiskBudgetEvaluation,
  language: LanguageCode
) => {
  const prefix = language === 'en' ? 'Risk budget' : 'Risk budget'
  const breaches = evaluation.breaches
    .slice(0, 5)
    .map((breach) => `${breach.label}: ${fmt(breach.currentPercent)}% vs limit ${fmt(breach.limitPercent)}%`)
    .join(' | ')
  return `${prefix}: status ${evaluation.status}. ${evaluation.summary}${breaches ? ` Breaches: ${breaches}.` : ''}`
}
