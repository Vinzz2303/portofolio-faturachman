import type { LanguageCode } from './language'
import { normalizeDisplaySymbol } from './assetNormalization'

export const DECISION_JOURNAL_STORAGE_KEY = 'tingai_decision_journal_v2_3_2'

export type DecisionJournalType = 'watch' | 'add' | 'reduce' | 'hold' | 'avoid' | 'review'

export type DecisionJournalEntry = {
  id: string
  createdAt: string
  updatedAt?: string
  relatedAsset?: string
  decisionType: DecisionJournalType
  reason: string
  riskAwareNote?: string
  reviewAt?: string | null
  linkedRiskBudgetStatus?: string
  linkedWatchItems?: string[]
  mode: 'draft' | 'saved'
}

const validDecisionTypes = new Set<DecisionJournalType>([
  'watch',
  'add',
  'reduce',
  'hold',
  'avoid',
  'review',
])

const cleanText = (value: unknown, max = 300) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

const cleanEntry = (entry: Partial<DecisionJournalEntry>): DecisionJournalEntry | null => {
  const reason = cleanText(entry.reason)
  if (!reason) return null

  return {
    id: cleanText(entry.id, 80) || `journal-${Date.now()}`,
    createdAt: cleanText(entry.createdAt, 40) || new Date().toISOString(),
    updatedAt: cleanText(entry.updatedAt, 40) || undefined,
    relatedAsset: cleanText(entry.relatedAsset, 40) || undefined,
    decisionType: validDecisionTypes.has(entry.decisionType as DecisionJournalType)
      ? (entry.decisionType as DecisionJournalType)
      : 'watch',
    reason,
    riskAwareNote: cleanText(entry.riskAwareNote) || undefined,
    reviewAt: typeof entry.reviewAt === 'string' && entry.reviewAt ? entry.reviewAt : null,
    linkedRiskBudgetStatus: cleanText(entry.linkedRiskBudgetStatus, 80) || undefined,
    linkedWatchItems: Array.isArray(entry.linkedWatchItems)
      ? entry.linkedWatchItems.map((item) => cleanText(item, 220)).filter(Boolean).slice(0, 3)
      : [],
    mode: entry.mode === 'draft' ? 'draft' : 'saved',
  }
}

export const readDecisionJournal = (): DecisionJournalEntry[] => {
  try {
    const raw = window.localStorage.getItem(DECISION_JOURNAL_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => cleanEntry(entry))
      .filter((entry): entry is DecisionJournalEntry => entry !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch {
    return []
  }
}

export const saveDecisionJournal = (entries: DecisionJournalEntry[]) => {
  const cleaned = entries
    .map((entry) => cleanEntry(entry))
    .filter((entry): entry is DecisionJournalEntry => entry !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  window.localStorage.setItem(DECISION_JOURNAL_STORAGE_KEY, JSON.stringify(cleaned))
  window.dispatchEvent(new Event('tingai-decision-journal'))
  return cleaned
}

export const addDecisionJournalEntry = (
  entry: Omit<DecisionJournalEntry, 'id' | 'createdAt' | 'mode'>
) => {
  const now = new Date().toISOString()
  const next: DecisionJournalEntry = {
    ...entry,
    id: `dj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    mode: 'saved',
  }
  return saveDecisionJournal([next, ...readDecisionJournal()])
}

export const decisionTypeLabel = (type: DecisionJournalType, language: LanguageCode) => {
  const labels: Record<DecisionJournalType, Record<LanguageCode, string>> = {
    watch: { id: 'Pantau dulu', en: 'Watch first' },
    add: { id: 'Tambah posisi', en: 'Add position' },
    reduce: { id: 'Kurangi posisi', en: 'Reduce position' },
    hold: { id: 'Tahan posisi', en: 'Hold position' },
    avoid: { id: 'Hindari dulu', en: 'Avoid for now' },
    review: { id: 'Review ulang', en: 'Review again' },
  }
  return labels[type]?.[language] || labels.watch[language]
}

export const formatDecisionJournalForCopilot = (
  entries: DecisionJournalEntry[],
  language: LanguageCode,
  maxEntries = 5
) => {
  const visible = entries.slice(0, maxEntries)
  if (!visible.length) return ''

  const prefix = language === 'en' ? 'Decision journal' : 'Jurnal keputusan'
  const guard =
    language === 'en'
      ? 'Use this only to reflect the user reasoning. Do not turn it into buy/sell instructions.'
      : 'Gunakan ini hanya untuk merefleksikan alasan user. Jangan ubah menjadi instruksi beli/jual.'

  return `${prefix}: ${visible
    .map((entry) => {
      const asset = entry.relatedAsset ? `${normalizeDisplaySymbol(entry.relatedAsset)} ` : ''
      const review = entry.reviewAt ? ` review ${entry.reviewAt}` : ''
      return `${asset}${decisionTypeLabel(entry.decisionType, language)} - ${entry.reason}${entry.riskAwareNote ? ` Risiko: ${entry.riskAwareNote}` : ''}${review}`
    })
    .join(' | ')}. ${guard}`
}
