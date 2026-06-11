// ─────────────────────────────────────────────────────────────────────────────
// Ting AI — Trust Layer v2
//
// PHILOSOPHY:
//   Provide reliability indication without misleading users.
//   Never claim "100% accurate". Always reflect uncertainty.
//   Tone: calm, neutral, non-predictive.
//
// CONFIDENCE LEVELS:
//   HIGH   — multi-source aligned (Yahoo + FMP within 5%) + stable data
//   MEDIUM — single source, or minor deviation (5–10%), or partial data
//   LOW    — no primary price, high deviation (>10%), or mostly fallback/error
//
// RULES:
//   - No prediction
//   - No signal
//   - No overclaim
//   - awareness > certainty
// ─────────────────────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW'

export type VolatilityContext = 'low' | 'medium' | 'high'

export type DataQuality = 'good' | 'partial' | 'weak'

// ── Reason shape (v2 — backward compatible) ───────────────────────────────────

export interface ConfidenceReason {
  /** Whether two or more data sources are in alignment (deviation ≤ 5%) */
  sourceAlignment: boolean
  /** Contextual volatility level */
  volatility: VolatilityContext
  /** Overall data quality descriptor */
  dataQuality: DataQuality
  /**
   * Price deviation % between Yahoo and FMP (0–1 scale).
   * Undefined when only a single source is available.
   */
  priceDeviation?: number
  /**
   * Human-readable note surfaced in PRO breakdown.
   * Examples: "Sources aligned", "Single source (Yahoo only)", "Minor deviation detected"
   */
  note?: string
}

export interface ConfidenceScore {
  confidence: ConfidenceLevel
  reason: ConfidenceReason
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A — Per-symbol scoring (Yahoo vs FMP)
//
// Use this when you have actual prices from two sources.
// This is the primary, preferred path.
// ─────────────────────────────────────────────────────────────────────────────

export interface SymbolTrustInput {
  /** Ticker symbol (for logging context only) */
  symbol?: string
  /** Price from Yahoo Finance (primary source) */
  yahooPrice: number | null | undefined
  /** Price from FMP or other secondary source — null if unavailable */
  fmpPrice?: number | null
  /** Market volatility context — derived externally */
  volatility?: VolatilityContext
  /** Status from the fetch layer — used for data quality assessment */
  status?: 'live' | 'delayed' | 'fallback' | 'error'
}

/**
 * formatDeviation()
 *
 * Formats a 0–1 decimal deviation as a percentage string.
 * Used only in PRO view. Safe against NaN / Infinity.
 *
 * Example: 0.018 → "1.8%"
 */
export function formatDeviation(deviation: number): string {
  if (!isFinite(deviation) || isNaN(deviation)) return 'N/A'
  const pct = Math.min(deviation * 100, 999) // clamp to 999% max
  return `${pct.toFixed(1)}%`
}

/**
 * computeConfidenceForSymbol()
 *
 * Real multi-source validation using Yahoo price vs FMP price.
 *
 * Rules:
 *   No Yahoo price                → LOW
 *   Yahoo only (no FMP)          → MEDIUM  (never HIGH from single source)
 *   Yahoo + FMP, deviation ≤ 5%  → HIGH
 *   Yahoo + FMP, deviation ≤ 10% → MEDIUM
 *   Yahoo + FMP, deviation > 10% → LOW
 *
 * The volatility context can lower confidence one step (HIGH→MEDIUM, MEDIUM→LOW)
 * when explicitly set to 'high', but never raises it.
 */
export function computeConfidenceForSymbol(input: SymbolTrustInput): ConfidenceScore {
  const {
    yahooPrice,
    fmpPrice,
    volatility = 'medium',
    status = 'delayed',
  } = input

  // ── Guard: no usable Yahoo price at all ───────────────────────────
  if (!yahooPrice || yahooPrice <= 0 || !isFinite(yahooPrice)) {
    return {
      confidence: 'LOW',
      reason: {
        sourceAlignment: false,
        volatility,
        dataQuality: 'weak',
        note: 'No primary price available',
      },
    }
  }

  // ── Data quality from status ───────────────────────────────────────
  const dataQuality: DataQuality =
    status === 'live' || status === 'delayed' ? 'good'
    : status === 'fallback' ? 'partial'
    : 'weak'

  // ── Single source path (no FMP) ───────────────────────────────────
  if (fmpPrice == null || fmpPrice <= 0 || !isFinite(fmpPrice)) {
    const confidence: ConfidenceLevel = dataQuality === 'weak' ? 'LOW' : 'MEDIUM'
    return {
      confidence,
      reason: {
        sourceAlignment: false,
        volatility,
        dataQuality,
        priceDeviation: undefined,
        note: 'Single source (Yahoo only)',
      },
    }
  }

  // ── Multi-source path (Yahoo + FMP) ───────────────────────────────
  // Safe division — yahooPrice is guaranteed > 0 at this point
  const rawDeviation = Math.abs(yahooPrice - fmpPrice) / yahooPrice
  // Clamp to [0, 1] to prevent absurd display values
  const deviation = Math.min(rawDeviation, 1)

  let confidence: ConfidenceLevel
  let sourceAlignment: boolean
  let note: string

  if (deviation <= 0.05) {
    confidence = 'HIGH'
    sourceAlignment = true
    note = 'Sources aligned'
  } else if (deviation <= 0.10) {
    confidence = 'MEDIUM'
    sourceAlignment = false
    note = 'Minor deviation detected'
  } else {
    confidence = 'LOW'
    sourceAlignment = false
    note = 'High deviation across sources'
  }

  // ── Volatility penalty: high vol can lower confidence one step ────
  if (volatility === 'high') {
    if (confidence === 'HIGH') confidence = 'MEDIUM'
    else if (confidence === 'MEDIUM') confidence = 'LOW'
  }

  // ── Data quality penalty: weak status caps at LOW ─────────────────
  if (dataQuality === 'weak') {
    confidence = 'LOW'
  }

  return {
    confidence,
    reason: {
      sourceAlignment,
      volatility,
      dataQuality,
      priceDeviation: deviation,
      note,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B — Portfolio-level confidence aggregation
//
// Aggregates multiple per-symbol scores into one portfolio-level score.
// Used when the user has entered multiple holdings.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * aggregateConfidenceScores()
 *
 * Given N per-symbol scores, derives a portfolio-level confidence.
 * Strategy: majority vote with a bias toward the lower bound.
 * (If > 50% of symbols are LOW → portfolio is LOW, etc.)
 */
export function aggregateConfidenceScores(scores: ConfidenceScore[]): ConfidenceScore {
  if (!scores.length) {
    return {
      confidence: 'LOW',
      reason: {
        sourceAlignment: false,
        volatility: 'medium',
        dataQuality: 'weak',
        note: 'No symbol data available',
      },
    }
  }

  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 }
  let totalDev = 0
  let devCount = 0
  let anyAligned = false
  const vol = scores[0].reason.volatility // use first symbol's volatility context

  for (const s of scores) {
    counts[s.confidence]++
    if (s.reason.priceDeviation !== undefined) {
      totalDev += s.reason.priceDeviation
      devCount++
    }
    if (s.reason.sourceAlignment) anyAligned = true
  }

  const n = scores.length
  let confidence: ConfidenceLevel

  if (counts.LOW / n > 0.5) {
    confidence = 'LOW'
  } else if (counts.HIGH / n >= 0.6 && counts.LOW === 0) {
    confidence = 'HIGH'
  } else {
    confidence = 'MEDIUM'
  }

  const avgDeviation = devCount > 0 ? totalDev / devCount : undefined

  // Derive aggregate data quality
  const allGood = scores.every(s => s.reason.dataQuality === 'good')
  const anyWeak = scores.some(s => s.reason.dataQuality === 'weak')
  const dataQuality: DataQuality = allGood ? 'good' : anyWeak ? 'weak' : 'partial'

  const note =
    confidence === 'HIGH'   ? 'Sources aligned across portfolio' :
    confidence === 'MEDIUM' ? 'Partial validation across holdings' :
    'Limited data reliability across holdings'

  return {
    confidence,
    reason: {
      sourceAlignment: anyAligned,
      volatility: vol,
      dataQuality,
      priceDeviation: avgDeviation,
      note,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C — Fallback path (status-only, no prices)
//
// Preserved from v1. Used when FMP data is unavailable
// or for non-equity assets (index, crypto, commodity).
// ─────────────────────────────────────────────────────────────────────────────

export interface SourceQuote {
  /** Price from primary source (symbolic — set to 1 if unknown) */
  primaryPrice: number
  /** Price from secondary source — optional */
  secondaryPrice?: number
  /** Status from the fetch layer */
  status: 'live' | 'delayed' | 'fallback' | 'error'
}

export interface TrustLayerInput {
  quotes: SourceQuote[]
  greenCount: number
  totalCount: number
  forceVolatility?: VolatilityContext
}

export interface LightQuote {
  status: 'live' | 'delayed' | 'fallback' | 'error'
  changePercent: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BREADTH_HIGH_VOL = 0.75
const BREADTH_LOW_VOL  = 0.30

// ── Internal helpers ──────────────────────────────────────────────────────────

function deriveVolatility(
  greenCount: number,
  totalCount: number,
  forced?: VolatilityContext
): VolatilityContext {
  if (forced) return forced
  if (totalCount === 0) return 'medium'
  const redRatio = (totalCount - greenCount) / totalCount
  if (redRatio > BREADTH_HIGH_VOL) return 'high'
  if (redRatio < BREADTH_LOW_VOL) return 'low'
  return 'medium'
}

function assessDataQuality(quotes: SourceQuote[]): DataQuality {
  if (!quotes.length) return 'weak'
  const liveOrDelayed = quotes.filter(q => q.status === 'live' || q.status === 'delayed').length
  const ratio = liveOrDelayed / quotes.length
  if (ratio >= 0.8) return 'good'
  if (ratio >= 0.4) return 'partial'
  return 'weak'
}

/**
 * computeConfidence()
 *
 * Legacy batch path. Kept for backward compatibility.
 * Prefer computeConfidenceForSymbol() for per-asset validation.
 */
export function computeConfidence(input: TrustLayerInput): ConfidenceScore {
  const { quotes, greenCount, totalCount, forceVolatility } = input

  const volatility = deriveVolatility(greenCount, totalCount, forceVolatility)
  const dataQuality = assessDataQuality(quotes)

  const alignedCount = quotes.filter(q => {
    if (q.secondaryPrice === undefined || q.secondaryPrice <= 0) return false
    if (q.primaryPrice <= 0) return false
    const dev = Math.abs(q.primaryPrice - q.secondaryPrice) / q.primaryPrice
    return dev <= 0.05
  }).length
  const comparableCount = quotes.filter(q =>
    q.secondaryPrice !== undefined && q.secondaryPrice > 0
  ).length

  const sourceAlignment = comparableCount > 0
    ? alignedCount / comparableCount >= 0.6
    : false

  let confidence: ConfidenceLevel

  if (dataQuality === 'weak') {
    confidence = 'LOW'
  } else if (dataQuality === 'good' && volatility === 'low' && (sourceAlignment || comparableCount === 0)) {
    confidence = 'HIGH'
  } else if (volatility === 'high' || dataQuality === 'partial') {
    confidence = 'MEDIUM'
  } else if (!sourceAlignment && comparableCount > 0) {
    confidence = 'MEDIUM'
  } else {
    confidence = 'MEDIUM'
  }

  const errorCount = quotes.filter(q => q.status === 'fallback' || q.status === 'error').length
  if (errorCount > quotes.length * 0.5) {
    confidence = 'LOW'
  }

  return {
    confidence,
    reason: {
      sourceAlignment,
      volatility,
      dataQuality,
      note: sourceAlignment ? 'Sources aligned' : 'Single source (Yahoo only)',
    },
  }
}

/**
 * computeConfidenceFromQuotes()
 *
 * Lightweight wrapper — uses only quote statuses and breadth.
 * Fallback path when FMP is unavailable or for non-equity assets.
 * Preserved from v1. DO NOT REMOVE.
 */
export function computeConfidenceFromQuotes(
  quotes: LightQuote[],
  forceVolatility?: VolatilityContext
): ConfidenceScore {
  const sourceQuotes: SourceQuote[] = quotes.map(q => ({
    primaryPrice: 1,
    status: q.status,
  }))

  const greenCount = quotes.filter(q => q.changePercent >= 0).length
  const totalCount = quotes.length

  return computeConfidence({
    quotes: sourceQuotes,
    greenCount,
    totalCount,
    forceVolatility,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D — i18n helpers (v2 — backward compatible)
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfidenceI18n {
  label: string
  description: string
  alignmentLabel: string
  volatilityLabel: string
  dataQualityLabel: string
  /** PRO only: formatted price deviation (e.g. "1.8%") or null */
  deviationLabel: string | null
  /** Human-readable note for PRO breakdown */
  noteLabel: string
  disclaimer: string
}

export function getConfidenceI18n(
  score: ConfidenceScore,
  lang: 'id' | 'en'
): ConfidenceI18n {
  const { confidence, reason } = score

  const levelLabel: Record<ConfidenceLevel, { id: string; en: string }> = {
    HIGH:   { id: 'Tinggi',  en: 'High'   },
    MEDIUM: { id: 'Sedang',  en: 'Medium' },
    LOW:    { id: 'Rendah',  en: 'Low'    },
  }

  const levelDesc: Record<ConfidenceLevel, { id: string; en: string }> = {
    HIGH: {
      id: 'Data yang ditampilkan berasal dari sumber yang stabil dan cukup konsisten.',
      en: 'Data shown comes from stable and reasonably consistent sources.',
    },
    MEDIUM: {
      id: 'Kondisi pasar atau kualitas data sedang membatasi tingkat keyakinan kami.',
      en: 'Market conditions or data quality are currently limiting our confidence.',
    },
    LOW: {
      id: 'Data terbatas atau tidak dapat diverifikasi sepenuhnya. Gunakan dengan hati-hati.',
      en: 'Data is limited or cannot be fully verified. Use with caution.',
    },
  }

  const volatilityDesc: Record<VolatilityContext, { id: string; en: string }> = {
    low:    { id: 'Volatilitas rendah',  en: 'Low volatility'    },
    medium: { id: 'Volatilitas sedang',  en: 'Medium volatility' },
    high:   { id: 'Volatilitas tinggi',  en: 'High volatility'   },
  }

  const dataQualityDesc: Record<DataQuality, { id: string; en: string }> = {
    good:    { id: 'Data berkualitas baik',    en: 'Good data quality'        },
    partial: { id: 'Data sebagian tersedia',   en: 'Partial data available'   },
    weak:    { id: 'Data terbatas / fallback', en: 'Weak data / fallback'     },
  }

  // Alignment label — use note if available, else derive from boolean
  const defaultAlignment = reason.sourceAlignment
    ? (lang === 'id' ? 'Sumber data selaras' : 'Sources aligned')
    : (lang === 'id' ? 'Verifikasi sumber terbatas' : 'Limited source verification')

  const noteMap: Record<string, { id: string; en: string }> = {
    'Sources aligned':                { id: 'Sumber data selaras',             en: 'Sources aligned'                },
    'Single source (Yahoo only)':     { id: 'Satu sumber (Yahoo saja)',         en: 'Single source (Yahoo only)'     },
    'Minor deviation detected':       { id: 'Deviasi kecil terdeteksi',         en: 'Minor deviation detected'       },
    'High deviation across sources':  { id: 'Deviasi besar antar sumber',       en: 'High deviation across sources'  },
    'No primary price available':     { id: 'Harga utama tidak tersedia',        en: 'No primary price available'     },
    'No symbol data available':       { id: 'Data simbol tidak tersedia',        en: 'No symbol data available'       },
    'Sources aligned across portfolio':    { id: 'Sumber selaras di portofolio', en: 'Sources aligned across portfolio'    },
    'Partial validation across holdings':  { id: 'Validasi sebagian posisi',     en: 'Partial validation across holdings'  },
    'Limited data reliability across holdings': { id: 'Keandalan data terbatas', en: 'Limited data reliability across holdings' },
  }

  const noteRaw = reason.note ?? ''
  const noteLabel = noteMap[noteRaw]
    ? noteMap[noteRaw][lang]
    : (noteRaw || defaultAlignment)

  const deviationLabel = reason.priceDeviation !== undefined
    ? formatDeviation(reason.priceDeviation)
    : null

  const disclaimer = lang === 'id'
    ? 'Ting AI tidak mengklaim akurasi penuh. Data bersifat indikatif.'
    : 'Ting AI does not claim full accuracy. Data is indicative only.'

  return {
    label:            levelLabel[confidence][lang],
    description:      levelDesc[confidence][lang],
    alignmentLabel:   noteLabel,
    volatilityLabel:  volatilityDesc[reason.volatility][lang],
    dataQualityLabel: dataQualityDesc[reason.dataQuality][lang],
    deviationLabel,
    noteLabel,
    disclaimer,
  }
}
