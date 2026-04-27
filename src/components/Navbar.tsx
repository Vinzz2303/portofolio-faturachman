import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth } from '../utils/auth'
import { useAuthSession } from '../utils/useAuthSession'
import { useLanguagePreference } from '../utils/language'

type AccountState = {
  fullname: string
  email: string
  authenticated: boolean
}

const formatInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { authenticated, user } = useAuthSession()
  const { language, setLanguage } = useLanguagePreference()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const account: AccountState = {
    fullname: user?.fullname || '',
    email: user?.email || '',
    authenticated
  }

  const greetName = useMemo(() => {
    if (!account.authenticated || !account.fullname) return ''
    const cleaned = account.fullname.trim()
    if (!cleaned) return ''
    const first = cleaned.split(/\s+/)[0]
    return first || cleaned
  }, [account.authenticated, account.fullname])

  const initials = useMemo(
    () => formatInitials(account.authenticated ? account.fullname : ''),
    [account.authenticated, account.fullname]
  )
  const isAdmin = account.email.toLowerCase() === 'faturachmanalkahfi7@gmail.com'

  const closeAll = () => setOpen(false)

  const handleLogout = () => {
    clearAuth()
    closeAll()
    navigate('/login', { replace: true })
  }

  const handleSwitchAccount = () => {
    clearAuth()
    closeAll()
    navigate('/login', { replace: true })
  }

  // smooth scroll helper for navbar links
  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      return
    }
    // if not on homepage, navigate to home then scroll after mount
    navigate('/')
    setTimeout(() => {
      const el2 = document.getElementById(id)
      if (el2) el2.scrollIntoView({ behavior: 'smooth' })
    }, 120)
  }

  const isEnglish = language === 'en'
  const navText = {
    explore: isEnglish ? 'Explore' : 'Jelajahi',
    product: isEnglish ? 'Product' : 'Produk',
    account: isEnglish ? 'Account' : 'Akun',
    overview: isEnglish ? 'Product Overview' : 'Ikhtisar Produk',
    morning: isEnglish ? 'Morning Command Center' : 'Pusat Komando Pagi',
    portfolio: isEnglish ? 'Portfolio' : 'Portofolio',
    personal: isEnglish ? 'Personal Space' : 'Ruang Personal',
    login: isEnglish ? 'Login to Ting AI' : 'Masuk ke Ting AI',
    create: isEnglish ? 'Create Account' : 'Buat Akun',
    profile: isEnglish ? 'Profile' : 'Profil',
    switchLang: isEnglish ? 'EN | switch to ID' : 'ID | switch to EN',
    openProduct: isEnglish ? 'Open Ting AI' : 'Buka Ting AI',
    flagship: 'Ting AI',
    projects: isEnglish ? 'Projects' : 'Proyek',
    resume: 'Resume',
    contact: isEnglish ? 'Contact' : 'Kontak'
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="brand-wrap">
          <Link className="brand-link" to="/" onClick={closeAll}>
            <img
              className="brand-logo"
              src="/ting-ai-logo-navbar-final.png"
              alt="Ting AI mark"
              width="40"
              height="40"
            />
            <div className="brand-copy">
              <span className="brand">Faturachman Al kahfi</span>
              <span className="brand-sub">Builder of Ting AI</span>
            </div>
          </Link>
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
          <div className="nav-primary">
            <span className="nav-mobile-label">{navText.explore}</span>
            <a href={isHome ? '#featured' : '/#featured'} onClick={(e) => { e.preventDefault(); closeAll(); if (isHome) scrollToId('featured'); else { navigate('/'); setTimeout(() => scrollToId('featured'), 120) } }}>
              {navText.flagship}
            </a>
            <a href={isHome ? '#projects' : '/#projects'} onClick={(e) => { e.preventDefault(); closeAll(); scrollToId('projects') }}>
              {navText.projects}
            </a>
            <a href="/faturachman-alkahfi-resume.pdf" target="_blank" rel="noreferrer" onClick={closeAll}>
              {navText.resume}
            </a>
            <a href={isHome ? '#contact' : '/#contact'} onClick={(e) => { e.preventDefault(); closeAll(); scrollToId('contact') }}>
              {navText.contact}
            </a>
          </div>
          <div className="nav-secondary">
            <button
              type="button"
              className="nav-language-toggle"
              onClick={() => setLanguage(isEnglish ? 'id' : 'en')}
              aria-label="Toggle language"
              aria-pressed={isEnglish}
              title={isEnglish ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
            >
              {navText.switchLang}
            </button>
            <div className="nav-actions">
              <div className="nav-dropdown nav-product">
                <span className="nav-mobile-label">{navText.product}</span>
                <button className="nav-cta" type="button">
                  {navText.openProduct}
                </button>
                <div className="nav-dropdown-menu nav-product-menu" role="menu">
                  <Link to="/ting-ai" onClick={closeAll}>
                    {navText.overview}
                  </Link>
                  {account.authenticated ? (
                    <>
                      <Link to="/dashboard" onClick={closeAll}>
                        {navText.morning}
                      </Link>
                      <Link to="/portfolio" onClick={closeAll}>
                        {navText.portfolio}
                      </Link>
                      <Link to="/personal-space" onClick={closeAll}>
                        {navText.personal}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={closeAll}>
                        {navText.login}
                      </Link>
                      <Link to="/signup" onClick={closeAll}>
                        {navText.create}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="nav-dropdown nav-account">
              <span className="nav-mobile-label">{navText.account}</span>
              <button className="nav-account-btn" type="button">
                <span className="nav-account-avatar">{initials || 'G'}</span>
                <span className="nav-account-name">{account.authenticated ? navText.profile : navText.account}</span>
              </button>
              <div className="nav-dropdown-menu nav-account-menu" role="menu">
                {account.authenticated ? (
                  <>
                    <div className="nav-account-summary">
                      {greetName && <span className="nav-account-greet">{isEnglish ? 'Hi' : 'Hai'}, {greetName}</span>}
                      <span className="nav-account-summary-name">{account.fullname}</span>
                      <span className="nav-account-summary-email">{account.email || '-'}</span>
                    </div>
                    <Link to="/profile" onClick={closeAll}>
                      {navText.profile}
                    </Link>
                    {isAdmin && (
                      <Link to="/admin/pro" onClick={closeAll}>
                        Admin Pro
                      </Link>
                    )}
                    <div className="nav-account-divider" />
                    <a href="https://github.com/Vinzz2303" target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                    <a
                      href="https://www.linkedin.com/in/faturachman-al-kahfi-662283304/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn
                    </a>
                    <a href="https://instagram.com/alvinstzy" target="_blank" rel="noreferrer">
                      Instagram
                    </a>
                    <div className="nav-account-divider" />
                    <button type="button" className="nav-menu-action" onClick={handleSwitchAccount}>
                      {isEnglish ? 'Switch Account' : 'Ganti Akun'}
                    </button>
                    <button type="button" className="nav-menu-action danger" onClick={handleLogout}>
                      {isEnglish ? 'Logout' : 'Keluar'}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="nav-account-summary">
                      <span className="nav-account-greet">{isEnglish ? 'Welcome' : 'Selamat datang'}</span>
                      <span className="nav-account-summary-name">{isEnglish ? 'Guest Account' : 'Akun Tamu'}</span>
                      <span className="nav-account-summary-email">
                        {isEnglish ? 'Sign in to access Ting AI' : 'Masuk untuk mengakses Ting AI'}
                      </span>
                    </div>
                    <Link to="/login" onClick={closeAll}>
                      {isEnglish ? 'Login' : 'Masuk'}
                    </Link>
                    <Link to="/signup" onClick={closeAll}>
                      {navText.create}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
