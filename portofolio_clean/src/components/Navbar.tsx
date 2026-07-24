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
  const isHome = location.pathname === '/'
  const isPersonal = isPersonalDomain()
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

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!productMenuRef.current) return
      if (!productMenuRef.current.contains(event.target as Node)) {
        setProductOpen(false)
      }
    }

    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [])

  const closeAll = () => {
    setOpen(false)
    setProductOpen(false)
  }

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

  const isEnglish = language === 'en'
  const navText = {
    explore: isEnglish ? 'Explore' : 'Jelajahi',
    product: isEnglish ? 'Ting AI Product' : 'Produk Ting AI',
    account: isEnglish ? 'Account' : 'Akun',
    tingAi: 'Ting AI',
    projects: isEnglish ? 'Projects' : 'Proyek',
    blog: 'Blog',
    resume: 'Resume',
    contact: isEnglish ? 'Contact' : 'Kontak',
    switchLang: isEnglish ? 'EN | switch to ID' : 'ID | switch to EN',
    openProduct: isEnglish ? 'Open Ting AI' : 'Buka Ting AI',
    login: isEnglish ? 'Login to Ting AI' : 'Masuk ke Ting AI',
    create: isEnglish ? 'Create Account' : 'Buat Akun',
    profile: isEnglish ? 'Profile' : 'Profil'
  }

  const productMenu = isEnglish
    ? [
        {
          title: 'Morning Command',
          desc: 'Start with today’s market and risk briefing.',
          to: account.authenticated ? '/komando-pagi' : '/login',
          recommended: true
        },
        {
          title: 'Portfolio Workspace',
          desc: 'Read portfolio exposure, decision framing, and risk simulation.',
          to: account.authenticated ? '/portfolio' : '/login',
          recommended: true
        },
        {
          title: 'Explore Intelligence',
          desc: 'Market pulse, smart chart, and portfolio relevance in one place.',
          to: account.authenticated ? '/explore-intelligence' : '/login'
        },
        {
          title: 'Personal Space',
          desc: 'Manage your profile and investing context.',
          to: account.authenticated ? '/personal-space' : '/login'
        }
      ]
    : [
        {
          title: 'Komando Pagi',
          desc: 'Mulai dari briefing market dan risiko hari ini.',
          to: account.authenticated ? '/komando-pagi' : '/login',
          recommended: true
        },
        {
          title: 'Workspace Portofolio',
          desc: 'Baca eksposur, arah keputusan, dan simulasi risiko.',
          to: account.authenticated ? '/portfolio' : '/login',
          recommended: true
        },
        {
          title: 'Explore Intelligence',
          desc: 'Denyut pasar, grafik cerdas, dan relevansi portofolio dalam satu tempat.',
          to: account.authenticated ? '/explore-intelligence' : '/login'
        },
        {
          title: 'Ruang Personal',
          desc: 'Kelola profil dan konteks investasimu.',
          to: account.authenticated ? '/personal-space' : '/login'
        }
      ]

  const isTingAiApp = ['/portfolio', '/ting-ai', '/komando-pagi', '/explore-intelligence'].includes(location.pathname)

  return (
    <header className="navbar w-full">
      <div className="container-saas nav-inner">
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
              <span className="brand">{isPersonal ? 'Faturachman Alkahfi' : 'Ting AI'}</span>
              <span className="brand-sub">{isPersonal ? 'AI Product Builder' : 'Macro & Wealth Intelligence'}</span>
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
            {isPersonal ? (
              <>
                <span className="nav-mobile-label">{navText.explore}</span>
                <button
                  type="button"
                  className="nav-link-button"
                  onClick={() => {
                    closeAll()
                    navigate('/ting-ai')
                  }}
                >
                  {navText.tingAi}
                </button>
                <Link to={isHome ? '#projects' : '/#projects'} onClick={closeAll}>
                  {navText.projects}
                </Link>
                <Link to="/blog" onClick={closeAll}>
                  {navText.blog}
                </Link>
                <a href="/faturachman-alkahfi-resume.pdf" target="_blank" rel="noreferrer" onClick={closeAll}>
                  {navText.resume}
                </a>
                <Link to={isHome ? '#contact' : '/#contact'} onClick={closeAll}>
                  {navText.contact}
                </Link>
              </>
            ) : (
              <>
                <span className="nav-mobile-label">{isEnglish ? 'Navigation' : 'Navigasi'}</span>
                <Link to="/" onClick={closeAll}>
                  Home
                </Link>
                {account.authenticated ? (
                  <>
                    <Link to="/komando-pagi" onClick={closeAll}>
                      {isEnglish ? 'Morning Command' : 'Komando Pagi'}
                    </Link>
                    <Link to="/portfolio" onClick={closeAll}>
                      {isEnglish ? 'Portfolio Workspace' : 'Workspace Portofolio'}
                    </Link>
                    <Link to="/explore-intelligence" onClick={closeAll}>
                      Explore
                    </Link>
                    <Link to="/personal-space" onClick={closeAll}>
                      {isEnglish ? 'Personal Space' : 'Ruang Personal'}
                    </Link>
                  </>
                ) : (
                  <Link to="/explore-intelligence" onClick={closeAll}>
                    Explore
                  </Link>
                )}
              </>
            )}
          </div>
          <div className="nav-secondary flex items-center gap-6">
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
            <div className="nav-actions flex items-center gap-4">
              {isPersonal && !isTingAiApp && (
                <div className="nav-dropdown nav-product" ref={productMenuRef}>
                  <span className="nav-mobile-label">{navText.product}</span>
                  <button
                    className="nav-cta"
                    type="button"
                    aria-expanded={productOpen}
                    onClick={() => setProductOpen(prev => !prev)}
                  >
                    {navText.openProduct}
                  </button>
                  <div
                    className={`nav-dropdown-menu nav-product-menu ${productOpen ? 'show' : ''}`}
                    role="menu"
                  >
                    {productMenu.map(item => (
                      <Link key={item.title} to={item.to} onClick={closeAll} className="nav-product-item">
                        <span className="nav-product-title-row">
                          {item.title}
                          {'recommended' in item && item.recommended && (
                            <span className="soft-recommended-badge">Recommended</span>
                          )}
                        </span>
                        <small>{item.desc}</small>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
