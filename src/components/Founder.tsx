import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

const highlights = [
  { label: "AI Product Builder", emoji: "🧠" },
  { label: "Full Stack Developer", emoji: "⚡" },
  { label: "Open Source Contributor", emoji: "🌐" },
  { label: "React + FastAPI", emoji: "⚛️" },
  { label: "TypeScript · Python", emoji: "📦" },
  { label: "Market Intelligence", emoji: "📊" },
]

/* ── Tilt Card with 3D perspective ──────────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function Founder() {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Ambient gradient bg */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #25d0c315, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #a78bfa15, transparent 70%)' }} />

      <div className="container-saas relative z-10">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">

          {/* ── Left: Photo with 3D tilt ─────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <TiltCard className="relative max-w-md mx-auto">
              {/* Glowing border ring */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-[#25d0c3]/30 via-transparent to-[#a78bfa]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative rounded-2xl overflow-hidden group cursor-crosshair">
                <img
                  src="/profile.png"
                  alt="Faturachman Alkahfi"
                  className="w-full aspect-[4/5] object-cover transition-all duration-700 group-hover:scale-[1.03] grayscale group-hover:grayscale-0"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/40 to-transparent" />

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#25d0c3] animate-pulse" />
                    <span className="text-[10px] font-mono text-[#25d0c3]/70 tracking-widest uppercase">Available for work</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Faturachman Alkahfi</h3>
                  <p className="text-xs text-white/40 font-mono mt-1">Informatika · UMN '26</p>
                </div>

                {/* Floating scan line */}
                <motion.div
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#25d0c3]/40 to-transparent"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
                />
              </div>
            </TiltCard>
          </motion.div>

          {/* ── Right: Bio + Skill Tokens ────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div>
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-xs font-mono text-[#25d0c3]/60 tracking-widest uppercase"
              >
                {isEn ? 'About The Builder' : 'Tentang Pembangun'}
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight leading-[1.1]">
                {isEn ? (
                  <>Crafting systems that<br /><span className="bg-gradient-to-r from-[#25d0c3] to-[#4ea8de] bg-clip-text text-transparent">think with you.</span></>
                ) : (
                  <>Membangun sistem yang<br /><span className="bg-gradient-to-r from-[#25d0c3] to-[#4ea8de] bg-clip-text text-transparent">berpikir bersama Anda.</span></>
                )}
              </h2>
            </div>

            <p className="text-base text-white/50 leading-relaxed max-w-lg">
              {isEn
                ? "I build AI-driven products from zero to production — from database schemas to pixel-perfect interfaces. Currently shipping Ting AI, an intelligence layer for retail investors, while contributing to open source in PCB design, MCP platforms, and algorithmic tooling."
                : "Saya membangun produk berbasis AI dari nol hingga produksi — dari skema database hingga interface pixel-perfect. Saat ini mengembangkan Ting AI, lapisan kecerdasan untuk investor ritel, sambil berkontribusi ke open source di PCB design, platform MCP, dan algorithmic tooling."}
            </p>

            {/* Skill tokens - interactive */}
            <div className="flex flex-wrap gap-2.5">
              {highlights.map((h, i) => (
                <motion.div
                  key={h.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  whileHover={{ scale: 1.06, y: -3 }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-mono cursor-default select-none
                    border transition-all duration-300 backdrop-blur-sm
                    ${hovered === i
                      ? 'border-[#25d0c3]/40 bg-[#25d0c3]/10 text-[#25d0c3] shadow-lg shadow-[#25d0c3]/10'
                      : 'border-white/[0.08] bg-white/[0.02] text-white/50 hover:text-white/70'
                    }
                  `}
                >
                  <span className="mr-1.5">{h.emoji}</span>
                  {h.label}
                </motion.div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="flex gap-8 pt-4 border-t border-white/[0.06]">
              {[
                { val: '3+', label: isEn ? 'Products Built' : 'Produk Dibangun' },
                { val: '5+', label: isEn ? 'OSS PRs Merged' : 'PR Open Source' },
                { val: '2+', label: isEn ? 'Years Building' : 'Tahun Membangun' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-2xl font-black text-white">{s.val}</div>
                  <div className="text-[10px] font-mono text-white/25 uppercase tracking-wider mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
