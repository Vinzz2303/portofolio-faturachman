import React, { useEffect, useMemo, useState } from 'react'
import type { AiMessage, InvestmentMeta, SectionProps } from '../types'
import { API_URL } from '../utils/api'

const SYSTEM_PROMPT =
  'You are a helpful AI assistant for Faturachman Al kahfi portfolio website. ' +
  'Answer briefly, friendly, and focus on skills, projects, and services.'

const DATA_PROMPT =
  'Kamu adalah AI Financial Analyst untuk Fatur LifeOS. ' +
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
  { role: 'assistant', content: 'Hi! Ask me anything about my projects or skills.' }
]

export default function AiChat({
  sectionId,
  summary,
  meta,
  variant = 'section',
  disabled = false
}: AiChatProps) {
  const defaultProvider: AiProvider = summary || meta ? 'local' : 'groq'
  const [provider, setProvider] = useState<AiProvider>(defaultProvider)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState<AiMessage[]>(defaultMessages)

  const storageKey = `lifeos_chat_${provider}`
  const dataContext = useMemo(() => buildDataContext(summary, meta), [summary, meta])
  const isDataChat = Boolean(summary || meta)

  useEffect(() => {
    if (isDataChat && provider !== 'local') {
      setProvider('local')
    }
  }, [isDataChat, provider])

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
      const url =
        provider === 'local'
          ? 'http://localhost:11434/api/generate'
          : `${API_URL}/api/ai-chat`

      const body =
        provider === 'local'
          ? {
              model: 'gemma3:1b',
              prompt: [
                `system: ${isDataChat ? DATA_PROMPT : SYSTEM_PROMPT}`,
                dataContext ? `context: ${dataContext}` : '',
                nextMessages.map(message => `${message.role}: ${message.content}`).join('\n')
              ]
                .filter(Boolean)
                .join('\n'),
              stream: false
            }
          : { messages: nextMessages, summary, meta }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const responseText = await res.text()
        throw new Error(responseText || 'Request failed')
      }

      const data = (await res.json()) as OllamaResponse | GroqResponse
      const reply =
        provider === 'local'
          ? (data as OllamaResponse).response
          : (data as GroqResponse).reply || (data as GroqResponse).choices?.[0]?.message?.content

      if (!reply) {
        throw new Error('No reply from AI')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(
        provider === 'local'
          ? 'Local AI is not running. Start Ollama on your laptop for the demo.'
          : err instanceof Error
            ? err.message
            : 'Groq AI error. Make sure GROQ_API_KEY is set on the VPS backend.'
      )
    } finally {
      setLoading(false)
    }
  }

  const content = (
    <>
      {!isDataChat && (
        <>
          <h2>AI Assistant</h2>
          <p className="ai-sub">
            Choose mode: <strong>Local (Ollama)</strong> for private demo, or{' '}
            <strong>Groq</strong> for public use.
          </p>
          <div className="ai-toggle">
            <button
              className={provider === 'groq' ? 'active' : ''}
              disabled={disabled}
              onClick={() => setProvider('groq')}
              type="button"
            >
              Groq (Public)
            </button>
            <button
              className={provider === 'local' ? 'active' : ''}
              disabled={disabled}
              onClick={() => setProvider('local')}
              type="button"
            >
              Local (Ollama)
            </button>
          </div>
        </>
      )}

      <div className="ai-box">
        {variant === 'panel' && (
          <div className="ai-panel-head">
            <h3>AI Assistant</h3>
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
        {error && <div className="ai-error">{error}</div>}
        <div className="ai-input">
          <input
            type="text"
            placeholder={
              isDataChat
                ? 'Tanya tentang ringkasan investasi...'
                : 'Ask about projects, skills, or services...'
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
