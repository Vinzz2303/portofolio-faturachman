import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AnalysisResult, Holding } from '../../engine/analyzePortfolio'
import ConfidenceBadge from './ConfidenceBadge'
import InsightEngineCard from './InsightEngineCard'
import type { ConfidenceScore } from '../../engine/trustLayer'
import type { ConfidenceOutput, FullInsight } from '../../engine/insightEngine'
import { useLanguagePreference } from '../../utils/language'
import { getTingAiI18n } from '../../utils/tingAiI18n'

interface Props {
  result: AnalysisResult | null
  holdings: Holding[]
  visible: boolean
  isPro?: boolean
  /** Trust Layer confidence score — computed by caller */
  confidenceScore?: ConfidenceScore
  quickInsight?: string | null
  fullInsight?: FullInsight | null
  language?: 'id' | 'en'
  trust?: ConfidenceOutput
}

// ── Inline style constants ────────────────────────────────────────
const iconBox: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.04)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
const iconBoxAmber: React.CSSProperties = {
  ...iconBox,
  background: 'rgba(245,158,11,0.1)',
}

function CollapsibleText({ text }: { text: string }) {
  const { language: lang } = useLanguagePreference()
  const safeText = text?.trim()
  if (!safeText) return null

  if (safeText.length <= 180) {
    return <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{safeText}</p>
  }

  const preview = `${safeText.slice(0, 170).trim()}...`
  const detailsLabel = lang === 'id' ? 'Lihat penjelasan lengkap' : 'View full explanation'

  return (
    <details style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>
      <summary style={{ cursor: 'pointer', color: '#cbd5e1' }}>
        {preview}
        <span style={{ display: 'block', marginTop: 8, fontSize: 11, color: '#14b8a6', fontFamily: 'monospace' }}>
          {detailsLabel}
        </span>
      </summary>
      <p style={{ margin: '10px 0 0', color: '#94a3b8' }}>{safeText}</p>
    </details>
  )
}

// ── Risk Meter ─────────────────────────────────────────────────────
function RiskMeter({ score }: { score: number }) {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)

  const color =
    score < 35 ? '#22d3ee'
    : score < 60 ? '#f59e0b'
    : '#ef4444'

  const label =
    score < 35 ? t.riskLabelSafe
    : score < 60 ? t.riskLabelAlert
    : t.riskLabelRisky

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94a3b8' }}>
          {t.riskIndexTitle}
        </span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 99,
          background: `${color}18`, color,
          fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: 'pulse 2s infinite' }} />
          {label} · {score}
        </div>
      </div>

      {/* Progress bar track */}
      <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'monospace', color: '#475569' }}>
        <span>{t.riskLow}</span>
        <span>{t.riskMedium}</span>
        <span>{t.riskHigh}</span>
      </div>
    </div>
  )
}

// ── Free Card ──────────────────────────────────────────────────────
function FreeCard({ label, icon, text, delay }: {
  label: string; icon: React.ReactNode; text: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)', padding: 20,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ ...iconBox, color: '#94a3b8' }}>{icon}</div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#64748b' }}>
          {label}
        </span>
      </div>
      <CollapsibleText text={text} />
    </motion.div>
  )
}

// ── Pro Card ───────────────────────────────────────────────────────
function ProCard({ label, icon, text, delay }: {
  label: string; icon: React.ReactNode; text: string; delay: number
}) {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)
  const safeText = text?.trim() || t.proFallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 16, border: '1px solid rgba(245,158,11,0.15)',
        background: 'rgba(245,158,11,0.04)', padding: 20, position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 80, height: 80,
        borderRadius: '50%', filter: 'blur(30px)', background: 'rgba(245,158,11,0.06)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ ...iconBoxAmber, color: '#f59e0b' }}>{icon}</div>
          <span style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(245,158,11,0.7)' }}>
            {label}
          </span>
        </div>
        <span style={{
          fontSize: 9, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
          padding: '2px 8px', borderRadius: 99,
          background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)',
        }}>
          PRO
        </span>
      </div>
      <CollapsibleText text={safeText} />
    </motion.div>
  )
}

// ── Pro Gate Banner ────────────────────────────────────────────────
function ProGateBanner() {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      style={{
        position: 'relative', borderRadius: 16,
        border: '1px solid rgba(245,158,11,0.2)',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, transparent 60%)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 120, height: 120,
        borderRadius: '50%', filter: 'blur(40px)', background: 'rgba(245,158,11,0.05)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', padding: '24px 28px',
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 8,
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" fill="#f59e0b" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#f59e0b' }}>
              {t.proGateBrand}
            </span>
          </div>

          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
            {t.proGateTitle}
          </h4>
          <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.6, maxWidth: 440 }}>
            {t.proGateDesc}
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {t.proGateFeatures.map(f => (
              <span key={f} style={{
                fontSize: 10, fontFamily: 'monospace', padding: '3px 10px', borderRadius: 8,
                border: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.05)',
                color: 'rgba(245,158,11,0.7)',
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <a
          href="/upgrade"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 12,
            fontWeight: 600, fontSize: 14,
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            color: '#000', textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(245,158,11,0.2)',
            flexShrink: 0,
          }}
        >
          {t.proGateCta}
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </motion.div>
  )
}

// ── Intelligence Layer Card (preview / locked) ─────────────────────
function IntelligenceLayerCard({ result, locked }: { result: AnalysisResult; locked: boolean }) {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)
  const [hovered, setHovered] = useState(false)

  const items = [
    { label: t.intelSensitivity,   text: result.intelligenceLayer || t.intelFallback },
    { label: t.intelMarketContext,  text: result.portfolioImpact   || t.intelFallback },
    { label: t.intelRiskTradeoff,  text: result.tradeoffContext    || t.intelFallback },
    { label: t.intelDecisionNote,  text: result.decisionReasoning  || t.intelFallback },
  ]

  return (
    <div style={{
      position: 'relative',
      borderRadius: 16,
      border: '1px solid rgba(245,158,11,0.16)',
      background: 'rgba(245,158,11,0.035)',
      overflow: 'hidden',
    }}>
      <div style={{ 
        padding: 22, 
        filter: locked ? (hovered ? 'blur(1px)' : 'blur(3px)') : undefined, 
        opacity: locked ? (hovered ? 0.6 : 0.4) : 1,
        transition: 'all 0.4s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(245,158,11,0.75)' }}>
            {t.intelligenceLayerLabel}
          </span>
          <span style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(245,158,11,0.75)' }}>
            {t.intelligenceLayerPro}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
          {items.map(item => (
            <div key={item.label} style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: 14 }}>
              <p style={{ margin: '0 0 8px', fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#64748b' }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: '#cbd5e1' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      {locked && (
        <div 
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => window.location.href = '/upgrade'}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 24,
            textAlign: 'center',
            background: hovered 
              ? 'linear-gradient(180deg, rgba(11,13,18,0.1), rgba(11,13,18,0.7) 60%, rgba(11,13,18,0.95))'
              : 'linear-gradient(180deg, rgba(11,13,18,0.3), rgba(11,13,18,0.85) 60%, rgba(11,13,18,0.98))',
            backdropFilter: hovered ? 'blur(0px)' : 'blur(1px)',
            transition: 'all 0.4s ease',
            cursor: 'pointer'
        }}>
          <svg width="20" height="20" fill="none" stroke="rgba(245,158,11,0.8)" strokeWidth="2" viewBox="0 0 24 24" style={{ marginBottom: 4 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <p style={{ margin: 0, maxWidth: 420, fontSize: 13, lineHeight: 1.6, color: '#cbd5e1' }}>{t.intelTeaser}</p>
          <a href="/upgrade" style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', textDecoration: 'none' }}>{t.intelCta}</a>
        </div>
      )}
    </div>
  )
}

// ── SVG Icons ─────────────────────────────────────────────────────
const IconSummary = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3"/></svg>)
const IconRisk = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>)
const IconAwareness = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>)
const IconLayer = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>)
const IconImpact = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>)
const IconTradeoff = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>)
const IconScenario = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>)
const IconDecision = () => (<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>)

// ── Main Component ─────────────────────────────────────────────────
export default function InsightPanel({
  result,
  holdings,
  visible,
  isPro = false,
  confidenceScore,
  quickInsight,
  fullInsight,
  language,
  trust,
}: Props) {
  const { language: lang } = useLanguagePreference()
  const t = getTingAiI18n(lang)

  if (!visible || !result) return null

  const hasProData =
    result.intelligenceLayer ||
    result.portfolioImpact ||
    result.tradeoffContext ||
    result.scenarioContext ||
    result.decisionReasoning

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, textAlign: 'left' }}>
      {quickInsight && fullInsight && trust && (
        <InsightEngineCard
          quickInsight={quickInsight}
          fullInsight={fullInsight}
          language={language}
          trust={trust}
        />
      )}

      {/* ── Risk Card ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '24px 28px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: '#64748b' }}>
              {t.riskSimulation}
            </span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
              {t.portfolioHealth}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
              {t.portfolioHealthSubtitle}
            </p>
          </div>
          <RiskMeter score={result.score} />
        </div>
      </motion.div>

      {/* ── FREE Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <FreeCard label={t.cardPortfolioSummary} icon={<IconSummary />} text={result.insight} delay={0.1} />
        <FreeCard label={t.cardPortfolioImpact}  icon={<IconRisk />}     text={result.risk}    delay={0.2} />
        <FreeCard label={t.cardMarketContext}     icon={<IconAwareness />} text={result.awareness} delay={0.3} />
      </div>

      {/* ── Trust Layer — FREE confidence badge ──────────────────── */}
      {confidenceScore && !isPro && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <ConfidenceBadge score={confidenceScore} isPro={false} />
        </motion.div>
      )}

      {/* ── Allocation Tags ──────────────────────────────────────── */}
      {holdings.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
        >
          {holdings.map(h => (
            <span key={h.ticker} style={{
              padding: '6px 12px', borderRadius: 10, fontSize: 11, fontFamily: 'monospace',
              border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
              color: '#94a3b8',
            }}>
              {h.ticker} <span style={{ color: 'rgba(34,211,238,0.6)', marginLeft: 4 }}>{h.weight.toFixed(0)}%</span>
            </span>
          ))}
        </motion.div>
      )}

      {/* ── PRO Section ───────────────────────────────────────────── */}
      <IntelligenceLayerCard result={result} locked={!isPro} />

      {isPro && hasProData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(245,158,11,0.15)' }} />
            <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(245,158,11,0.6)' }}>
              {t.proDividerLabel}
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(245,158,11,0.15)' }} />
          </div>

          {/* ── Trust Layer — PRO breakdown card ─────────────────── */}
          {confidenceScore && (
            <ConfidenceBadge score={confidenceScore} isPro={true} />
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {result.intelligenceLayer && (
              <ProCard label={t.proIntelligenceLayer} icon={<IconLayer />}    text={result.intelligenceLayer} delay={0.1} />
            )}
            {result.portfolioImpact && (
              <ProCard label={t.proPortfolioImpact}   icon={<IconImpact />}   text={result.portfolioImpact}   delay={0.2} />
            )}
            {result.tradeoffContext && (
              <ProCard label={t.proAllocationTradeoff} icon={<IconTradeoff />} text={result.tradeoffContext}   delay={0.3} />
            )}
            {result.scenarioContext && (
              <ProCard label={t.proMicroScenario}     icon={<IconScenario />} text={result.scenarioContext}   delay={0.4} />
            )}
          </div>

          {result.decisionReasoning && (
            <ProCard label={t.proDecisionContext} icon={<IconDecision />} text={result.decisionReasoning} delay={0.5} />
          )}
        </div>
      ) : (
        <ProGateBanner />
      )}
    </div>
  )
}
