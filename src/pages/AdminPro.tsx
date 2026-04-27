import React from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import { useAuthSession } from '../utils/useAuthSession'
import type { AdminStatsResponse, ProUpgradeRequest } from '../types'

const statusLabel: Record<ProUpgradeRequest['status'], string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected'
}

const formatExpiry = (value?: string | null) => {
  if (!value) return 'Belum ada masa aktif'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Tanggal aktif tidak tersedia'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}

const isImageProof = (value?: string | null) => Boolean(value && /\.(png|jpe?g|webp|gif)$/i.test(value))

export default function AdminPro() {
  const navigate = useNavigate()
  const { authenticated, user, loading } = useAuthSession()
  const [requests, setRequests] = React.useState<ProUpgradeRequest[]>([])
  const [recentUsers, setRecentUsers] = React.useState<AdminStatsResponse['recentUsers']>([])
  const [stats, setStats] = React.useState<AdminStatsResponse>({
    totalUsers: 0,
    pendingProRequests: 0,
    approvedProRequests: 0,
    rejectedProRequests: 0
  })
  const [busyId, setBusyId] = React.useState<number | null>(null)
  const [previewBusyId, setPreviewBusyId] = React.useState<number | null>(null)
  const [message, setMessage] = React.useState('')

  const loadDashboard = React.useCallback(async () => {
    const [statsResponse, requestsResponse] = await Promise.all([
      fetchWithSession(`${API_URL}/api/admin/stats`),
      fetchWithSession(`${API_URL}/api/admin/pro-upgrade-requests`)
    ])

    if (!statsResponse.ok) {
      throw new Error(await readResponseError(statsResponse, 'Gagal memuat admin stats.'))
    }

    if (!requestsResponse.ok) {
      throw new Error(await readResponseError(requestsResponse, 'Gagal memuat request Pro.'))
    }

    const statsData = (await statsResponse.json()) as AdminStatsResponse
    const requestsData = (await requestsResponse.json()) as { requests?: ProUpgradeRequest[] }

    setStats({
      totalUsers: statsData.totalUsers || 0,
      pendingProRequests: statsData.pendingProRequests || 0,
      approvedProRequests: statsData.approvedProRequests || 0,
      rejectedProRequests: statsData.rejectedProRequests || 0
    })
    setRecentUsers(statsData.recentUsers || [])
    setRequests(requestsData.requests || [])
  }, [])

  React.useEffect(() => {
    if (!loading && !authenticated) {
      navigate('/login', { replace: true })
    }
  }, [authenticated, loading, navigate])

  React.useEffect(() => {
    let active = true

    const load = async () => {
      try {
        await loadDashboard()
        if (!active) return
      } catch (error) {
        if (!active) return
        setMessage(error instanceof Error ? error.message : 'Gagal memuat admin stats.')
      }
    }

    void load()
    const intervalId = window.setInterval(() => {
      void load()
    }, 15000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [loadDashboard])

  const refresh = async () => {
    try {
      await loadDashboard()
      setMessage('Data request diperbarui.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat request Pro.')
    }
  }

  const updateRequest = async (id: number, status: ProUpgradeRequest['status']) => {
    setBusyId(id)
    try {
      const response = await fetchWithSession(`${API_URL}/api/admin/pro-upgrade-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNote: status === 'approved' ? 'Verified by admin' : 'Rejected by admin'
        })
      })

      if (!response.ok) {
        throw new Error(await readResponseError(response, 'Gagal memperbarui request.'))
      }

      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memperbarui request.')
    } finally {
      setBusyId(null)
    }
  }

  const openProof = async (request: ProUpgradeRequest) => {
    if (!request.proofUrl) return
    setPreviewBusyId(request.id)

    try {
      const response = await fetchWithSession(`${API_URL}${request.proofUrl}`)
      if (!response.ok) {
        throw new Error(await readResponseError(response, 'Gagal membuka bukti transfer.'))
      }

      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      window.open(objectUrl, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal membuka bukti transfer.')
    } finally {
      setPreviewBusyId(null)
    }
  }

  const isAdmin = user?.email?.toLowerCase() === 'faturachmanalkahfi7@gmail.com'

  if (loading) {
    return (
      <section className="container auth-shell">
        <div className="auth-card">
          <p className="lead">Memuat dashboard admin...</p>
        </div>
      </section>
    )
  }

  if (!isAdmin) {
    return (
      <section className="container auth-shell">
        <div className="auth-card">
          <h2>Admin access required</h2>
          <p className="lead">Akun ini belum diizinkan untuk membuka dashboard admin.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Ting AI Admin</p>
        <h2>Pro Upgrade Control Center</h2>
        <p className="lead">
          Pantau user baru, request Pro, dan status verifikasi dari satu tempat.
        </p>

        <div className="profile-grid" style={{ marginBottom: '1rem' }}>
          <div className="profile-panel">
            <h3>Total User</h3>
            <p className="dashboard-stat-value">{stats.totalUsers}</p>
          </div>
          <div className="profile-panel">
            <h3>Pending Pro</h3>
            <p className="dashboard-stat-value">{stats.pendingProRequests}</p>
          </div>
          <div className="profile-panel">
            <h3>Approved Pro</h3>
            <p className="dashboard-stat-value">{stats.approvedProRequests}</p>
          </div>
          <div className="profile-panel">
            <h3>Rejected Pro</h3>
            <p className="dashboard-stat-value">{stats.rejectedProRequests}</p>
          </div>
        </div>

        <div className="profile-panel" style={{ marginBottom: '1rem' }}>
          <div className="profile-actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Request Pro Terbaru</h3>
            <button className="btn secondary" type="button" onClick={() => void refresh()}>
              Refresh
            </button>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
            {requests.map((request) => (
              <div key={request.id} className="market-card">
                <p className="market-status-label">
                  {request.fullName} - {request.email}
                </p>
                <p className="card-note">
                  Status: <strong>{statusLabel[request.status]}</strong>
                </p>
                <p className="card-note">
                  Aktif sampai: <strong>{formatExpiry(request.expiresAt)}</strong>
                </p>
                <p className="card-note">Pengirim: {request.senderName}</p>
                <p className="card-note">Tanggal transfer: {request.transferDate}</p>
                <p className="card-note">File: {request.proofFileName || '-'}</p>
                {request.proofUrl ? (
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      className="btn secondary"
                      type="button"
                      onClick={() => void openProof(request)}
                      disabled={previewBusyId === request.id}
                    >
                      Lihat bukti
                    </button>
                    {isImageProof(request.proofFileName) ? <p className="card-note" style={{ marginTop: '0.5rem' }}>Preview gambar akan dibuka di tab baru.</p> : null}
                  </div>
                ) : null}
                <p className="card-note">Catatan: {request.notes || '-'}</p>
                <div className="profile-actions" style={{ marginTop: '0.75rem' }}>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => updateRequest(request.id, 'approved')}
                    disabled={busyId === request.id}
                  >
                    Approve
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => updateRequest(request.id, 'rejected')}
                    disabled={busyId === request.id}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {!requests.length ? <p className="card-note">Belum ada request Pro.</p> : null}
          </div>
        </div>

        <div className="profile-panel" style={{ marginBottom: '1rem' }}>
          <h3>User Terbaru</h3>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
            {recentUsers?.map((item) => (
              <div key={item.id} className="market-card">
                <p className="market-status-label">{item.fullname}</p>
                <p className="card-note">{item.email}</p>
                <p className="card-note">ID: {item.id}</p>
              </div>
            ))}
            {!recentUsers?.length ? <p className="card-note">Belum ada user yang terbaca.</p> : null}
          </div>
        </div>

        {message ? <p className="auth-note warn">{message}</p> : null}
      </div>
    </section>
  )
}
