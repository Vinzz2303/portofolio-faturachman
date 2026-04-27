import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { AiMessage, InvestmentMeta, SectionProps, PortfolioSummaryResponse, AskTingAiStructuredResponse } from '../types'
import { API_URL } from '../utils/api'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import { type LanguageCode } from '../utils/language'

const DATA_PROMPT =
  'You are Ting AI v1.8.1, a portfolio-aware risk copilot for retail traders. ' +
  'Reply in the same language the user uses. If the user language is unclear or mixed, default to English. ' +
  'Do not act like a signal bot, do not give absolute buy or sell commands, do not claim to know the future, and do not replace the user decision. ' +
  'If context is available, read the user portfolio first, then connect current market conditions to portfolio impact. ' +
  'Keep the answer short, scan-friendly, and practical. Use short label-style lines in plain text only. ' +
  'When relevant, structure the answer around: Situasi, Dampak ke portofolio, Masuk sekarang vs menunggu, Opsi yang bisa dipertimbangkan, Evidence, Confidence, and Decision stays with the user. ' +
  'Use natural Indonesian when the user writes in Indonesian. Prefer phrases like "berpotensi", "dalam kondisi ini", and "yang bisa dipertimbangkan". ' +
  'Avoid phrases like "pasti naik", "harus beli", "akan profit", or other overconfident language. ' +
  'Do not write generic chat, long explanations, markdown, bold, italics, or asterisks. Plain text only.'

type AiProvider = 'gemini'

type AiChatProps = Partial<SectionProps> & {
  summary?: string
  meta?: InvestmentMeta | null
  portfolio?: PortfolioSummaryResponse | null
  userPlan?: 'free' | 'pro'
  userEmail?: string
  language?: LanguageCode
  variant?: 'section' | 'panel'
  disabled?: boolean
  analysisStatus?: {
    label: string
    detail: string
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

const defaultMessagesByLanguage: Record<LanguageCode, AiMessage[]> = {
  id: [
    {
      role: 'assistant',
      content:
        'Ting AI membantu membaca konteks pasar, dampaknya ke portofolio, dan risiko yang perlu diperhatikan. Keputusan akhir tetap di tangan Anda.'
    }
  ],
  en: [
    {
      role: 'assistant',
      content:
        'Welcome to Ting AI. I can help frame market context, portfolio impact, the trade-off between entering now versus waiting, and a few options to consider. The final decision stays with you.'
    }
  ]
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
    return language === 'en' ? 'Assembling reasoning brief...' : 'Menyusun penjelasan AI...'
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
  disabled = false,
  analysisStatus = null
}: AiChatProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<AiMessage[]>(defaultMessagesByLanguage[language])
  const messagesRef = useRef<HTMLDivElement | null>(null)

  const isDataChat = Boolean(summary || meta)
  const isEnglish = language === 'en'
  const activeProvider: AiProvider = 'gemini'

  useEffect(() => {
    setMessages(defaultMessagesByLanguage[language])
  }, [language])

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
    () => [
      {
        title: isEnglish ? 'Market context' : 'Konteks pasar',
        body: isEnglish
          ? 'Ask what is changing in the market right now and why it matters.'
          : 'Apa yang sedang berubah di pasar hari ini?'
      },
      {
        title: isEnglish ? 'Portfolio impact' : 'Dampak portofolio',
        body: isEnglish
          ? 'Check how current conditions may affect your exposure and concentration.'
          : 'Bagaimana kondisi ini memengaruhi portofolioku?'
      },
      {
        title: isEnglish ? 'Trade-off' : 'Pertimbangan',
        body: isEnglish
          ? 'Ask about entering now versus waiting and what options are worth considering.'
          : 'Apa yang perlu saya pantau sebelum mengambil keputusan?'
      }
    ],
    [isEnglish]
  )

  const handleQuickPrompt = (prompt: string) => {
    if (disabled || loading) return
    setInput(prompt)
  }

  const handleNewChat = () => {
    if (loading) return
    setMessages(defaultMessagesByLanguage[language])
    setInput('')
    setError('')
  }

  const copy = useMemo(() => {
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
      scope: 'Ruang lingkup',
      scopeText: 'Konteks pasar + kerangka risiko portofolio',
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
  }, [isEnglish, userEmail, userPlan])

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading || disabled) return

    setError('')
    if (!overrideText) {
      setInput('')
    }

    const userMessage: AiMessage = { role: 'user', content: text }
    const localMessages = [...messages, userMessage]
    const payloadMessages: AiMessage[] = [{ role: 'system', content: DATA_PROMPT }, ...localMessages]

    setMessages(localMessages)
    setLoading(true)

    try {
      const url = `${API_URL}/api/ai-chat`
      const body = { messages: payloadMessages, summary, meta, portfolio, provider: activeProvider }

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
      const structured = parseStructuredResponse(data.structured) || parseStructuredResponse(reply)
      const fallbackReply = typeof reply === 'string' ? reply.trim() : ''

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
      setError(
        err instanceof Error
          ? err.message
          : 'Ting AI sedang mengalami gangguan sementara. Coba lagi beberapa saat.'
      )
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
      <div className="ai-kicker">{copy.kicker}</div>
      <h2>{copy.title}</h2>
      <p className="ai-sub">{copy.subtitle}</p>
      <div className="ai-highlights" aria-label="Ting AI highlights">
        {copy.highlights.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

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
