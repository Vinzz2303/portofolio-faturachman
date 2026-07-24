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

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

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
  const summary = intelligence.summary
  const largest = intelligence.largestPosition
  const totalHoldings = summary?.totalHoldings ?? intelligence.holdings.length
  const pnlPct = summary?.totalPnlPct ?? null

  if (!summary || !largest || summary.totalCurrentValue <= 0) {
    return {
      headline: language === 'id' 
        ? 'Menunggu kelengkapan data untuk membaca insight...'
        : 'Waiting for complete data to generate insight...',
      reasons: [
        language === 'id'
          ? 'Data yang tersedia belum memadai untuk analisis presisi.'
          : 'Available data is insufficient for precise analysis.'
      ],
      action: language === 'id'
        ? 'Tambahkan posisi aset untuk memulai pembacaan.'
        : 'Add asset positions to start reading.',
      risk_level: 'medium'
    }
  }

  const w = largest.weight
  const formattedWeight = formatPercentId(w, 1)

  // 1. HEADLINE PATTERNS
  let baseHeadline = ''
  if (w >= 60) {
    baseHeadline = getRandom(language === 'en' ? [
      `${formattedWeight}% of your investment is in ${largest.label}`,
      `Your current standing relies heavily on ${largest.label}, allocating up to ${formattedWeight}%`,
      `${largest.label} takes the lead with an allocation of around ${formattedWeight}%`
    ] : [
      `${formattedWeight}% porsi investasimu ada di ${largest.label}`,
      `Kondisi saat ini sangat bergantung pada ${largest.label}, dengan alokasi mencapai ${formattedWeight}%`,
      `${largest.label} memegang kendali utama dengan porsi sekitar ${formattedWeight}%`
    ])
  } else if (w >= 40) {
    baseHeadline = getRandom(language === 'en' ? [
      `${formattedWeight}% of the allocation is focused on ${largest.label}`,
      `Your balance is quite focused on ${largest.label}, holding ${formattedWeight}%`,
      `${largest.label} acts as the main anchor with around ${formattedWeight}% allocation`
    ] : [
      `${formattedWeight}% alokasi berpusat pada ${largest.label}`,
      `Keseimbanganmu lumayan terfokus pada ${largest.label}, dengan porsi ${formattedWeight}%`,
      `${largest.label} menjadi jangkar utama dengan alokasi sekitar ${formattedWeight}%`
    ])
  } else {
    baseHeadline = getRandom(language === 'en' ? [
      `The largest portion belongs to ${largest.label} at ${formattedWeight}%`,
      `${largest.label} is your highest position right now at ${formattedWeight}%`,
      `Maximum exposure is on ${largest.label} with ${formattedWeight}% allocation`
    ] : [
      `Porsi terbesar dipegang oleh ${largest.label} sebanyak ${formattedWeight}%`,
      `${largest.label} menjadi posisi tertinggimu saat ini di angka ${formattedWeight}%`,
      `Eksposur maksimal ada pada ${largest.label} dengan alokasi ${formattedWeight}%`
    ])
  }

  // 2. HEADLINE CONSEQUENCE
  let consequence = ''
  if (w > 60) {
    consequence = getRandom(language === 'en' ? [
      'meaning the movement of this single instrument will heavily dictate your final result.',
      'making its value highly sensitive to a single direction of movement.'
    ] : [
      'artinya pergerakan satu instrumen ini akan sangat menentukan hasil akhirmu.',
      'membuat nilainya menjadi sangat sensitif terhadap satu arah pergerakan.'
    ])
  } else if (w >= 40) {
    consequence = getRandom(language === 'en' ? [
      'meaning the direction is quite influenced by this single performance.',
      'making its dynamics fairly centered on one point.'
    ] : [
      'artinya arah pergerakan cukup dipengaruhi oleh kinerja tunggal ini.',
      'membuat dinamikanya lumayan berpusat pada satu titik.'
    ])
  } else {
    consequence = getRandom(language === 'en' ? [
      'meaning you have a fairly ideal room for diversification.',
      'making its movement relatively stable with minimal surprises.'
    ] : [
      'artinya kamu memiliki ruang diversifikasi yang cukup ideal.',
      'membuat pergerakannya relatif stabil dan minim kejutan.'
    ])
  }

  const headline = `${baseHeadline} — ${consequence}`

  // 3. CONTEXT & CONDITIONAL RELATABILITY
  const reasons: string[] = []
  
  if (w >= 40) {
    reasons.push(language === 'en' ? 'When one position dominates, even small changes can feel significant overall.' : 'Ketika satu posisi mendominasi, perubahan kecil pun bisa terasa signifikan secara keseluruhan.')
    if (w > 50 || totalHoldings <= 2) {
      reasons.push(language === 'en' ? 'Conditions like this are common when an asset grows much faster than others.' : 'Kondisi seperti ini wajar terjadi saat sebuah aset berkembang jauh lebih cepat dari yang lain.')
    }
  } else {
    reasons.push(language === 'en' ? 'An even spread makes your value more resilient to volatility in a single sector.' : 'Penyebaran yang merata membuat nilaimu lebih tangguh saat menghadapi volatilitas di satu sektor.')
    if (totalHoldings <= 2) {
      reasons.push(language === 'en' ? 'Even with few instruments, the weight distribution is well maintained.' : 'Meskipun instrumennya sedikit, pembagian bobotnya sudah dijaga dengan baik.')
    }
  }

  // 4. CONDITIONAL SUMMARY
  if (w >= 60 && pnlPct !== null) {
    if (pnlPct < 0) {
      reasons.push(language === 'en' ? 'In short: your position is under pressure due to over-reliance.' : 'Ringkasnya: posisimu sedang tertekan akibat ketergantungan berlebih.')
    } else if (pnlPct > 0) {
      reasons.push(language === 'en' ? 'In short: your position is in profit, but the risk is too concentrated.' : 'Ringkasnya: posisimu sedang profit, namun risikonya terlalu terpusat.')
    }
  }

  // 5. AWARENESS (Action)
  let action = ''
  if (w >= 40) {
    action = language === 'en' ? 'Adding exposure to other instruments can help lower this sensitivity.' : 'Menambah eksposur ke instrumen lain dapat membantu menurunkan sensitivitas ini.'
  } else {
    action = language === 'en' ? 'Maintaining this structure going forward is great for limiting single risks.' : 'Menjaga struktur seperti ini ke depannya sangat baik untuk membatasi risiko tunggal.'
  }

  const risk_level = w > 60 ? 'high' : w >= 40 ? 'medium' : 'low'

  return {
    headline,
    reasons,
    action,
    risk_level
  }
}

export function generateDecisionEngine(
  intelligence: PortfolioIntelligence,
  marketSentiment?: string | null,
  portfolioInsight?: PortfolioInsightHeroData,
  language: Language = 'id'
): PortfolioDecisionEngineData {
  // Maintaining simple calm structure, relying on the core insight
  const summary = intelligence.summary
  
  if (!summary || summary.totalCurrentValue <= 0) {
    return {
      decision: 'monitor',
      reasoning: language === 'en' ? 'Insufficient portfolio data.' : 'Data portofolio belum memadai.',
      risk_note: language === 'en' ? 'Waiting for complete data.' : 'Menunggu kelengkapan data.'
    }
  }

  return {
      decision: 'monitor',
      reasoning: language === 'en' ? 'Conditions are being monitored based on your largest position exposure.' : 'Kondisi sedang dipantau berdasarkan eksposur posisi terbesarmu.',
      risk_note: language === 'en' ? 'Keep evaluating allocation whenever there are significant price movements.' : 'Tetap evaluasi alokasi setiap kali ada pergerakan harga signifikan.'
  }
}

export function generateRiskSimulation(
  intelligence: PortfolioIntelligence,
  language: Language = 'id'
): PortfolioRiskSimulationData {
  const summary = intelligence.summary
  const largest = intelligence.largestPosition

  if (!summary || !largest || summary.totalCurrentValue <= 0) {
    return {
      largest_holding: '-',
      scenario: language === 'id' ? 'Simulasi tidak tersedia' : 'Simulation unavailable',
      impact_percent: 0,
      nominal_impact: null,
      interpretation: language === 'id' 
        ? 'Data belum cukup untuk membaca dampak simulasi ini.'
        : 'Not enough data to read the impact of this simulation.'
    }
  }

  const impactPercent = -((largest.weight * 5) / 100)
  const nominalImpact = Math.round(summary.totalCurrentValue * Math.abs(impactPercent) / 100)

  return {
    largest_holding: largest.label,
    scenario: language === 'en' ? `If ${largest.label} drops around 5%` : `Jika ${largest.label} turun sekitar 5%`,
    impact_percent: impactPercent,
    nominal_impact: nominalImpact,
    interpretation: language === 'en'
      ? `Because the proportion reaches ${formatPercentId(largest.weight, 1)}%, if ${largest.label} corrects by around 5%, your entire portfolio could also drop by roughly ${formatPercentId(Math.abs(impactPercent), 1)}%.`
      : `Karena proporsinya mencapai ${formatPercentId(largest.weight, 1)}%, jika ${largest.label} terkoreksi sekitar 5%, portofoliomu secara keseluruhan bisa ikut turun di kisaran ${formatPercentId(Math.abs(impactPercent), 1)}%.`
  }
}
