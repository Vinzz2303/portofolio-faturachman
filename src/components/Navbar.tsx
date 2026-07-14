import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth } from '../utils/auth'
import { useAuthSession } from '../utils/useAuthSession'
import { useLanguagePreference } from '../utils/language'
import { isPersonalDomain } from '../utils/domain'

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
  const [productOpen, setProductOpen] = useState(false)
  const { authenticated, user } = useAuthSession()
  const { language, setLanguage } = useLanguagePreference()
  const navigate = useNavigate()
  const location = useLocation()
  const productMenuRef = useRef<HTMLDivElement | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const isHome = location.pathname === '/'
  const isPersonal = isPersonalDomain()
  const account: AccountState = {
    fullname: user?.fullname || '',
    email: user?.email || '',
    authenticated,
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

  // Close desktop dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (productMenuRef.current && !productMenuRef.current.contains(e.target as Node)) {
        setProductOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

  // Lock body scroll when mobile overlay open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Auto-close overlay on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  const closeAll = () => { setOpen(false); setProductOpen(false) }

  const handleLogout = () => { clearAuth(); closeAll(); navigate('/login', { replace: true }) }
  const handleSwitchAccount = () => { clearAuth(); closeAll(); navigate('/login', { replace: true }) }

  const isEnglish = language === 'en'
  const navText = {
    explore:    isEnglish ? 'Explore'        : 'Jelajahi',
    product:    isEnglish ? 'Ting AI Product' : 'Produk Ting AI',
    account:    isEnglish ? 'Account'        : 'Akun',
    tingAi:     'Ting AI',
    projects:   isEnglish ? 'Projects'       : 'Proyek',
    blog:       'Blog',
    resume:     'Resume',
    contact:    isEnglish ? 'Contact'        : 'Kontak',
    switchLang: isEnglish ? 'EN | switch to ID' : 'ID | switch to EN',
    openProduct:isEnglish ? 'Open Ting AI'   : 'Buka Ting AI',
    login:      isEnglish ? 'Login to Ting AI' : 'Masuk ke Ting AI',
    create:     isEnglish ? 'Create Account' : 'Buat Akun',
    profile:    isEnglish ? 'Profile'        : 'Profil',
  }

  const productMenu = isEnglish
    ? [
        { title: 'Morning Command',    desc: 'Start with today\'s market and risk briefing.',                              to: account.authenticated ? '/komando-pagi'          : '/login', recommended: true },
        { title: 'Portfolio Workspace',desc: 'Read portfolio exposure, decision framing, and risk simulation.',            to: account.authenticated ? '/portfolio'             : '/login', recommended: true },
        { title: 'Explore Intelligence',desc:'Market pulse, smart chart, and portfolio relevance in one place.',           to: account.authenticated ? '/explore-intelligence'  : '/login' },
        { title: 'Personal Space',     desc: 'Manage your profile and investing context.',                                  to: account.authenticated ? '/personal-space'        : '/login' },
      ]
    : [
        { title: 'Komando Pagi',        desc: 'Mulai dari briefing market dan risiko hari ini.',                            to: account.authenticated ? '/komando-pagi'          : '/login', recommended: true },
        { title: 'Workspace Portofolio',desc: 'Baca eksposur, arah keputusan, dan simulasi risiko.',                       to: account.authenticated ? '/portfolio'             : '/login', recommended: true },
        { title: 'Explore Intelligence',desc: 'Denyut pasar, grafik cerdas, dan relevansi portofolio dalam satu tempat.',  to: account.authenticated ? '/explore-intelligence'  : '/login' },
        { title: 'Ruang Personal',      desc: 'Kelola profil dan konteks investasimu.',                                     to: account.authenticated ? '/personal-space'        : '/login' },
      ]

  const isTingAiApp = ['/portfolio', '/ting-ai', '/komando-pagi', '/explore-intelligence'].includes(location.pathname)

  // ── Mobile nav items (Ting AI app) ────────────────────────────────────────
  type NavItem = { label: string; to?: string; href?: string }
  const mobileNavLinks: NavItem[] = account.authenticated
    ? [
        { label: isEnglish ? 'Morning Command'    : 'Komando Pagi',        to: '/komando-pagi' },
        { label: isEnglish ? 'Portfolio Workspace': 'Workspace Portofolio', to: '/portfolio' },
        { label: 'Explore',                                                   to: '/explore-intelligence' },
        { label: isEnglish ? 'Decision Journal'   : 'Jurnal Keputusan',    to: '/decision-journal' },
        { label: 'Ting AI Copilot',                                           to: '/ting-ai' },
        { label: isEnglish ? 'Personal Space'     : 'Ruang Personal',      to: '/personal-space' },
      ]
    : [
        { label: 'Explore',                          to: '/explore-intelligence' },
        { label: isEnglish ? 'Login' : 'Masuk',     to: '/login' },
        { label: isEnglish ? 'Create Account' : 'Buat Akun', to: '/signup' },
      ]

  const mobilePersonalLinks: NavItem[] = [
    { label: navText.tingAi,   to: '/ting-ai' },
    { label: navText.projects, to: isHome ? '#projects' : '/#projects' },
    { label: navText.blog,     to: '/blog' },
    { label: navText.resume,   href: '/faturachman-alkahfi-resume.pdf' },
    { label: navText.contact,  to: isHome ? '#contact' : '/#contact' },
  ]

  const activeMobileLinks = isPersonal ? mobilePersonalLinks : mobileNavLinks

  return (
    <>
      {/* ══════════════════════════ HEADER BAR ══════════════════════════ */}
      <header className="navbar w-full">
        <div className="container-saas nav-inner">

          {/* Brand */}
          <div className="brand-wrap">
            <Link className="brand-link" to="/" onClick={closeAll}>
              <img className="brand-logo" src="/ting-ai-logo-navbar-final.png" alt="Ting AI mark" width="40" height="40" />
              <div className="brand-copy">
                <span className="brand">{isPersonal ? 'Faturachman Alkahfi' : 'Ting AI'}</span>
                <span className="brand-sub">{isPersonal ? 'AI Product Builder' : 'Macro & Wealth Intelligence'}</span>
              </div>
            </Link>
          </div>

          {/* ── Desktop nav (hidden on mobile via CSS) ── */}
          <nav className="nav-desktop">
            <div className="nav-primary">
              {isPersonal ? (
                <>
                  <button type="button" className="nav-link-button" onClick={() => { closeAll(); navigate('/ting-ai') }}>{navText.tingAi}</button>
                  <Link to={isHome ? '#projects' : '/#projects'} onClick={closeAll}>{navText.projects}</Link>
                  <Link to="/blog" onClick={closeAll}>{navText.blog}</Link>
                  <a href="/faturachman-alkahfi-resume.pdf" target="_blank" rel="noreferrer" onClick={closeAll}>{navText.resume}</a>
                  <Link to={isHome ? '#contact' : '/#contact'} onClick={closeAll}>{navText.contact}</Link>
                </>
              ) : (
                <>
                  <Link to="/" onClick={closeAll}>Home</Link>
                  {account.authenticated ? (
                    <>
                      <Link to="/komando-pagi"       onClick={closeAll}>{isEnglish ? 'Morning Command'    : 'Komando Pagi'}</Link>
                      <Link to="/portfolio"           onClick={closeAll}>{isEnglish ? 'Portfolio Workspace': 'Workspace Portofolio'}</Link>
                      <Link to="/explore-intelligence" onClick={closeAll}>Explore</Link>
                      <Link to="/decision-journal"   onClick={closeAll}>{isEnglish ? 'Decision Journal'   : 'Jurnal Keputusan'}</Link>
                      <Link to="/personal-space"     onClick={closeAll}>{isEnglish ? 'Personal Space'     : 'Ruang Personal'}</Link>
                    </>
                  ) : (
                    <Link to="/explore-intelligence" onClick={closeAll}>Explore</Link>
                  )}
                </>
              )}
            </div>

            <div className="nav-secondary">
              <button type="button" className="nav-language-toggle" onClick={() => setLanguage(isEnglish ? 'id' : 'en')}
                aria-label="Toggle language" title={isEnglish ? 'Switch to Bahasa Indonesia' : 'Switch to English'}>
                {navText.switchLang}
              </button>

              {isPersonal && !isTingAiApp && (
                <div className="nav-dropdown nav-product" ref={productMenuRef}>
                  <button className="nav-cta" type="button" aria-expanded={productOpen} onClick={() => setProductOpen(p => !p)}>
                    {navText.openProduct}
                  </button>
                  <div className={`nav-dropdown-menu nav-product-menu${productOpen ? ' show' : ''}`} role="menu">
                    {productMenu.map(item => (
                      <Link key={item.title} to={item.to} onClick={closeAll} className="nav-product-item">
                        <span className="nav-product-title-row">
                          {item.title}
                          {'recommended' in item && item.recommended && <span className="soft-recommended-badge">Recommended</span>}
                        </span>
                        <small>{item.desc}</small>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop account dropdown */}
              <div className="nav-dropdown nav-account" ref={accountMenuRef}>
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
                      <Link to="/profile" onClick={closeAll}>{navText.profile}</Link>
                      {isAdmin && <Link to="/admin/pro" onClick={closeAll}>Admin Pro</Link>}
                      <div className="nav-account-divider" />
                      <a href="https://github.com/Vinzz2303" target="_blank" rel="noreferrer">GitHub</a>
                      <a href="https://www.linkedin.com/in/faturachman-al-kahfi-662283304/" target="_blank" rel="noreferrer">LinkedIn</a>
                      <a href="https://instagram.com/alvinstzy" target="_blank" rel="noreferrer">Instagram</a>
                      <div className="nav-account-divider" />
                      <button type="button" className="nav-menu-action" onClick={handleSwitchAccount}>{isEnglish ? 'Switch Account' : 'Ganti Akun'}</button>
                      <button type="button" className="nav-menu-action danger" onClick={handleLogout}>{isEnglish ? 'Logout' : 'Keluar'}</button>
                    </>
                  ) : (
                    <>
                      <div className="nav-account-summary">
                        <span className="nav-account-greet">{isEnglish ? 'Welcome' : 'Selamat datang'}</span>
                        <span className="nav-account-summary-name">{isEnglish ? 'Guest Account' : 'Akun Tamu'}</span>
                        <span className="nav-account-summary-email">{isEnglish ? 'Sign in to access Ting AI' : 'Masuk untuk mengakses Ting AI'}</span>
                      </div>
                      <Link to="/login" onClick={closeAll}>{isEnglish ? 'Login' : 'Masuk'}</Link>
                      <Link to="/signup" onClick={closeAll}>{navText.create}</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* ── Hamburger (mobile only) ── */}
          <button
            className={`nav-toggle${open ? ' nav-toggle--open' : ''}`}
            type="button"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="mobile-nav-overlay"
            onClick={() => setOpen(p => !p)}
          >
            <span />
            <span />
            <span />
          </button>

        </div>
      </header>

      {/* ══════════════════════ MOBILE FULLSCREEN OVERLAY ═══════════════════ */}
      <div
        id="mobile-nav-overlay"
        className={`mobile-overlay${open ? ' mobile-overlay--open' : ''}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Overlay top bar */}
        <div className="mobile-overlay-header">
          <Link className="brand-link" to="/" onClick={closeAll}>
            <img className="brand-logo" src="/ting-ai-logo-navbar-final.png" alt="Ting AI" width="34" height="34" />
            <span className="brand">{isPersonal ? 'Faturachman' : 'Ting AI'}</span>
          </Link>
          <button type="button" className="mobile-overlay-close" aria-label="Close menu" onClick={closeAll}>✕</button>
        </div>

        {/* Scrollable nav body */}
        <div className="mobile-overlay-body">
          {/* Language toggle */}
          <button
            type="button"
            className="nav-language-toggle"
            style={{ alignSelf: 'flex-start', marginBottom: '2rem' }}
            onClick={() => setLanguage(isEnglish ? 'id' : 'en')}
          >
            {navText.switchLang}
          </button>

          {/* Section label */}
          <span className="mobile-nav-section-label">{isEnglish ? 'Navigation' : 'Navigasi'}</span>

          {/* Nav items — large typography with separator lines */}
          <nav className="mobile-nav-list">
            {activeMobileLinks.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="mobile-nav-item"
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeAll}
                >
                  <span>{item.label}</span>
                  <span className="mobile-nav-arrow" aria-hidden="true">↗</span>
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.to!}
                  className="mobile-nav-item"
                  onClick={closeAll}
                >
                  <span>{item.label}</span>
                  <span className="mobile-nav-arrow" aria-hidden="true">→</span>
                </Link>
              )
            )}
          </nav>
        </div>

        {/* Pinned account footer */}
        <div className="mobile-overlay-footer">
          {account.authenticated ? (
            <>
              <div className="mobile-account-summary">
                <span className="nav-account-avatar" style={{ width: 40, height: 40, fontSize: '1rem', flexShrink: 0 }}>
                  {initials || 'F'}
                </span>
                <div className="mobile-account-info">
                  <span className="mobile-account-name">{account.fullname}</span>
                  <span className="mobile-account-email">{account.email}</span>
                </div>
              </div>
              <div className="mobile-account-actions">
                <Link to="/profile" className="mobile-account-btn" onClick={closeAll}>{navText.profile}</Link>
                <button type="button" className="mobile-account-btn mobile-account-btn--danger" onClick={handleLogout}>
                  {isEnglish ? 'Logout' : 'Keluar'}
                </button>
              </div>
            </>
          ) : (
            <div className="mobile-account-actions">
              <Link to="/login" className="mobile-account-btn mobile-account-btn--primary" onClick={closeAll}>
                {isEnglish ? 'Login' : 'Masuk'}
              </Link>
              <Link to="/signup" className="mobile-account-btn" onClick={closeAll}>{navText.create}</Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
