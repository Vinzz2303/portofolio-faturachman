import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { useLanguagePreference } from '../utils/language'

const t = {
  en: {
    eyebrow: 'Account recovery',
    title: 'Forgot your password?',
    subtitle: "No worries. Enter your email and we'll send reset instructions right away.",
    secure: 'Secure & Protected',
    emailLabel: 'Email address',
    emailPlaceholder: 'Enter your registered email',
    submit: 'Send Reset Instructions',
    submitting: 'Sending...',
    sent: 'Instructions Sent',
    doneMsg: "If your email is registered, you'll receive reset instructions shortly. Check your inbox and spam folder.",
    backToLogin: 'Back to sign in',
    rememberPwd: 'Remembered your password?',
    signIn: 'Sign in',
    noAccount: "Don't have an account?",
    createAccount: 'Create account',
    switchLang: 'Switch to Indonesian',
    secure2: 'Secure & Protected',
    featureTitle: 'Account Security First',
    featureDesc: 'Your Ting AI account is protected with industry-standard encryption and secure password reset flows.',
    tip1: 'Check your spam folder if you don\'t see the email.',
    tip2: 'The reset link will expire in 30 minutes.',
    tip3: 'Contact support if you still can\'t access your account.',
  },
  id: {
    eyebrow: 'Pemulihan akun',
    title: 'Lupa password Anda?',
    subtitle: 'Tidak masalah. Masukkan email Anda dan kami akan mengirimkan instruksi reset segera.',
    secure: 'Aman & Terlindungi',
    emailLabel: 'Alamat email',
    emailPlaceholder: 'Masukkan email yang terdaftar',
    submit: 'Kirim Instruksi Reset',
    submitting: 'Mengirim...',
    sent: 'Instruksi Terkirim',
    doneMsg: 'Jika email Anda terdaftar, instruksi reset akan segera dikirim. Periksa kotak masuk dan folder spam Anda.',
    backToLogin: 'Kembali ke halaman masuk',
    rememberPwd: 'Ingat password Anda?',
    signIn: 'Masuk',
    noAccount: 'Belum punya akun?',
    createAccount: 'Buat akun',
    switchLang: 'Ganti ke Inggris',
    secure2: 'Aman & Terlindungi',
    featureTitle: 'Keamanan Akun Adalah Prioritas',
    featureDesc: 'Akun Ting AI Anda dilindungi dengan enkripsi standar industri dan alur reset password yang aman.',
    tip1: 'Periksa folder spam jika Anda tidak melihat emailnya.',
    tip2: 'Tautan reset akan kedaluwarsa dalam 30 menit.',
    tip3: 'Hubungi support jika Anda masih tidak bisa mengakses akun.',
  }
}

export default function ForgotPassword() {
  const { language, setLanguage } = useLanguagePreference()
  const lang = t[language]

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Permintaan gagal')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Permintaan gagal')
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
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#gold-grad-f)" strokeWidth="1.5" fill="none"/>
                <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="url(#gold-grad-fill-f)" opacity="0.6"/>
                <defs>
                  <linearGradient id="gold-grad-f" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F5C842"/><stop offset="1" stopColor="#B8860B"/>
                  </linearGradient>
                  <linearGradient id="gold-grad-fill-f" x1="10" y1="8" x2="22" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F5C842"/><stop offset="1" stopColor="#B8860B"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="auth-brand-name">Ting AI</span>
          </div>

          <div className="auth-left-content">
            <div className="auth-lock-illustration">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="38" stroke="rgba(245,200,66,0.15)" strokeWidth="1.5"/>
                <circle cx="40" cy="40" r="28" stroke="rgba(245,200,66,0.1)" strokeWidth="1"/>
                <rect x="24" y="36" width="32" height="24" rx="4" stroke="#F5C842" strokeWidth="1.5" fill="rgba(245,200,66,0.08)"/>
                <path d="M30 36V28a10 10 0 0 1 20 0v8" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="40" cy="48" r="3" fill="#F5C842"/>
                <line x1="40" y1="51" x2="40" y2="55" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="auth-left-title">{lang.featureTitle}</h2>
            <p className="auth-left-desc">{lang.featureDesc}</p>

            <div className="auth-tips-list">
              <div className="auth-tip-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
                <span>{lang.tip1}</span>
              </div>
              <div className="auth-tip-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
                <span>{lang.tip2}</span>
              </div>
              <div className="auth-tip-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
                <span>{lang.tip3}</span>
              </div>
            </div>
          </div>

          <div className="auth-chart-decoration">
            <svg viewBox="0 0 320 80" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartFillF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5C842" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#F5C842" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,70 C40,65 80,55 120,48 C160,41 200,50 240,35 C270,24 295,18 320,15" stroke="#F5C842" strokeWidth="1.5" fill="none" opacity="0.5"/>
              <path d="M0,70 C40,65 80,55 120,48 C160,41 200,50 240,35 C270,24 295,18 320,15 L320,80 L0,80 Z" fill="url(#chartFillF)"/>
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

          {done ? (
            <div className="auth-done-state">
              <div className="auth-done-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 className="auth-done-title">{lang.sent}</h3>
              <p className="auth-done-desc">{lang.doneMsg}</p>
              <Link to="/login" className="auth-submit-btn" style={{display:'flex', justifyContent:'center', textDecoration:'none', marginTop:'1.5rem'}}>
                {lang.backToLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form-new" noValidate>
              <div className="auth-field-group">
                <label className="auth-field-label" htmlFor="forgot-email">{lang.emailLabel}</label>
                <div className="auth-field-wrap">
                  <svg className="auth-field-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="forgot-email"
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

              {error && (
                <div className="auth-notice error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <button className="auth-submit-btn" type="submit" disabled={loading} id="forgot-submit-btn">
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    {lang.submitting}
                  </>
                ) : (
                  <>
                    {lang.submit}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-split-links">
            <p className="auth-switch-page">
              {lang.rememberPwd}{' '}
              <Link to="/login" className="auth-switch-link">
                {lang.signIn}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </p>
            <p className="auth-switch-page">
              {lang.noAccount}{' '}
              <Link to="/signup" className="auth-switch-link">
                {lang.createAccount}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
