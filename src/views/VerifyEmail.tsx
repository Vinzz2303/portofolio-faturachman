import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_URL } from '../utils/api'

type VerifyState = 'loading' | 'success' | 'error'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [state, setState] = useState<VerifyState>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const uid = searchParams.get('uid')

    if (!token || !uid) {
      setState('error')
      setMessage('Link verifikasi tidak valid. Minta ulang dari halaman profil.')
      return
    }

    const url = `${API_URL}/api/auth/email-verification/confirm?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(uid)}`

    fetch(url)
      .then(async res => {
        if (res.redirected || res.ok) {
          setState('success')
          setMessage('Email berhasil diverifikasi! Kamu sekarang bisa mengakses semua fitur.')
          // Delay then redirect to profile
          setTimeout(() => navigate('/profile'), 2500)
        } else {
          const data = (await res.json()) as { error?: string }
          setState('error')
          setMessage(data.error || 'Verifikasi gagal. Coba minta ulang link dari halaman profil.')
        }
      })
      .catch(() => {
        setState('error')
        setMessage('Koneksi ke server gagal. Pastikan kamu terhubung ke internet.')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#080a0f', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl border p-10 text-center space-y-6 animate-in fade-in duration-500"
        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {state === 'loading' && (
          <>
            <div className="w-12 h-12 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <p className="label-uppercase text-center">Verifikasi Email</p>
              <p className="text-sm text-slate-400">Sedang memverifikasi akun kamu…</p>
            </div>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="label-uppercase text-center text-teal-500">Berhasil</p>
              <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
              <p className="text-xs text-slate-600">Mengalihkan ke profil…</p>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="label-uppercase text-center text-red-500">Gagal</p>
              <p className="text-sm text-slate-400 leading-relaxed">{message}</p>
            </div>
            <a
              href="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
            >
              Kembali ke Profil
            </a>
          </>
        )}
      </div>
    </div>
  )
}
