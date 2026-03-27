import React, { useEffect, useMemo, useState } from 'react'

const SYSTEM_PROMPT =
  'You are a helpful AI assistant for Faturachman Al kahfi portfolio website. ' +
  'Answer briefly, friendly, and focus on skills, projects, and services.'

const DATA_PROMPT =
  'Kamu adalah AI Financial Analyst untuk Fatur LifeOS. ' +
  'Jawab singkat, profesional, dan jelas. Fokus pada data yang diberikan.'

const buildDataContext = (summary, meta) => {
  const antam = meta?.instruments?.ANTAM
  const sp500 = meta?.instruments?.SP500
  const parts = []
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

export default function AiChat({ sectionId, summary, meta, variant }) {
  const defaultProvider = summary || meta ? 'local' : 'groq'
  const [provider, setProvider] = useState(defaultProvider)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything about my projects or skills.' }
  ])
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
      if (!saved) return
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length) {
        setMessages(parsed)
      }
    } catch (err) {
      // ignore
    }
  }, [storageKey])

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch (err) {
      // ignore
    }
  }, [messages, storageKey])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setError('')
    setInput('')
    const nextMessages = [
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
          : '/.netlify/functions/groq-chat'

      const body =
        provider === 'local'
          ? {
              model: 'gemma3:1b',
              prompt: [
                `system: ${isDataChat ? DATA_PROMPT : SYSTEM_PROMPT}`,
                dataContext ? `context: ${dataContext}` : '',
                nextMessages.map(m => `${m.role}: ${m.content}`).join('\n')
              ]
                .filter(Boolean)
                .join('\n'),
              stream: false
            }
          : { messages: nextMessages }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Request failed')
      }

      const data = await res.json()
      const reply =
        provider === 'local'
          ? data?.response
          : data?.choices?.[0]?.message?.content

      if (!reply) throw new Error('No reply from AI')
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(
        provider === 'local'
          ? 'Local AI is not running. Start Ollama on your laptop for the demo.'
          : err?.message || 'Groq AI error. Make sure GROQ_API_KEY is set in Netlify.'
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
            Choose mode: <strong>Local (Ollama)</strong> for private demo, or <strong>Groq</strong> for public use.
          </p>
          <div className="ai-toggle">
            <button
              className={provider === 'groq' ? 'active' : ''}
              onClick={() => setProvider('groq')}
              type="button"
            >
              Groq (Public)
            </button>
            <button
              className={provider === 'local' ? 'active' : ''}
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
              Tanyakan ringkasan investasi, strategi, atau pergerakan XAU/USD & S&amp;P 500.
            </p>
          </div>
        )}
        <div className="ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>
              <span>{m.content}</span>
            </div>
          ))}
        </div>
        {error && <div className="ai-error">{error}</div>}
        <div className="ai-input">
          <input
            type="text"
            placeholder={isDataChat ? 'Tanya tentang ringkasan investasi...' : 'Ask about projects, skills, or services...'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => (e.key === 'Enter' ? sendMessage() : null)}
          />
          <button type="button" onClick={sendMessage} disabled={loading}>
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
