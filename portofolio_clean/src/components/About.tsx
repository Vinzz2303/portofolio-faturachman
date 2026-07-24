import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import type { SectionProps } from '../types'
import { useLanguagePreference } from '../utils/language'

/* ── Skill data with real GitHub-like categorization ───── */
const skillRows = [
  {
    category: 'Languages',
    icon: '{ }',
    color: '#58a6ff',
    items: ['TypeScript', 'Python', 'JavaScript', 'SQL', 'Bash']
  },
  {
    category: 'Frameworks',
    icon: '⬡',
    color: '#3fb950',
    items: ['React', 'Next.js', 'FastAPI', 'Express', 'Vite']
  },
  {
    category: 'AI / Data',
    icon: '◈',
    color: '#bc8cff',
    items: ['Gemini Pro', 'LangChain', 'Groq', 'OpenBB', 'Polygon API']
  },
  {
    category: 'Infrastructure',
    icon: '▲',
    color: '#d29922',
    items: ['PM2', 'IIS / VPS', 'MySQL', 'GitHub Actions', 'Redis']
  },
]

/* ── Contribution-heatmap row (visual, decorative) ─────── */
const COLS = 26
const ROWS = 5
function HeatMap() {
  const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
    const r = Math.random()
    const level = r < 0.45 ? 0 : r < 0.6 ? 1 : r < 0.75 ? 2 : r < 0.88 ? 3 : 4
    return level
  })

  const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']

  return (
    <div
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      aria-label="Activity heatmap"
    >
      {cells.map((level, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.3 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: (i % COLS) * 0.015 + Math.floor(i / COLS) * 0.03, duration: 0.3 }}
          className="rounded-sm"
          style={{ background: colors[level], width: '100%', aspectRatio: '1 / 1' }}
          title={`Level ${level}`}
        />
      ))}
    </div>
  )
}

/* ── Skill token ──────────────────────────────────────── */
function SkillToken({ label, color, delay }: { label: string; color: string; delay: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono cursor-default select-none border transition-all duration-200"
      style={{
        borderColor: `${color}30`,
        background: `${color}10`,
        color: `${color}cc`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {label}
    </motion.span>
  )
}

export default function About({ sectionId }: SectionProps) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section
      id={sectionId}
      ref={ref}
      className="py-24 relative overflow-hidden"
    >
      {/* subtle bg grid */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container-saas relative z-10">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span className="text-sm font-semibold text-[#c9d1d9]">Vinzz2303</span>
            <span className="text-[#8b949e]">/</span>
            <span className="text-sm font-semibold text-[#c9d1d9]">skills.json</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {isEn ? 'About & Skill Stack' : 'Tentang & Skill Stack'}
          </h2>
          <p className="text-sm text-white/40 mt-3 max-w-xl leading-relaxed">
            {isEn
              ? 'I focus on building AI-powered products that make complex data accessible. Currently building Ting AI — a market intelligence platform.'
              : 'Fokus membangun produk berbasis AI yang membuat data kompleks mudah dipahami. Saat ini membangun Ting AI — platform intelijen pasar.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* ── Left: Skills ──────────────────────────────── */}
          <div className="space-y-8">
            {skillRows.map((row, ri) => (
              <div key={row.category}>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="font-mono text-sm" style={{ color: row.color }}>{row.icon}</span>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-white/30">{row.category}</span>
                  <div className="flex-1 h-px bg-white/[0.05]" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.items.map((item, ii) => (
                    <SkillToken
                      key={item}
                      label={item}
                      color={row.color}
                      delay={ri * 0.05 + ii * 0.06}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Right: GitHub Contribution Heatmap ──────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="border border-[#30363d] rounded-xl overflow-hidden bg-[#0d1117]"
          >
            {/* Card header */}
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#c9d1d9]">
                {isEn ? 'Contribution activity' : 'Aktivitas kontribusi'}
              </span>
              <span className="text-[10px] font-mono text-[#8b949e]">Last 5 months</span>
            </div>
            <div className="p-4">
              <HeatMap />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-[#8b949e]">Less</span>
                <div className="flex gap-[3px]">
                  {['#161b22','#0e4429','#006d32','#26a641','#39d353'].map(c => (
                    <div key={c} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-[10px] text-[#8b949e]">More</span>
              </div>
            </div>

            {/* Profile strip */}
            <div className="border-t border-[#30363d] px-4 py-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#25d0c3] to-[#4ea8de] flex items-center justify-center text-[10px] font-bold text-[#0b0d12]">FA</div>
              <div>
                <div className="text-xs font-semibold text-[#c9d1d9]">Faturachman Alkahfi</div>
                <div className="text-[10px] text-[#8b949e]">@Vinzz2303 · Building Ting AI</div>
              </div>
              <a
                href="https://github.com/Vinzz2303"
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-[10px] font-mono text-[#58a6ff] hover:underline"
              >
                Follow →
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
