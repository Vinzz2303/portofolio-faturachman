import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { persistAuthSession } from '../utils/auth'
import type { LoginResponse } from '../types'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const loginNotice = new URLSearchParams(location.search).get('signup') === 'success'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      })
      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string }
        throw new Error(errorData.error || 'Login gagal')
      }
      const data = (await res.json()) as LoginResponse
      persistAuthSession(data?.token || '', data.user || null)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Ting AI</p>
        <h2>Masuk ke Ting AI</h2>
        <p className="lead">Masuk untuk membuka dashboard dan ringkasan pasar hari ini.</p>
        {loginNotice ? <p className="auth-note">Akun berhasil dibuat. Silakan masuk dengan email dan password Anda.</p> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="lifeos-email">Email</label>
          <input
            id="lifeos-email"
            className="auth-input"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="Masukkan email"
            autoComplete="email"
          />
          <label className="auth-label" htmlFor="lifeos-password">Password</label>
          <input
            id="lifeos-password"
            className="auth-input"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Masukkan password"
            autoComplete="current-password"
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        {error && <p className="auth-note warn">{error}</p>}
        <div className="auth-links">
          <Link to="/signup">Buat akun</Link>
          <a href="/forgot">Lupa kata sandi</a>
        </div>
      </div>
    </section>
  )
}
