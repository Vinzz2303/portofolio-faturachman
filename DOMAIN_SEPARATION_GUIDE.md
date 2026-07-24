# Panduan Pemisahan Domain: Web Portofolio & Ting AI

Kami telah berhasil mengimplementasikan sistem **Dynamic Domain Router (Multi-Tenant Frontend)** pada kode sumber Anda. Sekarang, satu hasil build aplikasi (`dist/`) dapat mendeteksi domain secara otomatis saat diakses oleh user:

- Jika diakses melalui **`faturachman.my.id`**, sistem akan menampilkan **Web Portofolio Pribadi Anda** (CV, Blog, Resume, Kontak, dll.).
- Jika diakses melalui **domain baru Anda** (misalnya `tings.ai` atau `tingai.id`), sistem akan menampilkan **Landing Page & Platform Ting AI** secara penuh tanpa ada elemen resume atau nama Anda di navigasi utama.

---

## 🛠️ Langkah-Langkah Konfigurasi VPS & DNS

Ikuti langkah-langkah berikut untuk mengaktifkan pemisahan domain ini di server Windows VPS Anda:

### Langkah 1: Atur DNS Record Domain Baru Anda
Masuk ke dasbor registrar tempat Anda membeli domain baru (misalnya Rumahweb, Niagahoster, Namecheap, dll.), kemudian tambahkan DNS record berikut:

| Type | Host/Name | Value (IP VPS Anda) | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (Root) | `103.xxx.xxx.xxx` (Masukkan IP VPS Anda) | Default / Automatic |
| **CNAME** | `www` | `domainbaruanda.com` | Default / Automatic |

---

### Langkah 2: Tambahkan IIS Bindings di Windows VPS
Anda tidak perlu membuat folder baru atau menyalin file build baru. IIS dapat menyajikan folder fisik yang sama untuk kedua domain tersebut.

1. Hubungi VPS Anda melalui **Remote Desktop Connection (RDP)**.
2. Buka **Internet Information Services (IIS) Manager**.
3. Di panel sebelah kiri, temukan situs web portofolio Anda saat ini (misalnya `faturachman.my.id`).
4. Klik kanan pada nama situs tersebut, lalu pilih **Bindings...**
5. Klik **Add** untuk menambahkan binding baru:
   - **Type**: `http`
   - **IP address**: `All Unassigned`
   - **Port**: `80`
   - **Host name**: `domainbaruanda.com` (Ganti dengan domain baru Anda, misal: `tings.ai`)
6. Klik **Add** sekali lagi untuk menambahkan versi `www`:
   - **Type**: `http`
   - **IP address**: `All Unassigned`
   - **Port**: `80`
   - **Host name**: `www.domainbaruanda.com`
7. Klik **Close**.

---

### Langkah 3: Konfigurasi SSL (HTTPS) Gratis menggunakan Certify The Web
Untuk memastikan domain baru Anda memiliki sertifikat SSL yang valid:

1. Di VPS Anda, buka aplikasi **Certify the Web** (Let's Encrypt GUI client).
2. Pilih managed certificate untuk situs web Anda.
3. Tambahkan domain baru Anda (`domainbaruanda.com` dan `www.domainbaruanda.com`) ke dalam daftar domain sertifikat tersebut.
4. Klik **Request Certificate** untuk memperbarui sertifikat SSL. Aplikasi ini akan otomatis membuat binding port `443` (HTTPS) baru di IIS untuk domain Anda.

---

## 💻 Bagaimana Sistem Bekerja di Codebase

### 1. Dynamic Routing (`src/App.tsx` & `src/utils/domain.ts`)
Kami mendeteksi hostname yang aktif di browser. Jika hostname-nya adalah `faturachman.my.id`, maka route portofolio seperti `/blog` dan `/` (resume) diizinkan. 
Jika diakses dari domain lain:
- Route `/` otomatis me-render landing page **Ting AI** (`TingAi.tsx`).
- Route portofolio seperti `/blog` akan otomatis di-redirect secara 301 ke `https://faturachman.my.id/blog` agar SEO Anda tetap terjaga dan tidak merusak navigasi user.

### 2. Navigasi & Footer Dinamis (`Navbar.tsx` & `Footer.tsx`)
- **Pada Domain Portofolio**: Navbar menunjukkan nama **Faturachman Alkahfi**, link ke Projects, Resume, dan tombol "Open Ting AI".
- **Pada Domain Baru (Ting AI)**: Navbar menunjukkan logo **Ting AI** dengan menu langsung (Komando Pagi, Portfolio Workspace, Explore, Personal Space) bagi user yang sudah login, serta menyembunyikan tombol "Open Ting AI" karena user sudah berada di dalam aplikasi.

### 3. URL Email Dinamis (`server/src/index.ts`)
Sebelumnya, tautan verifikasi email dan reset password di-hardcode ke `process.env.APP_URL` (`https://faturachman.my.id`). 
Sekarang, backend kami telah diperbarui untuk **mendeteksi asal permintaan (request origin)**:
- Jika user melakukan registrasi atau reset password dari `tings.ai`, email verifikasi yang dikirim akan otomatis mengarahkan user ke `https://tings.ai/verify-email?token=...`.
- Hal ini menjamin pengalaman pengguna (UX) yang sangat mulus tanpa ada bentrokan branding.

---

## 🧪 Cara Menguji Secara Lokal (Development)

Untuk memudahkan pengembangan dan pengujian lokal di komputer Anda:

1. **Uji Tampilan Ting AI (Default Lokal)**
   Akses `http://localhost:5173/` secara langsung. Ini akan memuat tampilan platform Ting AI.
2. **Uji Tampilan Portofolio Pribadi**
   Akses `http://localhost:5173/?personal=true`. Parameter query ini akan memaksa sistem mengaktifkan mode Portofolio Pribadi sehingga Anda dapat menguji perubahan visual portofolio Anda secara lokal.

---

> [!TIP]
> **Mengapa cara ini sangat optimal?**
> Dengan arsitektur ini, Anda tidak perlu mengelola dua repositori terpisah atau melakukan deploy dua kali. Cukup lakukan satu kali push (`git push` / deploy) ke VPS, dan kedua website akan langsung terupdate dengan performa maksimal dan efisiensi memori VPS yang sangat hemat.
