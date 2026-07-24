import React from 'react'
import { getTingAiI18n } from '../../utils/tingAiI18n'
import { useLanguagePreference } from '../../utils/language'

interface Props {
  isPro: boolean
  hasPortfolio: boolean
}

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

export default function ProAwareTingAiHeader({ isPro, hasPortfolio }: Props) {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)

  if (isPro) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: C.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em',
            color: 'rgba(245,158,11,0.75)', border: '1px solid rgba(245,158,11,0.2)',
            background: 'rgba(245,158,11,0.06)', padding: '4px 12px', borderRadius: 99,
          }}>
            {t.proBadge}
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.2, color: C.white }}>
          {t.proHeaderTitle}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: C.slate400, lineHeight: 1.6 }}>
          {t.proHeaderSubtitle}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: C.slate500, lineHeight: 1.6, fontStyle: 'italic' }}>
          {t.proSupportingCopy}
        </p>
      </div>
    )
  }

  // Free mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: C.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em',
          color: 'rgba(20,184,166,0.75)', border: '1px solid rgba(20,184,166,0.2)',
          background: 'rgba(20,184,166,0.06)', padding: '4px 12px', borderRadius: 99,
        }}>
          {t.freeBadge}
        </span>
        {hasPortfolio && (
          <span style={{
            fontFamily: C.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em',
            color: 'rgba(148,163,184,0.85)', border: '1px solid rgba(148,163,184,0.16)',
            background: 'rgba(148,163,184,0.05)', padding: '4px 12px', borderRadius: 99,
          }}>
            {t.freePortfolioAvailableBadge}
          </span>
        )}
      </div>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.2, color: C.white }}>
        {t.freeHeaderTitle}
      </h1>
      <p style={{ margin: 0, fontSize: 13, color: C.slate400, lineHeight: 1.6 }}>
        {t.freeHeaderSubtitle}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: C.slate500, lineHeight: 1.6 }}>
        {t.freeSupportingCopy}
      </p>
    </div>
  )
}
