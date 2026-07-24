import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

interface FeaturedWork {
  title: string
  titleId: string
  desc: string
  descId: string
  image: string
  url: string
  stack: string[]
  role: string
}

const works: FeaturedWork[] = [
  {
    title: 'Universitas Primagraha',
    titleId: 'Universitas Primagraha',
    desc: 'Official university website — industry-based higher education, faculty programs, and student admission portal with modern campus showcase.',
    descId: 'Website resmi universitas — pendidikan tinggi berbasis industri, program studi, dan portal PMB dengan showcase kampus modern.',
    image: '/works/primagraha.png',
    url: 'https://primagraha.ac.id',
    stack: ['Next.js', 'React', 'Prisma', 'PostgreSQL', 'Tailwind CSS'],
    role: 'Full Stack Developer'
  },
  {
    title: 'OPAC Library UPG',
    titleId: 'Perpustakaan Digital UPG',
    desc: 'Online Public Access Catalog for Universitas Primagraha — 3,070 book collections, full-text search, and digital visit tracking with 51K+ sessions.',
    descId: 'Katalog perpustakaan digital UPG — 3.070 koleksi buku, pencarian full-text, dan tracking kunjungan digital dengan 51K+ sesi.',
    image: '/works/opac-upg.png',
    url: 'https://opac.upg.ac.id',
    stack: ['SLiMS', 'PHP', 'MySQL', 'Bootstrap'],
    role: 'System Administrator'
  },
  {
    title: 'Central Jual Emas',
    titleId: 'Central Jual Emas',
    desc: 'Premium gold selling platform with transparent pricing, VIP rooms, certified appraisers, and instant WhatsApp consultation — luxury UX for a traditional service.',
    descId: 'Platform jual emas premium — harga transparan, ruang VIP, penilai bersertifikat, dan konsultasi WhatsApp instan. UX mewah untuk layanan tradisional.',
    image: '/works/central-emas.png',
    url: 'https://central-jual-emas.netlify.app',
    stack: ['HTML', 'CSS', 'JavaScript', 'Netlify'],
    role: 'Frontend Developer'
  },
  {
    title: 'Rajawali Prestige',
    titleId: 'Rajawali Prestige',
    desc: 'Premium platform for the Indonesian bird competition community — event arena, elite equipment catalog, national federation directory, and AI consultation.',
    descId: 'Platform premium komunitas kicau burung Indonesia — arena event, katalog peralatan elite, direktori federasi nasional, dan konsultasi AI.',
    image: '/works/rajawali.png',
    url: 'https://rajawaliprestige.my.id',
    stack: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript'],
    role: 'Full Stack Developer'
  },
  {
    title: 'Ting AI',
    titleId: 'Ting AI',
    desc: 'AI thinking partner for retail investors — not giving signals, just showing reality. Real-time macro intelligence, portfolio risk, and morning command center.',
    descId: 'Partner berpikir AI untuk investor ritel — bukan memberi sinyal, tapi menunjukkan realita. Intelijen makro, risiko portofolio, dan komando pagi.',
    image: '/works/tingsai.png',
    url: 'https://tingsai.my.id',
    stack: ['React', 'Next.js', 'Node.js', 'Gemini Pro', 'TypeScript'],
    role: 'Founder & Builder'
  }
]

export default function FeaturedProduct({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(i => (i - 1 + works.length) % works.length)
  const next = () => setCurrent(i => (i + 1) % works.length)

  const work = works[current]

  return (
    <section id={sectionId} className="py-24 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-white/[0.05]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header + arrows */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">
                {isEn ? 'Featured Works' : 'Karya Pilihan'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {isEn ? (
                <>Featured <span className="text-[var(--accent)]">Works</span>.</>
              ) : (
                <>Karya <span className="text-[var(--accent)]">Terpilih</span>.</>
              )}
            </h2>
            <p className="text-sm text-white/30 mt-2 max-w-xs leading-relaxed">
              {isEn
                ? 'A collection of projects I\'ve built — from user interfaces to complex systems.'
                : 'Kumpulan proyek yang telah saya bangun — dari antarmuka hingga sistem kompleks.'}
            </p>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-white/20 mr-2 tabular-nums">
              {String(current + 1).padStart(2, '0')} / {String(works.length).padStart(2, '0')}
            </span>
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
              aria-label="Previous"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
              aria-label="Next"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.a
            key={current}
            href={work.url}
            target="_blank"
            rel="noreferrer noopener"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="group block rounded-2xl border border-white/[0.07] bg-[var(--surface)] overflow-hidden hover:border-[var(--accent)]/20 transition-all duration-500"
          >
            <div className="grid md:grid-cols-[1fr_auto] gap-0">
              {/* Left: Screenshot */}
              <div className="relative overflow-hidden rounded-tl-2xl rounded-bl-2xl">
                <div className="aspect-[16/9] md:aspect-auto md:h-[340px] w-full overflow-hidden">
                  <img
                    src={work.image}
                    alt={work.title}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  {/* Overlay gradient on right side for desktop */}
                  <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[var(--surface)]" />
                </div>
              </div>

              {/* Right: Info panel */}
              <div className="md:w-[300px] p-7 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/[0.05]">
                <div>
                  {/* Role badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 mb-5">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                    <span className="text-[10px] font-mono text-[var(--accent)]/80 uppercase tracking-wider">{work.role}</span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">
                    {isEn ? work.title : work.titleId}
                  </h3>
                  <p className="text-sm text-white/35 leading-relaxed mb-6">
                    {isEn ? work.desc : work.descId}
                  </p>

                  {/* Stack */}
                  <div className="flex flex-wrap gap-1.5">
                    {work.stack.map(tech => (
                      <span key={tech} className="px-2 py-0.5 text-[10px] font-mono border border-white/[0.07] rounded text-white/30">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visit link */}
                <div className="flex items-center gap-1.5 mt-7 text-xs font-mono text-white/25 group-hover:text-[var(--accent)]/70 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M3 13L13 3M13 3H6M13 3V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {work.url.replace('https://', '')}
                </div>
              </div>
            </div>
          </motion.a>
        </AnimatePresence>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {works.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-4 h-1 bg-[var(--accent)]'
                  : 'w-1 h-1 bg-white/15 hover:bg-white/30'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
