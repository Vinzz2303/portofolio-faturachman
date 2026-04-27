import type {
  PortfolioHoldingItem,
  PortfolioSummaryResponse,
  PortfolioSummaryTotals
} from '../types'

type Language = 'id' | 'en'

export type AllocationItem = {
  label: string
  value: number
  weight: number
  currency: string
}

export type SymbolInsightItem = {
  label: string
  symbol: string
  name: string
  value: number
  weight: number
  pnl: number | null
  pnlPct: number | null
  quoteCurrency: string
  lots: number
}

export type PortfolioNarrative = {
  title: string
  body: string
}

export type PortfolioIntelligence = {
  summary: PortfolioSummaryTotals | null
  holdings: PortfolioHoldingItem[]
  allocation: AllocationItem[]
  largestPosition: AllocationItem | null
  winners: SymbolInsightItem[]
  losers: SymbolInsightItem[]
  concentrationLabel: string
  portfolioTone: string
  healthNote: string
  topAssetType: AllocationItem | null
  topRegion: AllocationItem | null
  narratives: PortfolioNarrative[]
}

const copy = {
  id: {
    notInitialized: 'Portofolio belum terbentuk',
    waiting: 'Menunggu data portofolio',
    emptyHealth:
      'Tambahkan posisi pertama untuk membuka pembacaan konsentrasi, pendorong hasil, penekan, dan kualitas eksposur.',
    noContextTitle: 'Belum ada konteks portofolio',
    noContextBody:
      'Tambahkan beberapa posisi terlebih dahulu agar Ting AI bisa membaca konsentrasi, pendorong hasil, dan kualitas eksposur.',
    unknown: 'Tidak diketahui',
    balanced: 'Konsentrasi seimbang',
    moderate: 'Konsentrasi menengah',
    high: 'Konsentrasi tinggi',
    flatTone: 'Portofolio cenderung datar',
    profitTone: 'Portofolio sedang untung',
    pressureTone: 'Portofolio sedang tertekan',
    healthBalanced:
      'Struktur portofolio masih cukup seimbang. Gunakan halaman ini untuk memantau kualitas eksposur dan posisi yang paling berpengaruh.',
    healthConcentrated:
      '{label} mendominasi bobot saat ini. Tinjau dulu apakah konsentrasi sebesar ini memang disengaja sebelum menambah risiko baru.',
    healthHealthyReturn:
      'Hasil saat ini terlihat sehat. Ini momen yang baik untuk meninjau apakah pemenang terbaru masih layak mempertahankan ukuran sekarang.',
    healthNegative:
      'Kinerja portofolio sedang tertekan. Fokus pada kualitas tesis, ukuran posisi, dan posisi mana yang masih layak dipertahankan.',
    exposureTitle: 'Pembacaan eksposur',
    exposureBody:
      '{label} menjadi posisi utama di {weight}% nilai portofolio saat ini. Ini menempatkan portofolio dalam kondisi {concentration}.',
    exposureFallback:
      'Portofolio belum memiliki nilai terbaru yang cukup untuk menghasilkan pembacaan eksposur yang rapi.',
    leadershipTitle: 'Kepemimpinan hasil',
    leadershipSingle:
      '{label} saat ini membawa hampir seluruh hasil portofolio. Dalam portofolio sekonsentrat ini, aset yang sama bisa menjadi sumber kenaikan sekaligus risiko utama.',
    leadershipDual:
      '{winner} saat ini menjadi kontributor laba berjalan terkuat, sementara {loser} menjadi penekan terbesar performa.',
    leadershipFallback:
      'Ting AI masih menunggu holding yang cukup sehat untuk mengidentifikasi pemenang dan penekan dengan yakin.',
    lensTitle: 'Lensa portofolio',
    lensBody:
      '{assetType} saat ini menjadi kelompok aset terbesar dan {region} menjadi eksposur wilayah utama. {healthNote}',
    ofCurrentValue: 'dari nilai portofolio saat ini',
    ofPortfolioValue: 'dari nilai portofolio',
    regionalExposure: 'eksposur wilayah'
  },
  en: {
    notInitialized: 'Portfolio not initialized',
    waiting: 'Waiting for portfolio data',
    emptyHealth:
      'Add your first holdings to unlock concentration, winners and losers, and exposure visibility.',
    noContextTitle: 'No portfolio context yet',
    noContextBody:
      'Add a few holdings first so Ting AI can read concentration, winners, and exposure quality.',
    unknown: 'Unknown',
    balanced: 'Balanced concentration',
    moderate: 'Moderate concentration',
    high: 'High concentration',
    flatTone: 'Portfolio is flat',
    profitTone: 'Portfolio in profit',
    pressureTone: 'Portfolio under pressure',
    healthBalanced:
      'Portfolio looks relatively balanced. Use this page to monitor exposure quality and identify the positions that matter most.',
    healthConcentrated:
      '{label} dominates current weight. Review whether that concentration is intentional before adding new risk.',
    healthHealthyReturn:
      'Current returns are healthy. This is a good time to review whether recent winners deserve their current size.',
    healthNegative:
      'Portfolio performance is under pressure. Focus on thesis quality, sizing, and which positions still deserve capital.',
    exposureTitle: 'Exposure read',
    exposureBody:
      '{label} is the anchor position at {weight}% of current portfolio value, which places the portfolio in a {concentration} state.',
    exposureFallback:
      'The portfolio has not built enough live value yet to produce a clean exposure read.',
    leadershipTitle: 'Leadership',
    leadershipSingle:
      '{label} is carrying nearly all of the current outcome. In a portfolio this concentrated, the same asset can define both upside leadership and downside risk.',
    leadershipDual:
      '{winner} is currently the strongest unrealized contributor, while {loser} is the main drag on performance.',
    leadershipFallback:
      'Ting AI is waiting for enough healthy holdings to identify clear winners and losers.',
    lensTitle: 'Portfolio lens',
    lensBody:
      '{assetType} is the largest asset bucket and {region} is the main regional exposure right now. {healthNote}',
    ofCurrentValue: 'of current portfolio value',
    ofPortfolioValue: 'of portfolio value',
    regionalExposure: 'regional exposure'
  }
} as const

const t = (language: Language, key: keyof (typeof copy)['id']): string => copy[language][key]

const interpolate = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (acc, [key, value]) => acc.split(`{${key}}`).join(String(value)),
    template
  )

const normalizePortfolioLabel = (
  label: string | null | undefined,
  key: 'assetType' | 'region',
  language: Language
) => {
  const fallback = t(language, 'unknown')
  if (!label) return fallback

  const cleaned = label.trim()
  if (!cleaned) return fallback
  if (language === 'en') return cleaned

  if (key === 'assetType') {
    const lower = cleaned.toLowerCase()
    if (lower === 'stock' || lower === 'stocks') return 'saham'
    if (lower === 'commodity' || lower === 'commodities') return 'komoditas'
    if (lower === 'crypto' || lower === 'cryptocurrency') return 'kripto'
    if (lower === 'etf') return 'ETF'
  }

  if (key === 'region') {
    const upper = cleaned.toUpperCase()
    if (upper === 'US' || upper === 'USA' || upper === 'UNITED STATES') return 'AS'
    if (upper === 'GLOBAL') return 'global'
    if (upper === 'INDONESIA' || upper === 'ID') return 'Indonesia'
  }

  return cleaned
}

const isHealthyGroupedPnlPct = (invested: number, value: number, pnlPct: number | null) => {
  if (pnlPct === null || !Number.isFinite(pnlPct)) return false
  if (!Number.isFinite(invested) || invested <= 0) return false
  if (Math.abs(pnlPct) > 1000) return false
  if (value > 100000 && invested < 10000) return false
  return true
}

const buildGroupedAllocation = (
  holdings: PortfolioHoldingItem[],
  totalCurrentValue: number,
  key: 'assetType' | 'region',
  language: Language
): AllocationItem[] => {
  const grouped = new Map<string, { value: number; currency: string }>()

  for (const holding of holdings) {
    const value = holding.currentValue ?? 0
    if (value <= 0) continue

    const label = normalizePortfolioLabel(holding[key], key, language)
    const current = grouped.get(label)
    if (current) {
      current.value += value
      continue
    }

    grouped.set(label, {
      value,
      currency: holding.displayCurrency || holding.quoteCurrency || 'IDR'
    })
  }

  return Array.from(grouped.entries())
    .map(([label, item]) => ({
      label,
      value: item.value,
      weight: totalCurrentValue > 0 ? (item.value / totalCurrentValue) * 100 : 0,
      currency: item.currency
    }))
    .sort((a, b) => b.value - a.value)
}

const buildSymbolInsights = (
  holdings: PortfolioHoldingItem[],
  totalCurrentValue: number
): SymbolInsightItem[] => {
  const grouped = new Map<
    string,
    {
      symbol: string
      name: string
      value: number
      invested: number
      pnl: number
      quoteCurrency: string
      lots: number
    }
  >()

  for (const holding of holdings) {
    const key = holding.symbol
    const current = grouped.get(key)
    const currentValue = holding.currentValue ?? 0
    const investedAmount = holding.investedAmountDisplay ?? holding.investedAmount ?? 0
    const pnl = holding.pnl ?? currentValue - investedAmount

    if (current) {
      current.value += currentValue
      current.invested += investedAmount
      current.pnl += pnl
      current.lots += 1
      continue
    }

    grouped.set(key, {
      symbol: holding.symbol,
      name: holding.name,
      value: currentValue,
      invested: investedAmount,
      pnl,
      quoteCurrency: holding.displayCurrency || holding.quoteCurrency,
      lots: 1
    })
  }

  return Array.from(grouped.values())
    .map((item) => {
      const pnlPctRaw = item.invested > 0 ? (item.pnl / item.invested) * 100 : null
      return {
        label: item.symbol,
        symbol: item.symbol,
        name: item.name,
        value: item.value,
        weight: totalCurrentValue > 0 ? (item.value / totalCurrentValue) * 100 : 0,
        pnl: Number.isFinite(item.pnl) ? item.pnl : null,
        pnlPct: isHealthyGroupedPnlPct(item.invested, item.value, pnlPctRaw) ? pnlPctRaw : null,
        quoteCurrency: item.quoteCurrency,
        lots: item.lots
      }
    })
    .sort((a, b) => b.value - a.value)
}

export const getPortfolioIntelligence = (
  portfolio: PortfolioSummaryResponse | null,
  language: Language = 'id'
): PortfolioIntelligence => {
  if (!portfolio?.summary || !portfolio.holdings?.length) {
    return {
      summary: null,
      holdings: [],
      allocation: [],
      largestPosition: null,
      winners: [],
      losers: [],
      concentrationLabel: t(language, 'notInitialized'),
      portfolioTone: t(language, 'waiting'),
      healthNote: t(language, 'emptyHealth'),
      topAssetType: null,
      topRegion: null,
      narratives: [
        {
          title: t(language, 'noContextTitle'),
          body: t(language, 'noContextBody')
        }
      ]
    }
  }

  const summary = portfolio.summary
  const holdings = portfolio.holdings
  const totalCurrentValue = summary.totalCurrentValue || 0
  const symbolInsights = buildSymbolInsights(holdings, totalCurrentValue)

  const allocation = symbolInsights
    .map((item) => ({
      label: item.label,
      value: item.value,
      weight: item.weight,
      currency: item.quoteCurrency
    }))
    .filter((item) => item.value > 0)

  const largestPosition = allocation[0] || null
  const winners = [...symbolInsights]
    .filter((item) => item.pnl !== null)
    .sort((a, b) => (b.pnl ?? 0) - (a.pnl ?? 0))
    .slice(0, 3)
  const losers = [...symbolInsights]
    .filter((item) => item.pnl !== null)
    .sort((a, b) => (a.pnl ?? 0) - (b.pnl ?? 0))
    .slice(0, 3)

  let concentrationLabel = t(language, 'balanced')
  if (!largestPosition) {
    concentrationLabel = t(language, 'notInitialized')
  } else if (largestPosition.weight >= 50) {
    concentrationLabel = t(language, 'high')
  } else if (largestPosition.weight >= 30) {
    concentrationLabel = t(language, 'moderate')
  }

  let portfolioTone = t(language, 'flatTone')
  if (summary.totalPnl > 0) {
    portfolioTone = t(language, 'profitTone')
  } else if (summary.totalPnl < 0) {
    portfolioTone = t(language, 'pressureTone')
  }

  let healthNote = t(language, 'healthBalanced')
  if (largestPosition && largestPosition.weight >= 50) {
    healthNote = interpolate(t(language, 'healthConcentrated'), {
      label: largestPosition.label
    })
  } else if ((summary.totalPnlPct ?? 0) >= 10) {
    healthNote = t(language, 'healthHealthyReturn')
  } else if ((summary.totalPnlPct ?? 0) < 0) {
    healthNote = t(language, 'healthNegative')
  }

  const assetTypeAllocation = buildGroupedAllocation(holdings, totalCurrentValue, 'assetType', language)
  const regionAllocation = buildGroupedAllocation(holdings, totalCurrentValue, 'region', language)
  const topAssetType = assetTypeAllocation[0] || null
  const topRegion = regionAllocation[0] || null

  const narratives: PortfolioNarrative[] = []

  narratives.push({
    title: t(language, 'exposureTitle'),
    body: largestPosition
      ? interpolate(t(language, 'exposureBody'), {
          label: largestPosition.label,
          weight: largestPosition.weight.toFixed(1),
          concentration: concentrationLabel.toLowerCase()
        })
      : t(language, 'exposureFallback')
  })

  narratives.push({
    title: t(language, 'leadershipTitle'),
    body:
      winners[0] && losers[0]
        ? winners[0].symbol === losers[0].symbol
          ? interpolate(t(language, 'leadershipSingle'), {
              label: winners[0].symbol
            })
          : interpolate(t(language, 'leadershipDual'), {
              winner: winners[0].symbol,
              loser: losers[0].symbol
            })
        : t(language, 'leadershipFallback')
  })

  narratives.push({
    title: t(language, 'lensTitle'),
    body:
      topAssetType && topRegion
        ? interpolate(t(language, 'lensBody'), {
            assetType: topAssetType.label,
            region: topRegion.label,
            healthNote
          })
        : healthNote
  })

  return {
    summary,
    holdings,
    allocation,
    largestPosition,
    winners,
    losers,
    concentrationLabel,
    portfolioTone,
    healthNote,
    topAssetType,
    topRegion,
    narratives
  }
}
