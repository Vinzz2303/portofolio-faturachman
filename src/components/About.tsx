import React from 'react'
import type { SectionProps } from '../types'

export default function About({ sectionId }: SectionProps) {
  return (
    <section id={sectionId} className="about container reveal">
      <h2>About Me</h2>
      <p className="lead">
        I focus on business landing pages and lightweight dashboards so users understand the value fast.
        I turn ideas into clean UI with React, Vite, HTML, CSS, and JavaScript.
      </p>
      <div className="value-grid">
        <div className="value-card">
          <div className="eyebrow">Strategy</div>
          <h3>Clear structure</h3>
          <p>Shape content flow so visitors instantly grasp your value.</p>
        </div>
        <div className="value-card">
          <div className="eyebrow">Design</div>
          <h3>Premium visuals</h3>
          <p>Consistent typography, color, and spacing for a luxury feel.</p>
        </div>
        <div className="value-card">
          <div className="eyebrow">Build</div>
          <h3>Fast execution</h3>
          <p>Lightweight components, responsive layouts, and data-ready builds.</p>
        </div>
      </div>
      <div className="skills">
        <h3>Skills</h3>
        <div className="chips">
          <span className="chip">HTML</span>
          <span className="chip">CSS</span>
          <span className="chip">JavaScript</span>
          <span className="chip">React</span>
          <span className="chip">Vite</span>
          <span className="chip">REST API</span>
          <span className="chip">UI/UX</span>
          <span className="chip">Responsive Design</span>
        </div>
      </div>
    </section>
  )
}
