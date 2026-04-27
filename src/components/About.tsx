import React from 'react'
import type { SectionProps } from '../types'
import { useLanguagePreference } from '../utils/language'

export default function About({ sectionId }: SectionProps) {
  const { language } = useLanguagePreference()
  const isEnglish = language === 'en'

  const copy = isEnglish
    ? {
        eyebrow: 'PHILOSOPHY',
        title: 'How I think',
        text: 'Most tools show data. I build systems that help people understand it.',
        cards: [
          {
            eyebrow: 'Structure',
            title: 'One clear job per screen',
            body: 'I shape routes, sections, and hierarchy so each surface feels easy to read.'
          },
          {
            eyebrow: 'Clarity',
            title: 'Information before decoration',
            body: 'Visual choices support comprehension, trust, and decision flow.'
          },
          {
            eyebrow: 'Execution',
            title: 'Build fast, keep it maintainable',
            body: 'I prefer production-ready frontend systems that still stay flexible to evolve.'
          }
        ],
        skillsTitle: 'Skills',
        frontendTitle: 'Frontend',
        backendTitle: 'Backend',
        aiTitle: 'AI',
        productTitle: 'Product',
        frontendSkills: ['React', 'TypeScript', 'UI Systems', 'Animation'],
        backendSkills: ['FastAPI', 'API Integration', 'Data Processing'],
        aiSkills: ['LLM Integration', 'Prompt Engineering', 'AI Response Structuring'],
        productSkills: ['Risk Intelligence', 'Portfolio UX', 'Decision Layer'],
        resumeTitle: 'Resume',
        resumeText: 'A concise overview of my full stack, AI product, and frontend execution experience.',
        resumeCta: 'Download Resume'
      }
    : {
        eyebrow: 'FILOSOFI',
        title: 'Cara saya berpikir',
        text: 'Kebanyakan tools hanya menampilkan data. Saya membangun sistem yang membantu orang memahaminya.',
        cards: [
          {
            eyebrow: 'Struktur',
            title: 'Satu layar, satu tugas yang jelas',
            body: 'Saya menyusun route, section, dan hierarchy agar setiap surface terasa mudah dibaca.'
          },
          {
            eyebrow: 'Kejelasan',
            title: 'Informasi lebih penting dari dekorasi',
            body: 'Pilihan visual saya pakai untuk mendukung pemahaman, rasa percaya, dan alur keputusan.'
          },
          {
            eyebrow: 'Eksekusi',
            title: 'Cepat dibangun, tetap rapi dirawat',
            body: 'Saya lebih suka sistem frontend yang siap produksi dan tetap fleksibel untuk berkembang.'
          }
        ],
        skillsTitle: 'Skills',
        frontendTitle: 'Frontend',
        backendTitle: 'Backend',
        aiTitle: 'AI',
        productTitle: 'Product',
        frontendSkills: ['React', 'TypeScript', 'UI Systems', 'Animation'],
        backendSkills: ['FastAPI', 'API Integration', 'Data Processing'],
        aiSkills: ['LLM Integration', 'Prompt Engineering', 'AI Response Structuring'],
        productSkills: ['Risk Intelligence', 'Portfolio UX', 'Decision Layer'],
        resumeTitle: 'Resume',
        resumeText: 'Ringkasan singkat tentang pengalaman saya di full stack, AI product, dan eksekusi frontend.',
        resumeCta: 'Unduh Resume'
      }

  return (
    <section id={sectionId} className="about container reveal ai-philosophy">
      <div className="ai-section-head">
        <div className="eyebrow">{copy.eyebrow}</div>
        <h2>{copy.title}</h2>
        <p className="lead">{copy.text}</p>
      </div>
      <div className="value-grid">
        {copy.cards.map((card) => (
          <div key={card.title} className="value-card ai-value-card">
            <div className="eyebrow">{card.eyebrow}</div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </div>
        ))}
      </div>
      <div className="skills">
        <h3>{copy.skillsTitle}</h3>
        <div className="value-grid">
          <div className="value-card ai-value-card">
            <div className="eyebrow">{copy.frontendTitle}</div>
            <div className="chips">
              {copy.frontendSkills.map((item) => (
                <span key={item} className="chip">{item}</span>
              ))}
            </div>
          </div>
          <div className="value-card ai-value-card">
            <div className="eyebrow">{copy.backendTitle}</div>
            <div className="chips">
              {copy.backendSkills.map((item) => (
                <span key={item} className="chip">{item}</span>
              ))}
            </div>
          </div>
          <div className="value-card ai-value-card">
            <div className="eyebrow">{copy.aiTitle}</div>
            <div className="chips">
              {copy.aiSkills.map((item) => (
                <span key={item} className="chip">{item}</span>
              ))}
            </div>
          </div>
          <div className="value-card ai-value-card">
            <div className="eyebrow">{copy.productTitle}</div>
            <div className="chips">
              {copy.productSkills.map((item) => (
                <span key={item} className="chip">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="value-card ai-value-card ai-resume-card">
        <div className="eyebrow">{copy.resumeTitle}</div>
        <p>{copy.resumeText}</p>
        <div className="hero-cta">
          <a
            className="btn secondary"
            href="/faturachman-alkahfi-resume.pdf"
            target="_blank"
            rel="noreferrer"
          >
            {copy.resumeCta}
          </a>
        </div>
      </div>
    </section>
  )
}
