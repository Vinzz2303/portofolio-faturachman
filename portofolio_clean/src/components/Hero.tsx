import React, { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguagePreference } from '../utils/language'

const Hero3D = lazy(() => import('./Hero3D'))

const statusMessages = [
  "BUILDING_TING_AI...",
  "OPEN_SOURCE_CONTRIBUTOR",
  "FULL_STACK_DEVELOPER",
  "AI_SYSTEMS_ARCHITECT",
  "SHIPPING_TO_PRODUCTION",
]

const statItems = [
  { value: "3+", label: "Shipped Products" },
  { value: "5+", label: "OSS Contributions" },
  { value: "2026", label: "Active" },
]

export default function Hero({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()
  const navigate = useNavigate()
  const [msgIdx, setMsgIdx] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % statusMessages.length), 3200)
    setMounted(true)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      id={sectionId}
      className="relative min-h-screen flex flex-col justify-center pt-24 overflow-hidden"
    >
      {/* ── 3D Canvas Background ────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {mounted && (
          <Suspense fallback={null}>
            <Hero3D />
          </Suspense>
        )}
        {/* Gradient fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0d12] to-transparent" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(37,208,195,0.04)_0%,transparent_70%)]" />
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div className="container-saas relative z-10">
        <div className="max-w-2xl">
          
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#25d0c3]/20 bg-[#25d0c3]/5 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#25d0c3] animate-pulse" />
            <AnimatePresence mode="wait">
              <motion.span
                key={statusMessages[msgIdx]}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] font-mono tracking-[0.2em] text-[#25d0c3]/80 uppercase"
              >
                {statusMessages[msgIdx]}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.02] text-white mb-6"
          >
            {language === 'en' ? (
              <>
                I build<br />
                <span className="bg-gradient-to-r from-[#25d0c3] via-[#4ea8de] to-[#a78bfa] bg-clip-text text-transparent">
                  intelligence
                </span>
                <br />into products.
              </>
            ) : (
              <>
                Membangun<br />
                <span className="bg-gradient-to-r from-[#25d0c3] via-[#4ea8de] to-[#a78bfa] bg-clip-text text-transparent">
                  kecerdasan
                </span>
                <br />ke dalam produk.
              </>
            )}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-white/45 max-w-lg leading-relaxed mb-10"
          >
            {language === 'en'
              ? 'Full stack developer & AI systems builder. Creator of Ting AI — a market intelligence platform for retail investors.'
              : 'Full stack developer & pembangun sistem AI. Pencipta Ting AI — platform intelijen pasar untuk investor ritel.'}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-3 mb-16"
          >
            <button
              type="button"
              onClick={() => navigate('/ting-ai')}
              className="group relative px-7 py-3 bg-[#25d0c3] text-[#0b0d12] font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.03] shadow-lg shadow-[#25d0c3]/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                {language === 'en' ? 'Explore Ting AI' : 'Jelajahi Ting AI'}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </button>
            <a
              href="#projects"
              className="px-7 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/25 hover:bg-white/5 transition-all font-semibold backdrop-blur-sm"
            >
              {language === 'en' ? 'View Work' : 'Lihat Karya'}
            </a>
            <a
              href="https://github.com/Vinzz2303"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-8 border-t border-white/[0.06] pt-8"
          >
            {statItems.map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
        />
      </motion.div>
    </section>
  )
}
