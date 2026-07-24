/**
 * exploreIntelligenceI18n.ts
 * Full i18n for Explore Intelligence page. Zero hardcoded JSX strings.
 */
import type { LanguageCode } from './language'

type ExploreI18n = {
  pageTitle: string
  pageSubtitle: string
  startHereTitle: string
  startHereBody: string
  startHereMorning: string
  startHerePortfolio: string
  startHereAsk: string
  recommended: string

  // Sections
  marketPulse: string
  smartChart: string
  newsIntelligence: string
  portfolioRelation: string
  opportunityContext: string

  // Market Pulse
  liveLabel: string
  delayedLabel: string
  unavailableLabel: string
  fallbackLabel: string
  changeDayLabel: string

  // Chart
  chartLoading: string
  chartUnavailable: string
  chartError: string
  chartRangeLabel: string
  rangeLabels: Record<string, string>
  chartMin: string
  chartMax: string
  chartClickHint: string
  ihsgUnavailable: string
  ihsgPortfolioCopy: string

  // News
  newsTitle: string
  newsNotConnected: string
  newsNotConnectedBody: string
  newsSourceLabel: string
  newsRelevanceLabel: string
  newsLoading: string
  newsFailed: string
  newsLoadedSubtitle: string
  newsLoadingTitle: string
  newsLoadingBody: string
  newsProviderUnavailableTitle: string
  newsProviderUnavailableBody: string
  newsRetryCta: string
  newsGeneralTitle: string
  newsNoPortfolioBody: string
  newsAddPortfolioCta: string
  newsEmptyTitle: string
  newsEmptyBody: string
  newsFallbackRelevance: string
  newsStatusDelayed: string
  newsStatusCached: string
  newsStatusUnavailable: string

  // Portfolio relation
  portfolioRelationHint: string
  portfolioRelationEmpty: string

  // Pro gate
  proUnlockCta: string
  softProCta: string
  softProMicrocopy: string
  proGateLabel: string
  proInterpretation: string
  intelligenceNote: string
  notTransactionRecommendation: string
  opportunityExample: string

  // CTA
  ctaMorningCommand: string
  ctaPortfolio: string

  // Status
  bullish: string
  bearish: string
  neutral: string

  // Market data
  marketDataUnavailable: string
  partialDataWarning: string
  proLockedRelevance: string
  timeframeLocked: string

  // Legacy components
  technicalVisualization: string
  clickForTechnicalVisualization: string
  consumer: string
  bank: string
  telco: string
  tech: string
  energy: string
  industry: string
  mining: string
}

const id: ExploreI18n = {
  pageTitle: 'Explore Intelligence',
  pageSubtitle: 'Konteks pasar, kondisi aset, dan relevansinya ke portofolio kamu',
  startHereTitle: 'Mulai dari sini',
  startHereBody: 'Baru pertama kali pakai Ting AI? Mulai dari Komando Pagi untuk melihat kondisi market hari ini, lalu buka Portfolio untuk memahami efeknya ke posisi kamu.',
  startHereMorning: 'Cek kondisi hari ini',
  startHerePortfolio: 'Cek risiko portofolio',
  startHereAsk: 'Tanya Ting AI',
  recommended: 'Recommended',

  marketPulse: 'Denyut Pasar',
  smartChart: 'Grafik Harga',
  newsIntelligence: 'Inteligensi Berita',
  portfolioRelation: 'Relevansi ke Portofolio',
  opportunityContext: 'Konteks Peluang',

  liveLabel: 'Live',
  delayedLabel: 'Tunda',
  unavailableLabel: 'Tidak tersedia',
  fallbackLabel: 'Estimasi',
  changeDayLabel: 'Perubahan hari ini',

  chartLoading: 'Memuat data grafik...',
  chartUnavailable: 'Data grafik belum tersedia',
  chartError: 'Gagal memuat grafik',
  chartRangeLabel: 'Rentang waktu',
  rangeLabels: { '5d': '5H', '1mo': '1B', '3mo': '3B', '6mo': '6B' },
  chartMin: 'Min Rentang',
  chartMax: 'Maks Rentang',
  chartClickHint: 'Klik kartu untuk melihat grafik',
  ihsgUnavailable: 'Data IHSG belum tersedia.',
  ihsgPortfolioCopy: 'IHSG membantu membaca tekanan pasar saham Indonesia, terutama jika portofoliomu berisi saham domestik.',

  newsTitle: 'News Intelligence',
  newsNotConnected: 'Berita belum tersedia',
  newsNotConnectedBody: 'Sumber berita sedang tidak tersedia. Ting AI tetap bisa membaca risiko dari portofolio dan market context yang ada.',
  newsSourceLabel: 'Sumber',
  newsRelevanceLabel: 'Relevansi pasar',
  newsLoading: 'Memuat berita pasar...',
  newsFailed: 'Gagal memuat berita',
  newsLoadedSubtitle: 'Berita dan katalis yang paling relevan dengan portofolio kamu.',
  newsLoadingTitle: 'Mengambil berita pasar...',
  newsLoadingBody: 'Ting AI sedang mencari berita yang relevan dengan portofolio kamu.',
  newsProviderUnavailableTitle: 'Berita belum tersedia',
  newsProviderUnavailableBody: 'Sumber berita sedang tidak tersedia. Ting AI tetap bisa membaca risiko dari portofolio dan market context yang ada.',
  newsRetryCta: 'Coba lagi',
  newsGeneralTitle: 'Berita market umum',
  newsNoPortfolioBody: 'Tambahkan portofolio agar Ting AI bisa memilih berita yang paling relevan dengan aset kamu.',
  newsAddPortfolioCta: 'Tambah portfolio',
  newsEmptyTitle: 'Belum ada berita relevan',
  newsEmptyBody: 'Tidak ada berita baru yang cukup relevan dengan portofolio kamu saat ini.',
  newsFallbackRelevance: 'Relevan sebagai konteks pasar untuk membaca risiko portofolio kamu.',
  newsStatusDelayed: 'Data tertunda',
  newsStatusCached: 'Cache',
  newsStatusUnavailable: 'Sumber belum tersedia',

  portfolioRelationHint: 'Pergerakan aset ini mungkin lebih berpengaruh karena portofolio kamu terkonsentrasi di sini.',
  portfolioRelationEmpty: 'Tambahkan posisi di portofolio untuk melihat relevansi market ke aset kamu.',

  proUnlockCta: 'Buka analisis lengkap di Pro',
  softProCta: 'Lihat penjelasan lengkap',
  softProMicrocopy: 'Insight ini membantu memahami risiko di balik angka, bukan memberi sinyal beli atau jual.',
  proGateLabel: 'Fitur Pro',
  proInterpretation: 'Lihat penjelasan lengkap',
  intelligenceNote: 'Catatan Inteligensi',
  notTransactionRecommendation: 'Bukan rekomendasi transaksi',
  opportunityExample: 'Beberapa saham menunjukkan karakteristik yield tinggi, tetapi yield tinggi tidak selalu berarti peluang tanpa melihat penyebabnya.',

  ctaMorningCommand: 'Komando Pagi',
  ctaPortfolio: 'Lihat Portofolio',

  bullish: 'Bullish',
  bearish: 'Bearish',
  neutral: 'Netral',

  marketDataUnavailable: 'Data pasar belum tersedia',
  partialDataWarning: 'Beberapa data belum tersedia',
  proLockedRelevance: 'Buka analisis lengkap di Pro',
  timeframeLocked: 'Rentang waktu ini tersedia di Pro',

  technicalVisualization: 'Visualisasi teknikal',
  clickForTechnicalVisualization: 'Klik untuk visualisasi teknikal',
  consumer: 'Konsumer',
  bank: 'Bank',
  telco: 'Telco',
  tech: 'Tech',
  energy: 'Energi',
  industry: 'Industri',
  mining: 'Tambang',
}

const en: ExploreI18n = {
  pageTitle: 'Explore Intelligence',
  pageSubtitle: 'Market context, asset conditions, and how they relate to your portfolio',
  startHereTitle: 'Start here',
  startHereBody: 'New to Ting AI? Start with Morning Command to see today\'s market conditions, then open Portfolio to understand the effect on your positions.',
  startHereMorning: 'Check today\'s conditions',
  startHerePortfolio: 'Check portfolio risk',
  startHereAsk: 'Ask Ting AI',
  recommended: 'Recommended',

  marketPulse: 'Market Pulse',
  smartChart: 'Price Chart',
  newsIntelligence: 'News Intelligence',
  portfolioRelation: 'Portfolio Relevance',
  opportunityContext: 'Opportunity Context',

  liveLabel: 'Live',
  delayedLabel: 'Delayed',
  unavailableLabel: 'Unavailable',
  fallbackLabel: 'Estimated',
  changeDayLabel: "Today's change",

  chartLoading: 'Loading chart data...',
  chartUnavailable: 'Chart data is not available',
  chartError: 'Failed to load chart',
  chartRangeLabel: 'Time range',
  rangeLabels: { '5d': '5D', '1mo': '1M', '3mo': '3M', '6mo': '6M' },
  chartMin: 'Range Min',
  chartMax: 'Range Max',
  chartClickHint: 'Click a card to view its chart',
  ihsgUnavailable: 'IHSG data is not available yet.',
  ihsgPortfolioCopy: 'IHSG helps read Indonesian equity market pressure, especially when your portfolio contains domestic stocks.',

  newsTitle: 'News Intelligence',
  newsNotConnected: 'News is not available yet',
  newsNotConnectedBody: 'The news source is unavailable. Ting AI can still read risk from your portfolio and available market context.',
  newsSourceLabel: 'Source',
  newsRelevanceLabel: 'Market relevance',
  newsLoading: 'Loading market news...',
  newsFailed: 'Failed to load news',
  newsLoadedSubtitle: 'News and catalysts most relevant to your portfolio.',
  newsLoadingTitle: 'Loading market news...',
  newsLoadingBody: 'Ting AI is looking for news relevant to your portfolio.',
  newsProviderUnavailableTitle: 'News is not available yet',
  newsProviderUnavailableBody: 'The news source is unavailable. Ting AI can still read risk from your portfolio and available market context.',
  newsRetryCta: 'Try again',
  newsGeneralTitle: 'General market news',
  newsNoPortfolioBody: 'Add a portfolio so Ting AI can choose the news most relevant to your assets.',
  newsAddPortfolioCta: 'Add portfolio',
  newsEmptyTitle: 'No relevant news yet',
  newsEmptyBody: 'There is no new news relevant enough to your portfolio right now.',
  newsFallbackRelevance: 'Relevant as market context for reading your portfolio risk.',
  newsStatusDelayed: 'Data delayed',
  newsStatusCached: 'Cache',
  newsStatusUnavailable: 'Source unavailable',

  portfolioRelationHint: 'This asset movement may matter more because your portfolio is concentrated here.',
  portfolioRelationEmpty: 'Add positions in your portfolio to see how market conditions relate to your holdings.',

  proUnlockCta: 'Unlock full analysis in Pro',
  softProCta: 'View full explanation',
  softProMicrocopy: 'This insight helps explain the risk behind the numbers, not provide buy or sell signals.',
  proGateLabel: 'Pro feature',
  proInterpretation: 'View full explanation',
  intelligenceNote: 'Intelligence Note',
  notTransactionRecommendation: 'Not a transaction recommendation',
  opportunityExample: 'Some stocks show high-yield characteristics, but high yield does not always mean opportunity without understanding the cause.',

  ctaMorningCommand: 'Morning Command',
  ctaPortfolio: 'View Portfolio',

  bullish: 'Bullish',
  bearish: 'Bearish',
  neutral: 'Neutral',

  marketDataUnavailable: 'Market data is not available',
  partialDataWarning: 'Some data is unavailable',
  proLockedRelevance: 'Unlock full analysis in Pro',
  timeframeLocked: 'This timeframe is available in Pro',

  technicalVisualization: 'Technical Visualization',
  clickForTechnicalVisualization: 'Click for technical visualization',
  consumer: 'Consumer',
  bank: 'Bank',
  telco: 'Telco',
  tech: 'Tech',
  energy: 'Energy',
  industry: 'Industry',
  mining: 'Mining',
}

const dict: Record<LanguageCode, ExploreI18n> = { id, en }
export const getExploreI18n = (lang: LanguageCode): ExploreI18n => dict[lang] ?? dict.id
