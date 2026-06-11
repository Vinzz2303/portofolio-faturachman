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

          {/* ── RIGHT: Identity Orbit System ──────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center"
          >
            {/* Root container — fixed pixel size for predictable layout */}
            <div className="orbit-root">

              {/* Ambient glow */}
              <div className="orbit-glow" />

              {/* Static decorative rings */}
              <div className="orbit-ring ring-outer" />
              <div className="orbit-ring ring-mid dashed" />
              <div className="orbit-ring ring-inner" />

              {/* HUD axes */}
              <div className="hud-axis hud-h" />
              <div className="hud-axis hud-v" />

              {/* Corner HUD brackets */}
              <div className="hud-corner top-[6%]    left-[6%]    border-t border-l"  />
              <div className="hud-corner top-[6%]    right-[6%]   border-t border-r"  />
              <div className="hud-corner bottom-[6%] left-[6%]    border-b border-l"  />
              <div className="hud-corner bottom-[6%] right-[6%]   border-b border-r"  />

              {/* ── Satellites ───────────────────────────── */}
              {satellites.map((sat) => (
                <div
                  key={sat.label}
                  className="orbit-arm"
                  style={{
                    '--orbit-r':    `${sat.orbitR}%`,
                    '--duration':   `${sat.duration}s`,
                    '--start-deg':  `${sat.startAngle}deg`,
                    '--border-clr': borderMap[sat.color],
                    '--label-clr':  colorMap[sat.color],
                  } as React.CSSProperties}
                >
                  <div className="sat-chip">
                    <div className="sat-label">{sat.label}</div>
                    <div className="sat-status" style={{ color: colorMap[sat.color] }}>{sat.status}</div>
                  </div>
                </div>
              ))}

              {/* ── Central Profile ──────────────────────── */}
              <div className="orbit-center">
                <div className="profile-ring">
                  <img
                    src="/profile.png"
                    alt="Faturachman Alkahfi"
                    className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                  />
                  <div className="profile-overlay" />
                  <div className="scan-beam" />
                </div>
                {/* Pulse rings */}
                <div className="pulse-ring pulse-1" />
                <div className="pulse-ring pulse-2" />
                {/* ID tag */}
                <div className="id-tag">
                  <span>ID: FOUNDER</span>
                </div>
              </div>

              {/* ── Status bar ────────────────────────────── */}
              <div className="status-bar">
                <div className="status-dot" />
                <span className="status-text">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={statusMessages[msgIdx]}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.4 }}
                    >
                      {statusMessages[msgIdx]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* ── All orbit CSS lives here so it's self-contained ── */}
      <style>{`
        /* ── Headline sizing (smaller & balanced) ── */
        .hero-headline {
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        /* ── Root orbit stage ── */
        .orbit-root {
          position: relative;
          width: 420px;
          height: 420px;
        }

        /* Ambient glow */
        .orbit-glow {
          position: absolute;
          inset: 15%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,208,195,0.08) 0%, transparent 70%);
          filter: blur(40px);
          animation: pulse 4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }

        /* Static ring decorations */
        .orbit-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(37,208,195,0.08);
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
        }
        .ring-outer { width: 95%; height: 95%; }
        .ring-mid   { width: 73%; height: 73%; border-color: rgba(78,168,222,0.08); }
        .ring-inner { width: 52%; height: 52%; border-color: rgba(37,208,195,0.06); }
        .dashed     { border-style: dashed; }

        /* HUD crosshairs */
        .hud-axis {
          position: absolute;
          background: linear-gradient(to right, transparent, rgba(37,208,195,0.08), transparent);
          pointer-events: none;
        }
        .hud-h { top:50%; left:0; right:0; height:1px; transform:translateY(-50%); }
        .hud-v { left:50%; top:0; bottom:0; width:1px; transform:translateX(-50%);
                 background: linear-gradient(to bottom, transparent, rgba(37,208,195,0.08), transparent); }

        /* HUD corner brackets */
        .hud-corner {
          position: absolute;
          width: 18px; height: 18px;
          border-color: rgba(37,208,195,0.3) !important;
          border-width: 1.5px;
        }

        /* ── Orbital arm technique ─────────────────────────
           1. Arm is centred on the stage.
           2. It rotates around that centre.
           3. A translateY moves the chip to the orbit edge.
           4. The chip counter-rotates so text stays upright.
        ──────────────────────────────────────────────────── */
        .orbit-arm {
          position: absolute;
          top: 50%; left: 50%;
          width: 0; height: 0;               /* zero-size pivot */
          animation: armSpin var(--duration) linear infinite;
          animation-delay: calc(-1 * var(--duration) * var(--start-deg) / 360deg);
        }
        @keyframes armSpin { to { transform: rotate(360deg); } }

        .sat-chip {
          position: absolute;
          transform: translateY(calc(-1 * var(--orbit-r) * 2.1))  /* move outward along arm */
                     rotate(calc(-1 * 1turn))                       /* keep text upright — overridden by counter-anim */
                     translate(-50%, -50%);
          animation: chipCounter var(--duration) linear infinite;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-clr);
          border-radius: 8px;
          padding: 5px 10px;
          min-width: 88px;
          backdrop-filter: blur(10px);
          white-space: nowrap;
          transition: border-color .3s, background .3s;
          cursor: default;
        }
        .sat-chip:hover {
          background: rgba(255,255,255,0.06);
          border-color: var(--label-clr);
        }
        @keyframes chipCounter { to { transform: translateY(calc(-1 * var(--orbit-r) * 2.1)) rotate(-360deg) translate(-50%,-50%); } }

        .sat-label {
          font-family: monospace;
          font-size: 7px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--label-clr);
          opacity: 0.8;
        }
        .sat-status {
          font-family: monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.85);
          margin-top: 1px;
        }

        /* ── Central profile ── */
        .orbit-center {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 160px; height: 160px;
        }
        .profile-ring {
          width: 100%; height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(37,208,195,0.35);
          box-shadow: 0 0 50px rgba(37,208,195,0.2), inset 0 0 20px rgba(0,0,0,0.4);
          position: relative;
        }
        .profile-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(11,13,18,.65) 0%, transparent 60%);
        }
        .scan-beam {
          position: absolute; top: 0; left: 0;
          width: 100%; height: 2px;
          background: rgba(37,208,195,0.55);
          box-shadow: 0 0 8px rgba(37,208,195,0.9);
          animation: scanDown 2.8s linear infinite;
        }
        @keyframes scanDown { 0%{top:-3%;opacity:.9} 85%{opacity:.9} 100%{top:103%;opacity:0} }

        /* Pulse rings */
        .pulse-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(37,208,195,0.2);
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          pointer-events: none;
        }
        .pulse-1 { width:130%; height:130%; animation: ringPulse 3s ease-out infinite; }
        .pulse-2 { width:160%; height:160%; animation: ringPulse 3s ease-out infinite .8s; }
        @keyframes ringPulse { 0%{opacity:.4;transform:translate(-50%,-50%) scale(.9)} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.15)} }

        /* ID tag */
        .id-tag {
          position: absolute;
          top: -12px; right: -16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(37,208,195,0.3);
          border-radius: 6px;
          padding: 2px 8px;
        }
        .id-tag span { font-family: monospace; font-size: 7px; color: rgba(37,208,195,0.9); letter-spacing: 1px; }

        /* ── Status bar ── */
        .status-bar {
          position: absolute;
          bottom: 8px; left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(37,208,195,0.1);
          border-radius: 99px;
          padding: 6px 16px;
          white-space: nowrap;
          backdrop-filter: blur(10px);
        }
        .status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #25d0c3;
          animation: ping 1.5s cubic-bezier(0,0,.2,1) infinite;
        }
        @keyframes ping { 75%,100%{transform:scale(1.8);opacity:0} }
        .status-text {
          font-family: monospace;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: rgba(37,208,195,0.6);
        }
      `}</style>
    </section>
  )
}
