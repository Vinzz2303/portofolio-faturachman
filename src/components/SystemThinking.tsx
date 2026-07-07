import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

const steps = [
  {
    num: "01",
    icon: "🎯",
    title: { en: "User Input", id: "Input Pengguna" },
    desc: { en: "Assets, portfolio data, and questions flow into the system.", id: "Aset, data portofolio, dan pertanyaan mengalir ke dalam sistem." },
    color: "#25d0c3"
  },
  {
    num: "02",
    icon: "📡",
    title: { en: "Data Layer", id: "Lapisan Data" },
    desc: { en: "Multi-source feeds: Polygon, FRED, FMP, market sentiment.", id: "Feed multi-sumber: Polygon, FRED, FMP, sentimen pasar." },
    color: "#4ea8de"
  },
  {
    num: "03",
    icon: "🧠",
    title: { en: "AI Reasoning", id: "Penalaran AI" },
    desc: { en: "Gemini Pro + Groq process context with structured prompts.", id: "Gemini Pro + Groq memproses konteks dengan prompt terstruktur." },
    color: "#a78bfa"
  },
  {
    num: "04",
    icon: "📊",
    title: { en: "Risk Analysis", id: "Analisis Risiko" },
    desc: { en: "Concentration, exposure, correlation — mapped and scored.", id: "Konsentrasi, eksposur, korelasi — dipetakan dan dinilai." },
    color: "#f59e0b"
  },
  {
    num: "05",
    icon: "💡",
    title: { en: "Your Clarity", id: "Kejelasan Anda" },
    desc: { en: "Actionable insights delivered — not signals, but understanding.", id: "Wawasan yang dapat ditindaklanjuti — bukan sinyal, tapi pemahaman." },
    color: "#25d0c3"
  }
]

export default function SystemThinking() {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-[#a78bfa]/[0.03] blur-[120px] pointer-events-none" />

      <div className="container-saas relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
              {isEn ? 'How It Works' : 'Cara Kerjanya'}
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {isEn ? 'Intelligence ' : 'Alur '}
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#4ea8de] bg-clip-text text-transparent">
              {isEn ? 'Pipeline' : 'Kecerdasan'}
            </span>
          </h2>
        </div>

        {/* Flow steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4 md:gap-5">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ x: 8 }}
                className="group relative"
              >
                <div className="flex items-stretch gap-4 md:gap-6">
                  {/* Vertical connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm relative z-10 shrink-0"
                      style={{ boxShadow: `0 0 20px ${step.color}10` }}
                    >
                      {step.icon}
                    </motion.div>
                    {i < steps.length - 1 && (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 + 0.3 }}
                        className="w-px flex-1 my-1 origin-top"
                        style={{ background: `linear-gradient(to bottom, ${step.color}30, transparent)` }}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm p-5 md:p-6 mb-2 overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.025] relative">
                    {/* Hover glow */}
                    <div
                      className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl"
                      style={{ background: `radial-gradient(circle, ${step.color}06, transparent 70%)` }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span
                          className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full border"
                          style={{ color: `${step.color}cc`, borderColor: `${step.color}30`, background: `${step.color}0a` }}
                        >
                          {step.num}
                        </span>
                        <h3 className="text-base md:text-lg font-bold text-white group-hover:text-[#25d0c3] transition-colors">
                          {isEn ? step.title.en : step.title.id}
                        </h3>
                      </div>
                      <p className="text-sm text-white/40 leading-relaxed">
                        {isEn ? step.desc.en : step.desc.id}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
