export type LanguageCode = 'id' | 'en'

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export function sanitizeMarketPercent(value: unknown, maxAbs = 35): number | null {
  if (!isFiniteNumber(value)) return null
  if (Math.abs(value) > maxAbs) return null
  return value
}

export function derivePercentChange(
  latest: unknown,
  previous: unknown,
  maxAbs = 35
): number | null {
  if (!isFiniteNumber(latest) || !isFiniteNumber(previous) || previous === 0) return null
  return sanitizeMarketPercent(((latest - previous) / previous) * 100, maxAbs)
}

export function formatPercent(value: number | null | undefined, language: LanguageCode, digits = 2): string {
  if (!isFiniteNumber(value)) return language === 'id' ? 'Tidak tersedia' : 'N/A'
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(abs)
  return `${value >= 0 ? '+' : '-'}${formatted}%`
}

export function formatMarketNumber(
  value: unknown,
  language: LanguageCode,
  options?: { currency?: string; maxDigits?: number; minDigits?: number }
): string {
  if (!isFiniteNumber(value)) return language === 'id' ? 'Tidak tersedia' : 'N/A'

  const locale = language === 'id' ? 'id-ID' : 'en-US'
  const currency = options?.currency

  if (currency) {
    return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'IDR' ? 0 : options?.minDigits ?? 2,
      maximumFractionDigits: currency === 'IDR' ? 0 : options?.maxDigits ?? 2,
    }).format(value)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: options?.minDigits ?? 0,
    maximumFractionDigits: options?.maxDigits ?? 2,
  }).format(value)
}
