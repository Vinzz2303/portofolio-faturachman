import React, { useEffect, useMemo, useState } from 'react'
import type { AiMessage, InvestmentMeta, SectionProps } from '../types'
import { API_URL } from '../utils/api'

const SYSTEM_PROMPT =
  'You are a helpful AI assistant for Faturachman Al kahfi portfolio website. ' +
  'Answer briefly, friendly, and focus on skills, projects, and services.'

const DATA_PROMPT =
  'Kamu adalah AI Financial Analyst untuk Ting AI. ' +
  'Jawab singkat, profesional, dan jelas. Fokus pada data yang diberikan.'

type AiProvider = 'local' | 'groq'

type AiChatProps = Partial<SectionProps> & {
  summary?: string
  meta?: InvestmentMeta | null
  variant?: 'section' | 'panel'
  disabled?: boolean
}

type GroqResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  reply?: string
}

type OllamaResponse = {
  response?: string
}

const buildDataContext = (summary?: string, meta?: InvestmentMeta | null) => {
  const antam = meta?.instruments?.ANTAM
  const sp500 = meta?.instruments?.SP500
  const parts: string[] = []

  if (summary) parts.push(`Ringkasan: ${summary}`)
  if (antam && !antam.error) {
    parts.push(
      `XAU/USD terbaru ${antam.latestPrice} (delta ${antam.delta}) pada ${antam.latestDate}.`
    )
  }
  if (sp500 && !sp500.error) {
    parts.push(
      `S&P 500 terbaru ${sp500.latestPrice} (delta ${sp500.delta}) pada ${sp500.latestDate}.`
    )
  }

  return parts.join(' ')
}

const defaultMessages: AiMessage[] = [
  {
    role: 'assistant',
    content:
      'Welcome to Ting AI. Ask about selected projects, technical strengths, or how I can help with your next build.'
  }
]

const publicPrompts = [
  'Which project best represents your backend skills?',
  'What stack do you use most confidently?',
  'How can you help build an AI-powered product?'
]

export default function AiChat({
  sectionId,
  summary,
  meta,
  variant = 'section',
  disabled = false
}: AiChatProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<AiMessage[]>(defaultMessages)

  const storageKey = 'lifeos_chat_groq' // Hardcoded to groq
  const isDataChat = Boolean(summary || meta)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (!saved) {
        setMessages(defaultMessages)
        return
      }

      const parsed = JSON.parse(saved) as unknown
      if (!Array.isArray(parsed) || !parsed.length) {
        setMessages(defaultMessages)
        return
      }

      const validMessages = parsed.filter(
        (message): message is AiMessage =>
          Boolean(message) &&
          typeof message === 'object' &&
          'role' in message &&
          'content' in message &&
          typeof message.role === 'string' &&
          typeof message.content === 'string'
      )

      setMessages(validMessages.length ? validMessages : defaultMessages)
    } catch {
      setMessages(defaultMessages)
    }
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch {
      // Ignore storage write errors.
    }
  }, [messages, storageKey])

  const handleQuickPrompt = (prompt: string) => {
    if (disabled || loading) return
    setInput(prompt)
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading || disabled) return

    setError('')
    setInput('')

    const nextMessages: AiMessage[] = [
      { role: 'system', content: isDataChat ? DATA_PROMPT : SYSTEM_PROMPT },
      ...messages,
      { role: 'user', content: text }
    ]

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const url = `${API_URL}/api/ai-chat`
      const body = { messages: nextMessages, summary, meta }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const responseText = await res.text()
        throw new Error(responseText || 'Request failed')
      }

      const data = (await res.json()) as GroqResponse
      const reply = data.reply || data.choices?.[0]?.message?.content

      if (!reply) {
        throw new Error('No reply from AI')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ting AI error. Make sure GROQ_API_KEY is set on the VPS backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <>
      {!isDataChat && (
        <>
          <div className="ai-kicker">Curated Public Demo</div>
          <h2>Ting AI</h2>
          <p className="ai-sub">
            A public AI layer for quick discovery. Ask about selected work, core strengths, or
            what kind of build I can lead end-to-end.
          </p>
          <div className="ai-highlights" aria-label="Ting AI highlights">
            <span>Groq-powered</span>
            <span>Portfolio-aware</span>
            <span>Fast first impression</span>
          </div>
        </>
      )}

      <div className="ai-box">
        {variant === 'panel' && (
          <div className="ai-panel-head">
            <h3>Ting AI Dashboard</h3>
            <p className="ai-panel-sub">
              Tanyakan ringkasan investasi, strategi, atau pergerakan XAU/USD &amp; S&amp;P
              500.
            </p>
          </div>
        )}
        <div className="ai-messages">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`ai-msg ${message.role}`}>
              <span>{message.content}</span>
            </div>
          ))}
        </div>
        {!isDataChat && (
          <div className="ai-prompt-list">
            {publicPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="ai-prompt-chip"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={disabled || loading}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        {error && <div className="ai-error">{error}</div>}
        <div className="ai-input">
          <input
            type="text"
            placeholder={
              isDataChat
                ? 'Tanya tentang ringkasan investasi...'
                : 'Ask Ting AI about projects, strengths, or collaboration...'
            }
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void sendMessage()
              }
            }}
            disabled={disabled || loading}
          />
          <button type="button" onClick={() => void sendMessage()} disabled={disabled || loading}>
            {loading ? 'Thinking...' : 'Send'}
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
