import React from 'react'

export default function About({ sectionId }){
  return (
    <section id={sectionId} className="about container reveal">
      <h2>About Me</h2>
      <p className="lead">
        Saya fokus ngulik landing page bisnis dan dashboard sederhana biar user langsung paham.
        I turn ideas into clean UI with React, Vite, HTML, CSS, and JavaScript.
      </p>
      <div className="value-grid">
        <div className="value-card">
          <div className="eyebrow">Strategy</div>
          <h3>Struktur yang terarah</h3>
          <p>Bangun alur konten yang jelas agar visitor cepat mengerti nilai produk.</p>
        </div>
        <div className="value-card">
          <div className="eyebrow">Design</div>
          <h3>Visual premium</h3>
          <p>Konsisten secara tipografi, warna, dan jarak untuk nuansa luxury.</p>
        </div>
        <div className="value-card">
          <div className="eyebrow">Build</div>
          <h3>Eksekusi cepat</h3>
          <p>Komponen ringan, responsif, dan siap diintegrasi dengan data.</p>
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
