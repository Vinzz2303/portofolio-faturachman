import React from 'react'
import { motion } from 'framer-motion'
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
  year: string
}

const projects: Project[] = [
  {
    title: "Ting AI",
    status: "Active · v1.9",
    statusColor: "#22c55e",
    category: "AI Product",
    description: "Sistem pendukung keputusan berbasis AI untuk investor ritel — memproses data pasar makro secara real-time dan memberikan wawasan analisis portofolio.",
    descriptionEn: "AI decision support system for retail investors — processing real-time macro market data and delivering portfolio analysis insights in seconds.",
    stack: ["React", "Node.js", "Gemini Pro", "TypeScript", "Recharts", "Supabase"],
    demo: "https://tingsai.my.id",
    featured: true,
    year: "2024–Present"
  },
  {
    title: "Schematic Viewer",
    status: "Merged",
    statusColor: "#60a5fa",
    category: "Open Source · tscircuit",
    description: "Accelerated PCB debugging visualization via interactive analog simulation viewer and trace highlight on hover.",
    descriptionEn: "Accelerated PCB debugging visualization workflows via interactive analog simulation viewer and trace highlight on hover.",
    stack: ["TypeScript", "React", "PCB Design"],
    github: "https://github.com/tscircuit/schematic-viewer",
    year: "2024"
  },
  {
    title: "Archestra Platform",
    status: "Contributing",
    statusColor: "#d6b26b",
    category: "Open Source · MCP",
    description: "Increased enterprise integration utility by developing MCP catalog form and frontend architecture modules.",
    descriptionEn: "Increased enterprise integration utility by developing the MCP catalog form and frontend architecture modules.",
    stack: ["React", "TypeScript", "Next.js", "MCP"],
    github: "https://github.com/sparesparrow/archestra",
    year: "2024"
  },
  {
    title: "Matchpack",
    status: "Contributing",
    statusColor: "#a78bfa",
    category: "Open Source · Algorithms",
    description: "Optimized automated layouting by designing ChipPartitionsSolver for PCB design partition problems.",
    descriptionEn: "Optimized automated layouting systems by designing the ChipPartitionsSolver algorithm for PCB design partition problem solving.",
    stack: ["TypeScript", "Bun", "Algorithms"],
    github: "https://github.com/matchpack/matchpack",
    year: "2024"
  },
  {
    title: "OpenBB Fast Data Layer",
    status: "Production",
    statusColor: "#60a5fa",
    category: "Financial Data",
    description: "Centralized abstraction layer cutting redundant requests for multi-source financial intelligence.",
    descriptionEn: "Centralized abstraction layer that significantly cuts request redundancy for multi-source financial intelligence (Polygon, FRED).",
    stack: ["Python", "Redis", "FastAPI"],
    year: "2024"
  },
  {
    title: "ML Research — Sentiment Modeling",
    status: "Published",
    statusColor: "#f59e0b",
    category: "Research",
    description: "Evaluating LLM performance on unstructured financial data for market direction prediction accuracy.",
    descriptionEn: "Financial sentiment modeling research — evaluating LLM model performance on unstructured data for market direction prediction accuracy.",
    stack: ["Python", "Jupyter", "ML"],
    year: "2023"
  }
]

/* ── Section label component ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">{children}</span>
    </div>
  )
}

export default function Projects({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  const featuredProject = projects[0]
  const otherProjects = projects.slice(1)

  return (
    <section id={sectionId} className="py-28 relative">
      <div className="container-saas relative z-10">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <SectionLabel>{isEn ? 'Selected Work' : 'Karya Pilihan'}</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {isEn ? 'Projects & Contributions' : 'Proyek & Kontribusi'}
          </h2>
          <p className="text-sm text-white/30 mt-3 max-w-sm leading-relaxed">
            {isEn
              ? 'Personal products, open source contributions, and research.'
              : 'Produk pribadi, kontribusi open source, dan riset.'}
          </p>
        </motion.div>

        {/* ── TIER 1: Featured Hero Card (Ting AI) ─────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4"
        >
          <a
            href={featuredProject.demo}
            target="_blank"
            rel="noreferrer noopener"
            className="group block relative rounded-2xl border border-white/[0.07] bg-[var(--surface)] hover:border-[var(--accent)]/25 transition-all duration-500 overflow-hidden"
          >
            {/* Top accent line — gold on hover */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-8 items-start">
              {/* Left: Content */}
              <div>
                {/* Meta row */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider"
                    style={{
                      color: featuredProject.statusColor,
                      background: `${featuredProject.statusColor}12`,
                      border: `1px solid ${featuredProject.statusColor}22`,
                    }}
                  >
                    <span className="w-1 h-1 rounded-full" style={{ background: featuredProject.statusColor }} />
                    {featuredProject.status}
                  </div>
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                    {featuredProject.category}
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-white/15">
                    {featuredProject.year}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-black text-white mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">
                  {featuredProject.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed max-w-lg mb-6">
                  {isEn ? featuredProject.descriptionEn : featuredProject.description}
                </p>

                {/* Stack */}
                <div className="flex flex-wrap gap-1.5">
                  {featuredProject.stack.map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] font-mono border border-white/[0.06] rounded text-white/35 bg-white/[0.02]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: Arrow + label */}
              <div className="flex flex-col items-end justify-between h-full gap-4 md:min-w-[120px]">
                <div className="w-10 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/25 group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/[0.06] transition-all duration-300">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-mono text-white/15 uppercase tracking-widest mb-1">
                    {isEn ? 'Featured Project' : 'Proyek Utama'}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--accent)]/50 uppercase tracking-wider">No.01</div>
                </div>
              </div>
            </div>
          </a>
        </motion.div>

        {/* ── TIER 2: Other Projects — List View (Vercel style) ─── */}
        <div className="rounded-2xl border border-white/[0.06] bg-[var(--surface)] overflow-hidden">
          {otherProjects.map((project, i) => {
            const href = project.github || project.demo
            const hasLink = !!href

            const Inner = (
              <div className="group flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors duration-200">
                {/* Index */}
                <span className="shrink-0 w-7 text-[10px] font-mono text-white/15 tabular-nums">
                  {String(i + 2).padStart(2, '0')}
                </span>

                {/* Status dot */}
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: project.statusColor }}
                />

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-sm text-white/80 group-hover:text-white transition-colors duration-200">
                    {project.title}
                  </span>
                  <span className="hidden md:inline text-white/20 text-sm"> — </span>
                  <span className="hidden md:inline text-xs text-white/30">
                    {isEn ? project.descriptionEn : project.description}
                  </span>
                </div>

                {/* Category */}
                <span className="hidden lg:block shrink-0 text-[10px] font-mono text-white/20 uppercase tracking-wider w-36 text-right">
                  {project.category}
                </span>

                {/* Stack — show only first 2 */}
                <div className="hidden md:flex shrink-0 gap-1 w-32 justify-end">
                  {project.stack.slice(0, 2).map(tech => (
                    <span key={tech} className="text-[9px] font-mono px-1.5 py-0.5 border border-white/[0.06] rounded text-white/25">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Year */}
                <span className="shrink-0 text-[10px] font-mono text-white/15 w-12 text-right">{project.year}</span>

                {/* Arrow */}
                {hasLink && (
                  <div className="shrink-0 text-white/15 group-hover:text-white/50 transition-colors duration-200 ml-1">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            )

            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={i > 0 ? 'border-t border-white/[0.04]' : ''}
              >
                {hasLink ? (
                  <a href={href} target="_blank" rel="noreferrer noopener">
                    {Inner}
                  </a>
                ) : (
                  <div>{Inner}</div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <a
            href="https://github.com/Vinzz2303"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/[0.07] text-xs text-white/35 hover:text-white/65 hover:border-white/15 transition-all font-mono"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            {isEn ? 'See all on GitHub →' : 'Lihat semua di GitHub →'}
          </a>
        </motion.div>

      </div>
    </section>
  )
}
