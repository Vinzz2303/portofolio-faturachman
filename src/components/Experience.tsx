import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

interface TimelineItem {
  year: string
  title: string
  company: string
  description: string
  descriptionEn: string
  type: 'work' | 'education' | 'opensource'
  color: string
}

const experiences: TimelineItem[] = [
  {
    year: "Mar 2026 - Present",
    title: "Full-Stack Developer",
    company: "Ting AI Portfolio & Investment Dashboard",
    description: "Membangun arsitektur full-stack untuk platform intelijen pasar berbasis AI (React, TypeScript, FastAPI/Express, VPS/IIS). Menerapkan auth flows, integrasi AI, dan sistem dashboard interaktif.",
    descriptionEn: "Built and deployed a full-stack portfolio website with AI assistant and investment dashboard features. Developed with React, TypeScript, Vite, Node.js, and Express.",
    type: "work",
    color: "#25d0c3" // accent
  },
  {
    year: "Feb 2026 - Present",
    title: "Full-Stack Developer",
    company: "Central Jual Emas (Gold Trading Platform)",
    description: "Mengembangkan antarmuka responsif dan alur kerja terintegrasi dengan backend untuk platform perdagangan emas yang berstandar produksi.",
    descriptionEn: "Built a React- and TypeScript-based gold trading website with responsive UI. Integrated market-related workflows and production-ready data handling.",
    type: "work",
    color: "#4ea8de"
  },
  {
    year: "2025 - Present",
    title: "Open Source Contributor",
    company: "Tscircuit, Archestra, Matchpack",
    description: "Mengembangkan analog simulation viewer, MCP catalog form, dan mengimplementasikan algoritma pemecahan masalah chip partition (ChipPartitionsSolver).",
    descriptionEn: "Developed analog simulation viewer, MCP catalog form, and implemented chip partition problem-solving algorithms (ChipPartitionsSolver).",
    type: "opensource",
    color: "#a78bfa"
  },
  {
    year: "2022 - 2026",
    title: "Bachelor of Informatics",
    company: "Universitas Multimedia Nusantara (UMN)",
    description: "Menempuh pendidikan sarjana S1 Informatika dengan fokus pada pengembangan perangkat lunak, sistem cerdas, dan arsitektur sistem informasi.",
    descriptionEn: "Pursuing a Bachelor of Informatics focusing on software engineering, intelligent systems, and information systems architecture.",
    type: "education",
    color: "#d6b15d"
  }
]

const TypeIcon = ({ type, color }: { type: TimelineItem['type'], color: string }) => {
  if (type === 'education') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    )
  }
  if (type === 'opensource') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.293 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  )
}

export default function Experience({ sectionId }: { sectionId?: string }) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section id={sectionId || "experience"} className="py-24 relative overflow-hidden bg-white/[0.01]">
      <div className="container-saas">
        <div className="mb-16">
          <div className="panel-label mb-2 text-accent">
            {isEn ? 'Journey' : 'Perjalanan'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient">
            {isEn ? 'Experience & Timeline' : 'Pengalaman & Timeline'}
          </h2>
          <p className="text-sm text-white/40 mt-3 max-w-lg">
            {isEn
              ? 'A chronological record of my professional work, open source contributions, and education.'
              : 'Catatan kronologis dari pekerjaan profesional, kontribusi open source, dan pendidikan saya.'}
          </p>
        </div>

        <div className="relative border-l border-white/10 ml-3 md:ml-6 space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative pl-8 md:pl-12 group"
            >
              {/* Timeline dot */}
              <div 
                className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0b0d12] transition-colors duration-500 group-hover:scale-125"
                style={{ backgroundColor: exp.color }}
              />

              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mb-2">
                <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                  {exp.title}
                </h3>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 w-fit">
                  {exp.year}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <TypeIcon type={exp.type} color={exp.color} />
                <span className="text-sm font-semibold" style={{ color: exp.color }}>
                  {exp.company}
                </span>
              </div>

              <p className="text-sm text-white/50 leading-relaxed max-w-3xl">
                {isEn ? exp.descriptionEn : exp.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
