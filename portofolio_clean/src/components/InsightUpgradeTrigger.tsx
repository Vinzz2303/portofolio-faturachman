import { Link } from 'react-router-dom'

// Keywords yang trigger risk warning
const RISK_KEYWORDS = [
  'terlalu bergantung', 'bergantung ke 1 aset', 'sensitif', 'tekanan',
  'volatilitas', 'volatil', 'risiko', 'terkonsentrasi', 'konsentrasi',
  'rentan', 'exposure', 'drawdown', 'turun',
]

const hasRiskSignal = (text: string): boolean => {
  const lower = text.toLowerCase()
  return RISK_KEYWORDS.some(kw => lower.includes(kw))
}

// ── Risk Trigger ─────────────────────────────────────────────────────────────
export function RiskTrigger({ userPlan }: { userPlan?: string }) {
  if (userPlan && userPlan !== 'free') return null
  return (
    <div
      className="mt-4 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      style={{
        background: 'rgba(239,68,68,0.04)',
        border: '1px solid rgba(239,68,68,0.12)',
      }}
    >
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-slate-300">
          ⚠️ Dampaknya bisa lebih besar dari yang kelihatan
        </p>
        <p className="text-xs text-slate-500">Lihat penjelasan lengkapnya di Pro</p>
      </div>
      <Link
        to="/upgrade"
        className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors whitespace-nowrap flex-shrink-0"
      >
        Buka analisis penuh →
      </Link>
    </div>
  )
}

// ── Partial Lock ─────────────────────────────────────────────────────────────
export function PartialInsightLock({
  fullText,
  userPlan,
}: {
  fullText: string
  userPlan?: string
}) {
  if (userPlan && userPlan !== 'free') {
    return <p className="body-text text-slate-400 italic leading-relaxed">"{fullText}"</p>
  }

  // Potong setelah kalimat pertama (split di titik/seru/tanda tanya)
  const sentences = fullText.split(/(?<=[.!?])\s+/)
  const visible  = sentences.slice(0, 2).join(' ')
  const locked   = sentences.slice(2).join(' ')
  const hasMore  = locked.trim().length > 0

  return (
    <div className="space-y-2">
      <p className="body-text text-slate-400 italic leading-relaxed">"{visible}"</p>
      {hasMore && (
        <div className="relative overflow-hidden rounded-lg">
          {/* Blurred continuation */}
          <p
            className="body-text text-slate-400 italic leading-relaxed select-none"
            style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {locked}
          </p>
          {/* Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-4"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(11,13,18,0.85))' }}
          >
            <span className="text-xs text-slate-500">(lanjutan dikunci)</span>
            <Link
              to="/upgrade"
              className="text-xs font-semibold px-4 py-1.5 rounded-lg border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-all"
            >
              Buka versi lengkap
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Decision Trigger ──────────────────────────────────────────────────────────
export function DecisionTrigger({ userPlan }: { userPlan?: string }) {
  if (userPlan && userPlan !== 'free') return null
  return (
    <div
      className="mt-5 pt-5"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
          Sebelum lo ambil keputusan, pahami dulu trade-off nya
        </p>
        <Link
          to="/upgrade"
          className="text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors whitespace-nowrap"
        >
          Lihat skenario lengkap →
        </Link>
      </div>
    </div>
  )
}

// ── Composite: Insight with all triggers ────────────────────────────────────
export function InsightWithTriggers({
  insightText,
  userPlan,
}: {
  insightText: string
  userPlan?: string
}) {
  const showRisk = hasRiskSignal(insightText)
  const isPremium = userPlan && userPlan !== 'free'

  return (
    <div>
      <PartialInsightLock fullText={insightText} userPlan={userPlan} />
      {!isPremium && showRisk && <RiskTrigger userPlan={userPlan} />}
      {!isPremium && <DecisionTrigger userPlan={userPlan} />}
    </div>
  )
}
