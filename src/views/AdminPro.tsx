/**
 * AdminPro.tsx — Pro Upgrade Control Center (v2 premium)
 * Admin-only dashboard for managing Pro upgrade requests.
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import { useAuthSession } from '../utils/useAuthSession'
import type { AdminStatsResponse, ProUpgradeRequest } from '../types'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  draft:    { label: 'Draft',    bg: 'rgba(148,163,184,0.08)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
  pending:  { label: 'Pending',  bg: 'rgba(251,191,36,0.10)',  text: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  approved: { label: 'Approved', bg: 'rgba(20,184,166,0.10)',  text: '#2dd4bf', border: 'rgba(20,184,166,0.25)' },
  rejected: { label: 'Rejected', bg: 'rgba(248,113,113,0.10)', text: '#f87171', border: 'rgba(248,113,113,0.25)' },
}

const formatExpiry = (value?: string | null) => {
  if (!value) return 'Belum ada masa aktif'
  const ts = new Date(value).getTime()
  if (Number.isNaN(ts)) return 'Tanggal tidak tersedia'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts))
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(d)
}

const isImageProof = (value?: string | null) => Boolean(value && /\.(png|jpe?g|webp|gif)$/i.test(value))

function getDecisionContext(req: ProUpgradeRequest): { label: string; color: string } {
  if (req.status === 'approved' || req.status === 'rejected') return { label: 'Sudah diproses', color: '#64748b' }
  if (req.proofUrl) return { label: 'Siap diverifikasi', color: '#2dd4bf' }
  return { label: 'Perlu cek manual', color: '#fbbf24' }
}

export default function AdminPro() {
  const navigate = useNavigate()
  const { authenticated, user, loading } = useAuthSession()
  const [requests, setRequests] = React.useState<ProUpgradeRequest[]>([])
  const [recentUsers, setRecentUsers] = React.useState<AdminStatsResponse['recentUsers']>([])
  const [stats, setStats] = React.useState<AdminStatsResponse>({
    totalUsers: 0, pendingProRequests: 0, approvedProRequests: 0, rejectedProRequests: 0
  })
  const [busyId, setBusyId] = React.useState<number | null>(null)
  const [previewBusyId, setPreviewBusyId] = React.useState<number | null>(null)
  const [message, setMessage] = React.useState('')

  const loadDashboard = React.useCallback(async () => {
    const [statsRes, reqRes] = await Promise.all([
      fetchWithSession(`${API_URL}/api/admin/stats`),
      fetchWithSession(`${API_URL}/api/admin/pro-upgrade-requests`),
    ])
    if (!statsRes.ok) throw new Error(await readResponseError(statsRes, 'Gagal memuat admin stats.'))
    if (!reqRes.ok) throw new Error(await readResponseError(reqRes, 'Gagal memuat request Pro.'))
    const statsData = (await statsRes.json()) as AdminStatsResponse
    const reqData = (await reqRes.json()) as { requests?: ProUpgradeRequest[] }
    setStats({ totalUsers: statsData.totalUsers || 0, pendingProRequests: statsData.pendingProRequests || 0, approvedProRequests: statsData.approvedProRequests || 0, rejectedProRequests: statsData.rejectedProRequests || 0 })
    setRecentUsers(statsData.recentUsers || [])
    setRequests(reqData.requests || [])
  }, [])

  React.useEffect(() => {
    if (!loading && !authenticated) navigate('/login', { replace: true })
  }, [authenticated, loading, navigate])

  React.useEffect(() => {
    let active = true
    const load = async () => { try { await loadDashboard() } catch (e) { if (active) setMessage(e instanceof Error ? e.message : 'Gagal memuat.') } }
    void load()
    const id = window.setInterval(() => void load(), 15000)
    return () => { active = false; window.clearInterval(id) }
  }, [loadDashboard])

  const refresh = async () => {
    try { await loadDashboard(); setMessage('Data diperbarui.'); setTimeout(() => setMessage(''), 3000) }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Gagal memuat.') }
  }

  const updateRequest = async (id: number, status: string) => {
    setBusyId(id)
    try {
      const res = await fetchWithSession(`${API_URL}/api/admin/pro-upgrade-requests/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(await readResponseError(res, 'Gagal memperbarui.'))
      await refresh()
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Gagal memperbarui.') }
    finally { setBusyId(null) }
  }

  const openProof = async (req: ProUpgradeRequest) => {
    if (!req.proofUrl) { setMessage('Bukti belum tersedia.'); setTimeout(() => setMessage(''), 3000); return }
    setPreviewBusyId(req.id)
    try {
      const res = await fetchWithSession(`${API_URL}${req.proofUrl}`)
      if (!res.ok) { setMessage('Gagal membuka bukti. File mungkin sudah dihapus atau belum di-upload.'); setPreviewBusyId(null); return }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000)
    } catch { setMessage('Gagal membuka bukti transfer.') }
    finally { setPreviewBusyId(null) }
  }

  const isAdmin = user?.email?.toLowerCase() === 'faturachmanalkahfi7@gmail.com'

  // ── Loading / Access Gate ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080a0f' }}>
        <p className="text-slate-500 text-sm">Memuat dashboard admin...</p>
      </div>
    )
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080a0f' }}>
        <div className="text-center space-y-3">
          <p className="text-slate-400 text-lg font-semibold">Admin access required</p>
          <p className="text-slate-600 text-sm">Akun ini belum diizinkan untuk membuka dashboard admin.</p>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: '#94a3b8' },
    { label: 'Pending Pro', value: stats.pendingProRequests, color: '#fbbf24' },
    { label: 'Approved Pro', value: stats.approvedProRequests, color: '#2dd4bf' },
    { label: 'Rejected Pro', value: stats.rejectedProRequests, color: '#f87171' },
  ]

  return (
    <div className="min-h-screen pb-20" style={{ background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(20,184,166,0.05) 0%, transparent 60%), #080a0f', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-10 space-y-6">

        {/* ═══ HERO ═══ */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Ting AI Admin</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">Pro Upgrade Control Center</h1>
          <p className="text-slate-500 text-sm" style={{ lineHeight: '1.5' }}>
            Pantau user, verifikasi request Pro, dan kelola status dari satu tempat.
          </p>
        </div>

        {/* ═══ MESSAGE ═══ */}
        {message && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 px-4 py-3 text-sm">{message}</div>
        )}

        {/* ═══ 4 STAT CARDS ═══ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] px-4 py-4 space-y-1" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ═══ PRO REQUESTS ═══ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Request Pro Terbaru</p>
            <button onClick={() => void refresh()} className="text-[11px] font-medium text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12]">
              Refresh
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] px-6 py-12 text-center" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <p className="text-slate-400 font-medium">Belum ada request Pro.</p>
              <p className="text-slate-600 text-sm mt-2">Saat ada user upload bukti, akan muncul di sini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map(req => {
                const sc = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
                const ctx = getDecisionContext(req)
                return (
                  <div key={req.id} className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="px-5 py-4 space-y-3">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-[14px] truncate">{req.fullName}</p>
                          <p className="text-slate-500 text-[12px] truncate">{req.email}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border" style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}>
                            {sc.label}
                          </span>
                        </div>
                      </div>

                      {/* Decision context */}
                      <p className="text-[11px] font-medium" style={{ color: ctx.color }}>
                        ● {ctx.label}
                      </p>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
                        <div>
                          <span className="text-slate-600">Dikirim:</span>{' '}
                          <span className="text-slate-400">{formatDate(req.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">File:</span>{' '}
                          <span className="text-slate-400 truncate max-w-[120px] inline-block align-bottom">{req.proofFileName || '—'}</span>
                        </div>
                      </div>

                      {/* Proof button */}
                      <div className="flex items-center gap-3 pt-1">
                        {req.proofUrl ? (
                          <button
                            onClick={() => void openProof(req)}
                            disabled={previewBusyId === req.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-all disabled:opacity-50"
                          >
                            {previewBusyId === req.id ? 'Membuka...' : 'Lihat Bukti'}
                            {isImageProof(req.proofFileName) && <span className="text-[9px] text-slate-600">🖼️</span>}
                          </button>
                        ) : (
                          <span className="text-[12px] text-slate-600 italic">Bukti belum tersedia.</span>
                        )}
                      </div>
                    </div>

                    {/* Action bar */}
                    {req.status === 'pending' && (
                      <div className="flex border-t border-white/[0.05]">
                        <button
                          onClick={() => void updateRequest(req.id, 'approved')}
                          disabled={busyId === req.id}
                          className="flex-1 py-3 text-[13px] font-bold text-teal-400 hover:bg-teal-500/10 transition-all disabled:opacity-50 border-r border-white/[0.05]"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => void updateRequest(req.id, 'rejected')}
                          disabled={busyId === req.id}
                          className="flex-1 py-3 text-[13px] font-bold text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ═══ RECENT USERS ═══ */}
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">User Terbaru</p>
          {recentUsers?.length ? (
            <div className="space-y-1.5">
              {recentUsers.map(u => (
                <div key={u.id} className="rounded-xl border border-white/[0.06] px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div>
                    <p className="text-white text-[13px] font-medium">{u.fullname}</p>
                    <p className="text-slate-600 text-[11px]">{u.email}</p>
                  </div>
                  <span className="text-slate-700 text-[10px] font-mono">#{u.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm">Belum ada user yang terbaca.</p>
          )}
        </div>

        {/* ═══ MANUAL UPGRADE & TERMINATE ═══ */}
        <div className="space-y-3 pt-6 border-t border-white/[0.05]">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Manual User Management</p>
          <div className="rounded-xl border border-white/[0.06] p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-slate-400 text-sm">Gunakan fitur ini untuk upgrade atau terminate user tanpa melalui form pembayaran.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                id="manual-user-email"
                type="email" 
                placeholder="Masukkan email user..." 
                className="flex-1 bg-[#080a0f] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    const email = (document.getElementById('manual-user-email') as HTMLInputElement).value
                    if (!email) return setMessage('Email wajib diisi')
                    setBusyId(-1)
                    try {
                      const res = await fetchWithSession(`${API_URL}/api/admin/users/upgrade`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                      if (!res.ok) throw new Error(await readResponseError(res, 'Gagal upgrade user'))
                      setMessage('User berhasil di-upgrade ke PRO')
                      await refresh()
                    } catch (e) { setMessage(e instanceof Error ? e.message : 'Error') }
                    finally { setBusyId(null) }
                  }}
                  disabled={busyId === -1}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Upgrade PRO
                </button>
                <button 
                  onClick={async () => {
                    const email = (document.getElementById('manual-user-email') as HTMLInputElement).value
                    if (!email) return setMessage('Email wajib diisi')
                    if (!confirm(`Yakin ingin terminate status PRO dari ${email}?`)) return
                    setBusyId(-2)
                    try {
                      const res = await fetchWithSession(`${API_URL}/api/admin/users/terminate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                      if (!res.ok) throw new Error(await readResponseError(res, 'Gagal terminate user'))
                      setMessage('Status PRO user berhasil dicabut')
                      await refresh()
                    } catch (e) { setMessage(e instanceof Error ? e.message : 'Error') }
                    finally { setBusyId(null) }
                  }}
                  disabled={busyId === -2}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-semibold rounded-lg transition-colors"
                >
                  Terminate
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
