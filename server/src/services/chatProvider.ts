import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getInsiderTradingDeclaration, getInsiderTrading } from './openbbAgentTools'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface InsightContext {
  quickInsight?: string
  reality?: string
  tradeoff?: string
  direction?: string
  portfolioSummary?: string
}

export interface ChatProviderResult {
  reply: string
  provider: 'gemini' | 'groq' | 'local'
  fallbackUsed: boolean
}

const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 30000)
const GROQ_TIMEOUT_MS = Number(process.env.GROQ_TIMEOUT_MS || 12000)

const SAFE_MESSAGE: Record<'id' | 'en', string> = {
  id: 'Respons lagi butuh waktu sedikit lebih lama. Coba ulangi ya.',
  en: 'Response is taking longer than usual. Try again.'
}

export function buildInsightAwareChatPrompt(
  basePrompt: string,
  insight?: InsightContext,
  lang: 'id' | 'en' = 'id'
): string {
  if (!insight) return basePrompt

  const lines: string[] = [basePrompt, '']

  if (insight.portfolioSummary) {
    lines.push(
      lang === 'id'
        ? `KONTEKS PORTOFOLIO PENGGUNA:\n${insight.portfolioSummary}`
        : `USER PORTFOLIO CONTEXT:\n${insight.portfolioSummary}`
    )
    lines.push('')
  }

  if (insight.quickInsight || insight.reality || insight.tradeoff || insight.direction) {
    lines.push(
      lang === 'id'
        ? 'INSIGHT ENGINE OUTPUT (gunakan sebagai dasar refleksi, bukan sebagai sinyal):'
        : 'INSIGHT ENGINE OUTPUT (use as a basis for reflection, not as a signal):'
    )

    if (insight.quickInsight) {
      lines.push(lang === 'id' ? `Ringkasan singkat: ${insight.quickInsight}` : `Quick summary: ${insight.quickInsight}`)
    }

    if (insight.reality) {
      lines.push(lang === 'id' ? `Realita: ${insight.reality}` : `Reality: ${insight.reality}`)
    }

    if (insight.tradeoff) {
      lines.push(lang === 'id' ? `Trade-off tersembunyi: ${insight.tradeoff}` : `Hidden trade-off: ${insight.tradeoff}`)
    }

    if (insight.direction) {
      lines.push(lang === 'id' ? `Arah berpikir: ${insight.direction}` : `Thinking direction: ${insight.direction}`)
    }

    lines.push('')
    lines.push(
      lang === 'id'
        ? 'Gunakan insight di atas HANYA sebagai konteks latar belakang. Jika pengguna bertanya tentang aset atau topik spesifik (misal: "data apple", "bagaimana dengan saham tsla", dll), JAWAB LANGSUNG menggunakan tool yang tersedia atau pengetahuanmu, dan JANGAN MEMAKSAKAN untuk mengaitkannya kembali dengan portofolio mereka kecuali jika benar-benar relevan dengan pertanyaannya.'
        : "Use the insight above ONLY as background context. If the user asks about a specific asset or topic (e.g., 'data apple', 'how about tsla stock', etc), ANSWER DIRECTLY using available tools or your knowledge, and DO NOT force a connection back to their portfolio unless it is highly relevant to their question."
    )
  }

  return lines.join('\n')
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let handle: ReturnType<typeof setTimeout> | null = null
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        handle = setTimeout(() => reject(new Error(`[chat] ${label} timeout after ${timeoutMs}ms`)), timeoutMs)
      })
    ])
  } finally {
    if (handle) clearTimeout(handle)
  }
}

async function callGeminiChat(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.log('[CHAT_PROVIDER] gemini skipped: GEMINI_API_KEY missing')
    return null
  }

  const systemParts = messages
    .filter((message) => message.role === 'system')
    .map((message) => message.content)
    .join('\n\n')

  const conversationMessages = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: message.content }]
    }))
    .reduce((acc, current) => {
      const last = acc[acc.length - 1]
      if (last && last.role === current.role) {
        last.parts[0].text += `\n${current.parts[0].text}`
        return acc
      }
      acc.push(current)
      return acc
    }, [] as Array<{ role: 'user' | 'model'; parts: { text: string }[] }>)

  const lastUserIdx = conversationMessages.map((message) => message.role).lastIndexOf('user')
  if (lastUserIdx === -1) return null

  const prompt = conversationMessages[lastUserIdx]
  const history = conversationMessages
    .slice(0, lastUserIdx)
    .filter((message, index, list) => !(index === 0 && message.role === 'model') && !(index === list.length - 1 && message.role === 'user'))

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: systemParts || undefined,
    tools: [
      {
        functionDeclarations: [getInsiderTradingDeclaration]
      }
    ]
  })

  const chat = model.startChat({ history })
  let result = await chat.sendMessage(prompt.parts)
  
  // Handle function calls
  const functionCalls = result.response.functionCalls()
  if (functionCalls && functionCalls.length > 0) {
    const call = functionCalls[0]
    if (call.name === 'getInsiderTrading') {
      const args = call.args as { symbol: string }
      console.log('[AGENT] Calling getInsiderTrading for', args.symbol)
      const data = await getInsiderTrading(args.symbol)
      
      // Send the tool response back to the model
      result = await chat.sendMessage([{
        functionResponse: {
          name: 'getInsiderTrading',
          response: { data }
        }
      }])
    }
  }

  const text = result.response.text().trim()
  return text || null
}

async function callGroqChat(messages: ChatMessage[]): Promise<string | null> {
  const url = process.env.GROQ_API_URL
  const apiKey = process.env.GROQ_API_KEY
  const model = process.env.GROQ_MODEL
  if (!url || !apiKey || !model) {
    console.log('[CHAT_PROVIDER] groq skipped: env vars missing')
    return null
  }

  const response = await axios.post(
    url,
    {
      model,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content
      })),
      temperature: 0.35
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: GROQ_TIMEOUT_MS + 1000
    }
  )

  const content = response.data?.choices?.[0]?.message?.content?.trim()
  return (content as string | undefined) || null
}

export async function sendChatWithFallback(
  messages: ChatMessage[],
  lang: 'id' | 'en' = 'id'
): Promise<ChatProviderResult> {
  try {
    const reply = await withTimeout(callGeminiChat(messages), GEMINI_TIMEOUT_MS, 'gemini')
    if (reply) {
      console.log('[CHAT_PROVIDER] provider=gemini success')
      return { reply, provider: 'gemini', fallbackUsed: false }
    }
  } catch (error) {
    console.log('[CHAT_PROVIDER] gemini failed:', error instanceof Error ? error.message : String(error))
  }

  try {
    const reply = await withTimeout(callGroqChat(messages), GROQ_TIMEOUT_MS, 'groq')
    if (reply) {
      console.log('[CHAT_PROVIDER] provider=groq fallback success')
      return { reply, provider: 'groq', fallbackUsed: true }
    }
  } catch (error) {
    console.log('[CHAT_PROVIDER] groq failed:', error instanceof Error ? error.message : String(error))
  }

  console.log('[CHAT_PROVIDER] provider=local both providers failed')
  return {
    reply: SAFE_MESSAGE[lang],
    provider: 'local',
    fallbackUsed: true
  }
}
