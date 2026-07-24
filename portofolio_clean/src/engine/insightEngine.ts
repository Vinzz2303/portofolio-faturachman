// ─────────────────────────────────────────────────────────────────────────────
import type { ConfidenceScore as ConfidenceOutput } from './trustLayer'

// Ting AI Insight Engine v2
//
// CORE PRINCIPLE:
//   - NOT signals. NOT buy/sell recommendations. NOT profit promises.
//   - Highlight hidden risk, expose trade-offs, guide thinking.
//   - Tone: calm, reflective, non-guru, human.
//
// Each insight has 3 mandatory layers:
//   1. REALITY   — what is actually happening
//   2. TRADE-OFF — what risk is hidden
//   3. DIRECTION — how to think, not what to do
//
// v2 adds: Trust Injection
//   - Trust context is woven into the text, not surfaced as a badge.
//   - HIGH   → "kondisi terlihat konsisten di beberapa sumber"
//   - MEDIUM → "data saat ini cukup terbatas"
//   - LOW    → "terdapat perbedaan antar sumber"
//   - Injected subtly — never as a warning, always as honest context.
// ─────────────────────────────────────────────────────────────────────────────

export interface AssetWeight {
  asset: string
  weight: number // 0–100 (percentage)
}

export interface MarketCondition {
  volatility: 'low' | 'medium' | 'high'
  trend: 'up' | 'sideways' | 'down'
  macroPressure?: 'tightening' | 'easing' | 'neutral'
}

// ── Trust context shape (mirrors trustLayer ConfidenceScore reason) ────────────

export type { ConfidenceOutput }

export type InsightInput = {
  portfolio: AssetWeight[]        // portfolio composition
  market: MarketCondition         // basic market snapshot
  language?: 'id' | 'en'         // defaults to 'id'
  /** Trust signal from Phase 2 Trust Layer */
  trust: ConfidenceOutput
}

// ── Output types ─────────────────────────────────────────────────────────────

export interface FullInsight {
  reality: string     // LAYER 1 — what is actually happening
  tradeoff: string    // LAYER 2 — the hidden risk / cost
  direction: string   // LAYER 3 — how to think (not what to do)
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function largestPosition(portfolio: AssetWeight[]): AssetWeight | null {
  if (!portfolio.length) return null
  return portfolio.reduce((max, h) => (h.weight > max.weight ? h : max))
}

function isConcentrated(portfolio: AssetWeight[]): boolean {
  const top = largestPosition(portfolio)
  return top !== null && top.weight > 60
}

function isDiversified(portfolio: AssetWeight[]): boolean {
  const top = largestPosition(portfolio)
  return top !== null && top.weight < 40 && portfolio.length >= 3
}

// ── Trust phrase injection ────────────────────────────────────────────────────
//
// Returns a short, calm phrase that reflects data reliability.
// It is appended naturally to the reality layer — never alarming.
//
// Rules:
//   - HIGH   → confident but still non-predictive
//   - MEDIUM → honest about partial data
//   - LOW    → calm uncertainty acknowledgment
//   - undefined → nothing injected (graceful degradation)

function trustPhrase(trust: ConfidenceOutput, lang: 'id' | 'en'): string {
  const phrases: Record<'HIGH' | 'MEDIUM' | 'LOW', { id: string; en: string }> = {
    HIGH: {
      id: 'Kondisi ini terlihat konsisten di beberapa sumber yang kami pantau.',
      en: 'This picture appears consistent across the sources we monitor.',
    },
    MEDIUM: {
      id: 'Data yang tersedia saat ini cukup terbatas — bacaan ini bersifat indikatif.',
      en: 'Available data is somewhat limited — this reading is indicative.',
    },
    LOW: {
      id: 'Terdapat perbedaan antar sumber data kami, sehingga bacaan ini perlu dimaknai dengan hati-hati.',
      en: 'There are differences across our data sources, so treat this reading with some caution.',
    },
  }

  return phrases[trust.confidence][lang]
}

// ─────────────────────────────────────────────────────────────────────────────
// generateInsight(context)
//
// Returns a structured 3-layer insight:
//   { reality, tradeoff, direction }
//
// v2: trust context is injected into the reality layer when available.
// ─────────────────────────────────────────────────────────────────────────────

export function generateInsight(context: InsightInput): FullInsight {
  const { portfolio, market, language: lang = 'id', trust } = context
  const top = largestPosition(portfolio)
  const concentrated = isConcentrated(portfolio)
  const diversified = isDiversified(portfolio)

  // ── LAYER 1: REALITY ────────────────────────────────────────────────────────
  // Trust phrase is appended here — it frames the data reliability context
  // before the user reads the risk layers.

  let realityCore: string

  if (!top || !portfolio.length) {
    realityCore = lang === 'id'
      ? 'Belum ada data portofolio yang cukup untuk dibaca.'
      : 'There is not enough portfolio data to read yet.'
  } else if (concentrated) {
    realityCore = lang === 'id'
      ? pick([
          `Portofolio lo terlihat ${market.volatility === 'low' ? 'tenang' : 'aktif'}, tapi sebetulnya ${top.weight.toFixed(0)}% dari nilainya bergantung pada satu aset: ${top.asset}.`,
          `Fakta yang perlu disadari: hampir ${top.weight.toFixed(0)}% dari portofolio lo ada di ${top.asset}. Artinya, pergerakan aset ini hampir identik dengan pergerakan keseluruhan portofolio.`,
          `${top.asset} memegang ${top.weight.toFixed(0)}% dari total alokasi lo. Secara struktural, portofolio lo saat ini berperilaku seperti satu aset tunggal, bukan kumpulan aset.`,
        ])
      : pick([
          `Your portfolio appears ${market.volatility === 'low' ? 'calm' : 'active'}, but ${top.weight.toFixed(0)}% of its value depends on a single asset: ${top.asset}.`,
          `Something worth noticing: nearly ${top.weight.toFixed(0)}% of your portfolio sits in ${top.asset}. Its movement and your portfolio's movement are nearly identical.`,
          `${top.asset} holds ${top.weight.toFixed(0)}% of your total allocation. Structurally, your portfolio currently behaves like a single asset, not a collection of assets.`,
        ])
  } else if (diversified) {
    realityCore = lang === 'id'
      ? pick([
          `Portofolio lo menyebar ke ${portfolio.length} aset. Yang sering terlewat adalah: penyebaran ini justru bisa meredam peluang besar sekaligus meredam kerugian besar secara bersamaan.`,
          `Dengan ${portfolio.length} aset dan tidak ada yang dominan, portofolio lo punya profil yang lebih stabil — tapi stabilitas itu ada harganya.`,
          `Lo memiliki ${portfolio.length} posisi tanpa ada yang mendominasi. Ini bukan berarti bebas risiko — ini berarti risiko tersebar, bukan hilang.`,
        ])
      : pick([
          `Your portfolio is spread across ${portfolio.length} assets. What's often overlooked: this spread can dampen both large gains and large losses at the same time.`,
          `With ${portfolio.length} assets and no single dominant position, your portfolio has a more stable profile — but that stability comes at a cost.`,
          `You have ${portfolio.length} positions with no single dominant one. That doesn't mean risk-free — it means risk is distributed, not eliminated.`,
        ])
  } else {
    // moderate concentration (40–60%)
    realityCore = lang === 'id'
      ? pick([
          `${top.asset} memegang sekitar ${top.weight.toFixed(0)}% dari portofolio lo — cukup besar untuk terasa, tapi belum mendominasi sepenuhnya.`,
          `Portofolio lo punya satu titik gravitasi utama: ${top.asset} di ${top.weight.toFixed(0)}%. Aset lain masih ada, tapi yang satu ini cukup menentukan arah.`,
        ])
      : pick([
          `${top.asset} holds around ${top.weight.toFixed(0)}% of your portfolio — large enough to feel, but not fully dominant.`,
          `Your portfolio has one main gravitational point: ${top.asset} at ${top.weight.toFixed(0)}%. Other assets exist, but this one has enough weight to steer direction.`,
        ])
  }

  // Append trust phrase if available — separated by a space
  const phrase = trustPhrase(trust, lang)
  const reality = phrase ? `${realityCore} ${phrase}` : realityCore

  // ── LAYER 2: TRADE-OFF ──────────────────────────────────────────────────────
  // Trust shapes assertiveness: LOW confidence adds "meski data terbatas" caveat.

  let tradeoff: string

  const lowTrustCaveat = trust?.confidence === 'LOW'
    ? (lang === 'id' ? ' Perlu dicatat bahwa data saat ini terbatas.' : ' Worth noting that current data is limited.')
    : ''

  if (market.volatility === 'high' && concentrated) {
    tradeoff = lang === 'id'
      ? pick([
          `Yang sering terlewat: di kondisi volatilitas tinggi seperti sekarang, sensitivitas portofolio lo terhadap ${top?.asset} menjadi lebih besar dari biasanya. Pergerakan kecil bisa terasa jauh lebih besar.`,
          `Risiko yang tersembunyi di sini bukan hanya soal nilainya — tapi soal kecepatan perubahannya. Volatilitas tinggi artinya perubahan bisa datang lebih cepat dari yang biasanya lo antisipasi.`,
        ]) + lowTrustCaveat
      : pick([
          `What's often overlooked: in high-volatility conditions like now, your portfolio's sensitivity to ${top?.asset} is amplified beyond normal. Small moves can feel much larger.`,
          `The hidden risk here isn't just the magnitude — it's the speed of change. High volatility means shifts can arrive faster than you'd normally anticipate.`,
        ]) + lowTrustCaveat
  } else if (market.volatility === 'low') {
    tradeoff = lang === 'id'
      ? pick([
          `Yang sering terlewat: volatilitas rendah bukan berarti aman. Ini bisa jadi periode sebelum perubahan besar — dan portofolio yang terasa tenang bisa bergerak cepat saat kondisi berubah.`,
          `Di kondisi pasar yang "tenang" seperti ini, ada risiko yang tidak terlihat: ketenangan menciptakan rasa nyaman yang kadang membuat kita tidak siap kalau tiba-tiba ada guncangan.`,
          `Pasar yang kalem sekarang bukan jaminan kalem seterusnya. Yang perlu disadari: volatilitas rendah sering mendahului pergerakan yang lebih tajam.`,
        ]) + lowTrustCaveat
      : pick([
          `What's often missed: low volatility doesn't mean safety. It can be the period before a significant change — and a portfolio that feels calm can move sharply when conditions shift.`,
          `In a market that feels "quiet" like this, there's an invisible risk: calm creates comfort that can leave you unprepared when a sudden shake hits.`,
          `A quiet market now isn't a guarantee it stays quiet. What's worth noting: low volatility often precedes sharper moves.`,
        ]) + lowTrustCaveat
  } else if (diversified) {
    tradeoff = lang === 'id'
      ? pick([
          `Trade-off yang jarang dibicarakan: diversifikasi membatasi kerugian, tapi juga membatasi potensi kenaikan. Kalau satu aset naik tajam, efeknya ke portofolio lo akan terasa lebih kecil dari yang lo bayangkan.`,
          `Dengan menyebar ke banyak aset, lo sudah menukar momentum untuk ketenangan. Ini pilihan yang valid — tapi perlu disadari ada pertukaran yang nyata di sini.`,
        ]) + lowTrustCaveat
      : pick([
          `The trade-off that's rarely discussed: diversification limits losses but also limits gains. If one asset spikes sharply, its effect on your portfolio will feel smaller than expected.`,
          `By spreading across many assets, you've traded momentum for stability. That's a valid choice — but it's worth being aware that a real exchange is happening.`,
        ]) + lowTrustCaveat
  } else {
    // moderate or down trend
    tradeoff = lang === 'id'
      ? pick([
          `Risiko yang tersembunyi: ketergantungan moderat pada ${top?.asset} artinya portofolio lo cukup sensitif terhadap sentimen spesifik aset itu — tapi tidak cukup terdiversifikasi untuk meredam dampaknya.`,
          `Di kondisi tren ${market.trend === 'down' ? 'turun' : 'sideways'} seperti sekarang, posisi yang terasa "aman" bisa menyembunyikan tekanan yang belum sepenuhnya terlihat.`,
        ]) + lowTrustCaveat
      : pick([
          `The hidden risk: moderate dependency on ${top?.asset} means your portfolio is sensitive enough to that asset's sentiment — but not diversified enough to absorb the impact smoothly.`,
          `In a ${market.trend === 'down' ? 'downward' : 'sideways'} trend like now, positions that feel "safe" can hide pressure that hasn't fully surfaced yet.`,
        ]) + lowTrustCaveat
  }

  // ── LAYER 3: DIRECTION ──────────────────────────────────────────────────────
  // Always reflective — awareness, not action.
  // HIGH confidence → slightly more grounded direction.
  // LOW confidence → explicitly reminds user to verify before thinking further.

  let direction: string

  if (concentrated) {
    direction = lang === 'id'
      ? pick([
          `Ini bukan soal harus bertindak sekarang. Tapi soal seberapa sadar lo bahwa kalau ${top?.asset} bergerak — ke mana pun — portofolio lo akan ikut bergerak ke arah yang sama.`,
          `Yang perlu direnungkan bukan "apa yang harus dilakukan" — tapi "apakah lo sudah siap dengan berbagai kemungkinan yang ada?" Kesiapan beda dengan kepastian.`,
          `Pertanyaan yang lebih berguna dari "kapan harus bereaksi" adalah: seberapa dalam lo memahami ${top?.asset} dan apa yang bisa membuat aset itu bergerak tajam?`,
        ])
      : pick([
          `This isn't about needing to act right now. It's about being aware that if ${top?.asset} moves — in any direction — your portfolio moves with it.`,
          `The useful question isn't "what should I do" — it's "am I prepared for the range of possibilities?" Preparedness is different from certainty.`,
          `A more useful question than "when to react" is: how deeply do you understand ${top?.asset} and what could cause it to move sharply?`,
        ])
  } else if (diversified) {
    direction = lang === 'id'
      ? pick([
          `Ini bukan soal mengubah struktur yang sudah ada. Tapi soal memastikan setiap aset yang lo pegang masih punya alasan yang jelas — bukan sekadar warisan keputusan masa lalu.`,
          `Yang perlu direnungkan: apakah portofolio ini masih mencerminkan cara pandang lo, atau hanya mencerminkan posisi yang belum pernah direview?`,
          `Diversifikasi yang baik bukan tentang jumlah aset — tapi tentang seberapa sadar lo terhadap peran setiap aset dalam keseluruhan struktur.`,
        ])
      : pick([
          `This isn't about changing the existing structure. It's about making sure every asset you hold still has a clear reason — not just a relic of past decisions.`,
          `Worth reflecting on: does this portfolio still reflect how you see things, or does it only reflect positions that have never been revisited?`,
          `Good diversification isn't about the number of assets — it's about how aware you are of each asset's role in the overall structure.`,
        ])
  } else {
    direction = lang === 'id'
      ? pick([
          `Ini bukan soal harus bertindak sekarang. Tapi soal seberapa siap lo kalau kondisi berubah lebih cepat dari yang diperkirakan.`,
          `Yang perlu disadari: pasar tidak selalu bergerak sesuai ekspektasi. Memahami struktur portofolio lo sendiri adalah fondasi dari setiap keputusan yang lebih jernih.`,
          `Ting AI tidak memberi tahu apa yang harus dilakukan — tapi membantu lo melihat di mana lo sebenarnya berdiri sekarang.`,
        ])
      : pick([
          `This isn't about needing to act right now. It's about how prepared you are if conditions shift faster than expected.`,
          `What's worth noting: the market doesn't always move as expected. Understanding your own portfolio structure is the foundation for any clearer decision.`,
          `Ting AI doesn't tell you what to do — it helps you see where you actually stand right now.`,
        ])
  }

  // LOW trust: append a gentle reminder in direction to verify context
  if (trust?.confidence === 'LOW') {
    const reminder = lang === 'id'
      ? ' Pertimbangkan untuk memverifikasi kondisi pasar dari sumber lain sebelum mengambil kesimpulan.'
      : ' Consider verifying market conditions from additional sources before drawing conclusions.'
    direction = direction + reminder
  }

  return { reality, tradeoff, direction }
}

// ─────────────────────────────────────────────────────────────────────────────
// generateQuickInsight(context)
//
// Returns 1 clear, scannable sentence — no jargon.
// v2: appends a brief trust qualifier when confidence is not HIGH.
// ─────────────────────────────────────────────────────────────────────────────

export function generateQuickInsight(context: InsightInput): string {
  const { portfolio, market, language: lang = 'id', trust } = context
  const top = largestPosition(portfolio)
  const concentrated = isConcentrated(portfolio)
  const diversified = isDiversified(portfolio)

  // Brief trust qualifier — appended only for MEDIUM/LOW, to keep HIGH clean
  const qualifier =
    trust?.confidence === 'LOW'
      ? (lang === 'id' ? ' (data terbatas)' : ' (limited data)')
      : trust?.confidence === 'MEDIUM'
        ? (lang === 'id' ? ' (data indikatif)' : ' (indicative data)')
        : ''

  if (!top || !portfolio.length) {
    return lang === 'id'
      ? 'Tambahkan posisi aset untuk mulai membaca kondisi portofolio lo.'
      : 'Add asset positions to start reading your portfolio.'
  }

  // Concentrated + high volatility
  if (concentrated && market.volatility === 'high') {
    return lang === 'id'
      ? `Portofolio lo sangat sensitif terhadap ${top.asset} di kondisi pasar yang sedang bergejolak.${qualifier}`
      : `Your portfolio is highly sensitive to ${top.asset} in a volatile market.${qualifier}`
  }

  // Concentrated + low volatility (false calm warning)
  if (concentrated && market.volatility === 'low') {
    return lang === 'id'
      ? `Portofolio lo bergantung pada ${top.asset} — ketenangan pasar saat ini tidak menghilangkan risiko itu.${qualifier}`
      : `Your portfolio depends on ${top.asset} — the market's current calm doesn't erase that risk.${qualifier}`
  }

  // Concentrated
  if (concentrated) {
    return lang === 'id'
      ? `Portofolio lo sensitif terhadap ${top.asset}.${qualifier}`
      : `Your portfolio is sensitive to ${top.asset}.${qualifier}`
  }

  // Diversified + low volatility
  if (diversified && market.volatility === 'low') {
    return lang === 'id'
      ? `Portofolio lo tersebar — stabil, tapi ingat bahwa ketenangan pasar bisa berubah kapan saja.${qualifier}`
      : `Your portfolio is spread out — stable, but remember market calm can shift at any time.${qualifier}`
  }

  // Diversified + high volatility
  if (diversified && market.volatility === 'high') {
    return lang === 'id'
      ? `Portofolio lo terdiversifikasi, tapi volatilitas tinggi masih bisa terasa di setiap posisi.${qualifier}`
      : `Your portfolio is diversified, but high volatility can still be felt across each position.${qualifier}`
  }

  // Diversified
  if (diversified) {
    return lang === 'id'
      ? `Portofolio lo cukup tersebar — risiko lebih diredam, tapi potensi kenaikan juga lebih terbatas.${qualifier}`
      : `Your portfolio is fairly spread — downside is more cushioned, but upside is also more limited.${qualifier}`
  }

  // Down trend
  if (market.trend === 'down') {
    return lang === 'id'
      ? `Tren pasar sedang melemah — posisi ${top.asset} sebesar ${top.weight.toFixed(0)}% perlu lebih diperhatikan.${qualifier}`
      : `Market trend is weakening — your ${top.weight.toFixed(0)}% position in ${top.asset} deserves closer attention.${qualifier}`
  }

  // Default moderate
  return lang === 'id'
    ? `${top.asset} menjadi titik gravitasi utama portofolio lo dengan porsi ${top.weight.toFixed(0)}%.${qualifier}`
    : `${top.asset} is the main gravitational point of your portfolio at ${top.weight.toFixed(0)}%.${qualifier}`
}
