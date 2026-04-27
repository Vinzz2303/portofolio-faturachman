# Ask Ting AI - Quick Reference

**Last Updated:** April 27, 2026 | **Version:** 1.0.0

---

## 🎯 What Is Ask Ting AI?

Ask Ting AI is a **context-aware financial copilot** that:
- Reads user's portfolio (holdings, P/L, concentration)
- Explains portfolio risk in plain language
- Suggests actions (Monitor, Wait, Rebalance, Reduce Exposure)
- Speaks in user's language (Indonesian or English)
- **NEVER gives buy/sell signals**
- **NEVER uses dramatic language**

---

## 📋 Key Files

### Backend
- **`server/src/index.ts`** - Main implementation
  - `tingAiStrictSystemPrompt` - System prompt with rules
  - `createPortfolioContext()` - Portfolio data collection
  - `parseAskTingAiResponse()` - JSON response parser
  - `buildAskTingAiFallback()` - Rule-based fallback
  - `/api/ai-chat` endpoint - Main API

### Frontend
- **`src/components/AiChat.tsx`** - React component
  - `renderStructuredResponse()` - Card rendering
  - `sendMessage()` - Updated to handle structured responses

### Styling
- **`src/styles.css`** - Card styling
  - `.ask-ting-ai-response-card` - Main container
  - `.response-section*` - Section styles
  - `.step-badge` - Action badge

### Types
- **`src/types.ts`** - Type definitions
  - `AskTingAiStructuredResponse` - Response structure
  - Extended `AiMessage` with `structured` field

---

## 🔑 Response Structure

```json
{
  "direct_answer": "1-2 sentences max",
  "why_it_matters": [
    "First reason - 1 bullet",
    "Second reason - 1 bullet"
  ],
  "risk_note": "One sentence about main risk",
  "suggested_next_step": "monitor|wait|rebalance|reduce_exposure"
}
```

---

## 🎨 Decision Rules

| Concentration | Action | Reason |
|---|---|---|
| **>50%** | `rebalance` | Extremely risky concentration |
| **35-50%** | `rebalance` | Moderate concentration |
| **<35%** | `monitor` | Well diversified |
| **Defensive market** | `wait` | Market caution |
| **General case** | `monitor` | Default safe action |

---

## 🗣️ Language Support

### Indonesian Mode
When user writes in Indonesian:
- Response is **100% Indonesian**
- Uses phrases: "portofoliomu", "berpotensi", "yang bisa dipertimbangkan"
- Avoids: "pasti", "harus", "hancur", "catastrophic"

### English Mode
When user writes in English:
- Response in **clear English**
- Professional tone
- No jargon overload

---

## 🚫 Forbidden Practices

**These MUST NEVER appear in responses:**

❌ "buy", "sell", "go long", "short"  
❌ "guaranteed", "will definitely"  
❌ "hancur", "kehancuran", "catastrophic", "devastating"  
❌ "crash pasti", "pasti rugi"  
❌ "Tell me more about...", "I need..."  

---

## ✅ Encouraged Practices

✅ "consider", "could", "might"  
✅ "berpotensi", "yang bisa dipertimbangkan"  
✅ "Here's what to watch for..."  
✅ "This is how it affects your portfolio..."  
✅ "One action you could take is..."  

---

## 🔄 Fallback Logic

**If AI fails to respond:**
1. Check portfolio concentration
2. If >50% concentrated → Suggest "rebalance"
3. If 35-50% concentrated → Suggest "rebalance"
4. If <35% concentrated → Suggest "monitor"
5. Respect user's language preference
6. Return deterministic response in <500ms

---

## 📊 API Endpoint

**POST `/api/ai-chat`**

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "portfolio": { "holdings": [...], "summary": {...} },
  "meta": { "instruments": {...}, "context": {...} },
  "summary": "market brief",
  "provider": "gemini"
}
```

**Response:**
```json
{
  "structured": {
    "direct_answer": "...",
    "why_it_matters": ["...", "..."],
    "risk_note": "...",
    "suggested_next_step": "monitor|wait|rebalance|reduce_exposure"
  },
  "providerStatus": {
    "requested": "gemini",
    "used": "gemini|groq|local",
    "fallbackUsed": false,
    "durationMs": 2500
  }
}
```

---

## 🧪 Quick Test Cases

### Test 1: Concentrated Portfolio
- Portfolio: AAPL 76.8%, profit +5.16%
- Question: "Portofolio saya aman gak?"
- Expected: Response mentions concentration, suggests "rebalance"

### Test 2: Diversified Portfolio
- Portfolio: Multiple holdings <25% each
- Question: "Apa yang harus saya lakukan?"
- Expected: Response acknowledges balance, suggests "monitor"

### Test 3: Language Detection
- Question in Indonesian → Response 100% Indonesian
- Question in English → Response in English

### Test 4: Fallback
- Disable AI provider → System uses fallback logic
- Expected: Deterministic response based on concentration

---

## 🎯 Deployment Steps

1. **Backend:** Update `server/src/index.ts`
2. **Frontend:** Update `src/components/AiChat.tsx` and `src/styles.css`
3. **Types:** Update `src/types.ts`
4. **Test:** Run test cases from `ASK_TING_AI_TEST_CASES.md`
5. **Deploy:** Follow `ASK_TING_AI_DEPLOYMENT_CHECKLIST.md`

---

## 📈 Monitoring

**Key metrics to track:**
- Response time (target: 2-5s for AI, <500ms for fallback)
- Fallback rate (target: <5%)
- Error rate (target: <1%)
- Language accuracy (target: 100%)
- User satisfaction (if surveyed)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Card doesn't display | Check `structured` field in API response |
| Wrong language | Verify language detection in system logs |
| Buy/sell signal appears | Check system prompt wasn't changed |
| Always using fallback | Check AI provider availability |
| Mobile layout broken | Check responsive CSS in `styles.css` |

---

## 📚 Full Documentation

- **Developer Guide:** `ASK_TING_AI_IMPLEMENTATION_GUIDE.md`
- **Test Cases:** `ASK_TING_AI_TEST_CASES.md`
- **User Guide:** `ASK_TING_AI_USER_GUIDE.md`
- **Deployment:** `ASK_TING_AI_DEPLOYMENT_CHECKLIST.md`
- **Summary:** `ASK_TING_AI_UPGRADE_SUMMARY.md`

---

## ⚡ Quick Commands

```bash
# Build backend
npm run build --workspace=server

# Build frontend
npm run build

# Test
npm run test

# Deploy to staging
# [your deployment command]

# Deploy to production
# [your deployment command]

# Rollback
git revert <commit-hash>
```

---

## 👤 Key Contacts

- **Developer:** [Name]
- **QA Lead:** [Name]
- **Product Manager:** [Name]
- **DevOps:** [Name]

---

## 📋 Checklist Before Deploying

- [ ] All code changes reviewed
- [ ] Tests pass
- [ ] No console errors
- [ ] Types compile correctly
- [ ] Styling looks good on mobile
- [ ] Fallback works
- [ ] Language detection works
- [ ] Response structure correct
- [ ] No buy/sell signals
- [ ] No dramatic language

---

## 🎉 Success Criteria

✅ Ask Ting AI responds with structured JSON  
✅ Card UI displays correctly  
✅ Both languages work (EN + ID)  
✅ Fallback works if AI unavailable  
✅ No buy/sell signals  
✅ No dramatic language  
✅ Response time <5s typical  
✅ Error rate <1%  

---

## 📞 Questions?

1. **How do I...** → Check `ASK_TING_AI_USER_GUIDE.md`
2. **What's the architecture?** → Check `ASK_TING_AI_IMPLEMENTATION_GUIDE.md`
3. **How do I test this?** → Check `ASK_TING_AI_TEST_CASES.md`
4. **How do I deploy?** → Check `ASK_TING_AI_DEPLOYMENT_CHECKLIST.md`

---

**Version:** 1.0.0  
**Status:** Ready for Production  
**Last Updated:** April 27, 2026
