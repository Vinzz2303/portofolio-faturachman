import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ConfidenceOutput, FullInsight } from '../../engine/insightEngine'
import { useLanguagePreference } from '../../utils/language'
import { getTingAiI18n } from '../../utils/tingAiI18n'

// ── Design tokens ────────────────────────────────────────────────────────────
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
}

interface InsightEngineCardProps {
  quickInsight: string
  fullInsight: FullInsight
  language?: 'id' | 'en'
  trust?: ConfidenceOutput
}

// ── Layer icon ─────────────────────────────────────────────────────────────
function LayerDot({ color }: { color: string }) {
  return (
    <div style={{
      width: 7, height: 7, borderRadius: '50%',
      background: color, flexShrink: 0,
      boxShadow: `0 0 6px ${color}80`,
    }} />
  )
}

// ── Expand chevron ─────────────────────────────────────────────────────────
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      style={{ transition: 'transform 0.3s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Single layer row ───────────────────────────────────────────────────────
function InsightLayer({
  label, text, accentColor, delay,
}: {
  label: string
  text: string
  accentColor: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        paddingLeft: 16,
        borderLeft: `2px solid ${accentColor}40`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <LayerDot color={accentColor} />
        <span style={{
          fontFamily: C.mono, fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.22em',
          color: accentColor,
        }}>
          {label}
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            margin: 0, fontSize: 14, lineHeight: 1.75,
            color: C.slate300,
            fontWeight: 400,
          }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// InsightEngineCard — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function InsightEngineCard({
  quickInsight,
  fullInsight,
  language,
  trust: _trust,
}: InsightEngineCardProps) {
  const { language: hookLang } = useLanguagePreference()
  const lang = language ?? hookLang
  const t = getTingAiI18n(lang)

  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      id="insight-engine-card"
      style={{
        borderRadius: 18,
        border: `1px solid ${C.border}`,
        background: C.surface,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle top accent glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${C.teal}50, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* ── QUICK INSIGHT (top card) ──────────────────────────────────────── */}
      <div style={{ padding: '20px 24px 18px' }}>

        {/* Label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 99,
            background: `${C.teal}10`,
            border: `1px solid ${C.teal}25`,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.teal }} />
            <span style={{
              fontFamily: C.mono, fontSize: 9, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.22em',
              color: C.teal,
            }}>
              {t.insightBadge}
            </span>
          </div>
        </div>

        {/* Quick insight sentence */}
        <AnimatePresence mode="wait">
          <motion.p
            key={quickInsight}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 500,
              color: C.white,
              lineHeight: 1.65,
              letterSpacing: '-0.01em',
            }}
          >
            {quickInsight}
          </motion.p>
        </AnimatePresence>

        <p style={{
          margin: '12px 0 0',
          fontSize: 11,
          color: C.slate600,
          fontFamily: C.mono,
          letterSpacing: '0.02em',
        }}>
          {t.basedOnCurrentData}
        </p>
      </div>

      {/* ── EXPAND TOGGLE ────────────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        id="insight-engine-expand-btn"
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px',
          background: 'transparent',
          border: 'none',
          borderTop: `1px solid rgba(255,255,255,0.05)`,
          cursor: 'pointer',
          color: C.slate500,
          fontFamily: C.mono,
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.slate300 }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.slate500 }}
      >
        <span>{expanded ? t.insightCollapse : t.insightExpand}</span>
        <ChevronIcon open={expanded} />
      </button>

      {/* ── FULL INSIGHT (expandable) ─────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="full-insight"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '20px 24px 24px',
              borderTop: `1px solid rgba(255,255,255,0.04)`,
              display: 'flex', flexDirection: 'column', gap: 22,
            }}>

              <InsightLayer
                label={t.insightLayerReality}
                text={fullInsight.reality}
                accentColor="#22d3ee"
                delay={0.05}
              />

              <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />

              <InsightLayer
                label={t.insightLayerTradeoff}
                text={fullInsight.tradeoff}
                accentColor={C.amber}
                delay={0.12}
              />

              <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />

              <InsightLayer
                label={t.insightLayerDirection}
                text={fullInsight.direction}
                accentColor="#a78bfa"
                delay={0.19}
              />

              {/* Disclaimer */}
              <p style={{
                margin: 0,
                fontFamily: C.mono,
                fontSize: 10,
                color: C.slate600,
                letterSpacing: '0.08em',
                paddingTop: 4,
                borderTop: `1px solid rgba(255,255,255,0.04)`,
              }}>
                {t.insightDisclaimer}
              </p>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
