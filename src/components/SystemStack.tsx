import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

/* ── Marquee row 1 (scroll left) ─── */
const row1 = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
  { name: 'Next.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
  { name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg' },
  { name: 'Tailwind CSS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
  { name: 'FastAPI', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg' },
  { name: 'PostgreSQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
]

/* ── Marquee row 2 (scroll right) ─── */
const row2 = [
  { name: 'Redis', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg' },
  { name: 'Git', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
  { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
  { name: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg' },
  { name: 'MySQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg' },
  { name: 'PHP', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg' },
  { name: 'Laravel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg' },
  { name: 'GraphQL', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/graphql/graphql-plain.svg' },
]

function MarqueeChip({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-2.5 px-5 py-3 mx-2 rounded-xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 cursor-default group">
      <img
        src={icon}
        alt={name}
        className="w-5 h-5 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
        loading="lazy"
      />
      <span className="text-sm font-medium text-white/50 group-hover:text-white/80 transition-colors whitespace-nowrap">
        {name}
      </span>
    </div>
  )
}

export default function SystemStack() {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  // Duplicate items for seamless loop
  const r1 = [...row1, ...row1]
  const r2 = [...row2, ...row2]

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Hairline divider top */}
      <div className="absolute top-0 inset-x-0 h-px bg-white/[0.05]" />

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 mb-3"
        >
          <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
            {isEn ? 'Tech Skills' : 'Teknologi'}
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="text-3xl md:text-4xl font-black text-white tracking-tight"
        >
          {isEn ? (
            <>Tech <span className="text-[var(--accent)]">Skills</span>.</>
          ) : (
            <>Keahlian <span className="text-[var(--accent)]">Teknis</span>.</>
          )}
        </motion.h2>
      </div>

      {/* ── Marquee Rows ── */}
      <div className="relative">
        {/* Fade masks left & right */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} />
        <div className="absolute inset-y-0 right-0 w-24 md:w-40 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} />

        {/* Row 1 — scroll left */}
        <div className="flex mb-3 overflow-hidden">
          <div className="flex animate-marquee-left">
            {r1.map((tech, i) => (
              <MarqueeChip key={`r1-${i}`} name={tech.name} icon={tech.icon} />
            ))}
          </div>
        </div>

        {/* Row 2 — scroll right */}
        <div className="flex overflow-hidden">
          <div className="flex animate-marquee-right">
            {r2.map((tech, i) => (
              <MarqueeChip key={`r2-${i}`} name={tech.name} icon={tech.icon} />
            ))}
          </div>
        </div>
      </div>

      {/* Hairline divider bottom */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-white/[0.05]" />
    </section>
  )
}
