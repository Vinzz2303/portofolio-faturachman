import type { LanguageCode } from './language'

export interface UpgradeI18n {
  title: string
  subtitle: string
  features: [string, string, string, string]
  pricing: {
    pro: {
      price: string
      features: [string, string, string, string]
    }
    free: {
      price: string
      features: [string, string]
    }
  }
  payment: {
    step1: string
    step2: string
    step3: string
    copyRekening: string
    nominal: string
    upload: string
    uploadDesc: string
    uploadDrop: string
    uploadOr: string
    uploadButton: string
    uploadFormat: string
    fullName: string
    email: string
    notes: string
    notesPlaceholder: string
    submitPending: string
    submitReady: string
    verificationTitle: string
    verificationDesc: string
    secureTitle: string
    secureDesc: string
    supportTitle: string
    supportDesc: string
    instructionStep1: string
    copied: string
    btnIdle: string
    btnPendingUpload: string
    btnUnderReview: string
    btnActive: string
    checkStatus: string
    back: string
    page1Title: string
    page1Subtitle: string
    paymentDetailTitle: string
    accNumber: string
    accName: string
    transferNominal: string
    recommended: string
  }
}

const id: UpgradeI18n = {
  title: "Upgrade ke Ting AI Pro",
  subtitle: "Buka insight lebih dalam untuk memahami risiko dan kondisi portofoliomu.",
  features: [
    "Insight lebih dalam & personal",
    "Analisis risiko & skenario",
    "Riwayat analisis tersimpan",
    "Pengalaman tanpa gangguan"
  ],
  pricing: {
    pro: {
      price: "Rp30.000",
      features: [
        "Insight mendalam",
        "Analisis risiko",
        "Riwayat analisis penuh",
        "Akses prioritas"
      ]
    },
    free: {
      price: "Rp0",
      features: [
        "Insight dasar",
        "Akses terbatas"
      ]
    }
  },
  payment: {
    step1: "Transfer",
    step2: "Upload Bukti",
    step3: "Verifikasi",
    copyRekening: "Salin nomor rekening",
    nominal: "Nominal transfer",
    upload: "Upload Bukti Pembayaran",
    uploadDesc: "Klik untuk mengganti file",
    uploadDrop: "Drag & drop file di sini",
    uploadOr: "atau",
    uploadButton: "Pilih File",
    uploadFormat: "Format: JPG, PNG, PDF",
    fullName: "Nama Lengkap",
    email: "Email",
    notes: "Catatan (Opsional)",
    notesPlaceholder: "Contoh: Sudah transfer dari m-banking BCA",
    submitPending: "Bukti Sedang Diverifikasi",
    submitReady: "Kirim Bukti Pembayaran",
    verificationTitle: "Verifikasi 1x24 Jam",
    verificationDesc: "Kami akan memverifikasi pembayaran Anda dalam maksimal 1x24 jam kerja.",
    secureTitle: "Data Aman",
    secureDesc: "Data dan privasi portofolio Anda dilindungi enkripsi standar bank.",
    supportTitle: "Dukungan Tersedia",
    supportDesc: "Tim Ting AI siap membantu jika ada kendala saat proses aktivasi.",
    instructionStep1: "Transfer sesuai nominal, lalu lanjutkan upload bukti pembayaran.",
    copied: "Disalin ✓",
    btnIdle: "Upgrade sekarang",
    btnPendingUpload: "Upload bukti",
    btnUnderReview: "Menunggu verifikasi",
    btnActive: "Paket aktif",
    checkStatus: "Cek Status Aktivasi",
    back: "Kembali",
    page1Title: "Aktivasi Ting AI Pro",
    page1Subtitle: "Selesaikan pembayaran untuk membuka insight lebih dalam dan pengalaman analisis lengkap.",
    paymentDetailTitle: "Detail Pembayaran",
    accNumber: "Nomor Rekening",
    accName: "Nama Rekening",
    transferNominal: "Nominal Transfer",
    recommended: "Direkomendasikan",
  }
}

// Ensure full Indonesian experience, map English to ID to avoid leaks.
// User requested "Language fully Indonesian (no mix)" for Phase 5.
const en: UpgradeI18n = id;

const dict: Record<LanguageCode, UpgradeI18n> = { id, en }

export const getUpgradeI18n = (lang: LanguageCode): UpgradeI18n => dict[lang] ?? dict.id
