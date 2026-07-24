import React, { useEffect, useMemo, useRef, useState } from 'react'
import type {
  AiMessage,
  InvestmentMeta,
  SectionProps,
  PortfolioSummaryResponse,
  AskTingAiStructuredResponse,
  AiProviderStatus
} from '../types'
import { API_URL } from '../utils/api'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import { type LanguageCode } from '../utils/language'
import { formatDecisionJournalForCopilot, readDecisionJournal } from '../utils/decisionJournal'

const DATA_PROMPT =
  'You are Ting AI v1.8.1, a portfolio-aware risk copilot for retail traders. ' +
  'Reply in the same language the user uses. If the user language is unclear or mixed, default to English. ' +
  'Do not act like a signal bot, do not give absolute buy or sell commands, do not claim to know the future, and do not replace the user decision. ' +
  'If the user asks about general market context, answer the market context first. Only connect it to portfolio impact if the user explicitly asks about portfolio impact, exposure, holdings, concentration, or next actions for the portfolio. ' +
  'If the user asks about portfolio impact or a portfolio holding, use the available portfolio context directly and specifically. ' +
  'CRITICAL RULES: ' +
  '1. If user asks about a ticker that is NOT in the portfolio, reply exactly (in Indonesian if applicable): "[TICKER] belum ada di portofoliomu. Aku bisa membaca konteks umum, tapi dampaknya ke portofolio belum bisa dihitung." ' +
  '2. If user asks about a ticker that EXISTS in the portfolio, you MUST use its quantity, entry price, latest price, PnL, weight, and data status. ' +
  '3. If data status is estimation/delayed, mention it calmly: "Catatan: data harga yang dipakai mungkin tertunda/berbasis estimasi." ' +
  '4. NEVER mention unrelated stale assets or mock data (e.g. AAPL). Focus strictly on the provided portfolio data. ' +
  'Keep the answer short, scan-friendly, and practical. Use short label-style lines in plain text only. ' +
  'When relevant, structure the answer around: Situasi, Dampak ke portofolio, Masuk sekarang vs menunggu, Opsi yang bisa dipertimbangkan, Evidence, Confidence, and Decision stays with the user. ' +
  'Use natural Indonesian when the user writes in Indonesian. Prefer phrases like "berpotensi", "dalam kondisi ini", and "yang bisa dipertimbangkan". ' +
  'Avoid phrases like "pasti naik", "harus beli", "akan profit", or other overconfident language. ' +
  'Do not write generic chat, long explanations, markdown, bold, italics, or asterisks. Plain text only.'

const buildChatPrompt = ({
  pageContext,
  userPlan,
  hasProfitLossData
}: {
  pageContext: 'general' | 'portfolio'
  userPlan: 'free' | 'pro'
  hasProfitLossData: boolean
}) => {
  if (pageContext !== 'portfolio') return DATA_PROMPT

  const mode = userPlan === 'pro' ? 'Pro Copilot' : 'Basic Insight'
  const pnlRule = hasProfitLossData
    ? 'Profit/loss data is available; use it only when directly relevant and keep it secondary to portfolio structure. '
    : 'CRITICAL: Profit/loss data is NOT available. Never claim the user is profitable, losing money, in gain, in loss, untung, rugi, profit, loss, keuntungan, or kerugian. Read only allocation, porsi, bobot, exposure, concentration, sensitivity, market impact, and monitoring points. Say: "Input ini membaca porsi portofolio, bukan profit/loss. Jadi Ting AI belum menghitung untung/rugi pribadi." only if clarification is needed. '

  return (
    'You are Ting AI Portfolio Copilot inside the Portfolio Workspace. ' +
    `Mode: ${mode}. ` +
    'Reply in the same language the user uses. If unclear, default to Indonesian. ' +
    'Focus on portfolio composition, allocation weight, concentration risk, market sensitivity, and monitoring points. ' +
    'Do not give buy/sell instructions, price predictions, or profit promises. ' +
    pnlRule +
    'For Pro users, be more specific and connect asset weights, concentration, and market context. ' +
    'For Free users, give a useful basic summary and keep deeper analysis reserved for Pro. ' +
    'Keep answers short, calm, scan-friendly, and practical. Plain text only.'
  )
}

type AiProvider = 'gemini'

type AiChatProps = Partial<SectionProps> & {
  summary?: string
  meta?: InvestmentMeta | null
  portfolio?: PortfolioSummaryResponse | null
  userPlan?: 'free' | 'pro'
  userEmail?: string
  language?: LanguageCode
  variant?: 'section' | 'panel'
  pageContext?: 'general' | 'portfolio'
  hasProfitLossData?: boolean
  disabled?: boolean
  analysisStatus?: {
    label: string
    detail: string
  } | null
  // Insight Engine v1 — injected into chat context
  insightContext?: {
    quickInsight?: string
    reality?: string
    tradeoff?: string
    direction?: string
    portfolioSummary?: string
  } | null
}

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  reply?: string
  structured?: AskTingAiStructuredResponse
  providerStatus?: AiProviderStatus
}

const nextStepPrompts: Record<
  AskTingAiStructuredResponse['suggested_next_step'],
  Record<LanguageCode, string>
> = {
  monitor: {
    en: 'What should I monitor from this condition?',
    id: 'Apa yang harus saya pantau dari kondisi ini?'
  },
  wait: {
    en: 'What should improve before I act?',
    id: 'Apa yang perlu membaik sebelum saya bertindak?'
  },
  rebalance: {
    en: 'What part of this portfolio should I rebalance first?',
    id: 'Bagian mana dari portofolio ini yang perlu saya rebalance dulu?'
  },
  reduce_exposure: {
    en: 'Which exposure looks too risky right now?',
    id: 'Eksposur mana yang terlihat terlalu berisiko saat ini?'
  }
}

function isStructuredResponse(value: unknown): value is AskTingAiStructuredResponse {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<AskTingAiStructuredResponse>
  return (
    typeof candidate.direct_answer === 'string' &&
    Array.isArray(candidate.why_it_matters) &&
    candidate.why_it_matters.every((item) => typeof item === 'string') &&
    typeof candidate.risk_note === 'string' &&
    typeof candidate.suggested_next_step === 'string'
  )
}

function parseStructuredResponse(rawValue: unknown): AskTingAiStructuredResponse | undefined {
  if (isStructuredResponse(rawValue)) {
    return rawValue
  }

  if (typeof rawValue !== 'string') {
    return undefined
  }

  try {
    const parsed = JSON.parse(rawValue)
    return isStructuredResponse(parsed) ? parsed : undefined
  } catch {
    return undefined
  }
}

const allocationOnlyDisclaimer: Record<LanguageCode, string> = {
  id: 'Input ini membaca porsi portofolio, bukan profit/loss. Jadi Ting AI belum menghitung untung/rugi pribadi.',
  en: 'This input reads portfolio allocation, not profit/loss. Ting AI has not calculated your personal gain or loss yet.'
}

const forbiddenPnlPattern =
  /\b(keuntungan|kerugian|profit|loss|gain|rugi|untung|profitable|losing money|in profit|in loss)\b/i

const sanitizeAllocationOnlyText = (text: string, language: LanguageCode) => {
  if (!text || !forbiddenPnlPattern.test(text)) return text

  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence && !forbiddenPnlPattern.test(sentence))

  const safeText = sentences.join(' ').trim()
  return safeText
    ? `${safeText}\n\n${allocationOnlyDisclaimer[language]}`
    : allocationOnlyDisclaimer[language]
}

const sanitizeAllocationOnlyStructured = (
  structured: AskTingAiStructuredResponse | undefined,
  language: LanguageCode
) => {
  if (!structured) return structured

  return {
    ...structured,
    direct_answer: sanitizeAllocationOnlyText(structured.direct_answer, language),
    why_it_matters: structured.why_it_matters.map((item) => sanitizeAllocationOnlyText(item, language)),
    risk_note: sanitizeAllocationOnlyText(structured.risk_note, language)
  }
}

const getDefaultMessages = (
  language: LanguageCode,
  pageContext: 'general' | 'portfolio',
  userPlan: 'free' | 'pro'
): AiMessage[] => {
  if (pageContext === 'portfolio') {
    if (language === 'en') {
      return [{
        role: 'assistant',
        content: userPlan === 'pro'
          ? 'Ting AI Portfolio Copilot is active. I can read allocation, concentration, market sensitivity, and monitoring points from your portfolio.'
          : 'I can summarize your portfolio composition and basic risk. Deeper portfolio reasoning is available in Ting AI Pro.'
      }]
    }

    return [{
      role: 'assistant',
      content: userPlan === 'pro'
        ? 'Ting AI Portfolio Copilot aktif. Saya bisa membaca porsi aset, konsentrasi risiko, sensitivitas market, dan hal yang perlu dipantau.'
        : 'Saya bisa merangkum komposisi dan risiko dasar portofolio kamu. Analisis yang lebih dalam tersedia di Ting AI Pro.'
    }]
  }

  return language === 'id'
    ? [{
        role: 'assistant',
        content:
          'Ting AI membantu membaca konteks pasar, dampaknya ke portofolio, dan risiko yang perlu diperhatikan. Keputusan akhir tetap di tangan Anda.'
      }]
    : [{
        role: 'assistant',
        content:
          'Welcome to Ting AI. I can help frame market context, portfolio impact, the trade-off between entering now versus waiting, and a few options to consider. The final decision stays with you.'
      }]
}

const getLoadingLabel = (text: string, isDataChat: boolean, language: LanguageCode) => {
  const normalized = text.toLowerCase()

  if (
    normalized.includes('portfolio') ||
    normalized.includes('portofolio') ||
    normalized.includes('holding') ||
    normalized.includes('exposure') ||
    normalized.includes('concentration')
  ) {
    return language === 'en' ? 'Analyzing exposure...' : 'Menganalisis eksposur...'
  }

  if (
    normalized.includes('us10y') ||
    normalized.includes('uup') ||
    normalized.includes('macro') ||
    normalized.includes('yield') ||
    normalized.includes('stress') ||
    normalized.includes('risk tone')
  ) {
    return language === 'en' ? 'Checking macro context...' : 'Memeriksa konteks makro...'
  }

  if (
    normalized.includes('gold') ||
    normalized.includes('emas') ||
    normalized.includes('xau') ||
    normalized.includes('btc') ||
    normalized.includes('bitcoin') ||
    normalized.includes('sp500') ||
    normalized.includes('s&p') ||
    normalized.includes('ihsg') ||
    normalized.includes('idx') ||
    normalized.includes('jci')
  ) {
    return language === 'en' ? 'Reviewing asset context...' : 'Meninjau konteks aset...'
  }

  if (isDataChat) {
    return language === 'en' ? 'Reading portfolio context...' : 'Ting AI sedang membaca konteks portofolio...'
  }

  return language === 'en' ? 'Composing answer...' : 'Menyusun jawaban...'
}

const renderMessageContent = (content?: string) => {
  const safeContent = typeof content === 'string' && content.trim() ? content : ''
  return <span style={{ whiteSpace: 'pre-line' }}>{safeContent}</span>
}

const renderStructuredResponse = (
  structured: AskTingAiStructuredResponse,
  language: LanguageCode,
  onStepClick: (step: AskTingAiStructuredResponse['suggested_next_step']) => void
) => {
  const getNextStepLabel = (step: string, isEnglish: boolean) => {
    const labels: Record<string, Record<string, string>> = {
      monitor: { en: 'Monitor', id: 'Pantau' },
      wait: { en: 'Wait', id: 'Tunggu' },
      rebalance: { en: 'Rebalance', id: 'Rebalance' },
      reduce_exposure: { en: 'Reduce Exposure', id: 'Kurangi Eksposur' }
    }
    return labels[step]?.[isEnglish ? 'en' : 'id'] || step
  }

  const isEnglish = language === 'en'

  return (
    <div className="ask-ting-ai-response-card">
      <div className="response-section direct-answer">
        <p>{structured.direct_answer}</p>
      </div>

      <div className="response-section why-matters">
        <div className="section-label">{isEnglish ? 'Why it matters' : 'Kenapa penting'}</div>
        <ul className="reasons-list">
          {structured.why_it_matters.map((reason, idx) => (
            <li key={idx}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className="response-section risk-note">
        <div className="section-label">{isEnglish ? 'Risk note' : 'Catatan risiko'}</div>
        <p>{structured.risk_note}</p>
      </div>

      <div className="response-section suggested-step">
        <div className="section-label">{isEnglish ? 'Suggested action' : 'Langkah yang bisa dipertimbangkan'}</div>
        <button
          type="button"
          className="step-badge"
          onClick={() => onStepClick(structured.suggested_next_step)}
        >
          {getNextStepLabel(structured.suggested_next_step, isEnglish)}
        </button>
      </div>
    </div>
  )
}

export default function AiChat({
  sectionId,
  summary,
  meta,
  portfolio,
  userPlan = 'free',
  userEmail,
  language = 'id',
  variant = 'section',
  pageContext = 'general',
  hasProfitLossData = true,
  disabled = false,
  analysisStatus = null,
  insightContext = null
}: AiChatProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<AiMessage[]>(() =>
    getDefaultMessages(language, pageContext, userPlan)
  )
  const [providerStatus, setProviderStatus] = useState<AiProviderStatus | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)

  const isDataChat = Boolean(summary || meta || portfolio)
  const isEnglish = language === 'en'
  const activeProvider: AiProvider = 'gemini'
  const isPortfolioPage = pageContext === 'portfolio'
  const isPro = userPlan === 'pro'

  useEffect(() => {
    setMessages(getDefaultMessages(language, pageContext, userPlan))
  }, [language, pageContext, userPlan])

  useEffect(() => {
    if (!messagesRef.current) return
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, loading])

  const loadingLabel = useMemo(() => {
    const latestUserMessage =
      [...messages].reverse().find((message) => message.role === 'user')?.content || input
    return getLoadingLabel(latestUserMessage, isDataChat, language)
  }, [input, isDataChat, language, messages])

  const guidanceCards = useMemo(
    () => isPortfolioPage
      ? [
          {
            title: isEnglish ? 'Concentration' : 'Konsentrasi',
            body: isEnglish
              ? 'Which asset dominates this portfolio?'
              : 'Aset mana yang paling dominan?'
          },
          {
            title: isEnglish ? 'Sensitivity' : 'Sensitivitas',
            body: isEnglish
              ? 'Which part is most sensitive if the market weakens?'
              : 'Kalau market melemah, bagian mana yang paling sensitif?'
          },
          {
            title: isEnglish ? 'Monitoring' : 'Pantauan',
            body: isEnglish
              ? 'What should I monitor today?'
              : 'Apa yang perlu saya pantau hari ini?'
          }
        ]
      : [
      {
        title: isEnglish ? 'Market context' : 'Market hari ini',
        body: isEnglish
          ? 'Ask what is changing in the market right now and why it matters.'
          : 'Apa yang sedang berubah di pasar hari ini?'
      },
      {
        title: isEnglish ? 'Portfolio impact' : 'Efek ke posisi kamu',
        body: isEnglish
          ? 'Check how current conditions may affect your exposure and concentration.'
          : 'Bagaimana kondisi ini memengaruhi portofolioku?'
      },
      {
        title: isEnglish ? 'Trade-off' : 'Yang perlu kamu pikirkan',
        body: isEnglish
          ? 'Ask about entering now versus waiting and what options are worth considering.'
          : 'Apa yang perlu saya pantau sebelum mengambil keputusan?'
      }
    ],
    [isEnglish, isPortfolioPage]
  )

  const beginnerPrompts = useMemo(
    () => {
      if (isPortfolioPage && isPro) {
        return isEnglish
          ? [
              'What is my portfolio\'s biggest risk?',
              'Which asset is most dominant?',
              'If the market weakens, which part is most sensitive?',
              'What should I monitor today?',
              'What is the biggest trade-off in this composition?',
              'How should I read the concentration risk?'
            ]
          : [
              'Apa risiko terbesar portofolio saya?',
              'Aset mana yang paling dominan?',
              'Kalau market melemah, bagian mana yang paling sensitif?',
              'Apa yang perlu saya pantau hari ini?',
              'Apa trade-off terbesar dari komposisi ini?',
              'Bagaimana cara membaca risiko konsentrasinya?'
            ]
      }

      if (isPortfolioPage) {
        return isEnglish
          ? [
              'What is the main risk in this portfolio?',
              'Which asset has the largest allocation?',
              'What should I monitor?',
              'Does today\'s market affect the portfolio?'
            ]
          : [
              'Risiko utama portofolio ini apa?',
              'Aset mana yang paling besar porsinya?',
              'Apa yang perlu saya pantau?',
              'Market hari ini ngaruh ke portofolio nggak?'
            ]
      }

      return isEnglish
      ? [
          'Is my portfolio safe?',
          'What is my biggest risk today?',
          'Does today\'s market affect my assets?',
          'Where should I be careful?',
          'Why does my position feel heavy?',
          'What should I monitor first?'
        ]
      : [
          'Portofolio saya aman nggak?',
          'Risiko terbesar saya hari ini apa?',
          'Market hari ini ngaruh ke aset saya nggak?',
          'Saya harus waspada di bagian mana?',
          'Kenapa posisi saya terasa berat?',
          'Apa yang perlu saya pantau dulu?'
        ]
    },
    [isEnglish, isPortfolioPage, isPro]
  )

  const handleQuickPrompt = (prompt: string) => {
    if (disabled || loading) return
    setInput(prompt)
  }

  const handleNewChat = () => {
    if (loading) return
    setMessages(getDefaultMessages(language, pageContext, userPlan))
    setInput('')
    setError('')
    setProviderStatus(null)
  }

  const copy = useMemo(() => {
    if (isPortfolioPage) {
      if (isEnglish) {
        return isPro
          ? {
              kicker: 'Portfolio Copilot',
              title: 'Ting AI Portfolio Copilot',
              subtitle:
                'Copilot active. Ting AI reads portfolio composition, concentration risk, and market context to help you think more clearly.',
              highlights: ['Portfolio-aware Copilot', 'Concentration', 'Market sensitivity'],
              panelTitle: 'Ting AI Portfolio Copilot',
              panelSub:
                'Copilot active. Ting AI reads portfolio composition, concentration risk, and market context to help you think more clearly.',
              reset: 'Reset',
              suggestedPrompts: 'Portfolio prompts',
              howToUse: 'How to use',
              howToUseText: 'Ask about composition, concentration, sensitivity, and monitoring',
              scope: 'Scope',
              scopeText: 'Portfolio composition + concentration risk + market impact',
              inputPlaceholder:
                'Ask about portfolio risk, dominant assets, sensitivity, or monitoring points...',
              send: 'Send',
              retry: 'Retry',
              dataPrompts: []
            }
          : {
              kicker: 'Portfolio Insight',
              title: 'Portfolio Summary',
              subtitle:
                'Ting AI helps read composition and basic portfolio risk. For deeper analysis, use Ting AI Pro.',
              highlights: ['Basic Insight', 'Allocation', 'Risk summary'],
              panelTitle: 'Portfolio Summary',
              panelSub:
                'Ting AI helps read composition and basic portfolio risk. For deeper analysis, use Ting AI Pro.',
              reset: 'Reset',
              suggestedPrompts: 'Suggested prompts',
              howToUse: 'How to use',
              howToUseText: 'Ask about allocation, largest position, and monitoring basics',
              scope: 'Scope',
              scopeText: 'Basic portfolio composition and risk summary',
              inputPlaceholder:
                'Ask about portfolio composition, basic risk, or what to monitor...',
              send: 'Send',
              retry: 'Retry',
              dataPrompts: []
            }
      }

      return isPro
        ? {
            kicker: 'Portfolio Copilot',
            title: 'Ting AI Portfolio Copilot',
            subtitle:
              'Copilot aktif. Ting AI membaca komposisi portofolio, risiko konsentrasi, dan konteks market untuk membantu kamu berpikir lebih jernih.',
            highlights: ['Portfolio-aware Copilot', 'Konsentrasi', 'Sensitivitas market'],
            panelTitle: 'Ting AI Portfolio Copilot',
            panelSub:
              'Copilot aktif. Ting AI membaca komposisi portofolio, risiko konsentrasi, dan konteks market untuk membantu kamu berpikir lebih jernih.',
            reset: 'Mulai Ulang',
            suggestedPrompts: 'Pertanyaan portofolio',
            howToUse: 'Cara pakai',
            howToUseText: 'Tanya komposisi, konsentrasi, sensitivitas, dan hal yang perlu dipantau',
            scope: 'Ting AI bisa bantu apa di sini',
            scopeText: 'Komposisi portofolio + risiko konsentrasi + dampak market',
            inputPlaceholder:
              'Tanyakan risiko portofolio, aset dominan, sensitivitas, atau hal yang perlu dipantau...',
            send: 'Kirim',
            retry: 'Coba lagi',
            dataPrompts: []
          }
        : {
            kicker: 'Portfolio Insight',
            title: 'Ringkasan Portfolio',
            subtitle:
              'Ting AI membantu membaca komposisi dan risiko dasar portofolio. Untuk analisis yang lebih dalam, gunakan Ting AI Pro.',
            highlights: ['Basic Insight', 'Alokasi', 'Ringkasan risiko'],
            panelTitle: 'Ringkasan Portfolio',
            panelSub:
              'Ting AI membantu membaca komposisi dan risiko dasar portofolio. Untuk analisis yang lebih dalam, gunakan Ting AI Pro.',
            reset: 'Mulai Ulang',
            suggestedPrompts: 'Saran pertanyaan',
            howToUse: 'Cara pakai',
            howToUseText: 'Tanya alokasi, posisi terbesar, dan pantauan dasar',
            scope: 'Ting AI bisa bantu apa di sini',
            scopeText: 'Komposisi dan ringkasan risiko dasar portofolio',
            inputPlaceholder:
              'Tanyakan komposisi portofolio, risiko dasar, atau hal yang perlu dipantau...',
            send: 'Kirim',
            retry: 'Coba lagi',
            dataPrompts: []
          }
    }

    if (isEnglish) {
      return {
        kicker: 'Reasoning Surface',
        title: 'Ting AI Briefing Desk',
        subtitle:
          'Ask for context, portfolio impact, trade-offs, and options. Short, direct, and tied to your actual exposure.',
        highlights: ['Risk-first', 'Portfolio-aware', 'Honest confidence'],
        panelTitle: 'Briefing Desk',
        panelSub: 'Read the brief, then ask what it may mean for risk, timing, and exposure.',
        reset: 'Reset',
        suggestedPrompts: 'Suggested prompts',
        howToUse: 'How to use',
        howToUseText: 'Ask for context, impact, trade-off, then options',
        scope: 'Scope',
        scopeText: 'Market context + portfolio risk framing',
        inputPlaceholder:
          'Ask about market context, portfolio impact, entry trade-offs, or options to consider...',
        send: 'Send',
        retry: 'Retry',
        dataPrompts: [
          'What is the current market context and how could it affect my portfolio?',
          'If I enter now versus wait, what trade-offs should I consider?',
          'What options make the most sense to consider in this condition?'
        ]
      }
    }

    return {
      kicker: 'Ting AI',
      title: 'Tanyakan ke Ting AI',
      subtitle:
        'Tanyakan konteks pasar, dampaknya ke portofolio, atau langkah yang perlu dipertimbangkan.',
      highlights: ['Fokus pada risiko', 'Memahami portofolio', 'Keyakinan yang jujur'],
      panelTitle: 'Tanyakan ke Ting AI',
      panelSub: 'Tanyakan konteks pasar, dampaknya ke portofolio, atau langkah yang perlu dipertimbangkan.',
      reset: 'Mulai Ulang',
      suggestedPrompts: 'Saran pertanyaan',
      howToUse: 'Cara pakai',
      howToUseText: 'Tanya konteks, dampak, pertimbangan, lalu opsi',
      scope: 'Ting AI bisa bantu apa di sini',
      scopeText: 'Market hari ini dan efeknya ke portofolio kamu',
      inputPlaceholder:
        'Tanyakan kondisi pasar, risiko, atau dampaknya ke portofoliomu...',
      send: 'Kirim',
      retry: 'Coba lagi',
      dataPrompts: [
        'Apa konteks pasar saat ini dan bagaimana dampaknya ke portofolio saya?',
        'Kalau saya masuk sekarang atau menunggu, pertimbangan utamanya apa?',
        'Dalam kondisi ini, opsi apa saja yang layak saya pertimbangkan?'
      ]
    }
  }, [isEnglish, isPortfolioPage, isPro])

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading || disabled) return

    setError('')
    if (!overrideText) {
      setInput('')
    }

    const userMessage: AiMessage = { role: 'user', content: text }
    const localMessages = [...messages, userMessage]
    const payloadMessages: AiMessage[] = [
      { role: 'system', content: buildChatPrompt({ pageContext, userPlan, hasProfitLossData }) },
      ...localMessages
    ]

    setMessages(localMessages)
    setLoading(true)

    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] AI Chat Request', {
        portfolio: portfolio?.holdings,
        query: text
      })
    }

    try {
      const url = `${API_URL}/api/ai-chat`
      const body: Record<string, unknown> = {
        messages: payloadMessages,
        summary,
        meta: { ...(meta || {}), mode: 'chat' },
        portfolio,
        provider: activeProvider,
        mode: 'chat',
        pageContext,
        userPlan,
        hasPortfolio: Boolean(portfolio?.holdings?.length),
        hasProfitLossData
      }
      // Inject Insight Engine v1 context when available
      const decisionJournalContext = pageContext === 'portfolio'
        ? formatDecisionJournalForCopilot(readDecisionJournal(), language, userPlan === 'pro' ? 5 : 2)
        : ''
      if ((insightContext && (insightContext.quickInsight || insightContext.reality)) || decisionJournalContext) {
        body.insightContext = {
          ...(insightContext || {}),
          portfolioSummary: [
            insightContext?.portfolioSummary,
            decisionJournalContext,
          ].filter(Boolean).join(' | '),
        }
      }

      const res = await fetchWithSession(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        throw new Error(await readResponseError(res, 'Request failed'))
      }

      const data = (await res.json()) as GroqResponse
      const reply = data.reply || data.choices?.[0]?.message?.content || ''
      const rawStructured = parseStructuredResponse(data.structured) || parseStructuredResponse(reply)
      const structured = hasProfitLossData
        ? rawStructured
        : sanitizeAllocationOnlyStructured(rawStructured, language)
      const fallbackReply = typeof reply === 'string'
        ? (hasProfitLossData ? reply.trim() : sanitizeAllocationOnlyText(reply.trim(), language))
        : ''

      if (!structured && !fallbackReply) {
        throw new Error('No reply from AI')
      }

      const assistantMessage: AiMessage = {
        role: 'assistant',
        content: fallbackReply,
        structured
      }

      const nextMessages: AiMessage[] = [...localMessages, assistantMessage]
      setMessages(nextMessages)
    } catch (err) {
      // Never show raw errors — always show calm safe message
      const safeMessage = isEnglish
        ? 'Response is taking longer than usual. Try again.'
        : 'Respons lagi butuh waktu sedikit lebih lama. Coba ulangi ya.'
      setError(safeMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    void sendMessage()
  }

  const handleStepAction = (step: AskTingAiStructuredResponse['suggested_next_step']) => {
    const prompt = nextStepPrompts[step]?.[language] || nextStepPrompts.monitor[language]
    void sendMessage(prompt)
  }

  const content = (
    <>
      {variant === 'section' && (
        <>
          <div className="ai-kicker">{copy.kicker}</div>
          <h2>{copy.title}</h2>
          <p className="ai-sub">{copy.subtitle}</p>
          <div className="ai-highlights" aria-label="Ting AI highlights">
            {copy.highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </>
      )}

      <div className={`ai-box ${variant === 'panel' ? 'ai-box-panel' : 'ai-box-section'}`}>
        {variant === 'panel' && (
          <div className="ai-panel-head">
            <div>
              <h3>{copy.panelTitle}</h3>
              <p className="ai-panel-sub">{copy.panelSub}</p>
              {analysisStatus ? (
                <div className="ai-analysis-status" aria-label="Analysis status">
                  <span className="ai-analysis-status-badge">{analysisStatus.label}</span>
                  <p className="ai-analysis-status-detail">{analysisStatus.detail}</p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="ai-new-chat"
              onClick={handleNewChat}
              disabled={disabled || loading}
            >
              {copy.reset}
            </button>
          </div>
        )}

        <div ref={messagesRef} className="ai-messages">
          {messages.length ? (
            messages.map((message, index) => {
              const normalizedContent =
                typeof message.content === 'string' ? message.content : ''
              const structured = parseStructuredResponse(message.structured)

              return (
                <div key={`${message.role}-${index}`} className={`ai-msg ${message.role}`}>
                  {structured ? (
                    renderStructuredResponse(structured, language, handleStepAction)
                  ) : normalizedContent.trim() ? (
                    <span className="ai-msg-content">{renderMessageContent(normalizedContent)}</span>
                  ) : (
                    <span className="ai-msg-content">
                      {isEnglish ? 'No response content available yet.' : 'Belum ada isi jawaban yang tersedia.'}
                    </span>
                  )}
                </div>
              )
            })
          ) : (
            <div className="ai-msg assistant">
              <span className="ai-msg-content">
                {isEnglish
                  ? 'Ask about market context, portfolio impact, or timing trade-offs to start.'
                  : 'Tanyakan konteks pasar, dampak portofolio, atau trade-off timing untuk mulai.'}
              </span>
            </div>
          )}
        </div>

        <div className="ai-guidance">
          <span className="ai-history-label">{copy.suggestedPrompts}</span>
          <div className="ask-ting-ai-prompts">
            {beginnerPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="ask-ting-ai-chip"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={disabled || loading}
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="ai-reasoning-grid">
            {guidanceCards.map((card) => (
              <button
                key={card.title}
                type="button"
                className="ai-reasoning-card"
                onClick={() => handleQuickPrompt(card.body)}
                disabled={disabled || loading}
              >
                <strong>{card.title}</strong>
                <span>{card.body}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="ai-error">{error}</div>}
        {error && (
          <button
            type="button"
            className="ai-retry"
            onClick={() => void sendMessage()}
            disabled={disabled || loading}
          >
            {copy.retry}
          </button>
        )}
        <div className="ai-summary-strip">
          <div>
            <span className="ai-history-label">{copy.howToUse}</span>
            <strong>{copy.howToUseText}</strong>
          </div>
          <div>
            <span className="ai-history-label">{copy.scope}</span>
            <strong>{copy.scopeText}</strong>
          </div>
        </div>
        {isPortfolioPage && !isPro && (
          <a className="ai-upgrade-cta" href="/upgrade">
            {isEnglish ? 'View full analysis with Ting AI Pro' : 'Lihat analisis lengkap dengan Ting AI Pro'}
          </a>
        )}
        <div className="ai-input">
          <input
            type="text"
            placeholder={copy.inputPlaceholder}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSend()
              }
            }}
            disabled={disabled || loading}
          />
          <button type="button" onClick={handleSend} disabled={disabled || loading}>
            {loading ? loadingLabel : copy.send}
          </button>
        </div>
      </div>
    </>
  )

  if (variant === 'panel') {
    return <div className="ai-panel">{content}</div>
  }

  return (
    <section id={sectionId} className="ai container reveal">
      {content}
    </section>
  )
}
