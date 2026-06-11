import React from 'react'
import type { SectionProps } from '../types'
import { useLanguagePreference } from '../utils/language'

const copy = {
  en: {
    title: 'About Me',
    lead1:
      'I am a developer focused on building AI-driven digital products, especially interfaces, portfolio systems, and decision-support tools.',
    lead2:
      'I am currently building Ting AI, an AI portfolio workspace that helps retail investors understand risk before making decisions.',
    skillsTitle: 'Core Skills',
    groups: [
      ['AI', ['LLM Integration', 'Prompt Engineering', 'AI Response Structuring', 'Context-Aware Systems']],
      ['Backend', ['FastAPI', 'REST API Design', 'API Integration', 'Data Processing']],
      ['Frontend', ['React', 'TypeScript', 'Vite', 'UI Systems', 'Animation']],
      ['Product', ['Risk Intelligence', 'Portfolio UX', 'Decision Layer', 'Financial UX']]
    ]
  },
  id: {
    title: 'Tentang Saya',
    lead1:
      'Saya adalah developer yang fokus membangun produk digital berbasis AI, terutama pada interface, sistem portofolio, dan decision-support tools.',
    lead2:
      'Saat ini saya mengembangkan Ting AI, sebuah AI portfolio workspace untuk membantu investor ritel memahami risiko sebelum mengambil keputusan.',
    skillsTitle: 'Skill Utama',
    groups: [
      ['AI', ['LLM Integration', 'Prompt Engineering', 'AI Response Structuring', 'Context-Aware Systems']],
      ['Backend', ['FastAPI', 'REST API Design', 'API Integration', 'Data Processing']],
      ['Frontend', ['React', 'TypeScript', 'Vite', 'UI Systems', 'Animation']],
      ['Product', ['Risk Intelligence', 'Portfolio UX', 'Decision Layer', 'Financial UX']]
    ]
  }
}

export default function About({ sectionId }: SectionProps) {
  const { language } = useLanguagePreference()
  const c = copy[language]

  return (
    <section id={sectionId} className="about container reveal ai-about-section">
      <div className="section-kicker">{language === 'en' ? 'Personal Identity' : 'Identitas Personal'}</div>
      <h2>{c.title}</h2>
      <div className="about-intro-card">
        <p className="lead">{c.lead1}</p>
        <p>{c.lead2}</p>
      </div>

      <div className="skills ai-skill-section">
        <h3>{c.skillsTitle}</h3>
        <div className="skill-group-grid">
          {c.groups.map(([group, skills]) => (
            <article className="skill-group-card" key={group as string}>
              <h4>{group as string}</h4>
              <div className="chips">
                {(skills as string[]).map((skill) => (
                  <span className="chip" key={skill}>{skill}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
