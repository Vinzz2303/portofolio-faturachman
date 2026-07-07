import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguagePreference } from '../utils/language'

const statusMessages = [
  "HUMAN_NODE_CONNECTED",
  "ANALYZING_PORTFOLIO_RISK...",
  "DETECTING_MARKET_NARRATIVES...",
  "SYSTEM_OPTIMIZED_BY_FATUR",
  "NEURAL_SYNC_COMPLETE",
]

/* ─── Orbital data ─────────────────────────────────────────────
   Each satellite lives inside a wrapper that rotates around the
   centre. The wrapper starts at the centre, is offset upward by
   `orbitR` (radius), and the satellite counter-rotates so its
   label always faces the reader.
   Different `startAngle` values spread them evenly.
─────────────────────────────────────────────────────────────── */
const satellites = [
  { label: "RISK_ENGINE",    status: "STABLE",   color: "accent",  orbitR: 46, duration: 22, startAngle: 0   },
  { label: "PORTFOLIO",      status: "SYNCED",   color: "accent",  orbitR: 46, duration: 22, startAngle: 120 },
  { label: "MACRO_SYNC",     status: "PARSING",  color: "accent",  orbitR: 46, duration: 22, startAngle: 240 },
  { label: "SENTIMENT_AI",   status: "ACTIVE",   color: "purple",  orbitR: 33, duration: 16, startAngle: 60  },
  { label: "REASONING",      status: "READY",    color: "blue",    orbitR: 33, duration: 16, startAngle: 240 },
]

const colorMap: Record<string, string> = {
  accent: "rgba(37,208,195,0.9)",
  purple: "rgba(192,132,252,0.9)",
  blue:   "rgba(96,165,250,0.9)",
}
const borderMap: Record<string, string> = {
  accent: "rgba(37,208,195,0.25)",
  purple: "rgba(192,132,252,0.2)",
  blue:   "rgba(96,165,250,0.2)",
}

export default function Hero({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()
  const navigate = useNavigate()
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % statusMessages.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <section id={sectionId} className="relative min-h-screen flex flex-col justify-center pt-20 overflow-hidden">
      <div className="container-saas relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">

          {/* ── LEFT: Copy ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="will-change-transform"
          >
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 glass-card text-accent rounded-full border border-accent/10 bg-accent/5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="panel-label tracking-widest">
                {language === 'en' ? 'AI SYSTEM ARCHITECT' : 'ARSITEK SISTEM AI'}
              </span>
            </div>

            {/* Headline — moderate size, max 2-3 lines */}
            <h1 className="hero-headline text-gradient mb-6 leading-[1.05]">
              {language === 'en'
                ? <>Building <br /> Intelligence Layer <br /> for Decision Making</>
                : <>Membangun Lapisan <br /> Kecerdasan untuk <br /> Pengambilan Keputusan</>}
            </h1>

            {/* Sub */}
            <p className="text-base md:text-lg text-white/50 max-w-xl mb-10 leading-relaxed">
              {language === 'en'
                ? 'I build AI-powered systems that transform raw data into risk-aware insights — enabling deeper clarity before every decision.'
                : 'Saya membangun sistem berbasis AI yang mengubah data mentah menjadi wawasan sadar risiko — memungkinkan kejelasan yang lebih dalam sebelum setiap keputusan.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={() => navigate('/explore-intelligence')} className="relative overflow-hidden px-8 py-3.5 bg-accent text-dark font-bold rounded-xl hover:scale-105 transition-all shadow-xl shadow-accent/10 group">
                <span className="relative z-10">{language === 'en' ? 'Explore Ting AI' : 'Jelajahi Ting AI'}</span>
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              </button>
              <a href="#contact" className="px-8 py-3.5 glass-card hover:bg-white/5 transition-colors font-semibold border-white/10">
                {language === 'en' ? 'Contact Founder' : 'Hubungi Founder'}
              </a>
            </div>
          </motion.div>

          {/* ── RIGHT: Developer Terminal ──────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="hidden lg:flex items-center justify-center w-full"
          >
            <div className="w-full max-w-lg rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363d] shadow-2xl font-mono text-sm">
              <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 text-[#8b949e] text-xs">bash - faturachman</span>
              </div>
              <div className="p-5 text-[#c9d1d9] leading-[1.7] h-[340px] flex flex-col justify-end relative">
                <div className="absolute top-5 left-5 right-5 bottom-5 overflow-hidden">
                  <div className="terminal-typing-sequence">
                    <p><span className="text-[#3fb950]">➜</span> <span className="text-[#79c0ff]">~</span> git clone https://github.com/Vinzz2303/ting-ai.git</p>
                    <p className="text-[#8b949e]">Cloning into 'ting-ai'...</p>
                    <p className="text-[#8b949e]">remote: Enumerating objects: 823, done.</p>
                    <p className="text-[#8b949e]">Receiving objects: 100% (823/823), 19.06 MiB | 17.34 MiB/s, done.</p>
                    <br/>
                    <p className="delay-1"><span className="text-[#3fb950]">➜</span> <span className="text-[#79c0ff]">ting-ai</span> <span className="text-[#a5d6ff]">git:(</span><span className="text-[#ff7b72]">main</span><span className="text-[#a5d6ff]">)</span> npm install && npm run build</p>
                    <p className="text-[#8b949e] delay-2">[pm2] Installing dependencies...</p>
                    <p className="text-[#3fb950] delay-3">✓ Compiled successfully in 34.4s</p>
                    <p className="text-[#3fb950] delay-4">✓ AI Models & Risk Engine Connected</p>
                    <br/>
                    <p className="delay-5"><span className="text-[#3fb950]">➜</span> <span className="text-[#79c0ff]">ting-ai</span> <span className="text-[#a5d6ff]">git:(</span><span className="text-[#ff7b72]">main</span><span className="text-[#a5d6ff]">)</span> ./deploy.sh</p>
                    <p className="text-[#d2a8ff] delay-6">Deploying to production (faturachman.my.id) 🚀</p>
                    <p className="animate-pulse delay-6 mt-1 text-[#3fb950]">_</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        /* ── Headline sizing ── */
        .hero-headline {
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        /* ── Terminal Animation Sequence ── */
        .terminal-typing-sequence p {
          opacity: 0;
          animation: terminalFadeIn 0.1s forwards;
        }
        
        /* Staggered delays to simulate typing/processing */
        .terminal-typing-sequence p:nth-child(1) { animation-delay: 0.5s; }
        .terminal-typing-sequence p:nth-child(2) { animation-delay: 1.2s; }
        .terminal-typing-sequence p:nth-child(3) { animation-delay: 1.6s; }
        .terminal-typing-sequence p:nth-child(4) { animation-delay: 2.0s; }
        
        .terminal-typing-sequence .delay-1 { animation-delay: 3.0s; }
        .terminal-typing-sequence .delay-2 { animation-delay: 3.5s; }
        .terminal-typing-sequence .delay-3 { animation-delay: 5.0s; }
        .terminal-typing-sequence .delay-4 { animation-delay: 5.3s; }
        
        .terminal-typing-sequence .delay-5 { animation-delay: 6.5s; }
        .terminal-typing-sequence .delay-6 { animation-delay: 7.0s; }

        @keyframes terminalFadeIn {
          to { opacity: 1; }
        }
      `}</style>
    </section>
  )
}
