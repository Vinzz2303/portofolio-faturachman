import React from 'react'
import type { SectionProps } from '../types'
import { useLanguagePreference } from '../utils/language'

type ProjectLink = {
  label: string
  href: string
}

type CaseStudyItem = {
  label: string
  text: string
}

type Project = {
  id: number
  cover: string
  title: {
    id: string
    en: string
  }
  desc: {
    id: string
    en: string
  }
  stack: string
  highlights: {
    id: string[]
    en: string[]
  }
  caseStudy: {
    id: CaseStudyItem[]
    en: CaseStudyItem[]
  }
  note: {
    id: string
    en: string
  }
  links: ProjectLink[]
}

const projects: Project[] = [
  {
    id: 2,
    cover: '/projects/central-emas.png',
    title: {
      id: 'Central Jual Emas',
      en: 'Central Jual Emas'
    },
    desc: {
      id: 'Landing page penjualan emas yang fokus pada edukasi, estimasi harga, dan CTA yang jelas.',
      en: 'A gold-selling landing page focused on education, pricing estimates, and clear conversion paths.'
    },
    stack: 'HTML, CSS, JavaScript, React, Vite, REST API',
    highlights: {
      id: [
        'Kalkulator estimasi harga emas',
        'Harga emas otomatis via API',
        'WhatsApp CTA, testimoni, FAQ, dan lokasi'
      ],
      en: [
        'Gold price estimation calculator',
        'Automatic gold pricing via API',
        'WhatsApp CTA, testimonials, FAQ, and locations'
      ]
    },
    caseStudy: {
      id: [
        { label: 'Masalah', text: 'Pengunjung butuh estimasi cepat dan rasa percaya saat menjual emas.' },
        { label: 'Solusi', text: 'Kalkulator harga otomatis dengan CTA WhatsApp yang jelas.' },
        { label: 'Hasil', text: 'Alur yang lebih singkat dan fokus ke konversi.' }
      ],
      en: [
        { label: 'Problem', text: 'Visitors need a quick estimate and trust before selling gold.' },
        { label: 'Solution', text: 'An automatic pricing calculator with a clear WhatsApp CTA.' },
        { label: 'Result', text: 'A shorter flow designed around conversion.' }
      ]
    },
    note: {
      id: 'Data customer, cabang, dan testimoni menggunakan konten mockup untuk kebutuhan desain.',
      en: 'Customer, branch, and testimonial data use mock content for presentation.'
    },
    links: [
      { label: 'Demo', href: 'https://central-jual-emas.netlify.app/' },
      { label: 'Admin', href: 'https://central-jual-emas.netlify.app/admin.html' },
      { label: 'Repo', href: 'https://github.com/Vinzz2303/central-jual-emas' }
    ]
  },
  {
    id: 3,
    cover: '/projects/queen-cell.png',
    title: {
      id: 'For My Queen Cell',
      en: 'For My Queen Cell'
    },
    desc: {
      id: 'Website personal bernuansa hangat dengan storytelling, mood switch, dan pengalaman mobile-first.',
      en: 'A warm personal website with storytelling, mood switching, and a mobile-first presentation.'
    },
    stack: 'HTML, CSS, JavaScript, React (UMD)',
    highlights: {
      id: [
        'Hero dengan pesan personal',
        'Mood switch untuk ubah nuansa',
        'Timeline cerita dan audio',
        'Animasi dekoratif ringan'
      ],
      en: [
        'Hero with a personal message',
        'Mood switch for visual tone',
        'Story timeline and audio',
        'Light decorative animation'
      ]
    },
    caseStudy: {
      id: [
        { label: 'Masalah', text: 'Klien ingin hadiah digital yang terasa personal dan hangat.' },
        { label: 'Solusi', text: 'Storytelling lembut dengan mood switch dan audio.' },
        { label: 'Hasil', text: 'Pengalaman mobile yang lebih intim dan berkesan.' }
      ],
      en: [
        { label: 'Problem', text: 'The client wanted a digital gift that felt personal and warm.' },
        { label: 'Solution', text: 'Soft storytelling supported by a mood switch and audio.' },
        { label: 'Result', text: 'A more intimate and memorable mobile experience.' }
      ]
    },
    note: {
      id: 'Project klien dengan copy dan isi yang disesuaikan dengan permintaan.',
      en: 'Client project with copy and content tailored to the request.'
    },
    links: [
      { label: 'Demo', href: 'https://formyqueencell.netlify.app/' },
      { label: 'Repo', href: 'https://github.com/Vinzz2303/buatcelyn' }
    ]
  }
]

export default function Projects({ sectionId }: SectionProps) {
  const { language } = useLanguagePreference()
  const isEnglish = language === 'en'

  const copy = isEnglish
    ? {
        title: 'Recent Projects',
        lead: 'Selected frontend work beyond Ting AI, kept lighter so the flagship product stays in focus.',
        stack: 'Stack'
      }
    : {
        title: 'Proyek Terbaru',
        lead: 'Beberapa project frontend terbaru di luar Ting AI, dengan fokus visual yang tetap lebih ringan.',
        stack: 'Stack'
      }

  return (
    <section id={sectionId} className="projects container reveal ai-projects">
      <div className="ai-section-head">
        <h2>{copy.title}</h2>
        <p className="lead">{copy.lead}</p>
      </div>
      <div className="grid ai-project-grid">
        {projects.map(project => (
          <article key={project.id} className="card ai-project-card">
            <div className="card-cover">
              <img
                src={project.cover}
                alt={`${project.title[language]} cover`}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="card-body">
              <h3>{project.title[language]}</h3>
              <p>{project.desc[language]}</p>
              <p className="card-meta">
                <strong>{copy.stack}:</strong> {project.stack}
              </p>
              <ul className="card-list">
                {project.highlights[language].map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <div className="case-study">
                {project.caseStudy[language].map((item) => (
                  <div key={item.label} className="case-row">
                    <span className="case-label">{item.label}</span>
                    <span className="case-text">{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="card-note">{project.note[language]}</p>
              <div className="card-links">
                {project.links.map((link) => (
                  <a
                    key={link.label}
                    className="btn-outline"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
