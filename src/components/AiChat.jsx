import React, { useState } from 'react'

const SYSTEM_PROMPT =
  'You are a helpful AI assistant for Faturachman Al kahfi portfolio website. ' +
  'Answer briefly, friendly, and focus on skills, projects, and services.'

export default function AiChat({ sectionId }) {
  const [provider, setProvider] = useState('groq')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Tanyakan apa saja tentang project atau skill saya.' }
  ])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setError('')
    setInput('')
    const nextMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
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
          ? { model: 'gemma3:1b', prompt: nextMessages.map(m => `${m.role}: ${m.content}`).join('\n'), stream: false }
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
          ? 'Local AI tidak aktif. Jalankan Ollama di laptop kamu untuk demo.'
          : err?.message || 'Groq AI error. Pastikan GROQ_API_KEY sudah diset di Netlify.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id={sectionId} className="ai container reveal">
      <h2>AI Assistant</h2>
      <p className="ai-sub">
        Pilih mode: <strong>Local (Ollama)</strong> untuk demo pribadi, atau <strong>Groq</strong> untuk publik.
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

      <div className="ai-box">
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
            placeholder="Tanya tentang project, skill, atau services..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => (e.key === 'Enter' ? sendMessage() : null)}
          />
          <button type="button" onClick={sendMessage} disabled={loading}>
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </section>
  )
}
