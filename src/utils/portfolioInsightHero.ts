import type { PortfolioIntelligence } from './portfolioIntelligence'

type Language = 'id' | 'en'
type RiskLevel = 'low' | 'medium' | 'high'

export type PortfolioInsightHeroData = {
  headline: string
  reasons: string[]
  action: string
  risk_level: RiskLevel
}

export type PortfolioDecisionEngineData = {
  decision: 'monitor' | 'wait' | 'rebalance' | 'reduce_exposure'
  reasoning: string
  risk_note: string
}

export type PortfolioRiskSimulationData = {
  largest_holding: string
  scenario: string
  impact_percent: number
  nominal_impact: number | null
  interpretation: string
}

const clampHeadline = (value: string, maxWords = 15) => {
  const words = value.trim().split(/\s+/)
  if (words.length <= maxWords) return value.trim()
  return `${words.slice(0, maxWords).join(' ')}.`
}

const formatPercentId = (value: number, fractionDigits = 1) =>
  new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(value)

export function generatePortfolioInsight(
  intelligence: PortfolioIntelligence,
  marketSentiment?: string | null,
  language: Language = 'id'
): PortfolioInsightHeroData {
  const isEnglish = language === 'en'
  const summary = intelligence.summary
  const largest = intelligence.largestPosition
  const totalHoldings = summary?.totalHoldings ?? intelligence.holdings.length
  const pnlPct = summary?.totalPnlPct ?? null
  const topAssetType = intelligence.topAssetType

  if (!summary || !largest || summary.totalCurrentValue <= 0) {
    return isEnglish
      ? {
          headline: 'Portfolio context is still limited, so risk read remains preliminary.',
          reasons: [
            'Live portfolio value is not fully formed yet.',
            'A clearer read appears after holdings and pricing are complete.'
          ],
          action: 'Complete holdings data and monitor the next sync.',
          risk_level: 'medium'
        }
      : {
          headline: 'Konteks portofolio masih terbatas, jadi pembacaan masih awal.',
          reasons: [
            'Nilai portofolio belum terbaca penuh.',
            'Pembacaan akan lebih jelas setelah posisi dan harga lengkap.'
          ],
          action: 'Lengkapi posisi lalu monitor sinkronisasi berikutnya.',
          risk_level: 'medium'
        }
  }

  const largestWeight = largest.weight
  const formattedWeight = formatPercentId(largestWeight, 1)
  const formattedPnl = pnlPct !== null && Number.isFinite(pnlPct) ? formatPercentId(pnlPct, 1) : null
  const normalizedSentiment = marketSentiment?.trim()

  if (largestWeight > 50) {
    return {
      headline: clampHeadline(
        formattedPnl !== null && pnlPct !== null && pnlPct > 0
          ? `${formattedWeight}% portofoliomu ada di ${largest.label}, untung tapi cukup rentan.`
          : `${formattedWeight}% portofoliomu ada di ${largest.label}, terlalu terkonsentrasi.`
      ),
      reasons: [
        `${largest.label} masih jadi porsi terbesar di portofoliomu.`,
        normalizedSentiment
          ? `Kondisi market ${normalizedSentiment.toLowerCase()}, jadi tekanan lebih cepat terasa.`
          : 'Diversifikasi belum cukup untuk meredam pergerakan satu aset.'
      ],
      action: 'Rebalance bertahap agar portofolio lebih seimbang.',
      risk_level: 'high'
    }
  }

  if (largestWeight >= 30) {
    return {
      headline: clampHeadline(
        formattedPnl !== null && pnlPct !== null && pnlPct > 0
          ? `${largest.label} masih dominan ${formattedWeight}%, jadi portofoliomu tetap sensitif.`
          : `${largest.label} masih dominan ${formattedWeight}%, jadi keseimbangannya perlu dijaga.`
      ),
      reasons: [
        `Porsi aset terbesar masih sekitar ${formattedWeight}% dari nilai portofolio.`,
        topAssetType
          ? `${topAssetType.label} masih jadi eksposur utama saat ini.`
          : `Portofolio punya ${totalHoldings} posisi, tetapi dominasi aset utama masih terasa.`
      ],
      action: 'Monitor konsentrasi dan pertimbangkan rebalance bertahap.',
      risk_level: 'medium'
    }
  }

  return {
    headline: clampHeadline(
      formattedPnl !== null && pnlPct !== null && pnlPct < 0
        ? 'Portofoliomu relatif seimbang, tetapi tekanan pasar masih perlu dipantau.'
        : 'Portofoliomu relatif seimbang dan risikonya masih cukup terkendali.'
    ),
    reasons: [
      'Tidak ada aset yang terlalu mendominasi nilai portofolio.',
      normalizedSentiment
        ? `Kondisi market ${normalizedSentiment.toLowerCase()}, tetapi diversifikasi membantu meredam tekanan.`
        : 'Diversifikasi membantu meredam pergerakan dari satu aset atau satu tema.'
    ],
    action: 'Monitor kondisi market dan jaga ukuran posisi tetap rapi.',
    risk_level: 'low'
  }
}

export function generateDecisionEngine(
  intelligence: PortfolioIntelligence,
  marketSentiment?: string | null,
  portfolioInsight?: PortfolioInsightHeroData,
  language: Language = 'id'
): PortfolioDecisionEngineData {
  const isEnglish = language === 'en'
  const summary = intelligence.summary
  const largest = intelligence.largestPosition
  const topAssetType = intelligence.topAssetType
  const pnlPct = summary?.totalPnlPct ?? null
  const largestWeight = largest?.weight ?? 0
  const topAssetTypeWeight = topAssetType?.weight ?? 0
  const normalizedSentiment = marketSentiment?.trim().toLowerCase() ?? ''
  const isDefensiveTone =
    normalizedSentiment.includes('defensive') ||
    normalizedSentiment.includes('volatile') ||
    normalizedSentiment.includes('tertekan') ||
    normalizedSentiment.includes('defensif')
  const isConcentrated = largestWeight >= 30
  const isSeverelyConcentrated = largestWeight > 50
  const isLosing = typeof pnlPct === 'number' && pnlPct < 0

  if (!summary || !largest || summary.totalCurrentValue <= 0) {
    return isEnglish
      ? {
          decision: 'monitor',
          reasoning: 'Portfolio data is not complete yet, so the safest step for now is to keep monitoring first.',
          risk_note: 'Complete portfolio data will make the risk read more accurate.'
        }
      : {
          decision: 'monitor',
          reasoning: 'Data portofolio belum lengkap, jadi langkah paling aman adalah memantau kondisi terlebih dahulu.',
          risk_note: 'Lengkapi data portofolio agar analisis risiko lebih akurat.'
        }
  }

  if (isLosing && isSeverelyConcentrated) {
    return {
      decision: 'reduce_exposure',
      reasoning: `Portofoliomu sedang tertekan dan masih terlalu bergantung pada ${largest.label}. Dalam kondisi seperti ini, kontrol risiko perlu diprioritaskan lebih dulu.`,
      risk_note: `Konsentrasi di ${largest.label} membuat penurunan lebih sensitif terhadap total nilai portofolio.`
    }
  }

  if (isSeverelyConcentrated) {
    return {
      decision: 'rebalance',
      reasoning: `Portofoliomu terlalu bergantung pada ${largest.label}, sehingga pergerakan satu aset sangat memengaruhi total nilainya. Langkah paling masuk akal saat ini adalah menurunkan konsentrasi bertahap.`,
      risk_note: `Jika ${largest.label} melemah, dampaknya akan cepat terasa ke sebagian besar portofoliomu.`
    }
  }

  if (topAssetType && topAssetTypeWeight > 60) {
    return {
      decision: 'rebalance',
      reasoning: `Eksposur portofoliomu masih terlalu berat di sektor ${topAssetType.label}. Ini membuat arah portofoliomu terlalu dipengaruhi satu kelompok aset.`,
      risk_note: `Pergerakan sektor ${topAssetType.label} berpotensi memengaruhi sebagian besar portofoliomu.`
    }
  }

  if (isLosing && isConcentrated) {
    return {
      decision: portfolioInsight?.risk_level === 'high' ? 'reduce_exposure' : 'rebalance',
      reasoning: `Portofoliomu sedang minus dan konsentrasinya masih cukup terasa. Fokus utama saat ini adalah merapikan risiko sebelum menambah tekanan baru.`,
      risk_note: 'Konsentrasi yang belum longgar bisa menambah tekanan saat market belum stabil.'
    }
  }

  if (isDefensiveTone && isConcentrated) {
    if (isSeverelyConcentrated) {
      return {
        decision: 'rebalance',
        reasoning: `Kondisi pasar sedang lebih defensif sementara portofoliomu masih terlalu terkonsentrasi di ${largest.label}. Menyeimbangkan ulang lebih masuk akal daripada membiarkan risiko tetap berat di satu titik.`,
        risk_note: `Saat pasar lebih sensitif, konsentrasi di ${largest.label} bisa lebih cepat terasa ke portofoliomu.`
      }
    }

    return {
      decision: 'wait',
      reasoning: `Portofoliomu masih punya konsentrasi moderat di ${largest.label}, sementara kondisi pasar belum terlalu nyaman. Langkah paling tenang saat ini adalah menunggu sambil memantau perubahan risikonya.`,
      risk_note: 'Jika volatilitas bertahan, konsentrasi moderat tetap perlu diperhatikan.'
    }
  }

  return isEnglish
    ? {
        decision: 'monitor',
        reasoning: 'Your portfolio looks relatively balanced, so the safest step for now is to keep monitoring conditions regularly.',
        risk_note: 'Risk can still change if market conditions become more volatile.'
      }
    : {
        decision: 'monitor',
        reasoning: 'Portofoliomu terlihat cukup seimbang, jadi langkah paling aman adalah memantau kondisi pasar secara berkala.',
        risk_note: 'Risiko tetap bisa berubah jika kondisi market menjadi lebih sensitif.'
      }
}

export function generateRiskSimulation(
  intelligence: PortfolioIntelligence,
  language: Language = 'id'
): PortfolioRiskSimulationData {
  const isEnglish = language === 'en'
  const summary = intelligence.summary
  const largest = intelligence.largestPosition

  if (!summary || !largest || summary.totalCurrentValue <= 0) {
    return isEnglish
      ? {
          largest_holding: '-',
          scenario: 'Simulation unavailable',
          impact_percent: 0,
          nominal_impact: null,
          interpretation: 'Portfolio data is not sufficient to calculate this risk simulation.'
        }
      : {
          largest_holding: '-',
          scenario: 'Simulasi tidak tersedia',
          impact_percent: 0,
          nominal_impact: null,
          interpretation: 'Data belum cukup untuk membaca dampak simulasi ini.'
        }
  }

  const impactPercent = -((largest.weight * 5) / 100)
  const nominalImpact = Math.round(summary.totalCurrentValue * Math.abs(impactPercent) / 100)

  return isEnglish
    ? {
        largest_holding: largest.label,
        scenario: `If ${largest.label} drops 5%`,
        impact_percent: impactPercent,
        nominal_impact: nominalImpact,
        interpretation: `Because ${largest.label} has a large weight, even a small decline would be felt across your portfolio.`
      }
    : {
        largest_holding: largest.label,
        scenario: `Jika ${largest.label} turun 5%`,
        impact_percent: impactPercent,
        nominal_impact: nominalImpact,
        interpretation: `Karena porsi ${largest.label} besar, penurunan 5% saja sudah cukup terasa ke total portofoliomu.`
      }
}
