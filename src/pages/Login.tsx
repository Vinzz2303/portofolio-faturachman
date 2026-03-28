import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/api'
import type { LoginResponse } from '../types'

const STORAGE_KEY = 'lifeos-auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      window.localStorage.setItem(STORAGE_KEY, 'true')
      window.localStorage.setItem('lifeOS_token', data?.token || '')
      window.localStorage.setItem('lifeOS_user', data?.user?.fullname || email.trim())
      window.localStorage.setItem('lifeOS_user_email', data?.user?.email || email.trim())
      window.dispatchEvent(new Event('lifeos-auth'))
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
        <p className="eyebrow">Fatur LifeOS</p>
        <h2>Login to Continue</h2>
        <p className="lead">
          Masuk untuk mengakses dashboard investasi dan AI assistant berbasis data pasar terbaru.
        </p>

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
            {loading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </button>
        </form>
        {error && <p className="auth-note warn">{error}</p>}

        <p className="auth-note">
          Login ini menggunakan autentikasi server (JWT).
        </p>
        <div className="auth-links">
          <a href="/signup">Buat akun</a>
          <a href="/forgot">Lupa password</a>
        </div>
      </div>
    </section>
  )
}
