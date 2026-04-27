const DISPLAY_CURRENCY = 'IDR' as const

const FALLBACK_FX_RATES: Record<string, number> = {
  IDR: 1,
  USD: 16500
}

const formatterCache = new Map<string, Intl.NumberFormat>()

export const getDisplayCurrency = () => DISPLAY_CURRENCY

export const getFxRate = (sourceCurrency?: string | null, targetCurrency: string = DISPLAY_CURRENCY) => {
  const source = (sourceCurrency || targetCurrency).toUpperCase()
  const target = targetCurrency.toUpperCase()

  if (source === target) return 1

  const sourceRate = FALLBACK_FX_RATES[source]
  const targetRate = FALLBACK_FX_RATES[target]

  if (!sourceRate || !targetRate) return null
  return sourceRate / targetRate
}

export const convertCurrency = (
  value: number | null | undefined,
  sourceCurrency?: string | null,
  targetCurrency: string = DISPLAY_CURRENCY
) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  const rate = getFxRate(sourceCurrency, targetCurrency)
  if (rate === null) return value
  return value * rate
}

export const formatCurrency = (
  value: number | null | undefined,
  currency: string = DISPLAY_CURRENCY
) => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Menunggu'

  const code = currency.toUpperCase()
  if (!formatterCache.has(code)) {
    formatterCache.set(
      code,
      new Intl.NumberFormat(code === 'IDR' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: code === 'IDR' ? 0 : 2
      })
    )
  }

  return formatterCache.get(code)!.format(value)
}
