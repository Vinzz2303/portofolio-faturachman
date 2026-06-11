import React from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
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
    featured: true
  },
  {
    title: "Schematic Viewer",
    status: "Merged",
    statusColor: "#4ea8de",
    category: "Open Source · tscircuit",
    description: "Mempercepat visualisasi alur debugging PCB pengguna lewat fitur analog simulation viewer interaktif dan trace highlight on hover.",
    descriptionEn: "Accelerated PCB debugging visualization workflows via interactive analog simulation viewer and trace highlight on hover.",
    stack: ["TypeScript", "React", "TSX", "PCB Design"],
    github: "https://github.com/tscircuit/schematic-viewer"
  },
  {
    title: "Archestra Platform",
    status: "Contributing",
    statusColor: "#d6b15d",
    category: "Open Source · MCP",
    description: "Meningkatkan utilitas integrasi enterprise dengan mengembangkan form katalog MCP dan modul arsitektur frontend.",
    descriptionEn: "Increased enterprise integration utility by developing the MCP catalog form and frontend architecture modules.",
    stack: ["React", "TypeScript", "Next.js", "MCP"],
    github: "https://github.com/sparesparrow/archestra"
  },
  {
    title: "Matchpack",
    status: "Contributing",
    statusColor: "#a78bfa",
    category: "Open Source · Algorithms",
    description: "Mengoptimalkan sistem layouting otomatis dengan merancang algoritma ChipPartitionsSolver untuk pemecahan masalah partisi desain PCB.",
    descriptionEn: "Optimized automated layouting systems by designing the ChipPartitionsSolver algorithm for PCB design partition problem solving.",
    stack: ["TypeScript", "Bun", "Algorithms"],
    github: "https://github.com/matchpack/matchpack"
  },
  {
    title: "OpenBB Fast Data Layer",
    status: "Production",
    statusColor: "#4ea8de",
    category: "Financial Data",
    description: "Abstraction layer terpusat yang memangkas redundansi request untuk intelijen finansial (Polygon, FRED, Market News) secara signifikan.",
    descriptionEn: "Centralized abstraction layer that significantly cuts request redundancy for multi-source financial intelligence (Polygon, FRED).",
    stack: ["Python", "Redis", "GraphQL", "FastAPI"]
  },
  {
    title: "ML Research PPT",
    status: "Published",
    statusColor: "#f59e0b",
    category: "Research",
    description: "Penelitian pemodelan sentimen finansial — mengevaluasi performa model LLM terhadap data unstructured untuk akurasi prediksi arah market.",
    descriptionEn: "Financial sentiment modeling research — evaluating LLM model performance on unstructured data for market direction prediction accuracy.",
    stack: ["Python", "Jupyter", "ML", "Data Science"]
  }
]

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

export default function Projects({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section id={sectionId} className="py-24 bg-white/[0.01]">
      <div className="container-saas">
        <div className="mb-16">
          <div className="panel-label mb-2 text-accent">
            {isEn ? 'Selected Work' : 'Karya Pilihan'}
          </div>
          <h2 className="text-3xl font-bold text-gradient">
            {isEn ? 'Projects & Contributions' : 'Proyek & Kontribusi'}
          </h2>
          <p className="text-sm text-white/40 mt-3 max-w-lg">
            {isEn
              ? 'A mix of personal products, open source contributions, and research work.'
              : 'Perpaduan antara produk pribadi, kontribusi open source, dan karya riset.'}
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {projects.map((project) => {
            const hasLink = project.github || project.demo
            const Wrapper = hasLink ? 'a' : 'div'
            const wrapperProps = hasLink
              ? {
                  href: project.github || project.demo,
                  target: '_blank' as const,
                  rel: 'noreferrer noopener'
                }
              : {}

            return (
              <motion.div
                key={project.title}
                variants={item}
                className={`relative ${project.featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <Wrapper
                  {...wrapperProps}
                  className={`glass-card p-6 flex flex-col justify-between h-full transition-all will-change-transform group ${hasLink ? 'hover-glow cursor-pointer' : ''} ${project.featured ? 'border-accent/20' : ''}`}
                >
                  {/* Top: status + category + link icon */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1.5">
                        <div
                          className="status-badge w-fit"
                          style={{
                            color: project.statusColor,
                            borderColor: `${project.statusColor}22`,
                            background: `${project.statusColor}0a`
                          }}
                        >
                          {project.status}
                        </div>
                        <div className="text-[9px] font-mono text-white/25 uppercase tracking-widest">
                          {project.category}
                        </div>
                      </div>
                      {hasLink && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 group-hover:text-accent">
                          <ExternalLinkIcon />
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed mb-5">
                      {isEn ? project.descriptionEn : project.description}
                    </p>
                  </div>

                  {/* Bottom: stack + links */}
                  <div className="pt-4 border-t border-white/[0.06]">
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.stack.map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-[9px] font-mono bg-white/[0.04] border border-white/[0.06] rounded text-white/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 hover:text-white/70 transition-colors"
                        >
                          <GitHubIcon />
                          GitHub
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-[10px] font-mono text-accent/50 hover:text-accent transition-colors"
                        >
                          <ExternalLinkIcon />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </Wrapper>
              </motion.div>
            )
          })}
        </motion.div>

        {/* GitHub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <a
            href="https://github.com/Vinzz2303"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2 px-5 py-2.5 glass-card text-sm text-white/50 hover:text-white/80 hover:border-white/20 transition-all font-mono"
          >
            <GitHubIcon />
            {isEn ? 'See all on GitHub →' : 'Lihat semua di GitHub →'}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
