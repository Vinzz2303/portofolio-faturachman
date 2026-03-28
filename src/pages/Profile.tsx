import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { clearAuth } from './ProtectedRoute'

const formatInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')

export default function Profile() {
  const fullname = useMemo(() => window.localStorage.getItem('lifeOS_user') || 'Guest', [])
  const email = useMemo(() => window.localStorage.getItem('lifeOS_user_email') || '-', [])
  const initials = useMemo(() => formatInitials(fullname), [fullname])

  return (
    <section className="container profile-shell">
      <div className="profile-card">
        <div className="profile-head">
          <div className="profile-avatar">{initials || 'G'}</div>
          <div>
            <p className="eyebrow">Account Center</p>
            <h2>{fullname}</h2>
            <p className="lead profile-email">{email}</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-panel">
            <h3>Profile</h3>
            <p className="card-note">
              Halaman ini menampilkan ringkasan akun yang sedang aktif di sesi LifeOS saat ini.
            </p>
            <div className="profile-actions">
              <Link className="btn" to="/dashboard">
                Buka Dashboard
              </Link>
              <Link className="btn secondary" to="/lifeos">
                Buka LifeOS
              </Link>
            </div>
          </div>

          <div className="profile-panel">
            <h3>Session</h3>
            <p className="card-note">
              Gunakan switch account untuk masuk dengan akun lain, atau logout untuk mengakhiri
              sesi ini.
            </p>
            <div className="profile-actions">
              <Link
                className="btn secondary"
                to="/login"
                onClick={() => {
                  clearAuth()
                }}
              >
                Switch Account
              </Link>
              <Link
                className="btn secondary danger"
                to="/login"
                onClick={() => {
                  clearAuth()
                }}
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
