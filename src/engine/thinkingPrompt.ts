import type { UserIntent } from './intentEngine'
import type { EngineContext } from './contextBuilder'
import type { ReasoningOutput } from './reasoningEngine'

export function buildThinkingPrompt(
  message: string,
  lang: 'id' | 'en',
  intent: UserIntent,
  context: EngineContext,
  reasoning: ReasoningOutput,
  trustNote: string
): string {
  return `
[SYSTEM CONTEXT]
Language: ${lang === 'id' ? 'Indonesian' : 'English'}
Intent Detected: ${intent}
Dominant Asset: ${context.dominantAsset || 'None'}
Dominant Weight: ${context.dominantWeight ? `${context.dominantWeight.toFixed(1)}%` : 'None'}
Concentration Level: ${context.concentrationLevel}
Market Volatility: ${context.volatility}
Macro Pressure: ${context.macroPressure}
Stance: ${context.stance}
Data Trust Level: ${context.trustLevel} (${trustNote})

[SYSTEM REASONING]
Trade-off to consider: ${reasoning.tradeOff}
Thinking Direction: ${reasoning.direction}

[USER MESSAGE]
"${message}"

[INSTRUCTIONS]
1. Strict topical relevance: The response MUST stay on the topic the user asked about.
2. If the user asks about IHSG, saham gorengan, saham Indonesia, or market Indonesia, DO NOT mention BTC, Gold (XAU), or USD unless the user explicitly asks for those or they are in the active context. Never switch asset classes without clear user intent.
3. Ambiguity handling: If the question is ambiguous, do not hallucinate a template answer. Instead, interpret carefully using recent context, or answer with a scoped assumption (e.g., "Kalau yang kamu maksud saham gorengan di pasar Indonesia, ...").
4. If intent is follow-up-question, treat this as a continuation of the previous turn's topic. Do not restart a different topic.
5. NO-SIGNAL POLICY (CRITICAL): NEVER give explicit buy, sell, hold, entry, or exit instructions. NEVER promise profits. Guide HOW to think, DO NOT tell them WHAT to do.
6. 4-LAYER ARCHITECTURE (CRITICAL): You MUST structure your response into exactly these 4 logical layers, blended naturally into 1-2 paragraphs (NO JSON, NO markdown, NO bullets, NO labels like "Acknowledge:"):
   - ACKNOWLEDGE: Validate the user's intent or question directly.
   - CONTEXT: Situate the current market condition or portfolio reality.
   - INSIGHT: Provide the reality and trade-off, qualified by the data trust level. Explain cause -> effect reasoning.
   - REFLECTION: End with a thinking direction on what to monitor or consider next.
7. Avoid defensive language. Do not say "I don't have live context", "I am not sure", or "data is unavailable"; use "belum terlihat sinyal kuat" atau "arahnya masih belum konsisten" instead.
  `
}
