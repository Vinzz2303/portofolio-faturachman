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
5. Answer the user's exact question first. If they ask "apa emas safe haven?", start with the safe-haven answer, not with portfolio context.
6. Then connect it to the user's portfolio concentration and dominant asset naturally, ONLY if portfolio data is available. If portfolio data is empty/None, operate in general mode and make no portfolio-specific claims.
7. Add cause -> effect reasoning: explain what could happen to the asset/market and why it matters for this portfolio.
8. Include a clear natural stance without labels, for example "cukup sensitif terhadap tekanan", "relatif mendukung", or "belum ada arah yang konsisten".
9. In copilot mode, include one mandatory trade-off sentence. In chat mode, keep the trade-off shorter.
10. Avoid defensive language. Do not say "I don't have live context", "I am not sure", or "data is unavailable"; use "belum terlihat sinyal kuat" atau "arahnya masih belum konsisten" instead.
11. Keep copilot output to 3-4 sentences. No JSON, markdown, bullets, or labels.
12. Guide how to think, DO NOT tell them what to buy or sell.
  `
}
