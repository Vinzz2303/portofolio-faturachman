import React from 'react'

export default function About(){
  return (
    <section id="about" className="about container">
      <h2>About Me</h2>
      <p>
        Saya fokus ngulik landing page bisnis dan dashboard sederhana biar user langsung paham.
        I turn ideas into clean UI with React, Vite, HTML, CSS, and JavaScript.
      </p>
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
