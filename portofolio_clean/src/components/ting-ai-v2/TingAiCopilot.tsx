/**
 * TingAiCopilot.tsx
 *
 * The Ting AI Copilot — a thinking partner chat UI embedded in the portfolio workspace.
 *
 * Design principles:
 *   - Premium, minimal, dark. No clutter.
 *   - Every response follows 4-part structure (Acknowledge → Context → Insight → Reflection)
 *   - Chip suggestions guide next thoughts without prescribing actions
 *   - Trust badge shown subtly in assistant message footer
 *   - Fully i18n'd via tingAiI18n.ts
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FullInsight, AssetWeight, MarketCondition } from '../../engine/insightEngine'
import type { ConfidenceScore } from '../../engine/trustLayer'
import { runCopilotV2, type CopilotResponse } from '../../services/copilotService'
import { normalizeDisplaySymbol } from '../../utils/assetNormalization'
import { useLanguagePreference } from '../../utils/language'
import { getTingAiI18n } from '../../utils/tingAiI18n'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       '#0b0d12',
  surface:  'rgba(255,255,255,0.025)',
  border:   'rgba(255,255,255,0.07)',
  teal:     '#14b8a6',
  amber:    '#f59e0b',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  white:    '#ffffff',
  mono:     "'SF Mono', 'Fira Mono', 'JetBrains Mono', monospace",
  red400:   '#f87171',
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface TingAiCopilotProps {
  market: MarketCondition
  portfolio: AssetWeight[]
  trust: ConfidenceScore
  insight: FullInsight
  /** if false, copilot is still shown but chips are reduced */
  isPro?: boolean
}

// ── Message shape ─────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant'
  content: string
  chips?: string[]
  meta?: CopilotResponse['meta']
}

// ── Trust level badge ─────────────────────────────────────────────────────────
const TRUST_COLORS: Record<'HIGH' | 'MEDIUM' | 'LOW', string> = {
  HIGH:   '#22d3ee',
  MEDIUM: '#f59e0b',
  LOW:    '#f87171',
}

function TrustMicro({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const color = TRUST_COLORS[level]
  return (
    <span style={{
      fontFamily: C.mono,
      fontSize: 9,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color,
      opacity: 0.7,
    }}>
      ▸ {level}
    </span>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal }}
        />
      ))}
    </div>
  )
}

// ── Chip button ───────────────────────────────────────────────────────────────
function ChipButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false)
  const displayLabel = normalizeDisplaySymbol(label)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '6px 14px',
        borderRadius: 99,
        border: `1px solid ${hovered ? C.teal + '40' : C.border}`,
        background: hovered ? `${C.teal}0d` : 'transparent',
        color: hovered ? C.teal : C.slate400,
        fontFamily: C.mono,
        fontSize: 11,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {displayLabel}
    </button>
  )
}

// ── Single message bubble ─────────────────────────────────────────────────────
function MessageBubble({ msg, onChipClick, isTyping, t }: {
  msg: Message
  onChipClick: (chip: string) => void
  isTyping: boolean
  t: ReturnType<typeof getTingAiI18n>
}) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: 8,
      }}
    >
      {/* Bubble */}
      <div style={{
        maxWidth: isUser ? '75%' : '100%',
        padding: isUser ? '10px 16px' : '16px 20px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
        background: isUser
          ? 'rgba(20,184,166,0.12)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isUser ? 'rgba(20,184,166,0.2)' : C.border}`,
      }}>
        {msg.role === 'assistant' && isTyping ? (
          <TypingDots />
        ) : (
          <p style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.75,
            color: isUser ? C.teal : C.slate300,
            whiteSpace: 'pre-line',
          }}>
            {msg.content}
          </p>
        )}

        {/* Trust micro-badge in assistant footer */}
        {!isUser && !isTyping && msg.meta && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid rgba(255,255,255,0.05)`, paddingTop: 8 }}>
            <span style={{ fontFamily: C.mono, fontSize: 9, color: C.slate500, letterSpacing: '0.04em' }}>
              {t.basedOnCurrentData}
            </span>
            <TrustMicro level={msg.meta.usedTrust} />
            {msg.meta.hasFallback && (
              <span style={{ fontFamily: C.mono, fontSize: 9, color: C.slate700, letterSpacing: '0.1em' }}>
                {t.copilotFallbackNote}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chip row for assistant messages */}
      {!isUser && !isTyping && msg.chips && msg.chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 4 }}>
          {msg.chips.map(chip => (
            <ChipButton
              key={chip}
              label={chip}
              onClick={() => onChipClick(chip)}
              disabled={isTyping}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ── Welcome message ───────────────────────────────────────────────────────────
function WelcomeState({ onChipClick, t, isPro }: { onChipClick: (c: string) => void; t: ReturnType<typeof getTingAiI18n>; isPro: boolean }) {
  const starterChips = isPro ? t.proPromptChips : t.freePromptChips

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '8px 0' }}
    >
      {/* Brand row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: isPro ? 'rgba(245,158,11,0.1)' : 'rgba(20,184,166,0.1)',
          border: isPro ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(20,184,166,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {isPro ? (
            <svg width="12" height="12" fill={C.amber} viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ) : (
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal }} />
          )}
        </div>
        <div>
          <div style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: isPro ? C.amber : C.teal }}>
            {isPro ? 'Ting AI Copilot' : 'Ting AI'}
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 9, color: C.slate600, letterSpacing: '0.1em' }}>
            {t.copilotTagline}
          </div>
        </div>
      </div>

      {/* Welcome content */}
      <p style={{ margin: 0, fontSize: 13, color: C.slate500, lineHeight: 1.7, maxWidth: 480 }}>
        {t.copilotWelcome}
      </p>

      {/* Starter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {starterChips.map(chip => (
          <ChipButton key={chip} label={chip} onClick={() => onChipClick(chip)} disabled={false} />
        ))}
      </div>
    </motion.div>
  )
}

// ── Send icon ─────────────────────────────────────────────────────────────────
function SendIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function TingAiCopilot({ market, portfolio, trust, insight, isPro = false }: TingAiCopilotProps) {
  const { language: hookLang } = useLanguagePreference()
  const lang = hookLang as 'id' | 'en'
  const t = getTingAiI18n(lang)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed || isTyping) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const previousMessages = messages
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const response = await runCopilotV2({
        message: trimmed,
        lang,
        mode: 'copilot',
        market,
        portfolio,
        trust,
        insight,
        messages: previousMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      })

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.text,
        chips: response.chips,
        meta: response.meta,
      }

      setMessages(prev => [...prev, assistantMsg])
    } finally {
      setIsTyping(false)
    }
  }, [insight, isTyping, lang, market, messages, portfolio, trust])

  const handleSend = () => sendMessage(input)
  const handleChip = (chip: string) => sendMessage(chip)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = () => {
    setMessages([])
    setInput('')
    setIsTyping(false)
    inputRef.current?.focus()
  }

  const isEmpty = messages.length === 0

  const inputPlaceholder = t.copilotPlaceholder

  return (
    <div
      id="ting-ai-copilot"
      style={{
        borderRadius: 18,
        border: `1px solid ${C.border}`,
        background: C.surface,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 420,
        position: 'relative',
      }}
    >
      {/* Accent top line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${C.amber}40, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, boxShadow: `0 0 6px ${C.amber}60` }} />
          <span style={{ fontFamily: C.mono, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: C.amber }}>
            {t.copilotHeaderName}
          </span>
          {/* Trust indicator */}
          <span style={{
            fontFamily: C.mono, fontSize: 9, letterSpacing: '0.12em',
            color: TRUST_COLORS[trust.confidence], opacity: 0.6,
            padding: '2px 7px', borderRadius: 99,
            border: `1px solid ${TRUST_COLORS[trust.confidence]}25`,
            background: `${TRUST_COLORS[trust.confidence]}0a`,
          }}>
            {trust.confidence}
          </span>
        </div>

        {!isEmpty && (
          <button
            onClick={handleReset}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: C.mono, fontSize: 10, color: C.slate600,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.slate400 }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.slate600 }}
          >
            {t.copilotReset}
          </button>
        )}
      </div>

      {/* ── Message area ──────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 28,
          scrollbarWidth: 'none',
        }}
      >
        <AnimatePresence mode="popLayout">
          {isEmpty ? (
            <WelcomeState key="welcome" onChipClick={handleChip} t={t} isPro={isPro} />
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                msg={msg}
                onChipClick={handleChip}
                isTyping={false}
                t={t}
              />
            ))
          )}
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}
            >
              <TypingDots />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Scroll anchor */}
        <div style={{ height: 20, flexShrink: 0 }} />
      </div>

      {/* ── Input ─────────────────────────────────────────────────── */}
      <div
        className="sticky z-20 md:static"
        style={{
          bottom: 'calc(4rem + env(safe-area-inset-bottom))',
          padding: '12px 16px 16px',
          borderTop: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
          background: 'rgba(11,13,18,0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
          placeholder={inputPlaceholder}
          id="copilot-input"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: C.white,
            fontFamily: 'Inter, system-ui, sans-serif',
            opacity: isTyping ? 0.5 : 1,
            caretColor: C.teal,
          }}
        />
        <button
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          id="copilot-send-btn"
          style={{
            width: 34, height: 34,
            borderRadius: 10,
            border: 'none',
            background: input.trim() && !isTyping ? `${C.teal}18` : 'transparent',
            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <SendIcon color={input.trim() && !isTyping ? C.teal : C.slate700} />
        </button>
      </div>

      {/* Disclaimer strip */}
      <div style={{
        padding: '6px 16px 10px',
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: C.mono, fontSize: 9, color: C.slate700, letterSpacing: '0.1em' }}>
          {t.insightDisclaimer}
        </span>
      </div>
    </div>
  )
}
