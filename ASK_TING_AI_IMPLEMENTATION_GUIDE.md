# Ask Ting AI Upgrade - Implementation Guide

## Overview

Ask Ting AI has been transformed from a generic chatbot into a **context-aware financial copilot** that reads your portfolio, market conditions, and language preference before answering.

### Core Philosophy
- ✅ **NOT** a signal provider - no "buy/sell" signals
- ✅ Helps retail investors **understand risk** and decision context
- ✅ Personal to **your actual portfolio**
- ✅ Calm, clear, non-dramatic tone
- ✅ **Works in Indonesian and English**

---

## What Changed

### 1. System Prompt (Backend: `tingAiStrictSystemPrompt`)

**New strict prompt replaces the old generic one with:**

- Explicit rules against buy/sell signals
- Ban on dramatic language ("hancur", "catastrophic", etc.)
- Requirement to NOT ask for more data if context exists
- Structured JSON response format (always)
- Language support for Indonesian with natural phrasing
- Decision framework: If concentrated risk, suggest rebalance; if diversified, suggest monitor

### 2. Portfolio Context Injection

**Before sending to AI, system now collects:**

```
PORTFOLIO CONTEXT:
- Total Capital Invested: $X,XXX
- Current Portfolio Value: $X,XXX
- Profit/Loss Amount: $±X,XXX
- Profit/Loss Percentage: ±X.XX%
- Number of Holdings: N
- Top 3 Holdings: ASSET1 (X%), ASSET2 (Y%), ASSET3 (Z%)
- Largest Holding: SYMBOL (X% of portfolio)
- Largest Asset Type: CATEGORY (X% of portfolio)
- RISK ASSESSMENT: [HIGH CONCENTRATION | MODERATE DIVERSIFICATION | WELL DIVERSIFIED]
- PORTFOLIO STATUS: [PROFIT | LOSS | BREAKEVEN]
```

**Portfolio context is used to:**
- Make responses personal to user's actual situation
- Identify concentration risks automatically
- Guide suggested actions (rebalance vs monitor vs wait)
- Never ask user for more data

### 3. Structured Response Format

**Every response now follows this JSON structure:**

```json
{
  "direct_answer": "1 short paragraph, max 2 sentences",
  "why_it_matters": [
    "First reason - 1 bullet point",
    "Second reason - 1 bullet point"
  ],
  "risk_note": "One short sentence about main risk",
  "suggested_next_step": "monitor | wait | rebalance | reduce_exposure"
}
```

**Benefits:**
- No long rambling paragraphs
- No markdown walls
- Consistent, predictable format
- Easy to display as a clean card

### 4. Deterministic Fallback Logic

**If AI fails to respond, system uses rule-based fallback:**

```javascript
If largestAssetWeight > 50%:
  → Suggest "rebalance"
  → Mention concentration risk
  → Emphasize how single asset dominates

Else if largestAssetWeight > 35%:
  → Suggest "rebalance"
  → Mention moderate concentration
  → Suggest consider diversifying

Else (well diversified):
  → Suggest "monitor"
  → Acknowledge good balance
  → Encourage ongoing monitoring
```

**Fallback ensures:**
- No errors or crashes
- Always helpful response
- Uses actual portfolio data
- Respects language preference

### 5. Frontend Display - Clean Card UI

**Response displays as a professional card:**

```
┌──────────────────────────────────┐
│ [Direct Answer - main insight]   │
│                                  │
│ WHY IT MATTERS                   │
│ • Reason 1                       │
│ • Reason 2                       │
│                                  │
│ RISK NOTE                        │
│ [Risk statement in italics]      │
│                                  │
│ ┌────────────────┐              │
│ │    REBALANCE   │  ← Badge     │
│ └────────────────┘              │
└──────────────────────────────────┘
```

**No more:**
- Long raw AI paragraphs
- Markdown formatting
- "I need more data" responses
- Mixed language confusion

---

## How It Works - Flow Diagram

```
User asks question in Ask Ting AI
         ↓
   Detect language (ID or EN)
         ↓
   Collect portfolio context
   (capital, P/L, holdings, etc)
         ↓
   Inject into strict system prompt
         ↓
   Send to AI model (Gemini/Groq)
         ↓
   ┌─────────────────┐
   │ AI responds     │
   └────────┬────────┘
            ↓
   Try to parse JSON response
            ↓
   ┌────────────────────────┐
   │ Success? ──→ Return structured
   └────┬───────────────────┘
        │ No
        ↓
   Apply deterministic fallback
   (based on concentration %)
        ↓
   Return fallback response
        ↓
   Frontend displays as card
```

---

## Decision Rules

### For Concentrated Portfolios (>50% in one asset)

**Response:**
- Emphasize concentration risk
- Say "profitable but vulnerable" if P/L is positive
- Say "risk control priority" if P/L is negative
- Suggest: **rebalance**

### For Moderate Portfolios (35-50%)

**Response:**
- Acknowledge moderate concentration
- Suggest diversifying further
- Suggest: **rebalance**

### For Diversified Portfolios (<35%)

**Response:**
- Praise balance
- Suggest monitoring
- Suggest: **monitor**

### For Defensive Markets

**Response:**
- Suggest caution
- Suggest: **wait** (if considering adding exposure)

### For Uncertain Contexts

**Response:**
- Use available data conservatively
- Mention uncertainty briefly (1 sentence max)
- Do NOT ask user for more data
- Suggest: **monitor** (default safe action)

---

## Language Support

### Indonesian Mode

**When user writes in Indonesian:**

- Response is **100% Indonesian**
- Uses natural phrases:
  - "portofoliomu" (your portfolio)
  - "modalmu" (your capital)
  - "yang bisa dipertimbangkan" (that could be considered)
  - "berpotensi" (potentially, not "pasti")

- Avoids:
  - "pasti naik" (definitely rise)
  - "harus beli" (must buy)
  - "akan profit" (will profit)
  - "hancur" (destroyed)
  - Mixed English unless necessary

**Example response (Indonesian):**

```json
{
  "direct_answer": "Portofoliomu terlalu terkonsentrasi pada AAPL (76.8%). Meskipun dalam keuntungan, risiko konsentrasinya masih tinggi.",
  "why_it_matters": [
    "Porsi AAPL terlalu dominan terhadap total portofoliomu",
    "Jika AAPL melemah, dampaknya langsung terasa ke nilai portofolio"
  ],
  "risk_note": "Risiko utama adalah konsentrasi, bukan arah pasar umum.",
  "suggested_next_step": "rebalance"
}
```

### English Mode

**When user writes in English or language is unclear:**

- Response is **clear, professional English**
- Uses precise terms
- Avoids jargon overload
- Accessible to all English speakers

**Example response (English):**

```json
{
  "direct_answer": "Your portfolio is heavily concentrated in AAPL (76.8%). Even though you're profitable, the concentration itself is the main risk right now.",
  "why_it_matters": [
    "AAPL represents nearly 77% of your total portfolio",
    "If AAPL declines, the impact on your portfolio value is immediate and large"
  ],
  "risk_note": "The primary risk is concentration in a single asset, not general market direction.",
  "suggested_next_step": "rebalance"
}
```

---

## What Ask Ting AI Will NOT Do

🚫 **No Buy/Sell Signals**
- Won't say "buy now", "sell", "go long", "short this"
- Won't give entry points or price targets

🚫 **No Predictions**
- Won't say "will go up to X"
- Won't guarantee profits
- Won't predict crashes

🚫 **No Fear Language**
- Won't use: "catastrophic", "devastating", "crash", "pasti rugi"
- Won't dramatize risk
- Won't say "money is gone"

🚫 **No Data Fishing**
- Won't ask "can you tell me more?"
- Won't say "I need to know..."
- Will use available context conservatively

---

## What Ask Ting AI WILL Do

✅ **Explain Portfolio Risk**
- "Your largest holding is 76% of portfolio - here's why that matters"
- "You're diversified - here's how that helps you"
- "Your portfolio is in profit but concentrated - here's the hidden risk"

✅ **Frame Context**
- "Market is defensive right now - here's what that means for portfolios like yours"
- "Valuations are stretched - consider these options"

✅ **Suggest Actions**
- "Monitor" - keep watching, things are fine
- "Wait" - consider not acting until conditions improve
- "Rebalance" - reduce concentration
- "Reduce exposure" - step back from risk

✅ **Personal Guidance**
- Always references your actual holdings
- Always mentions your actual P/L
- Always considers your concentration level
- Always speaks to YOUR situation, not generic advice

---

## Architecture

### Backend Changes

**File: `server/src/index.ts`**

1. **New System Prompt** (~100 lines)
   - Strict rules against signals, drama, data fishing
   - Structured JSON requirement
   - Language support rules
   - Decision framework

2. **Enhanced Portfolio Context** (~60 lines)
   - `createPortfolioContext()` function
   - Collects: capital, P/L, holdings, sectors, concentration level
   - Tags concentration risk level automatically

3. **Response Parser** (~25 lines)
   - `parseAskTingAiResponse()` function
   - Validates JSON structure
   - Returns null if parse fails → triggers fallback

4. **Fallback Logic** (~80 lines)
   - `buildAskTingAiFallback()` function
   - Rule-based responses by concentration level
   - Language-aware (Indonesian/English)
   - Deterministic and fast

5. **Response Formatter** (~10 lines)
   - `formatAskTingAiResponse()` function
   - Attempts parse, falls back if needed

6. **API Endpoint Update**
   - Returns `{ structured: AskTingAiStructuredResponse }`
   - Applies parsing and fallback to all responses

### Frontend Changes

**File: `src/components/AiChat.tsx`**

1. **Import New Type**
   - `AskTingAiStructuredResponse`

2. **Update Response Type**
   - `GroqResponse` now includes `structured` field

3. **Handle Structured Responses**
   - `renderStructuredResponse()` component
   - Displays card with direct_answer, bullets, risk note, badge

4. **Update Message Rendering**
   - Check for `message.structured`
   - Render card if available, otherwise render plain text

### Styling

**File: `src/styles.css`**

- `.ask-ting-ai-response-card` - Main container
- `.response-section` - Section layouts
- `.reasons-list` - Bullet point styling
- `.step-badge` - Action badge styling
- `.section-label` - Label styling
- Colors, typography, spacing for clean card UI

### Type System

**File: `src/types.ts`**

1. **New Type**
   ```typescript
   export type AskTingAiStructuredResponse = {
     direct_answer: string
     why_it_matters: string[]
     risk_note: string
     suggested_next_step: 'monitor' | 'wait' | 'rebalance' | 'reduce_exposure'
   }
   ```

2. **Extended AiMessage**
   ```typescript
   export type AiMessage = {
     role: AiRole
     content: string
     structured?: AskTingAiStructuredResponse  // Optional
   }
   ```

---

## Testing & Verification

**See: `ASK_TING_AI_TEST_CASES.md`** for comprehensive test cases

### Quick Manual Tests

1. **Concentrated Portfolio** → Asks "Portofolio saya aman?" → Expects "rebalance" suggestion
2. **Diversified Portfolio** → Asks "Apa yang harus saya lakukan?" → Expects "monitor" suggestion
3. **Indonesian Mode** → Asks in Indonesian → Response 100% Indonesian
4. **English Mode** → Asks in English → Response in English
5. **Fallback** → Disable portfolio data → Still works with sensible response

---

## FAQ

### Q: Will Ask Ting AI tell me to buy or sell?
**A:** No, never. The system prompt explicitly forbids it. If AI tries, fallback takes over.

### Q: What if my portfolio data is incomplete?
**A:** The system won't ask for more data. It answers conservatively with what's available.

### Q: Can I get responses in Indonesian?
**A:** Yes! Write your question in Indonesian and you'll get a fully Indonesian response.

### Q: Why does it always end with "monitor", "wait", "rebalance", or "reduce_exposure"?
**A:** These are the four safe, actionable suggestions. They avoid claims about future prices and let you decide.

### Q: What if the AI connection fails?
**A:** Fallback logic kicks in - you still get a sensible response based on your portfolio's concentration level.

### Q: Why the card format instead of long paragraphs?
**A:** Easier to scan, consistent structure, and forces conciseness - no fluff or dramatic language possible.

### Q: Can I ask about specific assets like gold, BTC, or stocks?
**A:** Yes! Ask about specific assets, market conditions, entry/exit timing, or options to consider. Ask Ting AI will answer tied to your portfolio.

### Q: Is this financial advice?
**A:** No. Ask Ting AI is analysis and framing, not advice. The decision stays with you.

---

## Performance & Limits

- **Response Time**: ~2-5 seconds (AI) or <500ms (fallback)
- **Fallback Rate**: Should be <5% (if AI is stable)
- **Supported Languages**: English (en), Indonesian (id)
- **Max Holdingsanalyzed**: Unlimited (system handles any number)
- **Minimum Portfolio**: 1 holding (works with any size)

---

## Troubleshooting

### Issue: "No response or empty response"
- Check API connection to AI provider
- Verify portfolio data is being sent
- Check backend logs for errors

### Issue: "Response is plain text, not card"
- Verify `structured` field is in API response
- Check frontend is parsing response correctly
- Clear browser cache

### Issue: "Response is in wrong language"
- Check language detection - look at system log
- Verify messages were sent in target language
- Manually set language preference

### Issue: "Response includes buy/sell signals"
- This shouldn't happen - check system prompt wasn't overwritten
- Report to developer if it occurs

### Issue: "Asking for more data"
- This shouldn't happen - check system prompt is active
- Fallback should trigger instead

---

## Maintenance & Updates

### To Update System Prompt
1. Edit `server/src/index.ts` → `tingAiStrictSystemPrompt`
2. Restart server
3. Test with comprehensive test cases

### To Update Fallback Logic
1. Edit `buildAskTingAiFallback()` in `server/src/index.ts`
2. Test with various portfolio configurations

### To Update UI Card
1. Edit `renderStructuredResponse()` in `src/components/AiChat.tsx`
2. Update styles in `src/styles.css`
3. Test responsive design

### To Add New Language
1. Add language detection in `detectPreferredLanguage()`
2. Add language-specific fallback responses
3. Update `renderStructuredResponse()` labels
4. Test translations

---

## Success Metrics

✅ **Ask Ting AI should feel like:**
- "AI ini benar-benar membaca portofolio saya" (This AI really reads my portfolio)
- "Jawaban ini personal, bukan generic" (This answer is personal, not generic)
- "Saya paham risiko saya lebih baik" (I understand my risk better)

❌ **Ask Ting AI should NOT feel like:**
- Generic chatbot advice
- Too sales-y or dramatic
- Asking me for more information
- Giving me buy/sell signals

---

## Next Steps

1. Deploy backend changes to production
2. Deploy frontend changes to production
3. Run comprehensive test suite
4. Monitor logs for fallback rate and errors
5. Gather user feedback
6. Iterate based on real-world usage

---

**Version:** 1.0.0  
**Last Updated:** April 27, 2026  
**Status:** Ready for Deployment
