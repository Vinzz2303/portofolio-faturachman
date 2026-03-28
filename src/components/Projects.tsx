import React from 'react'
import type { SectionProps } from '../types'

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
  title: string
  desc: string
  stack: string
  highlights: string[]
  caseStudy: CaseStudyItem[]
  note: string
  links: ProjectLink[]
}

const projects: Project[] = [
  {
    id: 1,
    cover: '/projects/central-emas.png',
    title: 'Central Jual Emas (Concept Project)',
    desc:
      'Concept landing page for a gold selling service focused on education and conversion. ' +
      'Conversion-focused with pricing insights and clear CTAs.',
    stack: 'HTML, CSS, JavaScript, React, Vite, REST API',
    highlights: [
      'Gold price estimation calculator',
      'Auto gold price via API (XAUSD/world data)',
      'WhatsApp CTA, testimonials, FAQ, locations'
    ],
    caseStudy: [
      { label: 'Problem', text: 'Visitors need quick estimates and trust when selling gold.' },
      { label: 'Solution', text: 'Auto pricing calculator plus clear WhatsApp CTA.' },
      { label: 'Result', text: 'A shorter flow focused on conversion.' }
    ],
    note: 'Customer/branch/testimonial data uses mock content for design purposes.',
    links: [
      { label: 'Demo', href: 'https://central-jual-emas.netlify.app/' },
      { label: 'Admin', href: 'https://central-jual-emas.netlify.app/admin.html' },
      { label: 'Repo', href: 'https://github.com/Vinzz2303/central-jual-emas' }
    ]
  },
  {
    id: 2,
    cover: '/projects/queen-cell.png',
    title: 'For My Queen Cell (Client Project)',
    desc:
      'Romantic themed website for "HTS" with personal messages, mood switch, and warm storytelling. ' +
      'A soft, mobile-first experience with playful interactions.',
    stack: 'HTML, CSS, JavaScript, React (UMD)',
    highlights: [
      'Hero with personal message + message toggle',
      'Mood switch to change the vibe',
      'Story timeline + audio player',
      'Floating hearts animation'
    ],
    caseStudy: [
      { label: 'Problem', text: 'Client wanted a personal, warm digital gift.' },
      { label: 'Solution', text: 'Soft storytelling with mood switch and audio.' },
      { label: 'Result', text: 'An intimate, memorable mobile experience.' }
    ],
    note: 'Client project: copy and content customized to the request.',
    links: [
      { label: 'Demo', href: 'https://formyqueencell.netlify.app/' },
      { label: 'Repo', href: 'https://github.com/Vinzz2303/buatcelyn' }
    ]
  }
]

export default function Projects({ sectionId }: SectionProps) {
  return (
    <section id={sectionId} className="projects container reveal">
      <h2>Projects</h2>
      <div className="grid">
        {projects.map(project => (
          <article key={project.id} className="card">
            <div className="card-cover">
              <img
                src={project.cover}
                alt={`${project.title} cover`}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="card-body">
              <h3>{project.title}</h3>
              <p>{project.desc}</p>
              <p className="card-meta">
                <strong>Stack:</strong> {project.stack}
              </p>
              <ul className="card-list">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <div className="case-study">
                {project.caseStudy.map((item) => (
                  <div key={item.label} className="case-row">
                    <span className="case-label">{item.label}</span>
                    <span className="case-text">{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="card-note">{project.note}</p>
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
