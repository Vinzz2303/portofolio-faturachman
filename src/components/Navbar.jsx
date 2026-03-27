import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const location = useLocation()
  const isHome = location.pathname === '/'

  const greetName = useMemo(() => {
    if (!userName) return ''
    const cleaned = userName.trim()
    if (!cleaned) return ''
    const first = cleaned.split(/\s+/)[0]
    return first || cleaned
  }, [userName])

  useEffect(() => {
    const readUser = () => {
      const stored = window.localStorage.getItem('lifeOS_user') || ''
      setUserName(stored)
    }
    readUser()
    window.addEventListener('storage', readUser)
    window.addEventListener('lifeos-auth', readUser)
    return () => {
      window.removeEventListener('storage', readUser)
      window.removeEventListener('lifeos-auth', readUser)
    }
  }, [])

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="brand-wrap">
          <div className="brand">Faturachman Al kahfi</div>
          {greetName && <div className="nav-greet">Hi, {greetName}!</div>}
        </div>
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
          <Link to={isHome ? '#about' : '/#about'} onClick={() => setOpen(false)}>About</Link>
          <Link to={isHome ? '#projects' : '/#projects'} onClick={() => setOpen(false)}>Projects</Link>
          <Link to={isHome ? '#ai' : '/#ai'} onClick={() => setOpen(false)}>AI</Link>
          <Link to={isHome ? '#contact' : '/#contact'} onClick={() => setOpen(false)}>Contact</Link>
          <div className="nav-dropdown">
            <Link className="nav-cta" to="/lifeos" onClick={() => setOpen(false)}>LifeOS</Link>
            <div className="nav-dropdown-menu" role="menu">
              <Link to="/lifeos" onClick={() => setOpen(false)}>Fatur LifeOS</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)}>AI Dashboard</Link>
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
            </div>
          </div>
          <div className="nav-dropdown nav-social">
            <button className="nav-link-btn" type="button">Social</button>
            <div className="nav-dropdown-menu" role="menu">
              <a href="https://github.com/Vinzz2303" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/faturachman-al-kahfi-662283304/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://instagram.com/alvinstzy" target="_blank" rel="noreferrer">Instagram</a>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
