import React from 'react'
import profileImg from '../assets/profile.png'

export default function Hero({ sectionId }){
  return (
    <section id={sectionId} className="hero container reveal">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="eyebrow">Frontend Developer</div>
          <h1>Faturachman Al kahfi</h1>
          <p className="lead">
            Frontend dev yang fokus bikin landing page bisnis yang terlihat premium, jelas arahnya, dan siap konversi.
            I build fast, responsive UI with React and modern web tech.
          </p>
          <div className="hero-badges">
            <span className="badge">Landing Pages</span>
            <span className="badge">UI Conversion</span>
            <span className="badge">React + Vite</span>
            <span className="badge">Clean UX</span>
          </div>
          <div className="hero-cta">
            <a className="btn" href="#projects">Lihat projek saya</a>
            <a className="btn secondary" href="#contact">Konsultasi cepat</a>
          </div>
        </div>
        <div className="hero-aside">
          <div className="hero-photo">
            <img src={profileImg} alt="Faturachman Al kahfi" />
          </div>
          <div className="hero-panel">
            <h3>Signature</h3>
            <ul className="hero-list">
              <li>Layout rapi, elegan, dan konsisten.</li>
              <li>CTA jelas dan fokus pada konversi.</li>
              <li>Loading cepat dengan UI ringan.</li>
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
