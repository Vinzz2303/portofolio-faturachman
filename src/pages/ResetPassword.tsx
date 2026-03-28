import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/api'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const query = useMemo(() => new URLSearchParams(location.search), [location.search])
  const email = query.get('email') || ''
  const token = query.get('token') || ''

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !token || !password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Reset gagal')
      }
      setDone(true)
      window.setTimeout(() => navigate('/login', { replace: true }), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Executive LifeOS</p>
        <h2>Reset Password</h2>
        <p className="lead">
          Buat password baru untuk akun kamu.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="reset-password">Password Baru</label>
          <input
            id="reset-password"
            className="auth-input"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Masukkan password baru"
            autoComplete="new-password"
          />
          <button className="btn" type="submit" disabled={loading || done || !email || !token}>
            {loading ? 'Memproses...' : done ? 'Berhasil' : 'Reset Password'}
          </button>
        </form>

        {(!email || !token) && (
          <p className="auth-note warn">Token reset tidak valid. Mohon cek link dari email.</p>
        )}
        {error && <p className="auth-note warn">{error}</p>}
      </div>
    </section>
  )
}
