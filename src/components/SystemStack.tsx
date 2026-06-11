import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

const skillGroups = [
  {
    title: "Frontend",
    icon: "⬡",
    color: "#25d0c3",
    techs: [
      { name: "React", level: 90 },
      { name: "TypeScript", level: 85 },
      { name: "Next.js", level: 80 },
      { name: "Tailwind", level: 88 },
      { name: "Framer Motion", level: 75 }
    ],
    descId: "Membangun antarmuka modern, responsif, dan interaktif dengan fokus pada pengalaman pengguna.",
    descEn: "Building modern, responsive, and interactive interfaces with focus on user experience."
  },
  {
    title: "Backend & AI",
    icon: "⬡",
    color: "#4ea8de",
    techs: [
      { name: "FastAPI", level: 82 },
      { name: "Python", level: 85 },
      { name: "Gemini Pro", level: 78 },
      { name: "LangChain", level: 70 },
      { name: "Groq / GPT", level: 72 }
    ],
    descId: "Merancang backend dan pipeline AI multi-model untuk sistem pendukung keputusan.",
    descEn: "Designing backend and multi-model AI pipelines for decision support systems."
  },
  {
    title: "Data & Infrastructure",
    icon: "⬡",
    color: "#d6b15d",
    techs: [
      { name: "PostgreSQL", level: 75 },
      { name: "Redis", level: 68 },
      { name: "OpenBB", level: 80 },
      { name: "Polygon API", level: 76 },
      { name: "FRED / Macro", level: 72 }
    ],
    descId: "Integrasi sumber data keuangan dan pengelolaan infrastruktur data untuk analitik real-time.",
    descEn: "Integrating financial data sources and managing data infrastructure for real-time analytics."
  },
  {
    title: "Tooling & Workflow",
    icon: "⬡",
    color: "#a78bfa",
    techs: [
      { name: "Git / GitHub", level: 88 },
      { name: "Vite / Bun", level: 80 },
      { name: "Playwright", level: 70 },
      { name: "PM2 / VPS", level: 72 },
      { name: "Figma", level: 65 }
    ],
    descId: "Toolchain lengkap dari development hingga deployment — testing, CI, dan server management.",
    descEn: "Full toolchain from development to deployment — testing, CI, and server management."
  }
]

function SkillBar({ level, color }: { level: number; color: string }) {
  return (
    <div className="h-0.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `${color}60` }}
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

export default function SystemStack() {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container-saas">
        <div className="mb-16 text-center lg:text-left">
          <div className="panel-label mb-2 text-accent">
            {isEn ? 'Capabilities' : 'Kemampuan'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient">
            {isEn ? 'Tech Stack & Skills' : 'Tech Stack & Keahlian'}
          </h2>
          <p className="text-sm text-white/40 mt-3 max-w-lg">
            {isEn
              ? 'Technologies I work with across products, open source, and research.'
              : 'Teknologi yang saya gunakan di produk, open source, dan riset.'}
          </p>
        </div>

        {/* Mobile: accordion */}
        <div className="md:hidden text-left mb-8">
          <details className="group border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden">
            <summary className="p-4 text-sm font-medium text-white cursor-pointer hover:bg-white/[0.04] transition-colors list-none flex justify-between items-center">
              <span>{isEn ? 'View full skill breakdown' : 'Lihat semua keahlian'}</span>
              <span className="text-white/40 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 pt-0 flex flex-col gap-5">
              {skillGroups.map((group) => (
                <div key={group.title} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-bold text-white">{group.title}</h3>
                  </div>
                  <p className="text-xs text-white/40 mb-3 leading-relaxed">
                    {isEn ? group.descEn : group.descId}
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {group.techs.map(tech => (
                      <div key={tech.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-mono text-white/50">{tech.name}</span>
                          <span className="text-[10px] font-mono text-white/25">{tech.level}%</span>
                        </div>
                        <SkillBar level={tech.level} color={group.color} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Subtle connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />

          {skillGroups.map((group, i) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col hover-glow transition-all will-change-transform group relative z-10 h-full"
            >
              <div className="mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 border border-white/5 group-hover:border-opacity-40 transition-colors"
                  style={{ background: `${group.color}10`, borderColor: `${group.color}20` }}
                >
                  <span className="text-base" style={{ color: group.color }}>⬡</span>
                </div>
                <h3 className="text-base font-bold mb-2 group-hover:text-accent transition-colors">
                  {group.title}
                </h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  {isEn ? group.descEn : group.descId}
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                {group.techs.map(tech => (
                  <div key={tech.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] font-mono text-white/50">{tech.name}</span>
                      <span className="text-[10px] font-mono text-white/20">{tech.level}%</span>
                    </div>
                    <SkillBar level={tech.level} color={group.color} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom label strip */}
        <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-mono text-white/20 uppercase tracking-widest">
          <span>Frontend</span>
          <span className="w-4 h-px bg-white/10" />
          <span>Backend</span>
          <span className="w-4 h-px bg-white/10" />
          <span>Data</span>
          <span className="w-4 h-px bg-white/10" />
          <span>Tooling</span>
          <span className="w-4 h-px bg-white/10" />
          <span className="text-accent/50">{isEn ? 'Full Stack AI Builder' : 'Full Stack AI Builder'}</span>
        </div>
      </div>
    </section>
  )
}
