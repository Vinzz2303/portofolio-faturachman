import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
  if (!value) return language === 'en' ? 'No active plan' : 'Tidak ada masa aktif'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return language === 'en' ? 'Expiry date unavailable' : 'Tanggal habis tidak tersedia'
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}

export default function Profile() {
  const { language } = useLanguagePreference()
  const { authenticated, loading, user } = useAuthSession()
  const [profile, setProfile] = useState<AuthUserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationLoading, setVerificationLoading] = useState(false)

  useEffect(() => {
    let active = true

    if (!authenticated) {
      setProfile(null)
      setProfileError('')
      setProfileLoading(false)
      return () => {
        active = false
      }
    }

    setProfileLoading(true)
    setProfileError('')

    void fetchAccountProfile()
      .then((accountProfile) => {
        if (!active) return
        setProfile(accountProfile)
      })
      .catch((error: unknown) => {
        if (!active) return
        setProfile(null)
        setProfileError(
          error instanceof Error
            ? error.message
            : language === 'en'
              ? 'Failed to load account profile.'
              : 'Gagal memuat profil akun.'
        )
      })
      .finally(() => {
        if (!active) return
        setProfileLoading(false)
      })

    return () => {
      active = false
    }
  }, [authenticated, language])

  const copy = useMemo(
    () =>
      language === 'en'
        ? {
            accountCenter: 'Account Center',
            guest: 'Guest',
            profileLoadFailed: 'Failed to load account profile.',
            requestFailed: 'Request failed.',
            verifyInstructionFallback: 'If the email is registered, verification instructions will be sent.',
            emailStatus: 'Email status',
            verified: 'Verified',
            unverified: 'Not verified',
            activeUntil: 'Active until',
            profile: 'Profile',
            session: 'Session',
            loadingProfile: 'Ting AI is verifying the active session before showing account identity.',
            activeProfile: 'This page shows the account summary and email status for the current active session.',
            inactiveProfile: 'No active session found. Please sign in again to load account identity.',
            sendVerification: 'Send Verification Instructions',
            sending: 'Sending...',
            openDashboard: 'Open Command Center',
            upgradeToPro: 'Upgrade to Pro',
            openPersonalSpace: 'Open Personal Space',
            sessionNote: 'Use switch account to sign in with another account, or log out to end this session.',
            switchAccount: 'Switch Account',
            logout: 'Logout'
          }
        : {
            accountCenter: 'Pusat Akun',
            guest: 'Guest',
            profileLoadFailed: 'Gagal memuat profil akun.',
            requestFailed: 'Permintaan gagal.',
            verifyInstructionFallback: 'Jika email terdaftar, instruksi verifikasi akan dikirim.',
            emailStatus: 'Status email',
            verified: 'Terverifikasi',
            unverified: 'Belum diverifikasi',
            activeUntil: 'Aktif sampai',
            profile: 'Profil',
            session: 'Sesi',
            loadingProfile: 'Ting AI sedang memverifikasi sesi aktif sebelum menampilkan identitas akun.',
            activeProfile: 'Halaman ini menampilkan ringkasan akun dan status email untuk sesi aktif saat ini.',
            inactiveProfile: 'Sesi aktif tidak ditemukan. Silakan login ulang untuk memuat identitas akun.',
            sendVerification: 'Kirim Instruksi Verifikasi',
            sending: 'Mengirim...',
            openDashboard: 'Buka Pusat Komando',
            upgradeToPro: 'Naikkan ke Pro',
            openPersonalSpace: 'Buka Ruang Pribadi',
            sessionNote: 'Gunakan ganti akun untuk masuk dengan akun lain, atau logout untuk mengakhiri sesi ini.',
            switchAccount: 'Ganti Akun',
            logout: 'Logout'
          },
    [language]
  )

  const resolvedUser = profile || user
  const fullname = useMemo(() => resolvedUser?.fullname || copy.guest, [copy.guest, resolvedUser?.fullname])
  const email = useMemo(() => resolvedUser?.email || '-', [resolvedUser?.email])
  const planLabel = useMemo(
    () => (resolvedUser?.plan === 'pro' ? 'Pro' : 'Free'),
    [resolvedUser?.plan]
  )
  const planExpiryLabel = useMemo(
    () => formatPlanExpiry(resolvedUser?.planExpiresAt, language),
    [language, resolvedUser?.planExpiresAt]
  )
  const showUpgradeCta = resolvedUser?.plan !== 'pro'
  const initials = useMemo(() => formatInitials(fullname), [fullname])
  const isProfileLoading = loading || (authenticated && profileLoading && !profile)
  const emailVerified = Boolean(resolvedUser?.emailVerified)

  const handleVerificationRequest = async () => {
    setVerificationLoading(true)
    setVerificationMessage('')
    try {
      const response = await fetchWithSession(`${API_URL}/api/auth/email-verification/request`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error(await readResponseError(response, copy.requestFailed))
      }
      const data = (await response.json()) as { message?: string }
      setVerificationMessage(data.message || copy.verifyInstructionFallback)
    } catch (error) {
      setVerificationMessage(error instanceof Error ? error.message : copy.requestFailed)
    } finally {
      setVerificationLoading(false)
    }
  }

  return (
    <section className="container profile-shell">
      <div className="profile-card">
        <div className="profile-head">
          <div className="profile-avatar">{initials || 'G'}</div>
          <div>
            <p className="eyebrow">{copy.accountCenter}</p>
            <h2>{fullname}</h2>
            <p className="lead profile-email">{email}</p>
            <span className="dashboard-summary-badge" style={{ display: 'inline-flex', marginTop: '0.5rem' }}>
              {planLabel}
            </span>
            <p className="card-note" style={{ marginTop: '0.5rem' }}>
              {copy.emailStatus}: {emailVerified ? copy.verified : copy.unverified}
            </p>
            {resolvedUser?.plan === 'pro' ? (
              <p className="card-note" style={{ marginTop: '0.5rem' }}>
                {copy.activeUntil}: {planExpiryLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-panel">
            <h3>{copy.profile}</h3>
            <p className="card-note">
              {isProfileLoading
                ? copy.loadingProfile
                : authenticated
                  ? copy.activeProfile
                  : copy.inactiveProfile}
            </p>
            {!emailVerified && authenticated ? (
              <div className="profile-actions" style={{ marginTop: '1rem' }}>
                <button className="btn secondary" type="button" onClick={() => void handleVerificationRequest()} disabled={verificationLoading}>
                  {verificationLoading ? copy.sending : copy.sendVerification}
                </button>
              </div>
            ) : null}
            {verificationMessage ? <p className="auth-note">{verificationMessage}</p> : null}
            {profileError ? <p className="auth-note warn">{profileError}</p> : null}
            <div className="profile-actions">
              <Link className="btn" to="/dashboard">
                {copy.openDashboard}
              </Link>
              {showUpgradeCta ? (
                <Link className="btn secondary" to="/upgrade">
                  {copy.upgradeToPro}
                </Link>
              ) : null}
              <Link className="btn secondary" to="/personal-space">
                {copy.openPersonalSpace}
              </Link>
            </div>
          </div>

          <div className="profile-panel">
            <h3>{copy.session}</h3>
            <p className="card-note">{copy.sessionNote}</p>
            <div className="profile-actions">
              <Link
                className="btn secondary"
                to="/login"
                onClick={() => {
                  clearAuth()
                }}
              >
                {copy.switchAccount}
              </Link>
              <Link
                className="btn secondary danger"
                to="/login"
                onClick={() => {
                  clearAuth()
                }}
              >
                {copy.logout}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
