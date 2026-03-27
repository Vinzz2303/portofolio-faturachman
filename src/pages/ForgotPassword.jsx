import React, { useState } from 'react'
import { API_URL } from '../utils/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async event => {
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
        throw new Error(text || 'Request gagal')
      }
      setDone(true)
    } catch (err) {
      setError(err?.message || 'Request gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Executive LifeOS</p>
        <h2>Forgot Password</h2>
        <p className="lead">
          Masukkan email untuk menerima link reset password.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            className="auth-input"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="Masukkan email"
            autoComplete="email"
          />
          <button className="btn" type="submit" disabled={loading || done}>
            {loading ? 'Mengirim...' : done ? 'Email Terkirim' : 'Kirim Link Reset'}
          </button>
        </form>

        {error && <p className="auth-note warn">{error}</p>}
        {done && <p className="auth-note">Jika email terdaftar, link reset sudah dikirim.</p>}
      </div>
    </section>
  )
}
