/**
 * tingAiI18n.ts
 *
 * Central i18n dictionary for the Ting AI workspace.
 * Covers: TingAi page, InsightPanel, InsightEngineCard, ConfidenceBadge.
 *
 * Usage:
 *   import { getTingAiI18n } from '../utils/tingAiI18n'
 *   const t = getTingAiI18n(lang)
 *   t.riskSimulation  // → "Simulasi Risiko" | "Risk Simulation"
 *
 * Rules:
 *   - Zero hardcoded strings in JSX
 *   - No lang ternaries inside render
 *   - All text lives here
 */

import type { LanguageCode } from './language'

// ─────────────────────────────────────────────────────────────────────────────
// Type definition — exhaustive so TypeScript catches missing keys
// ─────────────────────────────────────────────────────────────────────────────

export interface TingAiI18n {
  // ── Page nav ──────────────────────────────────────────────────────────────
  back: string
  login: string
  viewPro: string

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroBadge: string
  heroRegion: string
  heroHeadline1: string
  heroHeadline2: string
  heroSubtitle: string

  // ── Capability row ────────────────────────────────────────────────────────
  capFree: string
  capPro: string
  capFreeItems: [string, string, string]
  capProItems: [string, string, string]

  // ── Input / loading ───────────────────────────────────────────────────────
  fallbackDataNote: string
  analysisResultLabel: string

  // ── Portfolio Input ────────────────────────────────────────────────────────
  portfolioInputLabel: string
  portfolioInputHelper: string
  portfolioInputHelperDetail: string
  portfolioInputNegativeError: string

  // ── IHSG card ─────────────────────────────────────────────────────────────
  ihsgLabel: string
  ihsgDelayed: string
  ihsgSubtitle: string
  ihsgUp: string
  ihsgDown: string
  ihsgAverage: string
  ihsgNotableLabel: string
  ihsgDisclaimer: (count: number) => string
  ihsgUnavailable: string

  // ── Market context section ────────────────────────────────────────────────
  marketContextLabel: string
  marketContextTitle: string
  marketContextSubtitle: string

  // ── Sentiment ─────────────────────────────────────────────────────────────
  bullish: string
  bearish: string
  neutral: string

  // ── Section dividers ──────────────────────────────────────────────────────
  analysisResult: string

  // ── Footer ────────────────────────────────────────────────────────────────
  footerPhilosophyTitle: string
  footerPhilosophyBody: string
  footerDataTitle: string
  footerDataBody: string
  footerCredit: string

  // ── InsightEngineCard ─────────────────────────────────────────────────────
  insightBadge: string
  insightExpand: string
  insightCollapse: string
  insightLayerReality: string
  insightLayerTradeoff: string
  insightLayerDirection: string
  insightDisclaimer: string
  basedOnCurrentData: string

  // ── InsightPanel — Risk Meter ─────────────────────────────────────────────
  riskSimulation: string
  portfolioHealth: string
  portfolioHealthSubtitle: string
  riskIndexTitle: string
  riskLabelSafe: string
  riskLabelAlert: string
  riskLabelRisky: string
  riskLow: string
  riskMedium: string
  riskHigh: string

  // ── InsightPanel — Free cards ─────────────────────────────────────────────
  cardPortfolioSummary: string
  cardPortfolioImpact: string
  cardMarketContext: string

  // ── InsightPanel — Pro cards ──────────────────────────────────────────────
  proFallback: string
  proIntelligenceLayer: string
  proPortfolioImpact: string
  proAllocationTradeoff: string
  proMicroScenario: string
  proDecisionContext: string
  proDividerLabel: string

  // ── InsightPanel — Intelligence Layer Card (locked preview) ──────────────
  intelligenceLayerLabel: string
  intelligenceLayerPro: string
  intelSensitivity: string
  intelMarketContext: string
  intelRiskTradeoff: string
  intelDecisionNote: string
  intelTeaser: string
  intelCta: string
  intelFallback: string

  // ── InsightPanel — Pro Gate Banner ───────────────────────────────────────
  proGateTitle: string
  proGateDesc: string
  proGateCta: string
  proGateBrand: string
  proGateFeatures: [string, string, string, string, string]

  // ── ConfidenceBadge — FREE badge ─────────────────────────────────────────
  confidencePrefix: string

  // ── ConfidenceBadge — PRO card ────────────────────────────────────────────
  trustLayerLabel: string
  confidenceBreakdown: string
  sourceAlignmentLabel: string
  volatilityContextLabel: string
  dataQualityLabel: string
  priceDeviationLabel: string

  // ── TingAiCopilot ─────────────────────────────────────────────────────────
  copilotDivider: string
  copilotTagline: string
  copilotWelcome: string
  copilotPlaceholder: string
  copilotReset: string
  copilotHeaderName: string
  copilotFallbackNote: string
  copilotStarterChips: [string, string, string, string]

  // ── Pro-aware TingAi mode ──────────────────────────────────────────────────
  freeHeaderTitle: string
  freeHeaderSubtitle: string
  freeBadge: string
  freePortfolioAvailableBadge: string
  freeSupportingCopy: string
  freePromptChips: [string, string, string, string]

  proHeaderTitle: string
  proHeaderSubtitle: string
  proBadge: string
  proSupportingCopy: string
  proPromptChips: [string, string, string, string, string, string]

  proNoPortfolioStatus: string
  proNoPortfolioDescription: string
  proNoPortfolioAddButton: string
  proNoPortfolioAskButton: string

  proWithPortfolioStatus: string
  proWithPortfolioDescription: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Indonesian
// ─────────────────────────────────────────────────────────────────────────────

const id: TingAiI18n = {
  // nav
  back: 'Kembali',
  login: 'Masuk',
  viewPro: 'Lihat Pro',

  // hero
  heroBadge: 'Kopilot Portofolio AI',
  heroRegion: 'Indonesia',
  heroHeadline1: 'Pahami portofolio,',
  heroHeadline2: 'bukan cuma pasar.',
  heroSubtitle: 'Masukkan alokasi. Ting AI membaca konsentrasi, risiko, dan konteks pasar tanpa memberi sinyal beli atau jual.',

  // capability row
  capFree: 'Gratis',
  capPro: 'Pro',
  capFreeItems: ['Komposisi', 'Risiko utama', 'Konteks IHSG'],
  capProItems: ['Lapisan intelijen', 'Dampak detail', 'Skenario risiko'],

  // input
  fallbackDataNote: 'Konteks pasar memakai estimasi karena data live belum tersinkron.',
  analysisResultLabel: 'Hasil Analisis',

  // Portfolio Input
  portfolioInputLabel: 'Tulis isi portofolio kamu',
  portfolioInputHelper: 'Persennya adalah porsi aset di portofolio, bukan profit/loss.',
  portfolioInputHelperDetail: 'Contoh: ANTM 50% berarti 50% portofolio kamu ada di ANTM.',
  portfolioInputNegativeError: 'Porsi portofolio tidak bisa minus. Kalau ingin mencatat untung/rugi, fitur itu belum tersedia di input ini.',

  // IHSG card
  ihsgLabel: 'IDX / IHSG',
  ihsgDelayed: 'Tertunda',
  ihsgSubtitle: 'Konteks pasar Indonesia hari ini',
  ihsgUp: 'Naik',
  ihsgDown: 'Turun',
  ihsgAverage: 'Rata-rata',
  ihsgNotableLabel: 'Pergerakan signifikan',
  ihsgDisclaimer: (count) => `Berdasarkan ${count} emiten IDX - bukan rekomendasi investasi`,
  ihsgUnavailable: 'Data IHSG belum tersedia.',

  // market context section
  marketContextLabel: 'Konteks Pasar',
  marketContextTitle: 'Kondisi IDX hari ini',
  marketContextSubtitle: 'IHSG membantu membaca tekanan pasar saham Indonesia, terutama jika portofoliomu berisi saham domestik.',

  // sentiment
  bullish: 'Bullish',
  bearish: 'Bearish',
  neutral: 'Netral',

  // section dividers
  analysisResult: 'Hasil Analisis',

  // footer
  footerPhilosophyTitle: 'Filosofi Analisis',
  footerPhilosophyBody: 'Ting AI membaca konsentrasi, korelasi sektoral, dan sensitivitas portofolio terhadap kondisi pasar. Investor ritel membutuhkan kejernihan, bukan sinyal transaksi.',
  footerDataTitle: 'Metodologi Data',
  footerDataBody: 'Harga disinkronkan berkala melalui sumber pasar publik. Seluruh analisis bersifat informatif dan bukan saran investasi.',
  footerCredit: 'Ting AI - Intelligence Engine v2.1 - Dibangun oleh Faturachman Alkahfi - Bukan rekomendasi investasi',

  // InsightEngineCard
  insightBadge: 'Insight Portofolio',
  insightExpand: 'Lihat penjelasan lengkap',
  insightCollapse: 'Sembunyikan',
  insightLayerReality: 'Kesimpulan cepat',
  insightLayerTradeoff: 'Yang perlu kamu pikirkan',
  insightLayerDirection: 'Yang perlu dipantau',
  insightDisclaimer: 'Bukan sinyal beli/jual. Dibuat untuk membantu lo berpikir, bukan bertindak.',
  basedOnCurrentData: 'Berdasarkan kondisi data saat ini',

  // InsightPanel — Risk Meter
  riskSimulation: 'Analisis risiko',
  portfolioHealth: 'Kesehatan Portofolio',
  portfolioHealthSubtitle: 'Tingkat risiko ini menunjukkan sensitivitas portofoliomu terhadap pergerakan pasar, diukur berdasarkan komposisi aset saat ini.',
  riskIndexTitle: 'Indeks Eksposur Risiko',
  riskLabelSafe: 'Aman',
  riskLabelAlert: 'Waspada',
  riskLabelRisky: 'Berisiko',
  riskLow: 'Rendah',
  riskMedium: 'Sedang',
  riskHigh: 'Tinggi',

  // InsightPanel — Free cards
  cardPortfolioSummary: 'Kondisi portofolio saya',
  cardPortfolioImpact: 'Efek ke posisi kamu',
  cardMarketContext: 'Market hari ini dan efeknya ke posisi kamu',

  // InsightPanel — Pro cards
  proFallback: 'Belum cukup data untuk membentuk analisis mendalam.',
  proIntelligenceLayer: 'Cara Ting AI membaca data',
  proPortfolioImpact: 'Efek ke posisi kamu',
  proAllocationTradeoff: 'Yang perlu kamu pikirkan',
  proMicroScenario: 'Skenario Mikro',
  proDecisionContext: 'Bantuan memahami keputusan',
  proDividerLabel: 'Lapisan Intelijen - Pro',

  // Intelligence Layer Card (locked preview)
  intelligenceLayerLabel: 'Cara Ting AI membaca data',
  intelligenceLayerPro: 'Pro',
  intelSensitivity: 'Kondisi portofolio saya',
  intelMarketContext: 'Market hari ini dan efeknya ke posisi kamu',
  intelRiskTradeoff: 'Yang perlu kamu pikirkan',
  intelDecisionNote: 'Bantuan memahami keputusan',
  intelTeaser: 'Insight ini membantu memahami risiko di balik angka, bukan memberi sinyal beli atau jual.',
  intelCta: 'Lihat penjelasan lengkap',
  intelFallback: 'Belum cukup data untuk membentuk analisis mendalam.',

  // Pro Gate Banner
  proGateTitle: 'Analisis tingkat lanjut',
  proGateDesc: 'Analisis singkat sudah tersedia. Untuk melihat alasan lengkap, skenario risiko, dan dampaknya ke tiap aset, lanjutkan dengan Ting AI Pro.',
  proGateCta: 'Lihat analisis lengkap',
  proGateBrand: 'Ting AI Pro',
  proGateFeatures: ['Cara Ting AI membaca data', 'Efek ke posisi kamu', 'Yang perlu kamu pikirkan', 'Analisis risiko', 'Bantuan memahami keputusan'],

  // ConfidenceBadge — FREE
  confidencePrefix: 'Keyakinan Data',

  // ConfidenceBadge — PRO
  trustLayerLabel: 'Trust Layer',
  confidenceBreakdown: 'Rincian Keyakinan Data',
  sourceAlignmentLabel: 'Kesesuaian Sumber',
  volatilityContextLabel: 'Konteks Volatilitas',
  dataQualityLabel: 'Kualitas Data',
  priceDeviationLabel: 'Deviasi Harga',

  // TingAiCopilot
  copilotDivider: 'Tanya Copilot',
  copilotTagline: 'Partner berpikir · bukan sinyal',
  copilotWelcome: 'Tanyakan apa pun tentang kondisi pasar atau portofoliomu. Ting AI akan membantu membaca konteksnya, bukan memberi sinyal beli atau jual.',
  copilotPlaceholder: 'Tanyakan kondisi pasar atau dampaknya ke portofoliomu...',
  copilotReset: 'Reset',
  copilotHeaderName: 'Kopilot',
  copilotFallbackNote: '· fallback lokal',
  copilotStarterChips: [
    'Portofolio saya aman nggak?',
    'Risiko terbesar saya apa?',
    'Market hari ini ngaruh ke aset saya nggak?',
    'Saya harus waspada di mana?',
  ],

  // Pro-aware TingAi mode
  freeHeaderTitle: 'Tanyakan ke Ting AI',
  freeHeaderSubtitle: 'Tanyakan konteks pasar, risiko, atau hal yang perlu dipantau.',
  freeBadge: 'Basic AI',
  freePortfolioAvailableBadge: 'Data portofolio tersedia',
  freeSupportingCopy: 'Ting AI membantu membaca konteks umum. Untuk analisis yang lebih personal berdasarkan portofolio, gunakan Ting AI Pro.',
  freePromptChips: [
    'Market hari ini ngaruh ke aset saya nggak?',
    'Risiko terbesar saya apa?',
    'Saya harus waspada di bagian mana?',
    'Apa yang perlu saya pantau dulu?',
  ],

  proHeaderTitle: 'Ting AI Copilot',
  proHeaderSubtitle: 'Copilot aktif. Ting AI membaca portofolio, konteks market, dan risiko untuk membantu kamu berpikir lebih jernih.',
  proBadge: 'Portfolio-aware Copilot',
  proSupportingCopy: 'Partner berpikir · bukan sinyal',
  proPromptChips: [
    'Apa risiko terbesar portofolio saya hari ini?',
    'Aset mana yang paling memengaruhi portofolio saya?',
    'Kalau IHSG melemah, apa dampaknya ke posisi saya?',
    'Apa yang perlu saya pantau sebelum tambah posisi?',
    'Buatkan skenario risk-off untuk portofolio saya',
    'Apa trade-off terbesar dari portofolio saya?',
  ],

  proNoPortfolioStatus: 'Copilot aktif, tapi portofolio belum lengkap',
  proNoPortfolioDescription: 'Tambahkan aset dulu agar Ting AI bisa memberi analisis yang lebih personal.',
  proNoPortfolioAddButton: 'Tambah aset portfolio',
  proNoPortfolioAskButton: 'Tanya secara umum dulu',

  proWithPortfolioStatus: 'Membaca portofolio kamu',
  proWithPortfolioDescription: 'Ting AI menghubungkan komposisi portofolio, risiko, dan konteks market.',
}

// ─────────────────────────────────────────────────────────────────────────────
// English
// ─────────────────────────────────────────────────────────────────────────────

const en: TingAiI18n = {
  // nav
  back: 'Back',
  login: 'Login',
  viewPro: 'View Pro',

  // hero
  heroBadge: 'AI Portfolio Copilot',
  heroRegion: 'Indonesia',
  heroHeadline1: 'Understand your portfolio,',
  heroHeadline2: 'not just the market.',
  heroSubtitle: 'Enter your allocation. Ting AI reads concentration, risk, and market context without giving buy or sell signals.',

  // capability row
  capFree: 'Free',
  capPro: 'Pro',
  capFreeItems: ['Composition', 'Main risk', 'IHSG context'],
  capProItems: ['Intelligence layer', 'Impact detail', 'Risk scenario'],

  // input
  fallbackDataNote: 'Market context is using estimates because live data is not synced yet.',
  analysisResultLabel: 'Analysis Result',

  // Portfolio Input
  portfolioInputLabel: 'Write your portfolio holdings',
  portfolioInputHelper: 'The percentage means portfolio allocation, not profit/loss.',
  portfolioInputHelperDetail: 'Example: ANTM 50% means 50% of your portfolio is in ANTM.',
  portfolioInputNegativeError: 'Portfolio allocation cannot be negative. Profit/loss input is not supported here yet.',

  // IHSG card
  ihsgLabel: 'IDX / IHSG',
  ihsgDelayed: 'Delayed',
  ihsgSubtitle: 'Indonesian market context today',
  ihsgUp: 'Up',
  ihsgDown: 'Down',
  ihsgAverage: 'Average',
  ihsgNotableLabel: 'Notable moves',
  ihsgDisclaimer: (count) => `Based on ${count} IDX stocks - not investment advice`,
  ihsgUnavailable: 'IHSG data is not available yet.',

  // market context section
  marketContextLabel: 'Market Context',
  marketContextTitle: 'IDX condition today',
  marketContextSubtitle: 'IHSG helps read Indonesian equity market pressure, especially when your portfolio contains domestic stocks.',

  // sentiment
  bullish: 'Bullish',
  bearish: 'Bearish',
  neutral: 'Neutral',

  // section dividers
  analysisResult: 'Analysis Result',

  // footer
  footerPhilosophyTitle: 'Analysis Philosophy',
  footerPhilosophyBody: 'Ting AI reads concentration, sector correlation, and portfolio sensitivity to market conditions. Retail investors need clarity, not transaction signals.',
  footerDataTitle: 'Data Methodology',
  footerDataBody: 'Prices are refreshed periodically through public market sources. All analysis is informational and is not investment advice.',
  footerCredit: 'Ting AI - Intelligence Engine v2.1 - Built by Faturachman Alkahfi - Not investment advice',

  // InsightEngineCard
  insightBadge: 'Portfolio Insight',
  insightExpand: 'Read full insight',
  insightCollapse: 'Collapse',
  insightLayerReality: 'Reality',
  insightLayerTradeoff: 'Trade-off',
  insightLayerDirection: 'Direction',
  insightDisclaimer: 'Not a buy/sell signal. Built to help you think, not act.',
  basedOnCurrentData: 'Based on current data conditions',

  // InsightPanel — Risk Meter
  riskSimulation: 'Risk Simulation',
  portfolioHealth: 'Portfolio Health',
  portfolioHealthSubtitle: "This risk level indicates your portfolio's sensitivity to market movements, measured based on current asset composition.",
  riskIndexTitle: 'Risk Exposure Index',
  riskLabelSafe: 'Safe',
  riskLabelAlert: 'Alert',
  riskLabelRisky: 'Risky',
  riskLow: 'Low',
  riskMedium: 'Medium',
  riskHigh: 'High',

  // InsightPanel — Free cards
  cardPortfolioSummary: 'My portfolio condition',
  cardPortfolioImpact: 'Effect on your position',
  cardMarketContext: 'Today\'s market and its effect on you',

  // InsightPanel — Pro cards
  proFallback: 'Not enough data to build deeper analysis yet.',
  proIntelligenceLayer: 'Intelligence Layer',
  proPortfolioImpact: 'Impact on your position',
  proAllocationTradeoff: 'Allocation Trade-off',
  proMicroScenario: 'Micro Scenario',
  proDecisionContext: 'Decision Context',
  proDividerLabel: 'Intelligence Layer - Pro',

  // Intelligence Layer Card (locked preview)
  intelligenceLayerLabel: 'Intelligence Layer',
  intelligenceLayerPro: 'Pro',
  intelSensitivity: 'My portfolio condition',
  intelMarketContext: 'Today\'s market and its effect on you',
  intelRiskTradeoff: 'Risk trade-off',
  intelDecisionNote: 'Decision note',
  intelTeaser: 'This insight helps explain the risk behind the numbers, not provide buy or sell signals.',
  intelCta: 'View full explanation',
  intelFallback: 'Not enough data to build deeper analysis yet.',

  // Pro Gate Banner
  proGateTitle: 'Advanced analysis',
  proGateDesc: 'A brief analysis is already provided. To see the full reasoning, risk scenarios, and impact on each asset, continue with Ting AI Pro.',
  proGateCta: 'View full analysis',
  proGateBrand: 'Ting AI Pro',
  proGateFeatures: ['Intelligence Layer', 'Portfolio Impact', 'Allocation Trade-off', 'Risk Scenario', 'Decision Framework'],

  // ConfidenceBadge — FREE
  confidencePrefix: 'Data Confidence',

  // ConfidenceBadge — PRO
  trustLayerLabel: 'Trust Layer',
  confidenceBreakdown: 'Confidence Breakdown',
  sourceAlignmentLabel: 'Source Alignment',
  volatilityContextLabel: 'Volatility Context',
  dataQualityLabel: 'Data Quality',
  priceDeviationLabel: 'Price Deviation',

  // TingAiCopilot
  copilotDivider: 'Ask Copilot',
  copilotTagline: 'Thinking partner · not a signal',
  copilotWelcome: 'Ask anything about market conditions or your portfolio. Ting AI will help read the context, not provide buy or sell signals.',
  copilotPlaceholder: 'Ask about market conditions or portfolio impact...',
  copilotReset: 'Reset',
  copilotHeaderName: 'Copilot',
  copilotFallbackNote: '· local fallback',
  copilotStarterChips: [
    'Is my portfolio safe?',
    'What is my biggest risk?',
    'Does today\'s market affect my assets?',
    'What should I be careful of?',
  ],

  // Pro-aware TingAi mode
  freeHeaderTitle: 'Ask Ting AI',
  freeHeaderSubtitle: 'Ask about market context, risks, or what to monitor.',
  freeBadge: 'Basic AI',
  freePortfolioAvailableBadge: 'Portfolio data available',
  freeSupportingCopy: 'Ting AI helps read general context. For more personal analysis based on your portfolio, use Ting AI Pro.',
  freePromptChips: [
    'Does today\'s market affect my assets?',
    'What is my biggest risk?',
    'What should I be careful of?',
    'What do I need to monitor first?',
  ],

  proHeaderTitle: 'Ting AI Copilot',
  proHeaderSubtitle: 'Copilot active. Ting AI reads your portfolio, market context, and risk to help you think more clearly.',
  proBadge: 'Portfolio-aware Copilot',
  proSupportingCopy: 'Thinking partner · not a signal',
  proPromptChips: [
    'What is my portfolio\'s biggest risk today?',
    'Which asset impacts my portfolio the most?',
    'What happens if IHSG weakens?',
    'What should I monitor before adding positions?',
    'Create a risk-off scenario for my portfolio',
    'What is my portfolio\'s biggest trade-off?',
  ],

  proNoPortfolioStatus: 'Copilot active, but portfolio incomplete',
  proNoPortfolioDescription: 'Add assets first so Ting AI can provide more personal analysis.',
  proNoPortfolioAddButton: 'Add portfolio assets',
  proNoPortfolioAskButton: 'Ask generally first',

  proWithPortfolioStatus: 'Reading your portfolio',
  proWithPortfolioDescription: 'Ting AI connects portfolio composition, risk, and market context.',
}

// ─────────────────────────────────────────────────────────────────────────────
// Accessor
// ─────────────────────────────────────────────────────────────────────────────

const dict: Record<LanguageCode, TingAiI18n> = { id, en }

/**
 * getTingAiI18n(lang)
 * Returns the full copy object for the given language.
 * Falls back to 'id' if lang is unrecognised.
 */
export const getTingAiI18n = (lang: LanguageCode): TingAiI18n => dict[lang] ?? dict.id
