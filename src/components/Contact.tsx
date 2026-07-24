import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'
import { Mail, Briefcase, Code2, Globe } from 'lucide-react'

const contactItems = [
  {
    label: "Email",
    value: "faturachmanalkahfi7@gmail.com",
    href: "mailto:faturachmanalkahfi7@gmail.com",
    icon: <Mail size={28} strokeWidth={1.5} />,
    color: "#25d0c3"
  },
  {
    label: "LinkedIn",
    value: "faturachman-al-kahfi-662283304",
    href: "https://www.linkedin.com/in/faturachman-al-kahfi-662283304/",
    icon: <Briefcase size={28} strokeWidth={1.5} />,
    color: "#4ea8de"
  },
  {
    label: "GitHub",
    value: "@Vinzz2303",
    href: "https://github.com/Vinzz2303",
    icon: <Code2 size={28} strokeWidth={1.5} />,
    color: "#a78bfa"
  },
  {
    label: "Portfolio",
    value: "faturachman.my.id",
    href: "https://faturachman.my.id",
    icon: <Globe size={28} strokeWidth={1.5} />,
    color: "#d6b15d"
  }
]

export default function Contact({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section id={sectionId} className="py-32 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #25d0c315, transparent 70%)' }} />

      <div className="container-saas relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#25d0c3] animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Connect</span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            {isEn ? "Let's Build " : 'Mari Bangun '}
            <span className="bg-gradient-to-r from-[#25d0c3] to-[#4ea8de] bg-clip-text text-transparent">
              {isEn ? 'Together' : 'Bersama'}
            </span>
          </h2>
          <p className="text-base text-white/40 mb-14 leading-relaxed max-w-lg mx-auto">
            {isEn
              ? "Open for collaboration, research discussion, internship opportunities, product feedback, and AI-related projects."
              : "Terbuka untuk kolaborasi, diskusi riset, peluang magang, feedback produk, dan proyek terkait AI."}
          </p>

          {/* Contact cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contactItems.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-5 overflow-hidden transition-all duration-500 hover:border-white/[0.15]"
              >
                {/* Hover glow */}
                <div
                  className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl"
                  style={{ background: `radial-gradient(circle, ${item.color}10, transparent 70%)` }}
                />

                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </motion.div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">{item.label}</div>
                    <div className="text-xs text-white/60 font-mono group-hover:text-[#25d0c3] transition-colors truncate">
                      {item.value}
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
