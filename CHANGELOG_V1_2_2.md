# v1.2.2 Changelog

Status: `stabilization patch`

## Objective

Menutup gap kecil setelah `v1.2.1` supaya perilaku auth, AI chat, testing, dan deploy lebih konsisten.

## Primary Changes

- Menambahkan helper `src/utils/authFetch.ts` untuk request protected.
- Menyamakan penanganan `401` di:
  - `Dashboard`
  - `LifeOS / Personal Space`
  - `Portfolio`
  - `MarketDashboard`
  - `AiChat`
- Menambahkan smoke test `tests/ai-chat.spec.ts`.
- Merapikan dokumentasi deploy VPS agar tidak membingungkan antara source project, `dist`, dan IIS root.

## Why This Matters

- Session invalid sekarang dibersihkan lebih konsisten saat request protected gagal.
- Risiko regresi di AI chat berkurang karena sudah ada smoke test dasar.
- Proses deploy ke VPS lebih jelas dan lebih mudah diulang tanpa trial-and-error.

## Risk

- Karena helper auth dipakai di beberapa route penting, area yang perlu dicek setelah deploy adalah:
  - login
  - dashboard
  - portfolio
  - personal space
  - AI chat

## Verification

Checklist minimum setelah deploy:

1. Login dengan akun test
2. Buka `/dashboard`
3. Buka `/portfolio`
4. Buka `/personal-space`
5. Kirim 1 prompt di AI chat
6. Logout lalu coba buka route protected lagi

## Deploy Notes

- Jika hanya frontend yang berubah:
  - `npm run build`
  - copy isi `dist` ke `C:\inetpub\wwwroot`
  - `iisreset`
- Jika backend ikut berubah:
  - build/restart backend PM2
  - `pm2 save`

