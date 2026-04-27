import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { ProtectedRouteProps } from '../types'
import { useAuthSession } from '../utils/useAuthSession'

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { loading, authenticated } = useAuthSession()

  if (loading) {
    return (
      <section className="container auth-shell">
        <div className="auth-card">
          <p className="eyebrow">Pemeriksaan Sesi</p>
          <h2>Memverifikasi akses akun</h2>
          <p className="lead">
            Ting AI sedang memvalidasi sesi aktif Anda sebelum membuka workspace ini.
          </p>
        </div>
      </section>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
