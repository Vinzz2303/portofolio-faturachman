import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/api'

export default function Signup() {
  const navigate = useNavigate()
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        body: JSON.stringify({ fullname: fullname.trim(), email: email.trim(), password })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Signup gagal')
      }
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Ting AI</p>
        <h2>Create Account</h2>
        <p className="lead">Buat akun untuk mengakses dashboard dan AI assistant.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-label" htmlFor="signup-name">Fullname</label>
          <input
            id="signup-name"
            className="auth-input"
            type="text"
            value={fullname}
            onChange={event => setFullname(event.target.value)}
            placeholder="Masukkan nama lengkap"
            autoComplete="name"
          />
          <label className="auth-label" htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            className="auth-input"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="Masukkan email"
            autoComplete="email"
          />
          <label className="auth-label" htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            className="auth-input"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Buat password"
            autoComplete="new-password"
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Buat Akun'}
          </button>
        </form>

        {error && <p className="auth-note warn">{error}</p>}
        <p className="auth-note">Sudah punya akun? Login dari menu Ting AI.</p>
      </div>
    </section>
  )
}
