import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { useLanguagePreference } from '../utils/language'

const t = {
  en: {
    eyebrow: 'Get started',
    title: 'Create your Ting AI account',
    subtitle: 'Start your journey with AI-assisted market intelligence and portfolio awareness.',
    secure: 'Secure & Protected',
    nameLabel: 'Full name',
    namePlaceholder: 'Enter your full name',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Create a password',
    submit: 'Create Account',
    submitting: 'Creating account...',
    hasAccount: 'Already have an account?',
    signIn: 'Sign in',
    terms: 'By creating an account, you agree to our',
    termsLink: 'Terms of Service',
    and: 'and',
    privacyLink: 'Privacy Policy',
    featureTitle: 'Start investing with clarity',
    featureDesc: 'Join investors who use Ting AI to read markets with context, manage portfolio risk, and make more informed decisions.',
    stat1: '100%',
    stat1Label: 'Data accuracy',
    stat2: 'Real-time',
    stat2Label: 'Market updates',
    stat3: 'AI-powered',
    stat3Label: 'Decision support',
    switchLang: 'Switch to Indonesian',
  },
  id: {
    eyebrow: 'Mulai sekarang',
    title: 'Buat akun Ting AI Anda',
    subtitle: 'Mulai perjalanan Anda dengan inteligensi pasar berbasis AI dan kesadaran portofolio.',
    secure: 'Aman & Terlindungi',
    nameLabel: 'Nama lengkap',
    namePlaceholder: 'Masukkan nama lengkap Anda',
    emailLabel: 'Alamat email',
    emailPlaceholder: 'Masukkan email Anda',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Buat password',
    submit: 'Buat Akun',
    submitting: 'Memproses...',
    hasAccount: 'Sudah punya akun?',
    signIn: 'Masuk di sini',
    terms: 'Dengan membuat akun, Anda menyetujui',
    termsLink: 'Syarat & Ketentuan',
    and: 'dan',
    privacyLink: 'Kebijakan Privasi',
    featureTitle: 'Mulai berinvestasi dengan kejernihan',
    featureDesc: 'Bergabung dengan investor yang menggunakan Ting AI untuk membaca pasar dengan konteks, mengelola risiko portofolio, dan membuat keputusan yang lebih tepat.',
    stat1: '100%',
    stat1Label: 'Akurasi data',
    stat2: 'Real-time',
    stat2Label: 'Update pasar',
    stat3: 'AI-powered',
    stat3Label: 'Dukungan keputusan',
    switchLang: 'Ganti ke Inggris',
  }
}

export default function Signup() {
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguagePreference()
  const lang = t[language]

  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!fullname.trim() || !email.trim() || !password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: fullname.trim(),
          email: email.trim(),
          password
        })
      })
      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string }
        throw new Error(errorData.error || 'Pendaftaran gagal')
      }
      navigate('/login?signup=success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pendaftaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split-page">
      {/* Left panel */}
      <div className="auth-split-left">
        <div className="auth-split-left-inner">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#gold-grad-s)" strokeWidth="1.5" fill="none"/>
                <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="url(#gold-grad-fill-s)" opacity="0.6"/>
                <defs>
                  <linearGradient id="gold-grad-s" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F5C842"/><stop offset="1" stopColor="#B8860B"/>
                  </linearGradient>
                  <linearGradient id="gold-grad-fill-s" x1="10" y1="8" x2="22" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F5C842"/><stop offset="1" stopColor="#B8860B"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="auth-brand-name">Ting AI</span>
          </div>

          <div className="auth-left-content">
            <h2 className="auth-left-title">{lang.featureTitle}</h2>
            <p className="auth-left-desc">{lang.featureDesc}</p>

            <div className="auth-stats-grid">
              <div className="auth-stat-card">
                <p className="auth-stat-value">{lang.stat1}</p>
                <p className="auth-stat-label">{lang.stat1Label}</p>
              </div>
              <div className="auth-stat-card">
                <p className="auth-stat-value">{lang.stat2}</p>
                <p className="auth-stat-label">{lang.stat2Label}</p>
              </div>
              <div className="auth-stat-card">
                <p className="auth-stat-value">{lang.stat3}</p>
                <p className="auth-stat-label">{lang.stat3Label}</p>
              </div>
            </div>

            <div className="auth-features">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                </div>
                <div>
                  <p className="auth-feature-name">Bantuan memahami keputusan</p>
                  <p className="auth-feature-desc">{language === 'en' ? 'Data-driven insights with market context' : 'Insight berbasis data & konteks pasar'}</p>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <p className="auth-feature-name">Risk & Portfolio Awareness</p>
                  <p className="auth-feature-desc">{language === 'en' ? 'Understand risk before making decisions' : 'Pahami risiko sebelum mengambil keputusan'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-chart-decoration">
            <svg viewBox="0 0 320 80" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartFillS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5C842" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#F5C842" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,65 C30,58 60,40 90,35 C120,30 150,45 180,28 C210,11 240,22 280,12 C300,7 310,10 320,8" stroke="#F5C842" strokeWidth="2" fill="none" opacity="0.7"/>
              <path d="M0,65 C30,58 60,40 90,35 C120,30 150,45 180,28 C210,11 240,22 280,12 C300,7 310,10 320,8 L320,80 L0,80 Z" fill="url(#chartFillS)"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-split-right">
        <div className="auth-split-right-inner">
          <div className="auth-form-header">
            <button
              type="button"
              className="auth-lang-toggle"
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {language === 'en' ? 'ID' : 'EN'}
            </button>
            <div className="auth-secure-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {lang.secure}
            </div>
          </div>

          <div className="auth-form-eyebrow">{lang.eyebrow}</div>
          <h1 className="auth-form-title">{lang.title}</h1>
          <p className="auth-form-subtitle">{lang.subtitle}</p>

          <form onSubmit={handleSubmit} className="auth-form-new" noValidate>
            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="signup-name">{lang.nameLabel}</label>
              <div className="auth-field-wrap">
                <svg className="auth-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="signup-name"
                  className="auth-field-input"
                  type="text"
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  placeholder={lang.namePlaceholder}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="signup-email">{lang.emailLabel}</label>
              <div className="auth-field-wrap">
                <svg className="auth-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="signup-email"
                  className="auth-field-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={lang.emailPlaceholder}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label className="auth-field-label" htmlFor="signup-password">{lang.passwordLabel}</label>
              <div className="auth-field-wrap">
                <svg className="auth-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="signup-password"
                  className="auth-field-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={lang.passwordPlaceholder}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-field-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="auth-password-strength" data-strength={
                password.length === 0 ? 'none' :
                password.length < 6 ? 'weak' :
                password.length < 10 ? 'medium' : 'strong'
              }>
                <div className="auth-strength-bar" /><div className="auth-strength-bar" /><div className="auth-strength-bar" />
              </div>
            </div>

            {error && (
              <div className="auth-notice error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button className="auth-submit-btn" type="submit" disabled={loading} id="signup-submit-btn">
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  {lang.submitting}
                </>
              ) : (
                <>
                  {lang.submit}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="auth-terms-note">
            {lang.terms}{' '}
            <a href="#" className="auth-terms-link">{lang.termsLink}</a>
            {' '}{lang.and}{' '}
            <a href="#" className="auth-terms-link">{lang.privacyLink}</a>.
          </p>

          <p className="auth-switch-page">
            {lang.hasAccount}{' '}
            <Link to="/login" className="auth-switch-link">
              {lang.signIn}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
