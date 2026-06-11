/**
 * ConfidenceBadge.tsx
 *
 * Ting AI — Trust Layer UI
 *
 * FREE:  Shows a compact "Confidence: Medium" badge with a tooltip.
 * PRO:   Shows a full breakdown card — alignment, volatility, data quality.
 *
 * Rules:
 *   - Never implies 100% accuracy
 *   - Tone: calm, neutral
 *   - No predictions, no signals
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type ConfidenceScore,
  type ConfidenceLevel,
  getConfidenceI18n,
} from '../../engine/trustLayer'
import { useLanguagePreference } from '../../utils/language'
import { getTingAiI18n } from '../../utils/tingAiI18n'

// ── Color palette per level ────────────────────────────────────────────────────

const LEVEL_COLORS: Record<ConfidenceLevel, {
  primary: string
  bg: string
  border: string
  glow: string
  dot: string
}> = {
  HIGH: {
    primary: '#34d399',
    bg:      'rgba(52,211,153,0.08)',
    border:  'rgba(52,211,153,0.20)',
    glow:    'rgba(52,211,153,0.12)',
    dot:     '#34d399',
  },
  MEDIUM: {
    primary: '#f59e0b',
    bg:      'rgba(245,158,11,0.08)',
    border:  'rgba(245,158,11,0.20)',
    glow:    'rgba(245,158,11,0.10)',
    dot:     '#f59e0b',
  },
  LOW: {
    primary: '#ef4444',
    bg:      'rgba(239,68,68,0.08)',
    border:  'rgba(239,68,68,0.20)',
    glow:    'rgba(239,68,68,0.10)',
    dot:     '#ef4444',
  },
}

// ── Volatility icon ────────────────────────────────────────────────────────────

function VolatilityIcon({ level }: { level: 'low' | 'medium' | 'high' }) {
  const bars = level === 'low' ? 1 : level === 'medium' ? 2 : 3
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
      {[1, 2, 3].map(b => (
        <span
          key={b}
          style={{
            display: 'inline-block',
            width: 3,
            borderRadius: 1.5,
            height: b <= bars ? `${b * 4}px` : '4px',
            background: b <= bars
              ? (level === 'low' ? '#34d399' : level === 'medium' ? '#f59e0b' : '#ef4444')
              : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </span>
  )
}

// ── Shield icon ───────────────────────────────────────────────────────────────

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

// ── Check / Cross icon ────────────────────────────────────────────────────────

function AlignIcon({ aligned, color }: { aligned: boolean; color: string }) {
  return aligned ? (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

// ── Database icon ─────────────────────────────────────────────────────────────

function DataIcon({ quality, color }: { quality: 'good' | 'partial' | 'weak'; color: string }) {
  const fill = quality === 'good' ? color : quality === 'partial' ? '#f59e0b' : '#64748b'
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2.5">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path strokeLinecap="round" d="M3 5v6c0 1.657 4.029 3 9 3s9-1.343 9-3V5" />
      <path strokeLinecap="round" d="M3 11v6c0 1.657 4.029 3 9 3s9-1.343 9-3v-6" />
    </svg>
  )
}

// ── Percent / deviation icon ──────────────────────────────────────────────────

function DeviationIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <line x1="19" y1="5" x2="5" y2="19" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}

// ── Free Badge (compact) ──────────────────────────────────────────────────────

interface FreeBadgeProps {
  score: ConfidenceScore
}

function FreeBadge({ score }: FreeBadgeProps) {
  const { language: lang } = useLanguagePreference()
  const i18n = getConfidenceI18n(score, lang)
  const t = getTingAiI18n(lang)
  const colors = LEVEL_COLORS[score.confidence]
  const [open, setOpen] = useState(false)

  const labelPrefix = t.confidencePrefix

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Badge trigger */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 99,
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          cursor: 'pointer',
          outline: 'none',
          userSelect: 'none',
        }}
      >
        {/* Pulse dot */}
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: colors.dot,
          boxShadow: `0 0 6px ${colors.glow}`,
          animation: 'pulse 2s infinite',
        }} />
        <span style={{
          fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          color: colors.primary,
        }}>
          {labelPrefix}: {i18n.label}
        </span>
        {/* Expand chevron */}
        <svg
          width="9" height="9" viewBox="0 0 24 24" fill="none"
          stroke={colors.primary} strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </motion.button>

      {/* Tooltip / mini popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: 50,
              minWidth: 240,
              borderRadius: 12,
              background: '#0d1117',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)`,
              padding: '14px 16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            {/* Level + description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldIcon color={colors.primary} />
                <span style={{
                  fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.14em',
                  color: colors.primary,
                }}>
                  {i18n.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.55 }}>
                {i18n.description}
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

            {/* Volatility */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <VolatilityIcon level={score.reason.volatility} />
              <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>
                {i18n.volatilityLabel}
              </span>
            </div>

            {/* Disclaimer */}
            <p style={{
              margin: 0, fontSize: 10, color: '#475569',
              fontFamily: 'monospace', lineHeight: 1.5,
              borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8,
            }}>
              {i18n.disclaimer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Pro Breakdown Card ────────────────────────────────────────────────────────

interface ProBreakdownCardProps {
  score: ConfidenceScore
}

function ProBreakdownCard({ score }: ProBreakdownCardProps) {
  const { language: lang } = useLanguagePreference()
  const i18n = getConfidenceI18n(score, lang)
  const t = getTingAiI18n(lang)
  const colors = LEVEL_COLORS[score.confidence]

  const headerLabel  = t.trustLayerLabel
  const sectionTitle = t.confidenceBreakdown
  const alignLabel   = t.sourceAlignmentLabel
  const volLabel     = t.volatilityContextLabel
  const dataLabel    = t.dataQualityLabel
  const devLabel     = t.priceDeviationLabel

  const baseRows = [
    {
      label: alignLabel,
      value: i18n.alignmentLabel,
      icon: <AlignIcon aligned={score.reason.sourceAlignment} color={colors.primary} />,
      accent: score.reason.sourceAlignment,
    },
    {
      label: volLabel,
      value: i18n.volatilityLabel,
      icon: <VolatilityIcon level={score.reason.volatility} />,
      accent: score.reason.volatility === 'low',
    },
    {
      label: dataLabel,
      value: i18n.dataQualityLabel,
      icon: <DataIcon quality={score.reason.dataQuality} color={colors.primary} />,
      accent: score.reason.dataQuality === 'good',
    },
  ]

  // Append price deviation row only when real multi-source data is available (PRO)
  const rows = i18n.deviationLabel
    ? [
        ...baseRows,
        {
          label: devLabel,
          value: i18n.deviationLabel,
          icon: <DeviationIcon color={score.reason.sourceAlignment ? colors.primary : '#94a3b8'} />,
          accent: score.reason.sourceAlignment,
        },
      ]
    : baseRows

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        filter: 'blur(30px)', background: colors.glow,
        pointerEvents: 'none',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 8,
            background: colors.bg, border: `1px solid ${colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldIcon color={colors.primary} />
          </div>
          <span style={{
            fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.5)',
          }}>
            {headerLabel}
          </span>
        </div>

        {/* Level pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 99,
          background: colors.bg,
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: colors.dot,
            animation: 'pulse 2s infinite',
          }} />
          <span style={{
            fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: colors.primary,
          }}>
            {i18n.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
        {i18n.description}
      </p>

      {/* Breakdown section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase',
          letterSpacing: '0.18em', color: '#475569', marginBottom: 6,
        }}>
          {sectionTitle}
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map(row => (
            <div
              key={row.label}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: 10,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {row.icon}
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>
                  {row.label}
                </span>
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
                color: row.accent ? colors.primary : '#94a3b8',
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer strip */}
      <div style={{
        padding: '8px 12px', borderRadius: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
        <p style={{
          margin: 0, fontSize: 10, fontFamily: 'monospace',
          color: '#475569', lineHeight: 1.55,
        }}>
          {i18n.disclaimer}
        </p>
      </div>
    </motion.div>
  )
}

// ── Public API ────────────────────────────────────────────────────────────────

interface ConfidenceBadgeProps {
  score: ConfidenceScore
  /** If true, show full PRO breakdown. If false, show compact FREE badge. */
  isPro?: boolean
}

/**
 * ConfidenceBadge
 *
 * FREE  → compact pill badge with tooltip showing level + volatility + disclaimer
 * PRO   → full card with source alignment, volatility, and data quality breakdown
 */
export default function ConfidenceBadge({ score, isPro = false }: ConfidenceBadgeProps) {
  if (isPro) {
    return <ProBreakdownCard score={score} />
  }
  return <FreeBadge score={score} />
}
