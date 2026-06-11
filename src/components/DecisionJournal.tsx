import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LanguageCode } from '../utils/language'
import type { NormalizedPortfolioSnapshot } from '../utils/portfolioSnapshot'
import type { PortfolioActionWatchlistItem } from '../utils/portfolioActionWatchlist'
import type { RiskBudgetEvaluation } from '../utils/riskBudget'
import { getAssetTypeLabel, inferAssetTypeFromInput, normalizeDisplaySymbol } from '../utils/assetNormalization'
import {
  addDecisionJournalEntry,
  decisionTypeLabel,
  readDecisionJournal,
  type DecisionJournalEntry,
  type DecisionJournalType,
} from '../utils/decisionJournal'

type Props = {
  snapshot: NormalizedPortfolioSnapshot
  language: LanguageCode
  isPro: boolean
  riskBudgetEvaluation?: RiskBudgetEvaluation
  watchlistItems?: PortfolioActionWatchlistItem[]
  compact?: boolean
}

const reviewOptions = ['tomorrow', '3days', 'next_week', 'custom', 'none'] as const

const copy = {
  id: {
    title: 'Jurnal Keputusan',
    subtitle: 'Catat alasan sebelum mengambil keputusan agar kamu tidak hanya bereaksi pada market.',
    cta: 'Tulis catatan',
    close: 'Tutup',
    emptyTitle: 'Belum ada catatan keputusan',
    emptyBody: 'Mulai dari satu kalimat: apa yang sedang kamu pertimbangkan, dan risikonya apa?',
    asset: 'Aset terkait',
    assetPlaceholder: 'Contoh: XAU, BBCA, BTC',
    decision: 'Keputusan yang dipertimbangkan',
    reason: 'Alasan',
    reasonPlaceholder: 'Contoh: Saya ingin pantau XAU karena bobotnya paling besar di portofolio.',
    risk: 'Risiko yang disadari',
    riskPlaceholder: 'Contoh: Jika XAU bergerak tajam, portofolio saya ikut sangat terpengaruh.',
    review: 'Review lagi',
    customDate: 'Tanggal custom',
    save: 'Simpan catatan',
    required: 'Alasan wajib diisi.',
    limit: 'Akun Free bisa membuat sampai 3 catatan keputusan lokal.',
    upgrade: 'Gunakan Ting AI Pro untuk menyimpan lebih banyak catatan keputusan.',
    riskWarning: 'Catatan: aset ini sedang melewati batas risk budget kamu. Ini bukan berarti harus jual/beli, tapi perlu kamu sadari sebelum mengambil keputusan.',
    watchWarning: 'Aset ini masuk pantauan pribadi karena:',
    noAsset: 'Tidak dikaitkan ke aset tertentu',
    created: 'Dibuat',
    reviewAt: 'Review',
    options: {
      tomorrow: 'Besok',
      '3days': '3 hari lagi',
      next_week: 'Minggu depan',
      custom: 'Custom date',
      none: 'Tidak ditentukan',
    },
  },
  en: {
    title: 'Decision Journal',
    subtitle: 'Write down your reason before making a decision, so you are not only reacting to the market.',
    cta: 'Write note',
    close: 'Close',
    emptyTitle: 'No decision notes yet',
    emptyBody: 'Start with one sentence: what are you considering, and what is the risk?',
    asset: 'Related asset',
    assetPlaceholder: 'Example: XAU, BBCA, BTC',
    decision: 'Decision being considered',
    reason: 'Reason',
    reasonPlaceholder: 'Example: I want to watch XAU because it has the largest weight in my portfolio.',
    risk: 'Risk I am aware of',
    riskPlaceholder: 'Example: If XAU moves sharply, my portfolio will be strongly affected.',
    review: 'Review again',
    customDate: 'Custom date',
    save: 'Save note',
    required: 'Reason is required.',
    limit: 'Free accounts can create up to 3 local decision notes.',
    upgrade: 'Use Ting AI Pro to save more decision notes.',
    riskWarning: 'Note: this asset is currently above your risk budget. This does not mean you must buy/sell, but you should be aware of it before deciding.',
    watchWarning: 'This asset is in your personal watchlist because:',
    noAsset: 'Not linked to a specific asset',
    created: 'Created',
    reviewAt: 'Review',
    options: {
      tomorrow: 'Tomorrow',
      '3days': 'In 3 days',
      next_week: 'Next week',
      custom: 'Custom date',
      none: 'Not set',
    },
  },
} as const

const decisionTypes: DecisionJournalType[] = ['watch', 'add', 'reduce', 'hold', 'avoid', 'review']

const addDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const reviewDateFromOption = (option: typeof reviewOptions[number], customDate: string) => {
  if (option === 'tomorrow') return addDays(1)
  if (option === '3days') return addDays(3)
  if (option === 'next_week') return addDays(7)
  if (option === 'custom') return customDate || null
  return null
}

const formatDate = (raw?: string | null, language: LanguageCode = 'id') => {
  if (!raw) return '-'
  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return raw
  return parsed.toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const badgeClass = (type: DecisionJournalType) => {
  if (type === 'add') return 'border-teal-500/20 bg-teal-500/10 text-teal-300'
  if (type === 'reduce' || type === 'avoid') return 'border-amber-500/20 bg-amber-500/10 text-amber-300'
  if (type === 'review') return 'border-sky-500/20 bg-sky-500/10 text-sky-300'
  return 'border-white/10 bg-white/[0.04] text-slate-300'
}

export default function DecisionJournal({
  snapshot,
  language,
  isPro,
  riskBudgetEvaluation,
  watchlistItems = [],
  compact = false,
}: Props) {
  const t = copy[language] || copy.id
  const [entries, setEntries] = useState<DecisionJournalEntry[]>(() => readDecisionJournal())
  const [open, setOpen] = useState(false)
  const [relatedAsset, setRelatedAsset] = useState('')
  const [manualAsset, setManualAsset] = useState('')
  const [decisionType, setDecisionType] = useState<DecisionJournalType>('watch')
  const [reason, setReason] = useState('')
  const [riskAwareNote, setRiskAwareNote] = useState('')
  const [reviewOption, setReviewOption] = useState<typeof reviewOptions[number]>('none')
  const [customDate, setCustomDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const sync = () => setEntries(readDecisionJournal())
    window.addEventListener('tingai-decision-journal', sync)
    return () => window.removeEventListener('tingai-decision-journal', sync)
  }, [])

  const holdings = snapshot.holdings || []
  const hasHoldings = holdings.length > 0
  const selectedAsset = hasHoldings ? relatedAsset : manualAsset.trim()
  const normalizedSelected = selectedAsset.toUpperCase()
  const selectedAssetType = inferAssetTypeFromInput(selectedAsset)
  const isFreeLimitReached = !isPro && entries.length >= 3
  const visibleEntries = entries.slice(0, isPro ? 5 : compact ? 1 : 2)

  const selectedRiskBreach = useMemo(() => {
    if (!normalizedSelected || !riskBudgetEvaluation?.breaches?.length) return null
    const selectedHolding = holdings.find((holding) => holding.symbol.toUpperCase() === normalizedSelected)
    if (!selectedHolding) return null
    const assetType = (selectedHolding.assetType || '').toLowerCase()
    return riskBudgetEvaluation.breaches.find((breach) => {
      const label = breach.label.toLowerCase()
      if (breach.type === 'single_asset' && selectedHolding.allocationPercent > breach.limitPercent) return true
      if (assetType.includes('crypto') && label.includes('crypto')) return true
      if ((assetType.includes('gold') || normalizedSelected.includes('XAU')) && (label.includes('emas') || label.includes('gold') || label.includes('xau'))) return true
      if ((selectedHolding.exchange === 'IDX' || normalizedSelected.endsWith('.JK')) && (label.includes('indonesia') || label.includes('saham'))) return true
      return false
    }) || null
  }, [holdings, normalizedSelected, riskBudgetEvaluation])

  const selectedWatchItem = useMemo(() => {
    if (!normalizedSelected) return null
    return watchlistItems.find((item) => item.symbol.toUpperCase() === normalizedSelected) || null
  }, [normalizedSelected, watchlistItems])

  const resetForm = () => {
    setRelatedAsset('')
    setManualAsset('')
    setDecisionType('watch')
    setReason('')
    setRiskAwareNote('')
    setReviewOption('none')
    setCustomDate('')
    setError('')
  }

  const handleSave = () => {
    const cleanedReason = reason.trim()
    if (!cleanedReason) {
      setError(t.required)
      return
    }
    if (isFreeLimitReached) {
      setError(t.limit)
      return
    }

    const nextEntries = addDecisionJournalEntry({
      relatedAsset: selectedAsset ? normalizeDisplaySymbol(selectedAsset) : undefined,
      decisionType,
      reason: cleanedReason.slice(0, 300),
      riskAwareNote: riskAwareNote.trim().slice(0, 300) || undefined,
      reviewAt: reviewDateFromOption(reviewOption, customDate),
      linkedRiskBudgetStatus: selectedRiskBreach ? riskBudgetEvaluation?.status : undefined,
      linkedWatchItems: selectedWatchItem ? [selectedWatchItem.reason, selectedWatchItem.whatToWatch] : [],
    })
    setEntries(nextEntries)
    resetForm()
    setOpen(false)
  }

  return (
    <section className={compact ? 'space-y-3' : 'space-y-5'}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="label-uppercase text-[10px]">{t.title}</span>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{t.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((value) => !value)
            setError('')
          }}
          disabled={isFreeLimitReached && !open}
          className="self-start rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {open ? t.close : t.cta}
        </button>
      </div>

      {open && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{t.asset}</span>
              {hasHoldings ? (
                <select
                  value={relatedAsset}
                  onChange={(event) => setRelatedAsset(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080a0f] px-3 py-2.5 text-sm text-slate-200 outline-none"
                >
                  <option value="">{t.noAsset}</option>
                  {holdings.map((holding) => (
                    <option key={holding.symbol} value={holding.symbol}>
                      {normalizeDisplaySymbol(holding.symbol)} - {getAssetTypeLabel(holding.assetType || inferAssetTypeFromInput(holding.symbol), language)} - {(holding.name || normalizeDisplaySymbol(holding.symbol)).slice(0, 40)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={manualAsset}
                  onChange={(event) => setManualAsset(event.target.value.slice(0, 40))}
                  placeholder={t.assetPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-[#080a0f] px-3 py-2.5 text-sm text-slate-200 outline-none"
                />
              )}
              {selectedAsset && (
                <span className="block text-[10px] font-mono text-slate-600">
                  {normalizeDisplaySymbol(selectedAsset)} - {getAssetTypeLabel(selectedAssetType, language)}
                </span>
              )}
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{t.decision}</span>
              <select
                value={decisionType}
                onChange={(event) => setDecisionType(event.target.value as DecisionJournalType)}
                className="w-full rounded-xl border border-white/10 bg-[#080a0f] px-3 py-2.5 text-sm text-slate-200 outline-none"
              >
                {decisionTypes.map((type) => (
                  <option key={type} value={type}>{decisionTypeLabel(type, language)}</option>
                ))}
              </select>
            </label>
          </div>

          {selectedRiskBreach && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs text-amber-200 leading-relaxed">
              {t.riskWarning}
            </div>
          )}

          {selectedWatchItem && (
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.05] p-3 text-xs text-teal-100 leading-relaxed">
              <span className="font-semibold">{t.watchWarning}</span> {selectedWatchItem.reason}
            </div>
          )}

          <label className="space-y-1.5 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{t.reason}</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value.slice(0, 300))}
              placeholder={t.reasonPlaceholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#080a0f] px-3 py-2.5 text-sm text-slate-200 outline-none"
            />
            <span className="block text-right text-[10px] font-mono text-slate-700">{reason.length}/300</span>
          </label>

          <label className="space-y-1.5 block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{t.risk}</span>
            <textarea
              value={riskAwareNote}
              onChange={(event) => setRiskAwareNote(event.target.value.slice(0, 300))}
              placeholder={t.riskPlaceholder}
              rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#080a0f] px-3 py-2.5 text-sm text-slate-200 outline-none"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{t.review}</span>
              <select
                value={reviewOption}
                onChange={(event) => setReviewOption(event.target.value as typeof reviewOptions[number])}
                className="w-full rounded-xl border border-white/10 bg-[#080a0f] px-3 py-2.5 text-sm text-slate-200 outline-none"
              >
                {reviewOptions.map((option) => (
                  <option key={option} value={option}>{t.options[option]}</option>
                ))}
              </select>
            </label>
            {reviewOption === 'custom' && (
              <label className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{t.customDate}</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(event) => setCustomDate(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080a0f] px-3 py-2.5 text-sm text-slate-200 outline-none"
                />
              </label>
            )}
          </div>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-teal-400 px-4 py-2 text-xs font-bold text-black hover:bg-teal-300"
          >
            {t.save}
          </button>
        </div>
      )}

      {!visibleEntries.length ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5">
          <p className="text-sm font-medium text-slate-300">{t.emptyTitle}</p>
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-md">{t.emptyBody}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visibleEntries.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className={`rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${badgeClass(entry.decisionType)}`}>
                  {decisionTypeLabel(entry.decisionType, language)}
                </span>
                <span className="text-[10px] font-mono text-slate-600">{entry.relatedAsset ? normalizeDisplaySymbol(entry.relatedAsset) : t.noAsset}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{entry.reason}</p>
              {entry.riskAwareNote && (
                <p className="rounded-xl border border-white/[0.05] bg-black/10 p-3 text-xs text-slate-400 leading-relaxed">
                  {entry.riskAwareNote}
                </p>
              )}
              <div className="flex flex-wrap gap-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                <span>{t.created}: {formatDate(entry.createdAt, language)}</span>
                {entry.reviewAt && <span>{t.reviewAt}: {formatDate(entry.reviewAt, language)}</span>}
              </div>
            </article>
          ))}
        </div>
      )}

      {!isPro && (
        <Link to="/upgrade" className="inline-flex text-xs font-semibold text-amber-400 hover:text-amber-300">
          {t.upgrade} &rarr;
        </Link>
      )}
    </section>
  )
}
