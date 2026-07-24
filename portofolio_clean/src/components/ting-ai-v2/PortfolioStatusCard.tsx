import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getTingAiI18n } from '../../utils/tingAiI18n'
import { useLanguagePreference } from '../../utils/language'

interface Props {
  hasPortfolio: boolean
}

const C = {
  surface:  'rgba(255,255,255,0.025)',
  border:   'rgba(255,255,255,0.07)',
  amber:    '#f59e0b',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  white:    '#ffffff',
  mono:     "'SF Mono', 'Fira Mono', 'JetBrains Mono', monospace",
}

export default function PortfolioStatusCard({ hasPortfolio }: Props) {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)

  if (hasPortfolio) {
    // Pro with portfolio
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          borderRadius: 16,
          border: `1px solid rgba(245,158,11,0.15)`,
          background: 'rgba(245,158,11,0.04)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 8,
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" fill={C.amber} viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.white }}>
            {t.proWithPortfolioStatus}
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: C.slate400, lineHeight: 1.6 }}>
          {t.proWithPortfolioDescription}
        </p>
      </motion.div>
    )
  }

  // Pro without portfolio
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        borderRadius: 16,
        border: `1px solid rgba(245,158,11,0.15)`,
        background: 'rgba(245,158,11,0.04)',
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 8,
          background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" fill={C.amber} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.white }}>
          {t.proNoPortfolioStatus}
        </h3>
      </div>

      <p style={{ margin: 0, fontSize: 12, color: C.slate400, lineHeight: 1.6 }}>
        {t.proNoPortfolioDescription}
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link
          to="/portfolio"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            fontWeight: 600, fontSize: 13,
            background: `${C.amber}20`, color: C.amber, textDecoration: 'none',
            border: `1px solid ${C.amber}40`,
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
        >
          {t.proNoPortfolioAddButton}
        </Link>
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            fontWeight: 600, fontSize: 13,
            background: 'transparent', color: C.slate400, textDecoration: 'none',
            border: `1px solid ${C.slate500}40`,
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
        >
          {t.proNoPortfolioAskButton}
        </button>
      </div>
    </motion.div>
  )
}
