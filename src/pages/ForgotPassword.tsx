import React, { useState } from 'react'
import { API_URL } from '../utils/api'

export default function ForgotPassword() {
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
    <section className="container auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Ting AI</p>
        <h2>Forgot Password</h2>
        <p className="lead">
          Masukkan email untuk meminta instruksi reset password.
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
            {loading ? 'Mengirim...' : done ? 'Instruksi Terkirim' : 'Kirim Instruksi Reset'}
          </button>
        </form>

        {error && <p className="auth-note warn">{error}</p>}
        {done && <p className="auth-note">Jika email terdaftar, instruksi reset password akan dikirim.</p>}
      </div>
    </section>
  )
}
