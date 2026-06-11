/**
 * morningCommandI18n.ts
 * Complete i18n dictionary for the Morning Command / Komando Pagi page.
 * Every user-facing string MUST come from this file.
 */

import type { LanguageCode } from './language'

export type RiskStateKey = 'riskRising' | 'riskWatch' | 'riskCalm'

type MorningCommandCopy = {
  title: string
  subtitle: string
  datePrefix: string

  // Hero headline — the one-line daily command
  heroHeadline: Record<RiskStateKey, string>

  // Risk state
  states: Record<RiskStateKey, string>
  statesSub: Record<RiskStateKey, string>

  // Portfolio fit label
  portfolioFit: Record<RiskStateKey, string>

  // Impact (compact — max 1 sentence)
  impact: Record<RiskStateKey, string>

  // Context (expanded detail — for Pro)
  context: Record<RiskStateKey, string>

  // Focus (compact — max 1 sentence)
  focusLabel: string
  focus: Record<RiskStateKey, string>

  // CTA
  ctaViewPortfolio: string
  ctaTingAi: string
  ctaExploreIntelligence: string
  ctaPortfolioImpact: string

  // Quick card labels
  cardMarketPressure: string
  cardPortfolioImpact: string
  cardFocusLabel: string

  // Pro section labels
  proHint: string
  proSectionAiExplanation: string
  proSectionRiskScenario: string
  proSectionPortfolioSim: string
  proSectionAiChat: string
  proUnlockLabel: string
  proPreviewLabel: string

  // Collapsible
  showDetail: string
  hideDetail: string

  // News Intelligence
  newsEvidenceLabel: string
  newsAnalysisLabel: string
  newsWhyItMatters: { risk_on: string; risk_off: string; neutral: string }
  newsScenario: { risk_on: string; risk_off: string; neutral: string }
  newsImpactToPortfolio: string
  newsLoading: string
  newsUnavailable: string

  // Risk indicator labels
  riskLevels: { low: string; medium: string; high: string }

  // Empty state
  emptyTitle: string
  emptyBody: string
  emptyCta: string

  // Empty portfolio state (Patch 2)
  emptyPortfolioHeroHeadline: string
  emptyPortfolioHeroSubtext: string
  emptyPortfolioCTAPrimary: string
  emptyPortfolioCTASecondary: string
  marketOverviewLabel: string
  marketDataReady: string
  marketDataSyncing: string
  marketDataSyncingFallback: string
  marketDataUnavailableLabel: string  // "Belum tersedia" / "Unavailable" for individual cards
  emptyPortfolioBenefitsLabel: string
  emptyPortfolioBenefits: {
    riskConcentration: { title: string; description: string }
    marketPressure: { title: string; description: string }
    decisionTrade: { title: string; description: string }
  }
  emptyPortfolioGuidanceLabel: string
  emptyPortfolioGuidanceSteps: string[]
  emptyPortfolioNote: string

  // Greeting
  greetingMorning: string
  greetingSiang: string
  greetingSore: string
  greetingMalam: string
}

const id: MorningCommandCopy = {
  title: 'Komando Pagi',
  subtitle: 'Ringkasan risiko dan kondisi portofolio hari ini',
  datePrefix: '',

  heroHeadline: {
    riskRising: 'Hari ini: kurangi eksposur, jangan tambah risiko besar.',
    riskWatch: 'Hari ini: tahan disiplin, pantau posisi utama.',
    riskCalm: 'Hari ini: kondisi tenang, review tanpa tekanan.',
  },

  states: {
    riskRising: 'Risiko meningkat',
    riskWatch: 'Perlu dipantau',
    riskCalm: 'Risiko terkendali',
  },
  statesSub: {
    riskRising: 'Portofoliomu mulai sensitif',
    riskWatch: 'Ada tekanan yang perlu diperhatikan',
    riskCalm: 'Kondisi masih cukup stabil',
  },

  portfolioFit: {
    riskRising: 'Rapuh',
    riskWatch: 'Perlu waspada',
    riskCalm: 'Selaras',
  },

  impact: {
    riskRising: 'Pergerakan kecil bisa terasa lebih besar dari biasanya.',
    riskWatch: 'Dampak bisa muncul kalau sentimen memburuk.',
    riskCalm: 'Belum ada tekanan signifikan saat ini.',
  },

  context: {
    riskRising: 'Posisi yang kamu pegang saat ini lebih sensitif terhadap arah market. Bukan berarti harus bergerak, tapi penting untuk sadar.',
    riskWatch: 'Ada beberapa sinyal yang perlu dicermati. Bukan alarm, tapi perlu perhatian lebih.',
    riskCalm: 'Waktu yang tepat untuk review tanpa tekanan. Evaluasi apakah ukuran posisi masih sesuai tesis.',
  },

  focusLabel: 'Fokus hari ini',
  focus: {
    riskRising: 'Seberapa besar risiko yang siap kamu tanggung.',
    riskWatch: 'Pahami trade-off sebelum menambah posisi.',
    riskCalm: 'Jaga keputusan tetap tenang dan terukur.',
  },

  ctaViewPortfolio: 'Lihat portofolio',
  ctaTingAi: 'Tanya Ting AI',
  ctaExploreIntelligence: 'Explore Intelligence',
  ctaPortfolioImpact: 'Lihat dampak ke portofolio',

  cardMarketPressure: 'Pasar',
  cardPortfolioImpact: 'Portofolio',
  cardFocusLabel: 'Fokus',

  proHint: 'Analisis lengkap tersedia di Pro',
  proSectionAiExplanation: 'Penjelasan AI',
  proSectionRiskScenario: 'Skenario Risiko',
  proSectionPortfolioSim: 'Simulasi Dampak',
  proSectionAiChat: 'Tanya Ting AI',
  proUnlockLabel: 'Pro',
  proPreviewLabel: 'Lihat pratinjau',

  showDetail: 'Lihat detail',
  hideDetail: 'Sembunyikan',

  newsEvidenceLabel: 'Kenapa hari ini',
  newsAnalysisLabel: 'Lihat analisis berita',
  newsWhyItMatters: {
    risk_on: 'Sentimen pasar cenderung positif — momentum mendukung kenaikan jangka pendek.',
    risk_off: 'Sentimen pasar cenderung negatif — tekanan jual bisa meningkat.',
    neutral: 'Belum ada arah sentimen yang jelas dari berita terbaru.',
  },
  newsScenario: {
    risk_on: 'Jika momentum berlanjut, aset agresif bisa menguat lebih lanjut.',
    risk_off: 'Jika tekanan berlanjut, posisi terkonsentrasi bisa terdampak signifikan.',
    neutral: 'Pantau perkembangan — arah bisa berubah cepat.',
  },
  newsImpactToPortfolio: 'Posisi terbesar ({asset} di {pct}%) paling sensitif terhadap perubahan ini.',
  newsLoading: 'Memuat berita...',
  newsUnavailable: 'Berita belum tersedia.',

  riskLevels: { low: 'Rendah', medium: 'Sedang', high: 'Tinggi' },

  emptyTitle: 'Belum ada posisi',
  emptyBody: 'Tambahkan posisi pertama di portofolio untuk melihat ringkasan harian.',
  emptyCta: 'Buka Portofolio',

  emptyPortfolioHeroHeadline: 'Siap memulai perjalanan investasi yang lebih sadar?',
  emptyPortfolioHeroSubtext: 'Ting AI membantu kamu memahami risiko, peluang, dan dinamika portofolio dengan analisis mendalam setiap pagi.',
  emptyPortfolioCTAPrimary: 'Tambah Portofolio',
  emptyPortfolioCTASecondary: 'Coba Demo Portofolio',
  marketOverviewLabel: 'Konteks pasar hari ini',
  marketDataReady: 'Data siap',
  marketDataSyncing: 'Menyinkronkan data pasar...',
  marketDataSyncingFallback: 'Harga terbaru belum tersedia. Ting AI tidak menampilkan angka pasar palsu — hanya data asli yang dapat dipercaya.',
  marketDataUnavailableLabel: 'Belum tersedia',
  emptyPortfolioBenefitsLabel: 'Manfaat Ting AI',
  emptyPortfolioBenefits: {
    riskConcentration: {
      title: 'Pantau Konsentrasi Risiko',
      description: 'Pahami seberapa besar risiko yang terkonsentrasi pada aset-aset tertentu di portofoliomu.',
    },
    marketPressure: {
      title: 'Lihat Tekanan Pasar',
      description: 'Kenali bagaimana pergerakan pasar memengaruhi posisi-posisimu sebelum terlambat.',
    },
    decisionTrade: {
      title: 'Pahami Trade-Off',
      description: 'Evaluasi konsekuensi dari setiap keputusan investasi dengan perspektif yang terukur.',
    },
  },
  emptyPortfolioGuidanceLabel: 'Mulai dengan 3 langkah sederhana',
  emptyPortfolioGuidanceSteps: [
    'Tambahkan posisi pertama kamu (saham, crypto, emas, dll)',
    'Biarkan Ting AI menganalisis risiko dan peluang',
    'Dapatkan ringkasan harian yang personal dan actionable',
  ],
  emptyPortfolioNote: 'Ting AI bukan rekomendasi beli/jual. Kami membantu kamu membuat keputusan yang lebih informed dan sadar risiko.',

  greetingMorning: 'Selamat pagi',
  greetingSiang: 'Selamat siang',
  greetingSore: 'Selamat sore',
  greetingMalam: 'Selamat malam',
}

const en: MorningCommandCopy = {
  title: 'Morning Command',
  subtitle: 'Your daily risk and portfolio condition summary',
  datePrefix: '',

  heroHeadline: {
    riskRising: 'Today: reduce exposure, avoid adding major risk.',
    riskWatch: 'Today: stay disciplined, watch key positions.',
    riskCalm: 'Today: conditions are calm, review without pressure.',
  },

  states: {
    riskRising: 'Risk is rising',
    riskWatch: 'Needs attention',
    riskCalm: 'Risk is under control',
  },
  statesSub: {
    riskRising: 'Your portfolio is becoming more sensitive',
    riskWatch: 'There is pressure worth watching',
    riskCalm: 'Conditions are still relatively stable',
  },

  portfolioFit: {
    riskRising: 'Fragile',
    riskWatch: 'Watchful',
    riskCalm: 'Aligned',
  },

  impact: {
    riskRising: 'Small market moves may feel larger than usual.',
    riskWatch: 'Impact may show if sentiment weakens.',
    riskCalm: 'No significant pressure at this time.',
  },

  context: {
    riskRising: 'Your current positions are more sensitive to market direction. No need to react, but awareness matters.',
    riskWatch: 'There are signals worth watching. Not an alarm, but worth paying attention to.',
    riskCalm: 'A good time for a pressure-free review. Evaluate whether position sizing still matches your thesis.',
  },

  focusLabel: "Today's focus",
  focus: {
    riskRising: 'How much risk you are willing to carry.',
    riskWatch: 'Understand the trade-off before adding exposure.',
    riskCalm: 'Keep decisions calm and measured.',
  },

  ctaViewPortfolio: 'View portfolio',
  ctaTingAi: 'Ask Ting AI',
  ctaExploreIntelligence: 'Explore Intelligence',
  ctaPortfolioImpact: 'See portfolio impact',

  cardMarketPressure: 'Market',
  cardPortfolioImpact: 'Portfolio',
  cardFocusLabel: 'Focus',

  proHint: 'Full analysis is available in Pro',
  proSectionAiExplanation: 'AI Explanation',
  proSectionRiskScenario: 'Risk Scenario',
  proSectionPortfolioSim: 'Impact Simulation',
  proSectionAiChat: 'Ask Ting AI',
  proUnlockLabel: 'Pro',
  proPreviewLabel: 'Preview',

  showDetail: 'Show detail',
  hideDetail: 'Hide',

  newsEvidenceLabel: 'Why today',
  newsAnalysisLabel: 'See news analysis',
  newsWhyItMatters: {
    risk_on: 'Market sentiment is leaning positive — short-term momentum is supportive.',
    risk_off: 'Market sentiment is leaning negative — selling pressure may increase.',
    neutral: 'No clear directional signal from recent news.',
  },
  newsScenario: {
    risk_on: 'If momentum continues, aggressive assets could rally further.',
    risk_off: 'If pressure continues, concentrated positions may take outsized impact.',
    neutral: 'Monitor developments — direction could shift quickly.',
  },
  newsImpactToPortfolio: 'Your largest position ({asset} at {pct}%) is most sensitive to this shift.',
  newsLoading: 'Loading news...',
  newsUnavailable: 'News not available.',

  riskLevels: { low: 'Low', medium: 'Medium', high: 'High' },

  emptyTitle: 'No positions yet',
  emptyBody: 'Add your first portfolio position to unlock daily briefing.',
  emptyCta: 'Open Portfolio',

  emptyPortfolioHeroHeadline: 'Ready for more conscious investing?',
  emptyPortfolioHeroSubtext: 'Ting AI helps you understand risk, opportunity, and portfolio dynamics with deep analysis every morning.',
  emptyPortfolioCTAPrimary: 'Add Portfolio',
  emptyPortfolioCTASecondary: 'Try Demo Portfolio',
  marketOverviewLabel: 'Market context today',
  marketDataReady: 'Data ready',
  marketDataSyncing: 'Syncing market data...',
  marketDataSyncingFallback: 'Latest prices not available. Ting AI never shows fake market numbers — only real, trusted data.',
  marketDataUnavailableLabel: 'Unavailable',
  emptyPortfolioBenefitsLabel: 'Ting AI Benefits',
  emptyPortfolioBenefits: {
    riskConcentration: {
      title: 'Monitor Risk Concentration',
      description: 'Understand how much risk is concentrated on specific assets in your portfolio.',
    },
    marketPressure: {
      title: 'See Market Pressure',
      description: 'Recognize how market moves affect your positions before it becomes critical.',
    },
    decisionTrade: {
      title: 'Understand Trade-Offs',
      description: 'Evaluate the consequences of each investment decision with measured perspective.',
    },
  },
  emptyPortfolioGuidanceLabel: 'Start with 3 simple steps',
  emptyPortfolioGuidanceSteps: [
    'Add your first position (stocks, crypto, gold, etc.)',
    'Let Ting AI analyze risk and opportunities',
    'Get personalized and actionable daily insights',
  ],
  emptyPortfolioNote: 'Ting AI is not a buy/sell recommendation. We help you make more informed and risk-aware decisions.',

  greetingMorning: 'Good morning',
  greetingSiang: 'Good afternoon',
  greetingSore: 'Good evening',
  greetingMalam: 'Good night',
}

const dictionaries: Record<LanguageCode, MorningCommandCopy> = { id, en }

export const getMorningCommandCopy = (language: LanguageCode): MorningCommandCopy =>
  dictionaries[language] ?? dictionaries.id

export const getGreeting = (language: LanguageCode, name: string): string => {
  const c = getMorningCommandCopy(language)
  const hour = new Date().getHours()
  let greeting = c.greetingMorning
  if (hour >= 11 && hour < 15) greeting = c.greetingSiang
  else if (hour >= 15 && hour < 18) greeting = c.greetingSore
  else if (hour >= 18) greeting = c.greetingMalam
  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : name
  return `${greeting}, ${displayName}`
}
