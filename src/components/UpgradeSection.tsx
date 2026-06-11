import { useState } from 'react'

const VALUE_ITEMS = [
  'Tahu posisi lo sekarang → Lagi aman, overexposed, atau terlalu bergantung ke 1 aset',
  'Lihat dampak market ke portofolio lo → Bukan cuma market turun, tapi kena ke lo dimana',
  'Insight yang bisa lo pake mikir → Bukan sinyal, tapi alasan buat ambil keputusan sendiri',
  'Baca risiko sebelum kejadian → Bukan panik setelah harga gerak',
]

const PAIN_ITEMS = [
  'Ngeliat chart tanpa ngerti dampaknya',
  'Ikut sentimen tanpa tahu risiko',
  'Baru sadar salah setelah kejadian',
]

const NOT_ITEMS = ['Grup sinyal', 'Janji profit', 'Suruh buy/sell']
const IS_ITEMS  = ['Alat bantu mikir', 'Biar lo ngerti risiko', 'Biar keputusan lo lebih sadar']

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-500 transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function CollapsibleBlock({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">{label}</span>
        <Chevron open={open} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-5 pt-1">{children}</div>
      </div>
    </div>
  )
}

export default function UpgradeSection() {
  return (
    <section
      id="upgrade-pro"
      className="relative animate-in fade-in duration-1000"
      aria-label="Upgrade ke Ting AI Pro"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(20,184,166,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="border border-white/[0.08] rounded-3xl p-8 md:p-12 space-y-10 bg-white/[0.02]">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="space-y-3 max-w-xl">
          <span className="label-uppercase">Ting AI Pro</span>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
            Upgrade ke Pro – 30rb/bulan
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Bukan buat kasih sinyal. Tapi biar lo ngerti apa yang lagi lo pegang,
            dan risiko sebenarnya.
          </p>
          <p className="text-slate-500 text-xs leading-relaxed">
            Jangan cuma nebak arah market. Lihat dampaknya ke portofolio lo —
            sebelum lo ambil keputusan.
          </p>
        </div>

        {/* ── Value list ─────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
            Yang lo dapet di Pro:
          </p>
          <ul className="space-y-3">
            {VALUE_ITEMS.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-[10px] font-bold"
                >
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Collapsible: pain ──────────────────────────────── */}
        <CollapsibleBlock label="Tanpa ini, lo cuma…">
          <ul className="space-y-2.5">
            {PAIN_ITEMS.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400 leading-relaxed">
                <span aria-hidden="true" className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500/60" />
                {p}
              </li>
            ))}
          </ul>
        </CollapsibleBlock>

        {/* ── Collapsible: differentiation ──────────────────── */}
        <CollapsibleBlock label="Ting AI bukan apa">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">Bukan</p>
              {NOT_ITEMS.map((item, i) => (
                <p key={i} className="flex items-start gap-2 text-sm text-slate-500">
                  <span aria-hidden="true" className="mt-1 flex-shrink-0 text-red-500/60">✕</span>
                  {item}
                </p>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Ting AI adalah</p>
              {IS_ITEMS.map((item, i) => (
                <p key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span aria-hidden="true" className="mt-1 flex-shrink-0 text-teal-500/70">✓</span>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </CollapsibleBlock>

        {/* ── Price + CTA ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">
              30rb
              <span className="text-base font-normal text-slate-500">/bulan</span>
            </p>
            <p className="text-xs text-slate-500">Lebih murah dari 1x salah entry.</p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <a
              href="/upgrade"
              id="upgrade-pro-cta"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm rounded-2xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              Upgrade sekarang
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <p className="text-[11px] text-slate-600">Bisa batal kapan aja</p>
          </div>
        </div>

      </div>
    </section>
  )
}
