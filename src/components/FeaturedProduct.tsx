import React from 'react'
import { Link } from 'react-router-dom'
import type { SectionProps } from '../types'
import { useLanguagePreference } from '../utils/language'

export default function FeaturedProduct({ sectionId }: SectionProps) {
  const { language } = useLanguagePreference()
  const isEnglish = language === 'en'

  const copy = isEnglish
    ? {
        eyebrow: 'FLAGSHIP PROJECT',
        title: 'Ting AI',
        description:
          'An AI portfolio workspace that helps retail investors understand risk, market context, and portfolio exposure before making decisions.',
        highlights: [
          {
            title: 'Portfolio Insight',
            text: 'Reads concentration and risk exposure.'
          },
          {
            title: 'Decision Layer',
            text: 'Frames monitor, wait, or rebalance without giving signals.'
          },
          {
            title: 'Risk Simulation',
            text: 'Shows potential impact before it happens.'
          }
        ],
        metrics: ['76,8% in AAPL', 'Rebalance', 'If down 5% → -3,84%'],
        primaryCta: 'Open Ting AI',
        secondaryCta: 'View Portfolio Workspace',
        panelTitle: 'Built for clearer decisions'
      }
    : {
        eyebrow: 'PROYEK UTAMA',
        title: 'Ting AI',
        description:
          'Workspace portofolio berbasis AI yang membantu investor ritel memahami risiko, konteks pasar, dan eksposur sebelum mengambil keputusan.',
        highlights: [
          {
            title: 'Insight Portofolio',
            text: 'Membaca konsentrasi dan eksposur risiko.'
          },
          {
            title: 'Decision Layer',
            text: 'Membantu memilih pantau, tunggu, atau rebalance tanpa memberi sinyal.'
          },
          {
            title: 'Simulasi Risiko',
            text: 'Menunjukkan dampak risiko sebelum terjadi.'
          }
        ],
        metrics: ['76,8% di AAPL', 'Rebalance', 'Jika turun 5% → -3,84%'],
        primaryCta: 'Buka Ting AI',
        secondaryCta: 'Buka Workspace Portofolio',
        panelTitle: 'Dirancang untuk keputusan yang lebih jelas'
      }

  return (
    <section id={sectionId} className="featured-product container reveal ai-flagship">
      <div className="featured-product-head">
        <div>
          <div className="eyebrow">{copy.eyebrow}</div>
          <h2>{copy.title}</h2>
          <p className="lead">{copy.description}</p>
        </div>
        <img
          className="featured-product-logo"
          src="/ting-ai-logo-light-horizontal.png"
          alt="Ting AI logo"
          loading="lazy"
        />
      </div>

      <div className="featured-product-card">
        <div className="featured-product-copy">
          <h3>{copy.panelTitle}</h3>
          <div className="featured-product-metrics">
            {copy.metrics.map((metric) => (
              <span key={metric} className="featured-product-metric-pill">
                {metric}
              </span>
            ))}
          </div>
          <div className="featured-product-actions">
            <Link className="btn" to="/ting-ai">
              {copy.primaryCta}
            </Link>
            <Link className="btn secondary" to="/portfolio">
              {copy.secondaryCta}
            </Link>
          </div>
        </div>
        <div className="featured-product-pillar-grid">
          {copy.highlights.map((pillar) => (
            <article key={pillar.title} className="featured-pillar ai-featured-pillar">
              <h4>{pillar.title}</h4>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
