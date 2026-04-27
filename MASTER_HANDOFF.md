# Ting AI Master Handoff

## Current State

Project root:

- `D:\IdeaJ\portofolio faturachman alkahfi`

Live VPS paths:

- repo source: `C:\inetpub\wwwroot\portofolio-faturachman`
- frontend live root: `C:\inetpub\wwwroot`
- backend folder: `C:\inetpub\wwwroot\portofolio-faturachman\server`

Production status:

- frontend is served from IIS
- backend is served from PM2
- HTTPS is live on `https://faturachman.my.id`
- `/api` is reverse-proxied to backend port `3002`
- backend AI chat has already been repaired after Gemini/history issues

## Product Direction

Ting AI should not be treated as a crypto-only app.

The intended direction is:

- cross-asset intelligence
- macro, market, wealth, and portfolio context
- later: geopolitics as part of the reasoning layer

Best product framing:

`Ting AI is a cross-asset intelligence workspace that helps users understand macro, market, geopolitics, and portfolio context faster and more clearly so they can make better investment decisions.`

## Product Surfaces

- `/` = personal portfolio homepage for professional identity
- `/ting-ai` = product landing page
- `/dashboard` = `Morning Command Center`
- `/portfolio` = `Portfolio Intelligence` workspace
- `/personal-space` = secondary internal route

## Version Status

- `v1.0` = foundation release
- `v1.1` = product sharpening release
- `v1.2` = cross-asset intelligence expansion
- `v1.5` = stronger Morning Command Center intelligence layer
- `v2.0` = full decision-support workspace across macro, market, geopolitics, and portfolio

Current stage:

- Ting AI is now in active `v1.2`

Reason:

- `v1.1` surface/product-sharpening work is complete
- current work is now cross-asset intelligence expansion
- the infrastructure is already live and stable enough to support deeper product work

## What Was Completed Recently

Recent meaningful completed work:

- backend `sendGemini` flow was repaired
- malformed backend string/template issues were removed
- backend was rebuilt and restarted successfully on the VPS
- direct POST test to `/api/ai-chat` succeeded
- shared frontend portfolio intelligence logic was introduced
- `/portfolio` now includes:
  - `Portfolio Intelligence`
  - `Exposure Snapshot`
  - `Portfolio Narrative`
  - `Portfolio Brief`
- dashboard `Portfolio Lens` now uses shared intelligence logic
- repeated lots under the same symbol are now grouped more intelligently in portfolio intelligence
- dashboard wording was upgraded so `Market Brief` and `Portfolio Brief` are more clearly separated
- dashboard now includes `Overnight Context`, `Macro Context`, and `Geopolitic Context`
- backend investment summary now returns structured `briefing` and `context` metadata
- AI chat now receives market-brief context so it can connect market conditions to portfolio context more explicitly
- `investment-summary` market endpoints were made public so dashboard market surfaces do not break on stale/expired auth tokens
- `v1.2-A` market regime engine is now live:
  - `regime`
  - `conviction`
  - `drivers`
  - `watchItems`
- dashboard now shows:
  - `Regime`
  - `Conviction`
  - `Market Drivers`
  - `Next Confirmation Points`
- `v1.2-B1` macro pressure layer is now live:
  - `UUP` as dollar proxy
  - `US10Y` as long-end rates proxy
  - `macroSignals`
- BTC fallback now uses CoinGecko if DB data is unavailable
- UUP fallback now uses Alpha Vantage `GLOBAL_QUOTE` if daily series fails
- dashboard investment summary is now engine-driven and no longer depends on Groq long-form output
- `/api/investment-summary` now returns `usedGroq: false` and stays consistent with structured context
- `v1.2-B2` stress/geopolitic layer is now live:
  - `stressState`
  - `stressDrivers`
  - stress-based `geopoliticContext`
- dashboard now shows:
  - `Stress State`
  - `Stress Posture`
  - `Stress Drivers`
- `v1.2-C` AI reasoning upgrade is now live:
  - AI prompt explicitly reasons through `market brief -> stress state -> macro pressure -> portfolio implication`
  - market brief context now injects `stressState` and `stressDrivers`
  - AI chat panel includes more relevant suggested prompts for the dashboard workflow
- AI chat panel UI has been reworked to be reading-first:
  - full-width on dashboard
  - larger message reading area
  - subtler history chips
  - suggested questions moved into a calmer assistive role

## Current Version Focus

`v1.1` core scope should be treated as complete.

`v1.2` is now active and already partially implemented.

What `v1.1` now represents:

### 1. Morning Command Center polish completed

Target:

- make `/dashboard` feel like a daily intelligence brief

Desired outcome:

- answer what changed overnight
- answer what matters today
- answer what deserves attention

### 2. Portfolio Intelligence polish completed

Target:

- make `/portfolio` useful as a decision-support workspace, not just a holdings list

### 3. AI Briefing alignment completed

Target:

- make AI feel like a reasoning layer for market + portfolio context

### 4. Cross-surface coherence completed

Target:

- keep homepage, `/ting-ai`, dashboard, and portfolio aligned in language and promise

## Current V1.2 State

`v1.2` should be treated as active work, not planning-only.

Completed so far:

- `v1.2-A` = Market Brief Engine 2.0
- `v1.2-B1` = Macro pressure layer with dollar/rates proxies and data stabilization
- `v1.2-B2` = Stress/geopolitic context layer
- `v1.2-C` = AI reasoning upgrade + dashboard AI panel polish

What `v1.2` currently means in product terms:

- Morning Command Center is no longer just a prettier dashboard
- it now has a stronger cross-asset regime layer
- macro pressure is visible
- stress posture is visible
- AI has more explicit instructions to connect market context to portfolio implication

What is still not true yet:

- this is not a full external news engine
- this is not a live geopolitical feed
- geopolitic context is still inferred from market behavior, not sourced from event/news APIs
- AI is better grounded than before, but still depends on provider quality for final phrasing

## Important Product Clarification

`Portfolio Brief` is currently portfolio-derived intelligence, not external news summarization.

It is generated from:

- portfolio holdings
- allocation / concentration
- winners / losers
- summary values

It is not yet a Bloomberg-style news brief.

If future work touches this area, maintain the distinction between:

- `Portfolio Brief` = generated from user holdings
- `Market Brief` = generated from macro/market context
- `News Brief` = generated from external news sources

## Capital Strategy

The project should currently be built in a capital-efficient way.

Recommended principle:

- build a useful `Ting AI Lite` first
- avoid expensive data and infra unless product usefulness is already proven

Practical meaning:

- use free or low-cost APIs when possible
- prefer cached / scheduled refresh over expensive real-time systems
- prioritize portfolio intelligence because it creates value without costly external data

## Investor View

Ting AI may be interesting for future fundraising, but current recommendation is:

- do not optimize for fundraising first
- optimize for product usefulness first

The product becomes much more fundable if:

- Morning Command Center becomes genuinely useful
- Portfolio Intelligence becomes clearly better than a basic tracker
- AI Briefing becomes clearly better than a generic chatbot

## Files To Read First

If another AI or engineer continues this project, read these first:

1. `MASTER_HANDOFF.md`
2. `VPS_PROGRESS.md`
3. `README.md`

If working on product direction, also read:

4. `TING_AI_PROJECT_BLUEPRINT_2026-04-04.md`

## Rules For Future Work

- do not accidentally reposition Ting AI as crypto-only
- do not collapse the product back into a generic personal portfolio site
- do not treat AI as a generic chat feature
- do not blur personal homepage messaging with product messaging
- keep Morning Command Center as the main product face
- keep Portfolio as a real intelligence workspace, not just CRUD

## Current v1.2 Status

Current state after the latest batches:

- `v1.2-A` done:
  - Market Brief Engine 2.0
  - structured `regime`, `conviction`, `drivers`, `watchItems`
- `v1.2-B1` done:
  - macro pressure layer with `UUP` and `US10Y`
  - BTC and UUP fallbacks improved data reliability
- `v1.2-B2` done:
  - `stressState` and `stressDrivers`
  - geopolitic context reframed as a defensible stress layer
- `v1.2-C` done:
  - AI reasoning now explicitly connects market brief, stress state, macro pressure, and portfolio implication
  - AI chat UI is now reading-first and materially more usable
- `v1.2-D1` done:
  - external context / news-aware layer is now live
  - source trail is clickable and source-backed
  - current live sources: Alpha Vantage News Sentiment with Marketaux fallback
- `v1.2-D2` done:
  - headline selection is more balanced by theme instead of naively taking the top crypto-heavy results
  - external context now includes a direct `Why It Matters` explanation
  - headline pressure wording is clearer: `Low / Active / Elevated External Pressure`

## Best Next Move

If continuing product work right now, the best next move is:

- continue `v1.2` from the intelligence side, not from cosmetic UI work
- best next step:
  - keep improving external context quality:
    - better theme balancing
    - sharper implication mapping
    - better macro/equity/gold coverage
  - or improve macro proxy freshness and fallback quality for `UUP` and `US10Y`
