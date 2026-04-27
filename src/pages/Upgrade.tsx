import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../utils/api'
import { fetchWithSession, readResponseError } from '../utils/authFetch'
import { useAuthSession } from '../utils/useAuthSession'
import type { ProUpgradeStatusResponse, ProUpgradeSubmitResponse } from '../types'

const bankDetails = [
  { label: 'Bank', value: 'BCA' },
  { label: 'Nama Rekening', value: 'Faturachman Al Kahfi' },
  { label: 'Nomor Rekening', value: '5411301142' },
  { label: 'Nominal', value: 'Rp30.000' }
]

const proBenefits = [
  'Briefing yang lebih panjang dan lebih personal',
  'History percakapan yang lebih rapi',
  'Insight portofolio yang lebih dalam',
  'Layanan tanpa gangguan saat limit free hampir habis'
]

type PaymentStatus = 'draft' | 'pending'

type PaymentDraft = {
  fullName: string
  email: string
  senderName: string
  transferDate: string
  notes: string
  fileName: string
  status: PaymentStatus
}

const DRAFT_KEY = 'ting-ai-pro-payment-draft'

const formatExpiry = (value?: string | null) => {
  if (!value) return 'Belum ada masa aktif'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Masa aktif belum tersedia'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(timestamp))
}

const readDraft = (): PaymentDraft | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PaymentDraft>
    return {
      fullName: parsed.fullName || '',
      email: parsed.email || '',
      senderName: parsed.senderName || '',
      transferDate: parsed.transferDate || '',
      notes: parsed.notes || '',
      fileName: parsed.fileName || '',
      status: parsed.status === 'pending' ? 'pending' : 'draft'
    }
  } catch {
    return null
  }
}

export default function Upgrade() {
  const { user } = useAuthSession()
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [fullName, setFullName] = useState(user?.fullname || '')
  const [email, setEmail] = useState(user?.email || '')
  const [senderName, setSenderName] = useState(user?.fullname || '')
  const [transferDate, setTransferDate] = useState('')
  const [notes, setNotes] = useState('')
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState<PaymentStatus>('draft')
  const [message, setMessage] = useState('')

  React.useEffect(() => {
    let active = true

    const sync = async () => {
      const draft = readDraft()
      if (draft) {
        setFullName(draft.fullName)
        setEmail(draft.email)
        setSenderName(draft.senderName)
        setTransferDate(draft.transferDate)
        setNotes(draft.notes)
        setFileName(draft.fileName)
        setStatus(draft.status)
      }

      try {
        const response = await fetchWithSession(`${API_URL}/api/pro-upgrade/status`)
        if (!response.ok) return
        const data = (await response.json()) as ProUpgradeStatusResponse
        const latest = data.request
        if (!latest || !active) return

        setFullName(latest.fullName || draft?.fullName || '')
        setEmail(latest.email || draft?.email || '')
        setSenderName(latest.senderName || draft?.senderName || '')
        setTransferDate(latest.transferDate || draft?.transferDate || '')
        setNotes(latest.notes || draft?.notes || '')
        setFileName(latest.proofFileName || draft?.fileName || '')
        setStatus(latest.status === 'pending' ? 'pending' : 'draft')
        setMessage(
          latest.status === 'pending'
            ? 'Pengajuan Pro Anda sudah diterima dan menunggu verifikasi.'
            : ''
        )
      } catch {
        // Keep local draft if backend sync fails.
      }
    }

    void sync()

    return () => {
      active = false
    }
  }, [])

  const planLabel = user?.plan === 'pro' ? 'Pro aktif' : 'Free'
  const planExpiryLabel = user?.planExpiresAt ? formatExpiry(user.planExpiresAt) : 'Belum aktif / belum tervalidasi'
  const statusLabel = useMemo(
    () => (status === 'pending' ? 'Menunggu verifikasi' : 'Draft pembayaran'),
    [status]
  )

  const saveDraft = (next: PaymentDraft) => {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('[UPGRADE_SUBMIT_ATTEMPT]', {
      fullName: fullName.trim(),
      email: email.trim(),
      senderName: senderName.trim(),
      transferDate: transferDate.trim(),
      fileName: fileName.trim(),
      notes: notes.trim()
    })

    if (!fullName.trim() || !email.trim() || !senderName.trim() || !transferDate.trim() || !fileName.trim()) {
      console.warn('[UPGRADE_SUBMIT_BLOCKED]', {
        fullName: Boolean(fullName.trim()),
        email: Boolean(email.trim()),
        senderName: Boolean(senderName.trim()),
        transferDate: Boolean(transferDate.trim()),
        fileName: Boolean(fileName.trim())
      })
      setMessage('Lengkapi data transfer dan bukti pembayaran terlebih dahulu.')
      setStatus('draft')
      return
    }

    const next: PaymentDraft = {
      fullName: fullName.trim(),
      email: email.trim(),
      senderName: senderName.trim(),
      transferDate: transferDate.trim(),
      notes: notes.trim(),
      fileName,
      status: 'pending'
    }

    saveDraft(next)

    try {
      console.log('[UPGRADE_SUBMIT_POSTING]', {
        url: `${API_URL}/api/pro-upgrade`,
        proofFileName: next.fileName
      })
      const formData = new FormData()
      formData.append('fullName', next.fullName)
      formData.append('email', next.email)
      formData.append('senderName', next.senderName)
      formData.append('transferDate', next.transferDate)
      formData.append('notes', next.notes)
      formData.append('proofFileName', next.fileName)
      if (proofFile) {
        formData.append('proofFile', proofFile)
      }

      const response = await fetchWithSession(`${API_URL}/api/pro-upgrade`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(await readResponseError(response, 'Gagal mengirim bukti transfer.'))
      }

      const result = (await response.json()) as ProUpgradeSubmitResponse
      console.log('[UPGRADE_SUBMIT_RESPONSE]', result)
      setStatus((result.status === 'pending' ? 'pending' : 'draft') as PaymentStatus)
      setMessage(result.message || 'Bukti transfer diterima. Ting AI sedang menunggu verifikasi manual.')
      return
    } catch (error) {
      console.error('[UPGRADE_SUBMIT_ERROR]', error)
      setStatus('draft')
      setMessage(error instanceof Error ? error.message : 'Gagal mengirim bukti transfer.')
      return
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setProofFile(null)
      setFileName('')
      return
    }

    setProofFile(file)
    setFileName(file.name)
  }

  return (
    <section className="container auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Ting AI</p>
        <h2>Naik ke Pro</h2>
        <p className="lead">
          Ting AI Pro dibuka untuk pengguna yang ingin briefing lebih dalam, history lebih rapi,
          dan pengalaman analisis yang lebih konsisten.
        </p>

        <div className="dashboard-summary-badge" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          Plan Saat Ini: {planLabel}
        </div>
        <p className="card-note" style={{ marginBottom: '1rem' }}>
          {user?.plan === 'pro'
            ? `Aktif sampai: ${planExpiryLabel}`
            : 'Setelah verifikasi, akses Pro aktif selama 30 hari dan kembali ke Free jika masa aktif habis.'}
        </p>

        <div className="profile-panel" style={{ marginBottom: '1rem' }}>
          <h3>Apa yang Anda dapatkan</h3>
          <ul className="hero-list" style={{ marginTop: '0.75rem' }}>
            {proBenefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="profile-panel" style={{ marginBottom: '1rem' }}>
          <h3>Harga</h3>
          <p className="card-note">Rp30.000 / bulan</p>
          <p className="card-note">Pembayaran manual via transfer bank untuk tahap awal.</p>
        </div>

        <div className="profile-panel" style={{ marginBottom: '1rem' }}>
          <h3>Transfer ke rekening</h3>
          <div className="profile-grid">
            {bankDetails.map((item) => (
              <div key={item.label} className="card-note">
                <strong>{item.label}:</strong> {item.value}
              </div>
            ))}
          </div>
          <p className="card-note" style={{ marginTop: '0.75rem' }}>
            Setelah transfer, kirim bukti pembayaran ke admin untuk verifikasi manual.
          </p>
        </div>

        <div className="profile-panel" style={{ marginBottom: '1rem' }}>
          <h3>Upload Bukti Transfer</h3>
          <p className="card-note">Isi data berikut lalu unggah screenshot bukti transfer Anda.</p>
          <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '0.9rem' }}>
            <label className="auth-label" htmlFor="upgrade-name">Nama Lengkap</label>
            <input
              id="upgrade-name"
              className="auth-input"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nama lengkap"
            />

            <label className="auth-label" htmlFor="upgrade-email">Email</label>
            <input
              id="upgrade-email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email akun Ting AI"
            />

            <label className="auth-label" htmlFor="upgrade-sender">Nama Pengirim</label>
            <input
              id="upgrade-sender"
              className="auth-input"
              type="text"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              placeholder="Nama rekening pengirim"
            />

            <label className="auth-label" htmlFor="upgrade-date">Tanggal Transfer</label>
            <input
              id="upgrade-date"
              className="auth-input"
              type="date"
              value={transferDate}
              onChange={(event) => setTransferDate(event.target.value)}
            />

            <label className="auth-label" htmlFor="upgrade-proof">Bukti Transfer</label>
            <input
              id="upgrade-proof"
              className="auth-input"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            {fileName ? <p className="portfolio-input-hint">File dipilih: {fileName}</p> : null}

            <label className="auth-label" htmlFor="upgrade-notes">Catatan Opsional</label>
            <textarea
              id="upgrade-notes"
              className="auth-input"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contoh: transfer dari rekening pribadi"
              rows={4}
            />

            <button className="btn" type="submit">
              Kirim Bukti
            </button>
          </form>
          {message ? <p className="auth-note warn" style={{ marginTop: '0.85rem' }}>{message}</p> : null}
          <p className="card-note" style={{ marginTop: '0.5rem' }}>
            Status saat ini: <strong>{statusLabel}</strong>
          </p>
        </div>

        <div className="profile-panel">
          <h3>Langkah berikutnya</h3>
          <p className="card-note">
            Setelah bukti dikirim, status akan berubah menjadi menunggu verifikasi. Untuk tahap
            berikutnya, kita sambungkan ke panel admin agar approval Pro bisa dilakukan manual.
          </p>
          <div className="profile-actions">
            <Link className="btn" to="/profile">
              Kembali ke Profil
            </Link>
            <Link className="btn secondary" to="/dashboard">
              Lihat Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
