import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

const techCategories = [
  {
    title: "Frontend & Interfaces",
    color: "from-[#4ea8de] to-[#25d0c3]",
    shadow: "shadow-[#4ea8de]/20",
    icon: (
      <svg className="w-5 h-5 text-[#4ea8de]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js"]
  },
  {
    title: "Backend & Core",
    color: "from-[#a78bfa] to-[#c084fc]",
    shadow: "shadow-[#a78bfa]/20",
    icon: (
      <svg className="w-5 h-5 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    skills: ["Python", "Node.js", "FastAPI", "Express", "REST APIs", "WebSockets"]
  },
  {
    title: "AI & Intelligence",
    color: "from-[#f59e0b] to-[#d6b15d]",
    shadow: "shadow-[#f59e0b]/20",
    icon: (
      <svg className="w-5 h-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    skills: ["Gemini Pro", "LLaMA", "Groq", "LangChain", "Prompt Engineering", "RAG"]
  },
  {
    title: "Data & Infrastructure",
    color: "from-[#25d0c3] to-[#1a9e94]",
    shadow: "shadow-[#25d0c3]/20",
    icon: (
      <svg className="w-5 h-5 text-[#25d0c3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    skills: ["PostgreSQL", "Redis", "PM2 / IIS", "VPS Deployment", "GitHub Actions"]
  }
]

export default function SystemStack() {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section className="py-28 relative overflow-hidden">
      {/* ── Ambient Fluid Blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-20 w-96 h-96 bg-[#4ea8de]/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-20 -right-20 w-[30rem] h-[30rem] bg-[#a78bfa]/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#25d0c3] animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">System Architecture</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
          >
            {isEn ? 'The Engineering ' : 'Fondasi '}
            <span className="bg-gradient-to-r from-[#25d0c3] via-[#4ea8de] to-[#a78bfa] bg-clip-text text-transparent">Stack</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base text-white/40 mt-4 max-w-xl mx-auto leading-relaxed"
          >
            {isEn
              ? 'Fluid systems built with modern, scalable technologies. From deep intelligence layers to pixel-perfect glass interfaces.'
              : 'Sistem dinamis yang dibangun dengan teknologi modern dan terukur. Dari lapisan AI hingga antarmuka kaca yang presisi.'}
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {techCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -5 }}
              className={`relative group rounded-3xl p-8 border border-white/[0.06] bg-white/[0.015] backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/[0.12] hover:bg-white/[0.03] hover:${cat.shadow}`}
            >
              {/* Organic hover gradient */}
              <div className={`absolute -inset-20 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700 rounded-[4rem] blur-2xl pointer-events-none`} />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {cat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide">{cat.title}</h3>
                </div>

                <div className="flex flex-wrap gap-2.5 mt-auto">
                  {cat.skills.map((skill, si) => (
                    <motion.div
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm text-white/60 hover:text-white hover:border-white/20 transition-colors"
                    >
                      {skill}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
