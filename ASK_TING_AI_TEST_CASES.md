# Ask Ting AI - Context-Aware Financial Copilot Test Cases

This document provides test cases to verify the Ask Ting AI upgrade is working correctly.

## Implementation Summary

Ask Ting AI has been upgraded with:
- ✅ Strict system prompt that prevents buy/sell signals and dramatic language
- ✅ Enhanced portfolio context injection (total capital, P/L %, asset allocation, sector exposure)
- ✅ Structured JSON response format (direct_answer, why_it_matters, risk_note, suggested_next_step)
- ✅ Fallback logic for concentrated vs diversified portfolios
- ✅ Clean UI card display with bullets and badges
- ✅ Full Indonesian language support

---

## Test Case 1: Concentrated Portfolio with Profit

**Scenario:**
- Portfolio: AAPL 76.8%, other holdings minimal
- P/L: +5.16% (profitable)
- Market sentiment: Defensive
- User language: Indonesian
- User question: "Portofolio saya aman gak?"

**Expected Output:**

```json
{
  "direct_answer": "Portofoliomu masih cukup rentan karena terlalu bergantung pada satu aset utama. Meskipun dalam keuntungan, konsentrasinya adalah risiko utama saat ini.",
  "why_it_matters": [
    "Porsi AAPL terlalu dominan terhadap total portofoliomu",
    "Jika AAPL melemah, dampaknya langsung terasa ke nilai portofolio"
  ],
  "risk_note": "Risiko utama saat ini adalah konsentrasi, bukan arah harga.",
  "suggested_next_step": "rebalance"
}
```

**Verification Checklist:**
- [ ] Response mentions AAPL concentration (76.8%)
- [ ] Acknowledges portfolio is profitable but vulnerable
- [ ] Suggests "rebalance" as next step
- [ ] No buy/sell signals
- [ ] No dramatic language (no "hancur", "kehancuran", "catastrophic")
- [ ] Full Indonesian, no mixed English
- [ ] Card displays cleanly with bullets and badge

---

## Test Case 2: Diversified Portfolio

**Scenario:**
- Portfolio: No asset above 25%, 8+ holdings
- P/L: +3.2% (modest profit)
- Market sentiment: Neutral
- User language: English
- User question: "Apa yang harus saya lakukan?"

**Expected Output:**

```json
{
  "direct_answer": "Your portfolio appears reasonably balanced and diversified. The safest step right now is to continue monitoring market conditions and your positions.",
  "why_it_matters": [
    "No single asset dominates your portfolio allocation",
    "Good diversification helps reduce the impact of single-asset volatility"
  ],
  "risk_note": "Keep monitoring market changes as your risk profile can shift over time.",
  "suggested_next_step": "monitor"
}
```

**Verification Checklist:**
- [ ] Recognizes good diversification
- [ ] Suggests "monitor" as appropriate action
- [ ] Does NOT suggest rebalance (portfolio is balanced)
- [ ] Tone is calm and professional
- [ ] English language used consistently
- [ ] Card displays without errors

---

## Test Case 3: Missing Market Sentiment Context

**Scenario:**
- Portfolio: Standard mixed holdings
- Market sentiment data: UNAVAILABLE
- User language: Indonesian
- User question: "Bagaimana kondisi pasar sekarang?"

**Expected Output:**
- Response should still work and be useful
- Should NOT ask user for more data
- Should mention uncertainty briefly if needed
- Should use available context conservatively

**Verification Checklist:**
- [ ] Response generated successfully
- [ ] Does not ask user for more data
- [ ] Card displays properly
- [ ] If mentions missing context, does so briefly in one sentence
- [ ] Still provides actionable guidance

---

## Test Case 4: Indonesian Full Language Support

**Scenario:**
- Portfolio: Various assets with concentration
- User language: Indonesian (detected from user messages)
- User question: "Apakah saya harus menambah atau mengurangi portofolio?"

**Expected Output:**
- Fully in Indonesian
- Uses natural phrases like "portofoliomu", "modalmu"
- No English terms except common finance terms (e.g., "rebalance")
- Proper formatting of numbers and percentages

**Verification Checklist:**
- [ ] 100% Indonesian response
- [ ] No mixed English except necessary finance terms
- [ ] Natural Indonesian phrasing
- [ ] Card displays Indonesian section labels correctly
- [ ] "Rebalance" or other common terms used appropriately

---

## Test Case 5: Moderate Concentration (35-50%)

**Scenario:**
- Portfolio: Largest holding 45%, rest distributed
- P/L: -2.3% (small loss)
- User language: Indonesian
- User question: "Portofolio saya aman?"

**Expected Output:**
- Should recognize moderate concentration
- Should suggest rebalance but with less urgency than 76%+ case
- Should acknowledge loss state
- Should recommend risk control

**Verification Checklist:**
- [ ] Identifies moderate concentration
- [ ] Suggests rebalance as appropriate
- [ ] Acknowledges portfolio loss
- [ ] Emphasizes risk control priority
- [ ] Professional, non-dramatic tone

---

## Test Case 6: Fallback Logic (No Portfolio Data)

**Scenario:**
- User attempts Ask Ting AI without portfolio data
- Request fails or portfolio is empty

**Expected Output:**
- Should not error or crash
- Should return deterministic fallback response
- Should suggest "monitor" or "wait"
- Should be helpful despite missing data

**Verification Checklist:**
- [ ] No 500 errors returned
- [ ] Fallback response is appropriate
- [ ] Card renders successfully
- [ ] Response is in correct language

---

## Test Case 7: No Dramatic Language

**Scenario:**
- Test all responses across different portfolio states
- Check for forbidden words in system prompt

**Forbidden words to verify are NOT present:**
- "hancur" / "kehancuran"
- "catastrophic"
- "devastating"
- "crash pasti"
- "pasti rugi"
- "crash" (without context)
- "guaranteed" (profit/loss guarantee)
- "will crash"
- "must buy" / "harus beli"

**Verification Checklist:**
- [ ] Search response text for each forbidden word
- [ ] Response uses calm, measured language
- [ ] Uses "berpotensi" instead of "pasti"
- [ ] Uses "bisa" (could) instead of "akan" (will)

---

## Test Case 8: No Buy/Sell Signals

**Scenario:**
- Ask Ting AI various portfolio questions
- Check all responses avoid direct buy/sell commands

**Things to verify:**
- No "buy", "sell", "go long", "go short"
- No target prices or predictions
- No profit guarantees
- Frames as options to "consider" not commands

**Verification Checklist:**
- [ ] No "buy" or "sell" in responses
- [ ] Uses "consider", "think about", "could explore"
- [ ] Frames risks clearly without guarantees
- [ ] Decision stays with user ("keputusan tetap di tangan Anda")

---

## Test Case 9: Structured Response Format

**Scenario:**
- Every Ask Ting AI response should follow structured format
- Test both AI responses and fallbacks

**Response must have:**
- `direct_answer`: 1-2 sentences max
- `why_it_matters`: exactly 2 bullet points
- `risk_note`: 1 short sentence
- `suggested_next_step`: one of [monitor, wait, rebalance, reduce_exposure]

**Verification Checklist:**
- [ ] All responses are valid JSON
- [ ] direct_answer is short (< 80 words)
- [ ] why_it_matters has exactly 2 items
- [ ] risk_note is 1 sentence only
- [ ] suggested_next_step matches allowed values
- [ ] Card displays all sections properly

---

## Test Case 10: Portfolio Context Injection

**Scenario:**
- Verify portfolio data is actually being used in responses
- Check responses reference user's specific holdings

**For a Pro user with known portfolio:**
- Response should mention specific stock symbols
- Response should reference actual P/L percentage
- Response should address actual concentration levels
- Should NOT give generic advice

**Verification Checklist:**
- [ ] Response mentions specific holdings by symbol
- [ ] References actual P/L percentage from portfolio
- [ ] Calculates concentration based on real data
- [ ] Not generic/copy-paste advice
- [ ] Personal to user's actual situation

---

## Manual Testing Steps

### Step 1: Test Concentrated Portfolio
1. Go to portfolio with one large holding (60%+)
2. Open Ask Ting AI
3. Ask: "Portofolio saya aman gak?" (or English equivalent)
4. Verify:
   - Response identifies concentration
   - Suggests rebalance
   - Shows card with all 4 sections
   - No dramatic language

### Step 2: Test Diversified Portfolio
1. Go to well-balanced portfolio
2. Ask: "Apa yang harus saya lakukan?"
3. Verify:
   - Response acknowledges diversification
   - Suggests monitor
   - Calm, reassuring tone

### Step 3: Test Indonesian Mode
1. Write question in Indonesian
2. Verify response is 100% Indonesian
3. Check for natural phrasing

### Step 4: Test English Mode
1. Write question in English
2. Verify response is in English
3. Check consistency

### Step 5: Test Fallback
1. Clear or disable portfolio data
2. Try Ask Ting AI
3. Verify fallback works gracefully

---

## UI Display Verification

**Card should display:**
```
┌─────────────────────────────────────┐
│ [Direct Answer Text]                 │
│                                      │
│ WHY IT MATTERS                       │
│ • Reason 1                           │
│ • Reason 2                           │
│                                      │
│ RISK NOTE                            │
│ [Risk statement in italics]          │
│                                      │
│ ┌─────────────────┐                 │
│ │ REBALANCE       │  (Badge)         │
│ └─────────────────┘                 │
└─────────────────────────────────────┘
```

**Verification Checklist:**
- [ ] Direct answer at top
- [ ] 2 bullet reasons with bullets
- [ ] Risk note is italicized
- [ ] Step badge shows correct action
- [ ] No markdown or raw text visible
- [ ] Colors/styling match dashboard theme
- [ ] Mobile responsive

---

## Known Limitations / Future Improvements

- [ ] Sector exposure analysis could be more granular
- [ ] Market sentiment integration could be expanded
- [ ] Multi-holding cross-correlation analysis (future)
- [ ] Time-series risk analysis (future)
- [ ] Scenario analysis fallback (future)

---

## Sign-off Checklist

- [ ] All 10 test cases pass
- [ ] No buy/sell signals in any response
- [ ] No dramatic language
- [ ] Indonesian support verified
- [ ] Fallback logic working
- [ ] UI card renders correctly
- [ ] Mobile display verified
- [ ] Error handling works
- [ ] Response times acceptable
- [ ] Logging working for debugging

---

## Notes for Developer

**Key Files Modified:**
- `server/src/index.ts` - Backend API logic, system prompt, fallback logic
- `src/types.ts` - Added `AskTingAiStructuredResponse` type
- `src/components/AiChat.tsx` - Frontend response handling and display
- `src/styles.css` - Card styling

**System Prompt Location:** `server/src/index.ts` line ~273
**Portfolio Context Generator:** `server/src/index.ts` - `createPortfolioContext()` function
**Response Parser:** `server/src/index.ts` - `parseAskTingAiResponse()` function
**Fallback Logic:** `server/src/index.ts` - `buildAskTingAiFallback()` function

---

**Test Date:** [To be filled]
**Tester:** [To be filled]
**Status:** [PASS / FAIL]
**Notes:** [To be filled]
