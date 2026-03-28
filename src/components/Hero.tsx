import React from 'react'
import type { SectionProps } from '../types'

export default function Hero({ sectionId }: SectionProps) {
  return (
    <section id={sectionId} className="hero container reveal">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="eyebrow">Frontend Developer</div>
          <h1>Faturachman Al kahfi</h1>
          <p className="lead">
            Frontend developer focused on premium business landing pages with clear direction and conversion-ready flows.
            I build fast, responsive UI with React and modern web tech.
          </p>
          <div className="hero-badges">
            <span className="badge">Landing Pages</span>
            <span className="badge">UI Conversion</span>
            <span className="badge">React + Vite</span>
            <span className="badge">Clean UX</span>
          </div>
          <div className="hero-cta">
            <a className="btn" href="#projects">View my projects</a>
            <a className="btn secondary" href="#contact">Quick consultation</a>
            <a className="btn secondary" href="/faturachman-alkahfi-resume.pdf" target="_blank" rel="noreferrer">
              Download resume
            </a>
          </div>
        </div>
        <div className="hero-aside">
          <div className="hero-photo">
            <picture>
              <source srcSet="/profile.webp" type="image/webp" />
              <img src="/profile.png" alt="Faturachman Al kahfi" decoding="async" fetchPriority="high" />
            </picture>
          </div>
          <div className="hero-panel">
            <h3>Signature</h3>
            <ul className="hero-list">
              <li>Clean, elegant, consistent layouts.</li>
              <li>Clear CTAs that drive conversion.</li>
              <li>Fast loading with lightweight UI.</li>
            </ul>
          </div>
          <div className="hero-panel">
            <h3>Stack</h3>
            <div className="chips">
              <span className="chip">React</span>
              <span className="chip">Vite</span>
              <span className="chip">HTML</span>
              <span className="chip">CSS</span>
              <span className="chip">JavaScript</span>
              <span className="chip">REST API</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
