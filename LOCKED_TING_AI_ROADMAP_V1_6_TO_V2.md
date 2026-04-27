# LOCKED TING AI ROADMAP v1.6 to v2.0

Status: locked roadmap

Dokumen ini mengatur arah versi setelah spec final v1.6.
Gunakan ini sebagai peta eksekusi, bukan sebagai lisensi untuk menambah fitur di luar filosofi produk.

## Positioning

Ting AI tetap:
- intelligence layer
- decision-support product
- clarity-first experience

Ting AI tetap bukan:
- trading app
- signal provider
- raw data dashboard
- news feed
- generic chatbot

## Version Strategy

### v1.6 - Clarity & Monetization Core
Fokus:
- split Free vs Pro
- Today Status sebagai entry utama
- News -> Insight -> Implication pipeline
- AI reasoning terstruktur
- secondary context tetap di bawah fold

Target:
- user paham kondisi dengan cepat
- Free dan Pro terasa berbeda dalam kedalaman, bukan noise

### v1.7 - Personal Intelligence
Fokus:
- portfolio fit engine
- personal implication per user
- AI aware portfolio + regime
- konteks market diterjemahkan ke konteks user

Target:
- user merasa produk ini relevan ke posisinya sendiri

### v1.8 - Pro Advanced
Fokus:
- optional advanced context tab
- screener
- technicals
- macro relations
- OpenBB-derived data

Target:
- kedalaman bertambah tanpa merusak dashboard utama

### v2.0 - Mature Intelligence Product
Fokus:
- daily intelligence
- scenario thinking
- guided decision support yang matang

Target:
- Ting AI terasa seperti thinking tool, bukan dashboard biasa

## Locked Free vs Pro Direction

### Free
- awareness
- trust
- basic understanding
- lightweight portfolio overview
- AI preview

### Pro
- implication
- deeper reasoning
- portfolio-aware context
- advanced optional depth

Rule:
- Pro menambah meaning, bukan menambah noise
- Free tetap berguna, bukan demo kosong

## Advanced Context Rule

Pro Advanced tab boleh ada, tetapi:
- tidak boleh masuk first screen
- harus collapsed, tabbed, atau clearly secondary
- harus insight-first, data-second

Allowed advanced content:
- screener
- technicals
- macro relations
- OpenBB-derived data

Required rule:
- setiap blok advanced harus dimulai dari makna, bukan angka mentah

## Indicator to Meaning Mapping

Gunakan mapping ini sebagai standar arah visual dan copy:

- RSI < 30 across many assets -> many assets are oversold, downside pressure remains high
- VIX rising -> volatility is increasing, market instability is rising
- Gold up + equities down -> defensive assets are gaining strength while risk assets weaken
- Yield up -> rising yields are adding pressure to risk assets

Rule:
- indikator jangan pernah muncul tanpa interpretasi

## Technical Pipeline

```text
OpenBB / raw data
  ↓
filter relevance
  ↓
normalize
  ↓
quick mapping rules
  ↓
AI summarization
  ↓
DecisionContext
  ↓
UI
```

## Acceptance Criteria

- one screen = one decision
- max 3 insights
- AI always structured
- Free to Pro upgrade rationale clear in one interaction
- Advanced does not disturb the main dashboard

## Guardrails

- no raw data first
- no signal language
- no buy/sell language
- no aggressive gating
- no full-screen noise

## Copy Direction

Preferred phrases:
- understand the impact
- what changed
- what to watch
- deeper implication
- portfolio relevance

Avoid:
- signal
- trade now
- buy now
- analytics console
- dashboard metrics

