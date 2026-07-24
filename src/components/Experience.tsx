import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'
import { Rocket, CircleDollarSign, GraduationCap, Globe2, BookOpen } from 'lucide-react'

interface TimelineItem {
  year: string
  title: string
  company: string
  description: string
  descriptionEn: string
  type: 'work' | 'education' | 'opensource'
  color: string
  gradient: string
  icon: React.ReactNode
}

const experiences: TimelineItem[] = [
  {
    year: "Mar 2026 - Present",
    title: "Full-Stack Developer",
    company: "Ting AI Portfolio & Investment Dashboard",
    description: "Membangun arsitektur full-stack untuk platform intelijen pasar berbasis AI (React, TypeScript, FastAPI/Express, VPS/IIS). Menerapkan auth flows, integrasi AI, dan sistem dashboard interaktif.",
    descriptionEn: "Built and deployed a full-stack portfolio website with AI assistant and investment dashboard features. Developed with React, TypeScript, Vite, Node.js, and Express.",
    type: "work",
    color: "#25d0c3",
    gradient: "from-[#25d0c3]/20 via-[#25d0c3]/5 to-transparent",
    icon: <Rocket size={22} />
  },
  {
    year: "Feb 2026 - Present",
    title: "Full-Stack Developer",
    company: "Central Jual Emas (Gold Trading Platform)",
    description: "Mengembangkan antarmuka responsif dan alur kerja terintegrasi dengan backend untuk platform perdagangan emas yang berstandar produksi.",
    descriptionEn: "Built a React- and TypeScript-based gold trading website with responsive UI. Integrated market-related workflows and production-ready data handling.",
    type: "work",
    color: "#4ea8de",
    gradient: "from-[#4ea8de]/20 via-[#4ea8de]/5 to-transparent",
    icon: <CircleDollarSign size={22} />
  },
  {
    year: "2024 - 2025",
    title: "Full-Stack Web Developer",
    company: "Universitas Primagraha (upg.ac.id)",
    description: "Membangun sistem informasi dan website portal akademik untuk Universitas Primagraha. Proyek ini dikerjakan secara profesional (freelance/kontrak), di luar pendidikan sarjana saya di UMN.",
    descriptionEn: "Built the academic portal and information system website for Universitas Primagraha. This was a professional contract project, separate from my undergraduate studies at UMN.",
    type: "work",
    color: "#f59e0b",
    gradient: "from-[#f59e0b]/20 via-[#f59e0b]/5 to-transparent",
    icon: <GraduationCap size={22} />
  },
  {
    year: "2025 - Present",
    title: "Open Source Contributor",
    company: "Tscircuit, Archestra, Matchpack",
    description: "Mengembangkan analog simulation viewer, MCP catalog form, dan mengimplementasikan algoritma pemecahan masalah chip partition (ChipPartitionsSolver).",
    descriptionEn: "Developed analog simulation viewer, MCP catalog form, and implemented chip partition problem-solving algorithms (ChipPartitionsSolver).",
    type: "opensource",
    color: "#a78bfa",
    gradient: "from-[#a78bfa]/20 via-[#a78bfa]/5 to-transparent",
    icon: <Globe2 size={22} />
  },
  {
    year: "2022 - 2026",
    title: "Bachelor of Informatics",
    company: "Universitas Multimedia Nusantara (UMN)",
    description: "Menempuh pendidikan sarjana S1 Informatika dengan fokus pada pengembangan perangkat lunak, sistem cerdas, dan arsitektur sistem informasi.",
    descriptionEn: "Pursuing a Bachelor of Informatics focusing on software engineering, intelligent systems, and information systems architecture.",
    type: "education",
    color: "#d6b15d",
    gradient: "from-[#d6b15d]/20 via-[#d6b15d]/5 to-transparent",
    icon: <BookOpen size={22} />
  }
]

export default function Experience({ sectionId }: { sectionId?: string }) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section id={sectionId || "experience"} className="py-28 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-20 -right-40 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #25d0c315, transparent 70%)' }} />
      <div className="absolute bottom-20 -left-40 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, #a78bfa15, transparent 70%)' }} />

      <div className="container-saas relative z-10">
        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#25d0c3] animate-pulse" />
            <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">
              {isEn ? 'Journey' : 'Perjalanan'}
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {isEn ? 'Experience ' : 'Pengalaman '}
            <span className="bg-gradient-to-r from-[#25d0c3] to-[#4ea8de] bg-clip-text text-transparent">
              {isEn ? '& Timeline' : '& Timeline'}
            </span>
          </h2>
        </div>

        {/* Timeline cards */}
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="group relative"
            >
              <div className={`
                relative rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm
                p-6 md:p-8 overflow-hidden transition-all duration-500
                hover:border-white/[0.12] hover:bg-white/[0.025]
              `}>
                {/* Left gradient accent */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 rounded-full bg-gradient-to-b ${exp.gradient}`}
                  style={{ background: `linear-gradient(to bottom, ${exp.color}40, transparent)` }}
                />

                {/* Hover glow */}
                <div
                  className="absolute -inset-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[4rem] blur-3xl"
                  style={{ background: `radial-gradient(circle, ${exp.color}08, transparent 70%)` }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                  {/* Icon + Year */}
                  <div className="flex items-center md:flex-col md:items-center gap-3 md:gap-2 md:min-w-[100px] shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
                      style={{ color: exp.color }}
                    >
                      {exp.icon}
                    </motion.div>
                    <span
                      className="text-[10px] font-mono tracking-wider px-3 py-1 rounded-full border whitespace-nowrap"
                      style={{
                        color: `${exp.color}cc`,
                        borderColor: `${exp.color}30`,
                        background: `${exp.color}0a`
                      }}
                    >
                      {exp.year}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 group-hover:text-[#25d0c3] transition-colors duration-300">
                      {exp.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold" style={{ color: exp.color }}>
                        {exp.company}
                      </span>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {isEn ? exp.descriptionEn : exp.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
