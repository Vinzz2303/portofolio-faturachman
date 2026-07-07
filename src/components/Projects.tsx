import React, { useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring, type Variants } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

interface Project {
  title: string
  status: string
  statusColor: string
  category: string
  description: string
  descriptionEn: string
  stack: string[]
  github?: string
  demo?: string
  featured?: boolean
  gradient: string
}

const projects: Project[] = [
  {
    title: "Ting AI",
    status: "Active · v1.9",
    statusColor: "#25d0c3",
    category: "AI Product",
    description: "Sistem pendukung keputusan berbasis AI untuk investor ritel — memproses data pasar makro secara real-time dan memberikan wawasan analisis dalam hitungan detik.",
    descriptionEn: "AI decision support system for retail investors — processing real-time macro market data and delivering analysis insights in seconds.",
    stack: ["React", "FastAPI", "Gemini Pro", "Python", "Recharts"],
    demo: "https://faturachman.my.id",
    featured: true,
    gradient: "from-[#25d0c3]/20 to-[#4ea8de]/10"
  },
  {
    title: "Schematic Viewer",
    status: "Merged",
    statusColor: "#4ea8de",
    category: "Open Source · tscircuit",
    description: "Mempercepat visualisasi alur debugging PCB pengguna lewat fitur analog simulation viewer interaktif dan trace highlight on hover.",
    descriptionEn: "Accelerated PCB debugging visualization workflows via interactive analog simulation viewer and trace highlight on hover.",
    stack: ["TypeScript", "React", "TSX", "PCB Design"],
    github: "https://github.com/tscircuit/schematic-viewer",
    gradient: "from-[#4ea8de]/20 to-[#58a6ff]/10"
  },
  {
    title: "Archestra Platform",
    status: "Contributing",
    statusColor: "#d6b15d",
    category: "Open Source · MCP",
    description: "Meningkatkan utilitas integrasi enterprise dengan mengembangkan form katalog MCP dan modul arsitektur frontend.",
    descriptionEn: "Increased enterprise integration utility by developing the MCP catalog form and frontend architecture modules.",
    stack: ["React", "TypeScript", "Next.js", "MCP"],
    github: "https://github.com/sparesparrow/archestra",
    gradient: "from-[#d6b15d]/20 to-[#f59e0b]/10"
  },
  {
    title: "Matchpack",
    status: "Contributing",
    statusColor: "#a78bfa",
    category: "Open Source · Algorithms",
    description: "Mengoptimalkan sistem layouting otomatis dengan merancang algoritma ChipPartitionsSolver untuk pemecahan masalah partisi desain PCB.",
    descriptionEn: "Optimized automated layouting systems by designing the ChipPartitionsSolver algorithm for PCB design partition problem solving.",
    stack: ["TypeScript", "Bun", "Algorithms"],
    github: "https://github.com/matchpack/matchpack",
    gradient: "from-[#a78bfa]/20 to-[#c084fc]/10"
  },
  {
    title: "OpenBB Fast Data Layer",
    status: "Production",
    statusColor: "#4ea8de",
    category: "Financial Data",
    description: "Abstraction layer terpusat yang memangkas redundansi request untuk intelijen finansial (Polygon, FRED, Market News) secara signifikan.",
    descriptionEn: "Centralized abstraction layer that significantly cuts request redundancy for multi-source financial intelligence (Polygon, FRED).",
    stack: ["Python", "Redis", "GraphQL", "FastAPI"],
    gradient: "from-[#4ea8de]/15 to-[#25d0c3]/10"
  },
  {
    title: "ML Research PPT",
    status: "Published",
    statusColor: "#f59e0b",
    category: "Research",
    description: "Penelitian pemodelan sentimen finansial — mengevaluasi performa model LLM terhadap data unstructured untuk akurasi prediksi arah market.",
    descriptionEn: "Financial sentiment modeling research — evaluating LLM model performance on unstructured data for market direction prediction accuracy.",
    stack: ["Python", "Jupyter", "ML", "Data Science"],
    gradient: "from-[#f59e0b]/15 to-[#d6b15d]/10"
  }
]

/* ── 3D Tilt Project Card ──────────────────────────────── */
function ProjectCard({ project, isEn, index }: { project: Project; isEn: boolean; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 25 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 25 })
  const glareX = useTransform(x, [-0.5, 0.5], ['30%', '70%'])
  const glareY = useTransform(y, [-0.5, 0.5], ['30%', '70%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  const hasLink = project.github || project.demo
  const href = project.github || project.demo

  const CardContent = (
    <>
      {/* Gradient accent at top */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Glare effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(300px circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.04), transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Status + category */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex flex-col gap-1.5">
            <div
              className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider"
              style={{
                color: project.statusColor,
                borderColor: `${project.statusColor}22`,
                background: `${project.statusColor}0a`,
                border: `1px solid ${project.statusColor}22`
              }}
            >
              <span className="w-1 h-1 rounded-full" style={{ background: project.statusColor }} />
              {project.status}
            </div>
            <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
              {project.category}
            </div>
          </div>
          {hasLink && (
            <motion.div
              className="text-white/20 group-hover:text-[#25d0c3] transition-colors"
              whileHover={{ scale: 1.2 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#25d0c3] transition-colors duration-300">
          {project.title}
        </h3>
        <p className="text-sm text-white/40 leading-relaxed mb-6">
          {isEn ? project.descriptionEn : project.description}
        </p>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/[0.04]">
          {project.stack.map(tech => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[9px] font-mono bg-white/[0.03] border border-white/[0.06] rounded-md text-white/40 group-hover:text-white/60 group-hover:border-white/10 transition-all"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        className="will-change-transform"
      >
        {hasLink ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="relative block p-6 rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm group hover:border-white/[0.12] transition-all duration-500 h-full"
          >
            {CardContent}
          </a>
        ) : (
          <div className="relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm group h-full">
            {CardContent}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function Projects({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section id={sectionId} className="py-28 relative">
      {/* Ambient bg */}
      <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full bg-[#25d0c3]/[0.02] blur-[100px] pointer-events-none" />

      <div className="container-saas relative z-10">
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-3"
          >
            <div className="w-2 h-2 rounded-full bg-[#25d0c3]" />
            <span className="text-xs font-mono text-[#25d0c3]/60 tracking-widest uppercase">
              {isEn ? 'Selected Work' : 'Karya Pilihan'}
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {isEn ? 'Projects & Contributions' : 'Proyek & Kontribusi'}
          </h2>
          <p className="text-sm text-white/35 mt-3 max-w-lg leading-relaxed">
            {isEn
              ? 'Personal products, open source contributions, and research — built from scratch and shipped to production.'
              : 'Produk pribadi, kontribusi open source, dan riset — dibangun dari nol dan dikirim ke produksi.'}
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} isEn={isEn} index={i} />
          ))}
        </div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex justify-center"
        >
          <a
            href="https://github.com/Vinzz2303"
            target="_blank"
            rel="noreferrer noopener"
            className="group flex items-center gap-2.5 px-6 py-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-white/40 hover:text-white/80 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 font-mono backdrop-blur-sm"
          >
            <svg className="w-4 h-4 group-hover:text-[#25d0c3] transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            {isEn ? 'See all on GitHub →' : 'Lihat semua di GitHub →'}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
