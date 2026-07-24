import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguagePreference } from '../../utils/language'

const decorativeCards = [
  { titleEn: 'Context', titleId: 'Konteks', bars: [74, 48, 61] },
  { titleEn: 'Risk', titleId: 'Risiko', bars: [36, 62, 44] },
  { titleEn: 'Narrative', titleId: 'Narasi', bars: [58, 31, 66] }
]

export default function TingAiV2Hero() {
  const { language } = useLanguagePreference()
  const isEnglish = language === 'en'

  const copy = isEnglish
    ? {
        label: 'AI Intelligence',
        title: 'Ting AI 2.0',
        pillars: ['Market Context', 'Risk Awareness', 'Narratives', 'Portfolio Insight'],
        summary:
          'A calm, intelligence-first surface for understanding what markets may be pricing, where risk is building, and how portfolio context changes interpretation.',
        exploreDashboard: 'Explore current dashboard',
        viewStable: 'View Ting AI 1.9.2'
      }
    : {
        label: 'Inteligensi AI',
        title: 'Ting AI 2.0',
        pillars: ['Konteks Pasar', 'Kesadaran Risiko', 'Narasi', 'Insight Portofolio'],
        summary:
          'Gunakan workspace untuk membaca kondisi portofolio dan risiko secara langsung.',
        exploreDashboard: 'Buka Portfolio Workspace',
        viewStable: 'Lihat Versi Saat Ini'
      }

  return (
    <section className="ting-ai-v2-hero">
      <div className="ting-ai-v2-hero-copy">
        <p className="eyebrow">{copy.label}</p>
        <h1>{copy.title}</h1>
        <div className="ting-ai-v2-pillars" aria-label={copy.title}>
          {copy.pillars.map((pillar) => (
            <span key={pillar} className="ting-ai-v2-pillar-chip">
              {pillar}
            </span>
          ))}
        </div>
        <p className="lead ting-ai-v2-summary">{copy.summary}</p>
        <div className="hero-cta">
          <Link className="btn" to="/portfolio">
            {copy.exploreDashboard}
          </Link>
          <Link className="btn secondary" to="/dashboard">
            {copy.viewStable}
          </Link>
        </div>
      </div>

      <div className="ting-ai-v2-hero-art" aria-hidden="true">
        <div className="ting-ai-v2-preview-shell">
          <div className="ting-ai-v2-preview-card ting-ai-v2-preview-card-main">
            <div className="ting-ai-v2-preview-chip-row">
              <span className="ting-ai-v2-preview-chip" />
              <span className="ting-ai-v2-preview-chip ting-ai-v2-preview-chip-wide" />
            </div>
            <div className="ting-ai-v2-preview-orbit">
              <span className="ting-ai-v2-preview-orbit-core" />
              <span className="ting-ai-v2-preview-orbit-ring ting-ai-v2-preview-orbit-ring-a" />
              <span className="ting-ai-v2-preview-orbit-ring ting-ai-v2-preview-orbit-ring-b" />
            </div>
          </div>

          <div className="ting-ai-v2-preview-stack">
            {decorativeCards.map((card) => (
              <div key={card.titleEn} className="ting-ai-v2-preview-card">
                <span className="ting-ai-v2-preview-label">
                  {isEnglish ? card.titleEn : card.titleId}
                </span>
                <div className="ting-ai-v2-preview-bars">
                  {card.bars.map((bar, index) => (
                    <span
                      key={`${card.titleEn}-${index}`}
                      className="ting-ai-v2-preview-bar"
                      style={{ width: `${bar}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
