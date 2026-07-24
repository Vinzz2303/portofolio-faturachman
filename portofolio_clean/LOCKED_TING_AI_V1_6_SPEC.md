# LOCKED TING AI v1.6

Status: final locked product spec

Dokumen ini menjadi sumber kebenaran untuk implementasi Ting AI v1.6.
Jangan mengubah arah produk di luar aturan yang tertulis di sini.

## Product Identity

Ting AI adalah:
- market and portfolio intelligence layer
- decision-support product
- clarity-first experience

Ting AI bukan:
- trading app
- signal provider
- raw data dashboard
- news feed
- generic chatbot

Core rules:
- 1 screen = 1 decision
- no raw data first
- max 3 insights
- AI = reasoning, not generic chat
- Pro = deeper understanding, not more noise
- News = input, not UI output

## V1.6 Goal

Lock product experience so it becomes:
- clear
- structured
- monetizable
- consistent

Primary focus:
1. Today Status as the main entry
2. clean Free vs Pro separation
3. News -> Insight -> Implication pipeline
4. AI structured reasoning
5. optional Pro Advanced depth without harming the main dashboard

## Free vs Pro Final Boundary

Free:
- understand market condition
- see basic Today Status
- see max 3 high-level insights
- see lightweight portfolio overview
- see AI preview only

Pro:
- understand portfolio implication
- see deeper Today Insight
- see full portfolio reasoning
- see full AI reasoning
- access optional Advanced Context tab

Important:
Pro must not feel like more charts or more raw data.
Pro must feel like:
- more meaning
- more implication
- more personal relevance

## Today Status Final Spec

The first screen must show:
1. Market
2. Risk
3. You
4. Main implication

Format example:
- Market: Defensive
- Risk: Increasing
- You: Overexposed
- Main implication: Your portfolio is more sensitive to downside risk today

Do not place raw charts, raw news, or advanced technical panels above the fold.

## Today Insight Final Spec

Free:
- max 3 short insights
- what changed only
- high-level language

Pro:
- max 3 deeper insights
- what changed + why it matters
- include regime direction when possible

No raw headlines.
No news feed rendering on the main screen.

## Portfolio Final Spec

Free portfolio:
- risk level
- exposure summary
- one short implication
- teaser for deeper analysis

Pro portfolio:
- risk level
- concentration
- portfolio fit vs current market regime
- main implication
- 1-2 supporting reasoning bullets

Pro portfolio must feel like:
“This tells me what the market means for my own position.”

## AI Final Spec

AI output must always use this structure:
1. Situasi / Situation
2. Kondisi saya / My condition
3. Implikasi / Implication
4. Yang perlu diperhatikan / What to watch

Free AI:
- preview only
- partial reasoning
- show upgrade path

Pro AI:
- full reasoning
- portfolio-aware
- more specific and more contextual

Do not allow generic long-form chat feel as the default experience.

## Pro Advanced Tab

Create a Pro-only optional Advanced Context tab.

Important:
- it must not be part of the main first-screen flow
- it must be collapsed, tabbed, or clearly secondary
- default mode should still be insight-first

Advanced Context may include:
- screener
- technicals
- macro relations
- OpenBB-derived data

But every advanced block must begin with insight, not raw data.

Example:
- “Many assets are oversold -> downside pressure remains high”
- “Volatility is rising -> market instability is increasing”

Only after the insight may the user expand into raw technical or screener detail.

## Technical / Screener Mapping Rule

If OpenBB or technical indicators are used, map them into meaning first.

Examples:
- RSI < 30 across many assets -> “Many assets are oversold, indicating strong selling pressure”
- VIX rising -> “Volatility is increasing, showing a less stable market”
- Gold up + equities down -> “Defensive assets are gaining strength while risk assets weaken”
- Yield up -> “Rising yields are adding pressure to risk assets”

Do not surface indicators without interpretation.

## Architecture Requirement

Refactor the dashboard architecture into:
- FreeDashboard
- ProDashboard

Dashboard.tsx should act as the selector using plan/entitlement.

Use shared building blocks where possible:
- TodayStatusHero
- TodayInsightSummary
- PortfolioPreview or PortfolioInsight
- AIReasoningPreview or AIReasoningFull

This should be modular, not copy-paste duplication.

## Decision Context

Use a shared DecisionContext object as the product brain.

Minimum shape:

```ts
type DecisionContext = {
  marketRegime: string
  riskLevel: string
  overnightChange: string[]
  portfolioFit: string
  concentrationRisk?: string
  mainImplication: string
  planTier: 'free' | 'pro'
}
```

All main surfaces must consume the same decision context.
Do not let each screen invent different framing.

## Copy Rules

Preferred language:
- condition
- risk
- implication
- what changed
- what to watch
- understand the impact

Avoid:
- signal
- trade now
- buy now
- analytics console
- dashboard metrics
- generic ask anything

## Output Required

Implementation must be practical and engineering-ready.

Required deliverables:
1. file-by-file implementation plan
2. component tree plan
3. which files become shared vs free-only vs pro-only
4. props/interfaces needed
5. DecisionContext integration plan
6. how to implement Pro Advanced tab without breaking clarity
7. copy updates needed
8. phased implementation order with lowest breakage risk

Final rule:
- Do not propose a new philosophy.
- Do not add unrelated features.
- Do not turn Ting AI into a data terminal.
- Implement the locked spec only.

