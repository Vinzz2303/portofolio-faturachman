import React from 'react'

export default function Navbar(){
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="brand">Faturachman Al kahfi</div>
        <nav>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#ai">AI</a>
          <a href="#contact">Contact</a>
          <a href="https://github.com/Vinzz2303" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/faturachman-al-kahfi-662283304/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://instagram.com/alvinstzy" target="_blank" rel="noreferrer">Instagram</a>
        </nav>
      </div>
    </header>
  )
}
