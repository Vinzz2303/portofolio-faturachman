import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth, getAuthStatus } from '../pages/ProtectedRoute'

type AccountState = {
  fullname: string
  email: string
  authenticated: boolean
}

const readAccountState = (): AccountState => {
  const fullname = window.localStorage.getItem('lifeOS_user') || ''
  const email = window.localStorage.getItem('lifeOS_user_email') || ''
  const { valid } = getAuthStatus()

  return {
    fullname,
    email,
    authenticated: valid && Boolean(fullname)
  }
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
  const [account, setAccount] = useState<AccountState>({
    fullname: '',
    email: '',
    authenticated: false
  })
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  const greetName = useMemo(() => {
    if (!account.fullname) return ''
    const cleaned = account.fullname.trim()
    if (!cleaned) return ''
    const first = cleaned.split(/\s+/)[0]
    return first || cleaned
  }, [account.fullname])

  const initials = useMemo(() => formatInitials(account.fullname), [account.fullname])

  useEffect(() => {
    const syncAccount = () => {
      setAccount(readAccountState())
    }

    syncAccount()
    window.addEventListener('storage', syncAccount)
    window.addEventListener('lifeos-auth', syncAccount)

    return () => {
      window.removeEventListener('storage', syncAccount)
      window.removeEventListener('lifeos-auth', syncAccount)
    }
  }, [])

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
          <Link to={isHome ? '#about' : '/#about'} onClick={closeAll}>
            About
          </Link>
          <Link to={isHome ? '#projects' : '/#projects'} onClick={closeAll}>
            Projects
          </Link>
          <Link to={isHome ? '#ai' : '/#ai'} onClick={closeAll}>
            AI
          </Link>
          <Link to={isHome ? '#contact' : '/#contact'} onClick={closeAll}>
            Contact
          </Link>
          <div className="nav-dropdown">
            <Link className="nav-cta" to={account.authenticated ? '/lifeos' : '/login'} onClick={closeAll}>
              LifeOS
            </Link>
            <div className="nav-dropdown-menu" role="menu">
              {account.authenticated ? (
                <>
                  <Link to="/lifeos" onClick={closeAll}>
                    Fatur LifeOS
                  </Link>
                  <Link to="/dashboard" onClick={closeAll}>
                    AI Dashboard
                  </Link>
                  <Link to="/profile" onClick={closeAll}>
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeAll}>
                    Login
                  </Link>
                  <Link to="/signup" onClick={closeAll}>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="nav-dropdown nav-social">
            <button className="nav-link-btn" type="button">
              Social
            </button>
            <div className="nav-dropdown-menu" role="menu">
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
            </div>
          </div>
          <div className="nav-dropdown nav-account">
            <button className="nav-account-btn" type="button">
              <span className="nav-account-avatar">{initials || 'G'}</span>
              <span className="nav-account-copy">
                <strong>{account.authenticated ? greetName || 'Account' : 'Guest'}</strong>
                <span>{account.authenticated ? account.email || 'LifeOS member' : 'Not signed in'}</span>
              </span>
            </button>
            <div className="nav-dropdown-menu nav-account-menu" role="menu">
              {account.authenticated ? (
                <>
                  <div className="nav-account-summary">
                    <span className="nav-account-summary-name">{account.fullname}</span>
                    <span className="nav-account-summary-email">{account.email || '-'}</span>
                  </div>
                  <Link to="/profile" onClick={closeAll}>
                    Profile
                  </Link>
                  <Link to="/dashboard" onClick={closeAll}>
                    Dashboard
                  </Link>
                  <Link to="/lifeos" onClick={closeAll}>
                    LifeOS
                  </Link>
                  <button type="button" className="nav-menu-action" onClick={handleSwitchAccount}>
                    Switch Account
                  </button>
                  <button type="button" className="nav-menu-action danger" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeAll}>
                    Login
                  </Link>
                  <Link to="/signup" onClick={closeAll}>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
