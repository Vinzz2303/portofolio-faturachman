// ─────────────────────────────────────────────────────────────────────────────
// Ting AI Copilot Engine v1
//
// PHILOSOPHY:
//   - A thinking partner, not a signal bot.
//   - Uses existing insight data — does NOT regenerate blindly.
//   - Trust level shapes tone: confident (HIGH) → indicative (MEDIUM) → cautious (LOW)
//   - Language-aware (id | en). No mixing.
//
// STRUCTURE (every response):
//   1. ACKNOWLEDGE  — mirror the user's intent
//   2. CONTEXT      — situate current market condition
//   3. INSIGHT      — Reality + Trade-off from engine, trust-qualified
//   4. REFLECTION   — Direction: how to think, not what to do
//
// NO-SIGNAL POLICY:
//   - Never buy/sell/entry/exit language
//   - Never profit promises
//   - Allowed: "yang perlu diperhatikan", "yang sering terlewat"
// ─────────────────────────────────────────────────────────────────────────────

import type { AssetWeight, FullInsight, MarketCondition } from './insightEngine'
import type { ConfidenceScore } from './trustLayer'

// ── Input / Output types ──────────────────────────────────────────────────────

export interface CopilotInput {
  userMessage: string
  lang: 'id' | 'en'
  market: MarketCondition
  portfolio: AssetWeight[]
  trust: ConfidenceScore
  insight: FullInsight
}

export interface CopilotResponse {
  text: string
  chips: string[]
  meta: {
    usedTrust: 'HIGH' | 'MEDIUM' | 'LOW'
    hasFallback: boolean
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function largestPosition(portfolio: AssetWeight[]): AssetWeight | null {
  if (!portfolio.length) return null
  return portfolio.reduce((max, h) => (h.weight > max.weight ? h : max))
}

// ── Intent classification ────────────────────────────────────────────────────
// Maps user message into one of 6 intents to customise the acknowledge layer.

type Intent =
  | 'portfolio_impact'
  | 'market_context'
  | 'tradeoff'
  | 'risk'
  | 'comparison'
  | 'general'

function classifyIntent(msg: string): Intent {
  const m = msg.toLowerCase()
  if (/portofolio|portfolio|holding|posisi|alokasi|allocation|exposure|weight/.test(m))
    return 'portfolio_impact'
  if (/pasar|market|ihsg|idx|kondisi|context|sentimen|sentiment/.test(m))
    return 'market_context'
  if (/tradeoff|trade.off|pertimbang|masuk|entry|timing|wait|tunggu/.test(m))
    return 'tradeoff'
  if (/risiko|risk|bahaya|danger|aman|safe|drawdown|volatil/.test(m))
    return 'risk'
  if (/banding|compar|versus|vs|emas|gold|btc|bitcoin|xau/.test(m))
    return 'comparison'
  return 'general'
}

// ── 1. ACKNOWLEDGE layer ─────────────────────────────────────────────────────

function buildAcknowledge(intent: Intent, lang: 'id' | 'en'): string {
  const map: Record<Intent, { id: string; en: string }> = {
    portfolio_impact: {
      id: pick([
        'Pertanyaan yang tepat — dampak ke portofolio sering yang paling relevan untuk dipikirkan dulu.',
        'Lo menyentuh sesuatu yang penting: bagaimana kondisi ini terhubung langsung ke posisi yang lo pegang.',
      ]),
      en: pick([
        'Good starting point — portfolio impact is often the most relevant thing to think through first.',
        "You're touching on something important: how current conditions connect directly to the positions you hold.",
      ]),
    },
    market_context: {
      id: pick([
        'Membaca konteks pasar sebelum menyimpulkan sesuatu adalah langkah yang tepat.',
        'Konteks pasar adalah fondasi yang bagus untuk dibaca sebelum memikirkan dampaknya lebih jauh.',
      ]),
      en: pick([
        'Reading market context before drawing conclusions is a solid first step.',
        'Market context is a good foundation to read before thinking through its implications further.',
      ]),
    },
    tradeoff: {
      id: pick([
        'Ini salah satu pertanyaan paling penting yang sering tidak diajukan secara eksplisit.',
        'Trade-off adalah hal yang sering terlewat — bagus bahwa lo memikirkannya.',
      ]),
      en: pick([
        "This is one of the most important questions that often isn't asked explicitly.",
        "Trade-offs are what's often missed — good that you're thinking about it.",
      ]),
    },
    risk: {
      id: pick([
        'Memikirkan risiko sebelum memikirkan potensi keuntungan adalah cara berpikir yang lebih sehat.',
        'Pertanyaan tentang risiko adalah titik awal yang tepat.',
      ]),
      en: pick([
        'Thinking about risk before potential returns is the healthier framing.',
        'Risk questions are the right starting point.',
      ]),
    },
    comparison: {
      id: pick([
        'Membandingkan aset bisa membantu memperjelas trade-off yang ada di portofolio lo.',
        'Perbandingan bisa memberi perspektif — selama konteksnya tetap pada portofolio lo sendiri.',
      ]),
      en: pick([
        "Comparing assets can help clarify the trade-offs present in your portfolio.",
        "Comparison can add perspective — as long as the context stays tied to your own portfolio.",
      ]),
    },
    general: {
      id: pick([
        'Pertanyaan yang menarik untuk dijadikan titik refleksi.',
        'Izinkan Ting AI membantu memetakan konteksnya terlebih dahulu.',
      ]),
      en: pick([
        "That's an interesting angle to use as a reflection point.",
        'Let Ting AI help map the context first.',
      ]),
    },
  }
  return map[intent][lang]
}

// ── 2. CONTEXT layer ─────────────────────────────────────────────────────────

function buildContext(market: MarketCondition, portfolio: AssetWeight[], lang: 'id' | 'en'): string {
  const top = largestPosition(portfolio)
  const assetName = top?.asset ?? (lang === 'id' ? 'aset utama' : 'primary asset')

  const volatilityMap: Record<MarketCondition['volatility'], { id: string; en: string }> = {
    high: {
      id: `Kondisi pasar saat ini menunjukkan volatilitas tinggi — pergerakan harga lebih cepat dan lebih lebar dari biasanya. Ini bukan berarti berbahaya, tapi artinya sensitivitas portofolio terhadap ${assetName} sedang lebih besar dari kondisi normal.`,
      en: `Current market conditions show high volatility — price movements are faster and wider than usual. This doesn't necessarily mean danger, but it does mean your portfolio's sensitivity to ${assetName} is elevated beyond normal levels.`,
    },
    medium: {
      id: `Pasar bergerak dalam range yang moderat. Ini bukan kondisi ekstrem, tapi tetap ada ketidakpastian yang perlu disadari — terutama kalau ${assetName} punya bobot signifikan di portofolio lo.`,
      en: `The market is moving in a moderate range. This isn't an extreme condition, but uncertainty remains — especially if ${assetName} carries significant weight in your portfolio.`,
    },
    low: {
      id: `Pasar tampak tenang saat ini. Tapi volatilitas rendah bukan berarti tidak ada risiko tersembunyi — justru kondisi seperti ini sering mendahului pergerakan yang lebih tajam.`,
      en: `The market appears calm right now. But low volatility doesn't mean the absence of hidden risk — in fact, conditions like this often precede sharper moves.`,
    },
  }

  const trendSuffix: Record<MarketCondition['trend'], { id: string; en: string }> = {
    up: {
      id: ' Tren saat ini masih cenderung ke atas.',
      en: ' The current trend is still tilted upward.',
    },
    sideways: {
      id: ' Arah tren masih belum jelas — pasar bergerak sideways.',
      en: ' Trend direction remains unclear — the market is moving sideways.',
    },
    down: {
      id: ' Tren yang sedang terjadi menunjukkan tekanan ke bawah.',
      en: ' The prevailing trend shows downward pressure.',
    },
  }

  return volatilityMap[market.volatility][lang] + trendSuffix[market.trend][lang]
}

// ── 3. INSIGHT layer (trust-qualified reuse) ─────────────────────────────────

function buildInsightLayer(
  insight: FullInsight,
  trust: ConfidenceScore,
  lang: 'id' | 'en'
): string {
  const level = trust.confidence

  // Trust-qualified opener — shapes assertiveness of the insight layer
  const opener: Record<'HIGH' | 'MEDIUM' | 'LOW', { id: string; en: string }> = {
    HIGH: {
      id: 'Berdasarkan bacaan kami, kondisi ini terlihat konsisten di beberapa sumber:',
      en: 'Based on our reading, this condition appears consistent across sources:',
    },
    MEDIUM: {
      id: 'Bacaan ini bersifat indikatif — data yang tersedia cukup terbatas, tapi pola yang terlihat adalah:',
      en: 'This reading is indicative — available data is somewhat limited, but the pattern visible is:',
    },
    LOW: {
      id: 'Terdapat variasi dalam data yang kami pantau, sehingga bacaan ini perlu dimaknai dengan hati-hati:',
      en: 'There are variations in the data we monitor, so treat this reading with some care:',
    },
  }

  const realityLabel = lang === 'id' ? 'Realita:' : 'Reality:'
  const tradeoffLabel = lang === 'id' ? 'Yang sering terlewat:' : "What's often overlooked:"

  return `${opener[level][lang]}\n\n${realityLabel} ${insight.reality}\n\n${tradeoffLabel} ${insight.tradeoff}`
}

// ── 4. REFLECTION layer ───────────────────────────────────────────────────────

function buildReflection(insight: FullInsight, lang: 'id' | 'en'): string {
  const prefix = lang === 'id' ? 'Arah berpikir:' : 'How to think about it:'
  return `${prefix} ${insight.direction}`
}

// ── Chip suggestions ─────────────────────────────────────────────────────────

function buildChips(intent: Intent, lang: 'id' | 'en'): string[] {
  const all: Record<Intent, { id: string[]; en: string[] }> = {
    portfolio_impact: {
      id: [
        'Apa trade-off yang sering terlewat?',
        'Bagaimana kondisi ini memengaruhi konsentrasinya?',
        'Aset mana yang paling sensitif sekarang?',
        'Apa yang perlu saya perhatikan selanjutnya?',
      ],
      en: [
        "What trade-offs are often missed?",
        'How does this affect portfolio concentration?',
        'Which position is most sensitive right now?',
        'What should I pay attention to next?',
      ],
    },
    market_context: {
      id: [
        'Bagaimana dampaknya ke portofolio saya?',
        'Apa yang berubah dari kondisi sebelumnya?',
        'Seberapa signifikan pergerakan ini?',
        'Apa yang perlu dipantau dari kondisi ini?',
      ],
      en: [
        'How does this affect my portfolio?',
        'What changed from before?',
        'How significant is this move?',
        'What should I monitor from this?',
      ],
    },
    tradeoff: {
      id: [
        'Apa yang sering tidak disadari dari posisi ini?',
        'Bagaimana kalau kondisi berubah lebih cepat?',
        'Apa dampaknya ke aset lain di portofolio?',
        'Apa yang perlu saya pahami dulu sebelum memutuskan?',
      ],
      en: [
        "What's often not noticed about this position?",
        'What if conditions shift faster than expected?',
        'How does this affect the other assets in the portfolio?',
        'What do I need to understand before deciding?',
      ],
    },
    risk: {
      id: [
        'Risiko mana yang paling langsung ke portofolio saya?',
        'Apakah diversifikasi saya cukup?',
        'Apa trade-off yang tersembunyi di sini?',
        'Bagaimana cara membaca sensitivitas portofolio saya?',
      ],
      en: [
        'Which risk is most direct to my portfolio?',
        'Is my diversification adequate?',
        "What's the hidden trade-off here?",
        'How do I read my portfolio sensitivity?',
      ],
    },
    comparison: {
      id: [
        'Bagaimana dampaknya ke portofolio saya secara keseluruhan?',
        'Apa yang sering terlewat dari perbandingan ini?',
        'Mana yang lebih relevan untuk kondisi sekarang?',
        'Apa trade-off dari memilih satu vs yang lain?',
      ],
      en: [
        'How does this comparison affect my overall portfolio?',
        "What's often missed in this comparison?",
        'Which is more relevant for current conditions?',
        'What are the trade-offs between them?',
      ],
    },
    general: {
      id: [
        'Bagaimana dampaknya ke portofolio saya?',
        'Apa trade-off yang sering terlewat?',
        'Bandingkan dengan konteks pasar saat ini?',
        'Apa yang perlu saya perhatikan?',
      ],
      en: [
        'How does this affect my portfolio?',
        "What trade-offs are often missed?",
        'Compare with current market context?',
        'What should I pay attention to?',
      ],
    },
  }
  return all[intent][lang]
}

// ── Fallback response ────────────────────────────────────────────────────────
// Used when primary generation fails. Always calm, never exposes error.

function buildFallback(lang: 'id' | 'en', insight: FullInsight): CopilotResponse {
  const text = lang === 'id'
    ? `Ting AI sedang membaca konteksnya. Berdasarkan informasi yang tersedia: ${insight.reality} ${insight.direction}`
    : `Ting AI is reading the context. Based on available information: ${insight.reality} ${insight.direction}`

  const chips = lang === 'id'
    ? ['Bagaimana dampaknya ke portofolio saya?', 'Apa yang perlu saya perhatikan?']
    : ['How does this affect my portfolio?', 'What should I pay attention to?']

  return {
    text,
    chips,
    meta: { usedTrust: 'LOW', hasFallback: true },
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateCopilotResponse(input: CopilotInput): CopilotResponse {
  try {
    const { userMessage, lang, market, portfolio, trust, insight } = input

    const intent = classifyIntent(userMessage)

    const acknowledge = buildAcknowledge(intent, lang)
    const context = buildContext(market, portfolio, lang)
    const insightLayer = buildInsightLayer(insight, trust, lang)
    const reflection = buildReflection(insight, lang)
    const chips = buildChips(intent, lang)

    // Compose full response — one coherent block of text with natural paragraph breaks
    const text = [acknowledge, context, insightLayer, reflection].join('\n\n')

    return {
      text,
      chips,
      meta: {
        usedTrust: trust.confidence,
        hasFallback: false,
      },
    }
  } catch {
    // Never expose error text — always fall back gracefully
    return buildFallback(input.lang, input.insight)
  }
}
