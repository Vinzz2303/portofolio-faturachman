import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

const features = [
  {
    icon: "📊",
    title: { en: "Portfolio Risk Analysis", id: "Analisis Risiko Portofolio" },
    desc: { en: "Real-time concentration detection and sector exposure mapping.", id: "Deteksi konsentrasi real-time dan pemetaan eksposur sektor." },
    color: "#25d0c3"
  },
  {
    icon: "🧠",
    title: { en: "AI-Powered Insights", id: "Wawasan Berbasis AI" },
    desc: { en: "Multi-model reasoning using Gemini Pro and Groq for market context.", id: "Penalaran multi-model menggunakan Gemini Pro dan Groq untuk konteks pasar." },
    color: "#a78bfa"
  },
  {
    icon: "⚡",
    title: { en: "Morning Command", id: "Komando Pagi" },
    desc: { en: "Daily briefing system with macro signals and portfolio health check.", id: "Sistem briefing harian dengan sinyal makro dan pemeriksaan kesehatan portofolio." },
    color: "#f59e0b"
  },
  {
    icon: "🔒",
    title: { en: "Decision Layer", id: "Lapisan Keputusan" },
    desc: { en: "Not trading signals — but clarity before every decision you make.", id: "Bukan sinyal trading — tapi kejelasan sebelum setiap keputusan yang Anda buat." },
    color: "#4ea8de"
  }
]

export default function FeaturedProduct({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section id={sectionId} className="py-28 relative overflow-hidden">
      {/* Ambient */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#25d0c3]/[0.03] blur-[150px] pointer-events-none"
      />

      <div className="container-saas relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-[#25d0c3]/20 bg-[#25d0c3]/5 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#25d0c3] animate-pulse" />
            <span className="text-[10px] font-mono text-[#25d0c3]/80 tracking-widest uppercase">Flagship Product</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
          >
            Ting AI
            <span className="block text-2xl md:text-3xl font-light text-white/30 mt-2">
              {isEn ? 'Retail Intelligence Layer' : 'Lapisan Intelijen Ritel'}
            </span>
          </motion.h2>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto mb-14">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-6 md:p-8 overflow-hidden transition-all duration-500 hover:border-white/[0.12]"
            >
              {/* Hover glow */}
              <div
                className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl"
                style={{ background: `radial-gradient(circle, ${f.color}08, transparent 70%)` }}
              />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border border-white/[0.08] bg-white/[0.03] mb-5"
                >
                  {f.icon}
                </motion.div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#25d0c3] transition-colors">
                  {isEn ? f.title.en : f.title.id}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {isEn ? f.desc.en : f.desc.id}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-3"
        >
          <Link
            to="/ting-ai"
            className="group relative px-8 py-3.5 bg-[#25d0c3] text-[#0b0d12] font-bold rounded-xl overflow-hidden transition-all hover:scale-[1.03] shadow-lg shadow-[#25d0c3]/20 text-center"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isEn ? 'Explore Intelligence' : 'Jelajahi Inteligensi'}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </Link>
          <Link
            to="/portfolio"
            className="px-8 py-3.5 rounded-xl border border-white/[0.1] text-white/60 hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-all font-semibold backdrop-blur-sm text-center"
          >
            {isEn ? 'Live Workspace' : 'Workspace Aktif'}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
