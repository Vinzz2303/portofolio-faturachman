import React, { useState } from 'react'

export default function Navbar(){
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="brand">Faturachman Al kahfi</div>
        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(prev => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={open ? 'open' : ''}>
          <a href="#about" onClick={() => setOpen(false)}>About</a>
          <a href="#projects" onClick={() => setOpen(false)}>Projects</a>
          <a href="#ai" onClick={() => setOpen(false)}>AI</a>
          <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
          <a href="https://github.com/Vinzz2303" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/faturachman-al-kahfi-662283304/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://instagram.com/alvinstzy" target="_blank" rel="noreferrer">Instagram</a>
        </nav>
      </div>
    </header>
  )
}
