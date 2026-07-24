/**
 * newsSignalService.ts
 * Fetches market news and normalizes into actionable signals.
 * Single pipeline — both Layer A (micro bullets) and Layer B (analysis) use same data.
 */

import { getMarketNews, type MarketNewsItem } from '../services/marketData'
import { IS_DEV } from './api'
import type { LanguageCode } from './language'

/** Core signal direction */
export type SignalDirection = 'risk_on' | 'risk_off' | 'neutral'

/** A normalized news signal */
export interface NewsSignal {
  direction: SignalDirection
  /** Micro bullet text — max ~10 words */
  bullet: string
  /** Full driver descriptions */
  drivers: string[]
  /** Affected asset symbols */
  affected: string[]
  /** Original source */
  source: string
}

/** Full pipeline output */
export interface NewsIntelligence {
  signals: NewsSignal[]
  /** Overall direction across all signals */
  netDirection: SignalDirection
  /** Aggregated affected symbols */
  allAffected: string[]
  /** Whether data was actually fetched */
  loaded: boolean
}

// ── Keyword detection (lightweight NLP) ────────────────────────

const RISK_OFF_KEYWORDS = [
  'crash', 'jatuh', 'turun', 'drop', 'fall', 'bearish', 'sell-off', 'selloff',
  'fear', 'panic', 'decline', 'recession', 'rate hike', 'inflation', 'hawkish',
  'melemah', 'tekanan', 'pelemahan', 'anjlok', 'koreksi', 'correction',
  'war', 'conflict', 'crisis', 'krisis', 'tariff', 'tarif', 'sanctions',
  'volatility', 'volatile', 'downgrade', 'risk', 'warning', 'concern',
]

const RISK_ON_KEYWORDS = [
  'rally', 'surge', 'naik', 'gain', 'rise', 'bullish', 'optimism',
  'recovery', 'rebound', 'breakout', 'all-time high', 'ath', 'dovish',
  'menguat', 'penguatan', 'positif', 'rate cut', 'stimulus',
  'growth', 'pertumbuhan', 'upgrade', 'beat expectations', 'melampaui',
]

function detectDirection(text: string): SignalDirection {
  const lower = text.toLowerCase()
  let riskOffScore = 0
  let riskOnScore = 0

  for (const kw of RISK_OFF_KEYWORDS) {
    if (lower.includes(kw)) riskOffScore++
  }
  for (const kw of RISK_ON_KEYWORDS) {
    if (lower.includes(kw)) riskOnScore++
  }

  if (riskOffScore > riskOnScore) return 'risk_off'
  if (riskOnScore > riskOffScore) return 'risk_on'
  return 'neutral'
}

// ── Bullet generation ──────────────────────────────────────────

function generateBullet(item: MarketNewsItem, lang: LanguageCode): string {
  // Extract a concise ≤10 word summary from title
  const words = item.title.split(/\s+/)
  if (words.length <= 10) return item.title

  // Truncate to ~10 words
  const truncated = words.slice(0, 10).join(' ')
  return lang === 'en' ? `${truncated}…` : `${truncated}…`
}

// ── Main pipeline ──────────────────────────────────────────────

const NEWS_SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'GC=F', 'SI=F', 'CL=F', 'SPY']

/**
 * Fetch and normalize news into signals.
 * This is the SINGLE function both Layer A and Layer B consume.
 */
export async function fetchNewsIntelligence(lang: LanguageCode): Promise<NewsIntelligence> {
  const empty: NewsIntelligence = {
    signals: [],
    netDirection: 'neutral',
    allAffected: [],
    loaded: false,
  }

  try {
    const items = await getMarketNews(NEWS_SYMBOLS)
    if (!items.length) return { ...empty, loaded: true }

    // Normalize into signals (take top 3 most recent)
    const topItems = items.slice(0, 5)
    const signals: NewsSignal[] = topItems.map(item => {
      const combined = `${item.title} ${item.summary || ''}`
      const direction = detectDirection(combined)
      return {
        direction,
        bullet: generateBullet(item, lang),
        drivers: [item.title],
        affected: item.symbols || [],
        source: item.source || '',
      }
    })

    // Compute net direction
    const riskOffCount = signals.filter(s => s.direction === 'risk_off').length
    const riskOnCount = signals.filter(s => s.direction === 'risk_on').length
    const netDirection: SignalDirection =
      riskOffCount > riskOnCount ? 'risk_off' :
      riskOnCount > riskOffCount ? 'risk_on' : 'neutral'

    // Aggregate affected
    const allAffected = [...new Set(signals.flatMap(s => s.affected))]

    return {
      signals: signals.slice(0, 3), // Layer A shows max 3
      netDirection,
      allAffected,
      loaded: true,
    }
  } catch (err) {
    if (IS_DEV) console.warn('[newsSignal] fetch error:', err)
    return { ...empty, loaded: true }
  }
}
