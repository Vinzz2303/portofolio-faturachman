import React from 'react'
import { Link } from 'react-router-dom'
import type { SectionProps } from '../types'
import { useLanguagePreference } from '../utils/language'

export default function Hero({ sectionId }: SectionProps) {
  const { language } = useLanguagePreference()
  const isEnglish = language === 'en'

  const copy = isEnglish
    ? {
        name: 'Faturachman Alkahfi',
        role: 'AI Product Builder & Full Stack Developer',
        eyebrow: 'AI PRODUCT BUILDER & FULL STACK DEVELOPER',
        title: 'I build AI-driven systems and product interfaces.',
        description:
          'I build AI-driven systems and interfaces that turn data into insight, decisions, and real product experience.',
        pills: ['LLM Integration', 'Prompt Engineering', 'React', 'Risk Intelligence'],
        primaryCta: 'Explore Ting AI',
        secondaryCta: 'View Projects',
        thirdCta: 'Contact Me',
        resumeCta: 'Download Resume',
        cardOne: 'AI Layer',
        cardTwo: 'Risk Context',
        cardThree: 'Portfolio Insight',
        signalLabel: 'Flagship Focus',
        signalValue: 'Ting AI',
        noteLabel: 'Positioning',
        noteValue: 'AI Product Builder & Full Stack Developer'
      }
    : {
        name: 'Faturachman Alkahfi',
        role: 'AI Product Builder & Full Stack Developer',
        eyebrow: 'AI PRODUCT BUILDER & FULL STACK DEVELOPER',
        title: 'Saya membangun sistem dan interface berbasis AI.',
        description:
          'Saya membangun sistem dan interface berbasis AI yang mengubah data menjadi insight, keputusan, dan pengalaman produk nyata.',
        pills: ['LLM Integration', 'Prompt Engineering', 'React', 'Risk Intelligence'],
        primaryCta: 'Lihat Ting AI',
        secondaryCta: 'Lihat Proyek',
        thirdCta: 'Hubungi Saya',
        resumeCta: 'Unduh Resume',
        cardOne: 'AI Layer',
        cardTwo: 'Risk Context',
        cardThree: 'Portfolio Insight',
        signalLabel: 'Fokus Utama',
        signalValue: 'Ting AI',
        noteLabel: 'Posisi',
        noteValue: 'AI Product Builder & Full Stack Developer'
      }

  const [preTitle, postTitle] = copy.title.split('AI-driven')

  return (
    <section id={sectionId} className="ai-home ai-hero container reveal">
      <div className="ai-hero-layout">
        <div className="ai-hero-copy">
          <div className="hero-personal">
            <div className="hero-name">{copy.name}</div>
            <div className="hero-role">{copy.role}</div>
          </div>
          <div className="eyebrow">{copy.eyebrow}</div>
          <h1>
            {preTitle}
            <span className="ai-highlight">AI-driven</span>
            {postTitle}
          </h1>
          <p className="lead">{copy.description}</p>
          <div className="hero-badges">
            {copy.pills.map((pill) => (
              <span className="badge" key={pill}>
                {pill}
              </span>
            ))}
          </div>
          <div className="hero-cta">
            <Link className="btn" to="/ting-ai">
              {copy.primaryCta}
            </Link>
            <a className="btn secondary" href="#projects">
              {copy.secondaryCta}
            </a>
            <a className="btn secondary" href="#contact">
              {copy.thirdCta}
            </a>
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
        <div className="ai-hero-visual" aria-hidden="true">
          <div className="hero-photo-panel hero-glass">
            <div className="hero-photo">
              <img src="/faturachman-photo.svg" alt="Faturachman Alkahfi" />
            </div>
          </div>
          <div className="ai-orb-stage">
            <div className="ai-scan-line" />
            <div className="ai-orb-glow" />
            <div className="ai-orb-core" />
            <div className="ai-orbit ai-orbit-one" />
            <div className="ai-orbit ai-orbit-two" />
            <div className="ai-orbit ai-orbit-three" />
            <div className="ai-floating-card ai-floating-card-one">{copy.cardOne}</div>
            <div className="ai-floating-card ai-floating-card-two">{copy.cardTwo}</div>
            <div className="ai-floating-card ai-floating-card-three">{copy.cardThree}</div>
          </div>
          <div className="ai-hero-signal ai-hero-signal-top">
            <span>{copy.signalLabel}</span>
            <strong>{copy.signalValue}</strong>
          </div>
          <div className="ai-hero-signal ai-hero-signal-bottom">
            <span>{copy.noteLabel}</span>
            <strong>{copy.noteValue}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
