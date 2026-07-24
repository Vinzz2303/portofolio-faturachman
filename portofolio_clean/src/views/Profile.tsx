import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { clearAuth } from '../utils/auth'
import { fetchAccountProfile } from '../utils/accountProfile'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import { useLanguagePreference } from '../utils/language'
import { useAuthSession } from '../utils/useAuthSession'
import type { AuthUserProfile } from '../types'

const formatInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')

const formatPlanExpiry = (value: string | null | undefined, language: 'id' | 'en') => {
  if (!value) return null
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return null
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
    dateStyle: 'medium'
  }).format(new Date(timestamp))
}

// Helper: is plan premium (pro or admin)
const isPremiumPlan = (plan?: string) => Boolean(plan && plan !== 'free')

// Plan display label
const planDisplayLabel = (plan?: string) => {
  if (!plan || plan === 'free') return 'Free'
  if (plan === 'pro') return 'Pro'
  // admin, admin_pro, etc
  return plan
    .split(/[_-]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function Profile() {
  const { language } = useLanguagePreference()
  const copy = useMemo(() => ({
    accountCenter: language === 'en' ? 'Account Center' : 'Pusat Akun',
    emailVerified: language === 'en' ? 'Email verified' : 'Email terverifikasi',
    notVerified: language === 'en' ? 'Not verified' : 'Belum diverifikasi',
    activeUntil: language === 'en' ? 'Active until' : 'Aktif sampai',
    verifyingSession: language === 'en' ? 'Verifying active session...' : 'Memverifikasi sesi aktif...',
    emailNotVerifiedTitle: language === 'en' ? 'Email not verified' : 'Email belum diverifikasi',
    emailNotVerifiedBody: language === 'en'
      ? 'Verify your email to activate all account features.'
      : 'Verifikasi email untuk mengaktifkan semua fitur akun.',
    sending: language === 'en' ? 'Sending...' : 'Mengirim...',
    sendVerification: language === 'en' ? 'Send verification instructions' : 'Kirim Instruksi Verifikasi',
    plan: language === 'en' ? 'Plan' : 'Paket',
    emailStatus: language === 'en' ? 'Email Status' : 'Status Email',
    session: language === 'en' ? 'Session' : 'Sesi',
    verified: language === 'en' ? 'Verified' : 'Terverifikasi',
    notYet: language === 'en' ? 'Pending' : 'Belum',
    active: language === 'en' ? 'Active' : 'Aktif',
    inactive: language === 'en' ? 'Inactive' : 'Tidak Aktif',
    quickNav: language === 'en' ? 'Quick Navigation' : 'Navigasi Cepat',
    commandCenter: language === 'en' ? 'Command Center' : 'Pusat Komando',
    portfolio: language === 'en' ? 'Portfolio' : 'Portofolio',
    askTingAi: language === 'en' ? 'Ask Ting AI' : 'Tanya Ting AI',
    upgrade: language === 'en' ? 'Upgrade to Pro' : 'Upgrade ke Pro',
    sessionBody: language === 'en'
      ? 'Use switch account to sign in with another account, or logout to end this session.'
      : 'Gunakan ganti akun untuk masuk dengan akun lain, atau logout untuk mengakhiri sesi ini.',
    switchAccount: language === 'en' ? 'Switch Account' : 'Ganti Akun',
    loggingOut: language === 'en' ? 'Logging out...' : 'Keluar...',
  }), [language])
  const { authenticated, loading, user } = useAuthSession()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AuthUserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    if (!authenticated) {
      setProfile(null)
      setProfileLoading(false)
      return () => { active = false }
    }
    setProfileLoading(true)
    const profileErrorMsg = language === 'id' ? 'Gagal memuat profil.' : 'Failed to load profile.'
    void fetchAccountProfile()
      .then(p => { if (active) setProfile(p) })
      .catch(() => { if (active) setProfileError(profileErrorMsg) })
      .finally(() => { if (active) setProfileLoading(false) })
    return () => { active = false }
  }, [authenticated, language])

  const resolvedUser = profile || user
  const fullname   = resolvedUser?.fullname || 'Guest'
  const email      = resolvedUser?.email || '-'
  const plan       = resolvedUser?.plan || 'free'
  const isPremium  = isPremiumPlan(plan)
  const planLabel  = planDisplayLabel(plan)
  const expiry     = formatPlanExpiry(resolvedUser?.planExpiresAt, language)
  const initials   = formatInitials(fullname)
  const verified   = Boolean(resolvedUser?.emailVerified)
  const isLoading  = loading || (authenticated && profileLoading && !profile)

  const handleVerificationRequest = async () => {
    setVerificationLoading(true)
    setVerificationMessage('')
    const errorMsg = language === 'id' ? 'Permintaan gagal.' : 'Request failed.'
    const successMsg = language === 'id' ? 'Instruksi verifikasi telah dikirim ke email Anda.' : 'Verification instructions have been sent to your email.'
    try {
      const response = await fetchWithSession(`${API_URL}/api/auth/email-verification/request`, { method: 'POST' })
      if (!response.ok) throw new Error(await readResponseError(response, errorMsg))
      const data = (await response.json()) as { message?: string }
      setVerificationMessage(data.message || successMsg)
    } catch (error) {
      setVerificationMessage(error instanceof Error ? error.message : errorMsg)
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleLogout = () => {
    setLoggingOut(true)
    clearAuth()
    navigate('/login')
  }

  const handleQuickNavigate = (path: string) => {
    navigate(path)
    window.scrollTo(0, 0)
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(20,184,166,0.08) 0%, transparent 60%), #080a0f',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Ambient grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 animate-in fade-in duration-700">

        {/* ── Identity Card ──────────────────────────────────────── */}
        <div
          className="relative rounded-3xl overflow-hidden border border-white/[0.08]"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)' }}
        >
          {/* Top teal accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.6), transparent)' }} />

          <div className="p-8 md:p-10 flex flex-col sm:flex-row gap-6 sm:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{
                  background: isPremium
                    ? 'linear-gradient(135deg, #0d9488, #14b8a6)'
                    : 'linear-gradient(135deg, #1e293b, #334155)',
                  color: isPremium ? '#000' : '#94a3b8',
                  boxShadow: isPremium ? '0 8px 32px rgba(20,184,166,0.25)' : 'none',
                }}
              >
                {initials || 'G'}
              </div>
              {/* Online dot */}
              {authenticated && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-[#080a0f]" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2 min-w-0">
              <p className="label-uppercase text-slate-600">{copy.accountCenter}</p>
              <h1 className="text-2xl font-semibold tracking-tight truncate">{fullname}</h1>
              <p className="text-slate-500 text-sm truncate">{email}</p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Plan badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: isPremium ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.05)',
                    border: isPremium ? '1px solid rgba(20,184,166,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    color: isPremium ? '#2dd4bf' : '#64748b',
                  }}
                >
                  {isPremium && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  {planLabel}
                </span>

                {/* Email status badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: verified ? 'rgba(20,184,166,0.08)' : 'rgba(239,68,68,0.08)',
                    border: verified ? '1px solid rgba(20,184,166,0.2)' : '1px solid rgba(239,68,68,0.2)',
                    color: verified ? '#5eead4' : '#f87171',
                  }}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${verified ? 'bg-teal-400' : 'bg-red-400'}`} />
                  {verified ? copy.emailVerified : copy.notVerified}
                </span>
              </div>

              {/* Pro expiry */}
              {isPremium && expiry && (
                <p className="text-xs text-slate-500">{copy.activeUntil} {expiry}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading State ──────────────────────────────────────── */}
        {isLoading && (
          <div className="premium-card flex items-center gap-4 bg-white/[0.02]">
            <div className="w-5 h-5 rounded-full border-2 border-teal-500/40 border-t-teal-500 animate-spin flex-shrink-0" />
            <p className="text-sm text-slate-400">{copy.verifyingSession}</p>
          </div>
        )}

        {/* ── Email Verification ─────────────────────────────────── */}
        {!verified && authenticated && !isLoading && (
          <div
            className="rounded-2xl border p-6 space-y-4"
            style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-300">{copy.emailNotVerifiedTitle}</p>
                <p className="text-xs text-slate-500 mt-0.5">{copy.emailNotVerifiedBody}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleVerificationRequest()}
              disabled={verificationLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-all disabled:opacity-50"
            >
              {verificationLoading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-red-400/40 border-t-red-400 animate-spin" />
                  {copy.sending}
                </>
              ) : copy.sendVerification}
            </button>
            {verificationMessage && (
              <p className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-2.5">
                {verificationMessage}
              </p>
            )}
            {profileError && (
              <p className="text-xs text-red-400">{profileError}</p>
            )}
          </div>
        )}

        {/* ── Stats Row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: copy.plan, value: planLabel },
            { label: copy.emailStatus, value: verified ? copy.verified : copy.notYet },
            { label: copy.session, value: authenticated ? copy.active : copy.inactive },
          ].map(item => (
            <div key={item.label} className="stat-card-small text-center">
              <p className="label-uppercase mb-2">{item.label}</p>
              <p className="text-sm font-semibold text-slate-200">{item.value}</p>
            </div>
          ))}
        </div>

        {/* ── Quick Nav ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="label-uppercase px-1">{copy.quickNav}</p>
          <div className="space-y-2">
            {[
              { path: '/morning-command', label: copy.commandCenter, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { path: '/portfolio', label: copy.portfolio, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
              { path: '/ting-ai', label: copy.askTingAi, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
              { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 4a2 2 0 01-2-2v-2a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2h-4z' },
            ].map(item => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleQuickNavigate(item.path)}
                className="flex w-full items-center gap-4 px-5 py-4 rounded-2xl border transition-all group text-left"
                style={{
                  background: (item as { highlight?: boolean }).highlight ? 'rgba(20,184,166,0.06)' : 'rgba(255,255,255,0.02)',
                  borderColor: (item as { highlight?: boolean }).highlight ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                  style={{
                    background: (item as { highlight?: boolean }).highlight ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <svg className="w-4 h-4" style={{ color: (item as { highlight?: boolean }).highlight ? '#2dd4bf' : '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium" style={{ color: (item as { highlight?: boolean }).highlight ? '#2dd4bf' : '#cbd5e1' }}>
                  {item.label}
                </span>
                <svg className="w-4 h-4 text-slate-700 ml-auto group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* ── Session Actions ───────────────────────────────────── */}
        <div className="premium-card bg-white/[0.02] space-y-4">
          <p className="label-uppercase">{copy.session}</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            {copy.sessionBody}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/login"
              onClick={() => clearAuth()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
            >
              {copy.switchAccount}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
            >
              {loggingOut ? copy.loggingOut : 'Logout'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
