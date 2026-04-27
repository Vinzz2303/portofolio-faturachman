# Ask Ting AI Upgrade - Deployment Checklist

## Pre-Deployment Review

### Code Quality
- [ ] All TypeScript compiles without errors
- [ ] No console.error or console.warn in production code
- [ ] All types properly defined and imported
- [ ] No hardcoded test values
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate (not verbose)

### Backend (`server/src/index.ts`)
- [ ] `tingAiStrictSystemPrompt` is correctly defined
- [ ] `tingAiSystemPrompt` points to the new strict prompt
- [ ] `createPortfolioContext()` function works correctly
- [ ] `parseAskTingAiResponse()` validates JSON properly
- [ ] `buildAskTingAiFallback()` covers all portfolio types
- [ ] `formatAskTingAiResponse()` handles both parsed and fallback responses
- [ ] API endpoint returns `{ structured, providerStatus }`
- [ ] All AI provider calls (Gemini, Groq, Azure) use structured responses
- [ ] Error handling doesn't leak sensitive data

### Frontend (`src/components/AiChat.tsx`)
- [ ] `AskTingAiStructuredResponse` type is imported
- [ ] `GroqResponse` type includes `structured` field
- [ ] `renderStructuredResponse()` function renders all sections
- [ ] Message rendering checks for `message.structured`
- [ ] Language detection works correctly (id/en)
- [ ] Fallback to plain text if no structured data
- [ ] No errors if `structured` is undefined

### Types (`src/types.ts`)
- [ ] `AskTingAiStructuredResponse` type is exported
- [ ] `AiMessage` extended with optional `structured` field
- [ ] All type exports are used correctly throughout code

### Styling (`src/styles.css`)
- [ ] `.ask-ting-ai-response-card` styles defined
- [ ] All `.response-section*` styles present
- [ ] `.step-badge` styling correct
- [ ] Colors match dashboard theme
- [ ] Typography is consistent
- [ ] Mobile responsive (test on device)
- [ ] No z-index conflicts
- [ ] No layout shift when loading/unloading

### Documentation
- [ ] `ASK_TING_AI_TEST_CASES.md` created ✅
- [ ] `ASK_TING_AI_IMPLEMENTATION_GUIDE.md` created ✅
- [ ] `ASK_TING_AI_USER_GUIDE.md` created ✅

---

## Testing Checklist

### Unit Tests (if applicable)
- [ ] `parseAskTingAiResponse()` with valid JSON
- [ ] `parseAskTingAiResponse()` with invalid JSON
- [ ] `buildAskTingAiFallback()` for high concentration (>50%)
- [ ] `buildAskTingAiFallback()` for moderate concentration (35-50%)
- [ ] `buildAskTingAiFallback()` for low concentration (<35%)
- [ ] Portfolio context generation with various holdings

### Integration Tests
- [ ] Send request with portfolio data
- [ ] Send request without portfolio data
- [ ] Verify structured response is returned
- [ ] Verify fallback triggers correctly
- [ ] Test with Gemini provider
- [ ] Test with Groq provider
- [ ] Test language detection (ID vs EN)

### Frontend Tests
- [ ] Component renders without errors
- [ ] Structured response displays as card
- [ ] Plain text response displays correctly
- [ ] Error states handled gracefully
- [ ] Loading state visible
- [ ] Mobile layout responsive
- [ ] Irish language badges display correctly (id/en)

### User Testing
- [ ] Test concentrated portfolio (>50%) scenario
- [ ] Test diversified portfolio (<35%) scenario
- [ ] Test moderate concentration (35-50%) scenario
- [ ] Test Indonesian language support
- [ ] Test English language support
- [ ] Test missing portfolio data
- [ ] Test with no market context
- [ ] Verify suggested actions are reasonable

---

## Deployment Steps

### 1. Database (if needed)
- [ ] No database migrations required (no schema changes)
- [ ] Verify backward compatibility

### 2. Environment Variables
- [ ] Verify all AI provider keys are set (GEMINI_API_KEY, GROQ_API_KEY, etc.)
- [ ] Verify timeouts are appropriate
- [ ] Check rate limits are not too restrictive

### 3. Backend Deployment
```bash
# Build backend
npm run build --workspace=server

# Test build
npm run test --workspace=server  # if tests exist

# Deploy to production
# [deployment process specific to your infrastructure]
```

Checklist:
- [ ] Code pushed to repository
- [ ] Build succeeds
- [ ] No build warnings (except deprecation warnings)
- [ ] Deployed to staging first
- [ ] Run staging smoke tests
- [ ] Deployed to production

### 4. Frontend Deployment
```bash
# Build frontend
npm run build

# Test build
npm run preview  # local preview

# Deploy to production
# [deployment process specific to your infrastructure]
```

Checklist:
- [ ] Code pushed to repository
- [ ] Build succeeds
- [ ] No build warnings
- [ ] Assets optimized (CSS, JS, images)
- [ ] Deployed to staging first
- [ ] Run staging smoke tests
- [ ] Deployed to production

### 5. Verify Deployment
- [ ] Access application in production
- [ ] Test Ask Ting AI is accessible
- [ ] Test can send a message
- [ ] Verify structured response is returned
- [ ] Check styling renders correctly
- [ ] Test both languages work
- [ ] Test fallback works (temporarily disable AI provider)
- [ ] Check logs for errors

---

## Post-Deployment Monitoring

### Logs to Monitor
- [ ] AI chat error rate
- [ ] Fallback trigger rate (should be <5%)
- [ ] Response time (should be 2-5s for AI, <500ms for fallback)
- [ ] Language detection accuracy
- [ ] Provider failures and failover

### Metrics to Track
- [ ] Number of Ask Ting AI interactions per day
- [ ] Average response time
- [ ] Fallback rate
- [ ] User satisfaction (if surveyed)
- [ ] Error rate

### Alerts to Set Up
- [ ] High fallback rate (>10%)
- [ ] AI provider unavailable
- [ ] Response time >10s
- [ ] Error rate >5%
- [ ] No Ask Ting AI usage (may indicate UI bug)

---

## Rollback Plan

If issues occur, rollback using:

### Quick Rollback (within 1 hour)
```bash
# Revert to previous version
git revert <commit-hash>
# OR use deployment system's rollback feature
```

### Specific Component Rollback

**If only backend is broken:**
- Revert `server/src/index.ts` to previous version
- Keep frontend changes (UI is backward compatible)

**If only frontend is broken:**
- Revert `src/components/AiChat.tsx` and `src/styles.css`
- Backend continues to work, returns `structured` field (ignored by old frontend)
- Old frontend displays nothing or falls back to plain text

### Full Rollback Procedure
1. Identify the issue (backend vs frontend vs both)
2. Revert specific files or full deployment
3. Run basic smoke tests
4. Verify no regressions
5. Document what caused the issue
6. Fix the issue in development
7. Re-deploy when ready

---

## Known Issues & Mitigations

### Issue 1: AI Response Timeout
- **Symptom:** Responses take >10 seconds
- **Cause:** AI provider slow
- **Mitigation:** Increase timeout in `GROQ_REQUEST_TIMEOUT_MS` env var
- **Fallback:** Automatic fallback to local rules

### Issue 2: Fallback Rate High (>10%)
- **Symptom:** Many responses using fallback logic
- **Cause:** AI provider frequently unavailable or parsing failing
- **Mitigation:** Check AI provider status, verify system prompt format
- **Action:** Review recent deployments for unintended changes

### Issue 3: Wrong Language Response
- **Symptom:** Response in wrong language (EN vs ID)
- **Cause:** Language detection failed
- **Mitigation:** Ensure `detectPreferredLanguage()` working correctly
- **Action:** Add language preference UI if needed

### Issue 4: Structured Response Missing
- **Symptom:** Card doesn't display, plain text shown
- **Cause:** API not returning `structured` field
- **Mitigation:** Check API is returning both fields, check parsing
- **Action:** Frontend gracefully handles both cases

### Issue 5: Styling Issues on Mobile
- **Symptom:** Card doesn't fit on small screens
- **Cause:** CSS not responsive
- **Mitigation:** Test on all device sizes, adjust media queries
- **Action:** Review CSS media breakpoints

---

## Sign-Off

### Development Sign-Off
- [ ] Developer: _________________ Date: _______
- [ ] Code review completed
- [ ] All tests pass
- [ ] Documentation complete

### QA Sign-Off
- [ ] QA Lead: _________________ Date: _______
- [ ] Test cases executed
- [ ] No critical issues found
- [ ] Known issues documented

### Deployment Sign-Off
- [ ] DevOps/Release: __________ Date: _______
- [ ] Deployment successful
- [ ] Monitoring configured
- [ ] Rollback tested

### Product Sign-Off
- [ ] Product Manager: __________ Date: _______
- [ ] Feature meets requirements
- [ ] Ready for customer use

---

## Post-Launch Checklist (First Week)

- [ ] Monitor error rates daily
- [ ] Review user feedback
- [ ] Check performance metrics
- [ ] Verify no regression in other features
- [ ] Collect examples of good responses
- [ ] Identify any edge cases not covered
- [ ] Plan improvements for next iteration
- [ ] Document lessons learned

---

## Success Criteria

✅ **Deployment is successful if:**
1. Ask Ting AI responds with structured JSON
2. Card UI displays correctly
3. Both languages work (EN and ID)
4. Fallback works if AI unavailable
5. No buy/sell signals in responses
6. No dramatic language in responses
7. Response time is <5s typically
8. Error rate is <1%
9. Users can understand responses

❌ **Deployment should be rolled back if:**
1. Critical error on every request
2. Structured response never returned
3. Card never displays properly
4. Language mixing occurs frequently
5. Buy/sell signals appear in responses
6. Response time is consistently >10s
7. Error rate is >5%
8. Database becomes corrupted

---

## Deployment Notes

**Deployment Date:** [To be filled]  
**Deployed By:** [To be filled]  
**Version:** 1.0.0  
**Environment:** [Development / Staging / Production]  

**Issues Encountered:**
[None / Describe any issues and how they were resolved]

**Performance Baseline:**
- Average response time: _______ ms
- Fallback rate: _______ %
- Error rate: _______ %

---

## Appendix: File Checklist

### Modified Files
- [ ] `server/src/index.ts` - Backend API changes
- [ ] `src/types.ts` - New type definitions  
- [ ] `src/components/AiChat.tsx` - Frontend component updates
- [ ] `src/styles.css` - New card styling

### New Documentation Files
- [ ] `ASK_TING_AI_TEST_CASES.md` - Test cases
- [ ] `ASK_TING_AI_IMPLEMENTATION_GUIDE.md` - Implementation docs
- [ ] `ASK_TING_AI_USER_GUIDE.md` - User guide
- [ ] `ASK_TING_AI_DEPLOYMENT_CHECKLIST.md` - This file

### Unchanged Files (should still work)
- [ ] `src/components/AskTingAiPanel.tsx` - Dashboard panel (compatible)
- [ ] All other components - No changes needed
- [ ] Database schema - No changes needed

---

**Last Updated:** April 27, 2026  
**Maintained By:** [Team responsible for Ask Ting AI]
