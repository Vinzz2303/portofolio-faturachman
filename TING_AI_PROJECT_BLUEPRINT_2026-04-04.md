# TING AI

**Project Blueprint**  
Version: Initial Presentation Draft  
Date: 2026-04-04

## 1. Project Overview

**Project Name:**  
Ting AI

**Brand Positioning:**  
Macro, Market, and Wealth Intelligence

**Core Product Experience:**  
Morning Command Center

**Main Objective:**  
Membangun produk digital yang membantu pengguna memahami konteks makro, market, dan wealth dengan lebih cepat, lebih jelas, dan lebih terarah.

**Current Strategic Direction:**
- Ting AI adalah brand utama
- Morning Command Center adalah surface utama produk
- LifeOS tidak lagi menjadi surface utama
- LifeOS tetap dipertahankan sebagai route sekunder bernama Personal Space
- Portfolio pribadi tetap dipertahankan untuk identitas profesional dan kebutuhan job application

**Key Principle:**  
Jangan mencampur personal portfolio, product landing, dan app internal dalam satu pesan yang sama.

## 2. Core Strategy

**Strategic Decision:**  
Produk tidak dibangun ulang dari nol. Repo yang ada tetap digunakan. Fokus diarahkan pada restrukturisasi surface, positioning, dan information hierarchy.

**Why This Strategy:**
- Infrastruktur dan deploy sudah berjalan
- App sudah memiliki fondasi yang cukup
- Identitas personal tetap penting untuk LinkedIn, recruiter, dan client
- Ting AI membutuhkan ruang positioning sendiri agar tidak bercampur dengan portfolio pribadi

**Main Strategy:**
- Pertahankan personal portfolio
- Tambahkan landing page produk yang jelas
- Pertahankan app internal sebagai area utility utama

## 3. Proposed Product Structure

**Route Structure:**

1. `/`  
   Personal portfolio Faturachman Al kahfi
2. `/ting-ai`  
   Landing page produk Ting AI
3. `/dashboard`  
   Morning Command Center
4. `/portfolio`  
   Portfolio workspace di dalam app
5. `/personal-space`  
   Surface sekunder/internal
6. `/profile`  
   Account center
7. `/lifeos`  
   Redirect ke `/personal-space`

## 4. Purpose Of Each Surface

### A. Homepage Personal (`/`)

**Purpose:**  
Menjadi wajah profesional utama untuk recruiter, LinkedIn, client, dan personal branding.

**This Page Must Answer:**
- Siapa Anda
- Apa kemampuan Anda
- Project terbaik apa yang pernah Anda bangun
- Bagaimana orang bisa menghubungi Anda

**Main Tone:**  
Professional, personal, credible

### B. Product Landing (`/ting-ai`)

**Purpose:**  
Menjelaskan Ting AI sebagai produk.

**This Page Must Answer:**
- Apa itu Ting AI
- Untuk siapa produk ini dibuat
- Apa value proposition utamanya
- Kenapa user perlu peduli
- Bagaimana cara masuk ke produk

**Main Tone:**  
Strategic, market-focused, product-driven

### C. Dashboard (`/dashboard`)

**Purpose:**  
Menjadi pusat experience harian untuk membaca konteks pasar dan wealth intelligence.

**This Page Must Answer:**
- Apa yang penting pagi ini
- Apa yang berubah
- Apa yang perlu diperhatikan user

**Main Tone:**  
Utility-first, concise, actionable

### D. Portfolio (`/portfolio`)

**Purpose:**  
Menjadi workspace untuk memantau holdings, allocation, exposure, dan performa aset.

**Main Tone:**  
Operational, clear, practical

### E. Personal Space (`/personal-space`)

**Purpose:**  
Menjadi route sekunder untuk workflow personal/internal.

**Strategic Role:**
- Tetap ada
- Tidak dihapus
- Tidak dijadikan wajah utama produk

## 5. Navigation Blueprint

**Public Navigation:**
- About
- Projects
- Contact
- Ting AI

**Product Navigation:**
- Morning Command Center
- Portfolio
- Personal Space

**Account Navigation:**
- Profile
- Switch Account
- Logout

**Navigation Principle:**  
Ting AI pada navbar publik harus mengarah ke halaman produk, bukan dicampur dengan copy portfolio pribadi.

## 6. Homepage Personal Blueprint

**Page:**  
`/`

**Goal:**  
Menjaga identitas personal Anda tetap kuat untuk kebutuhan professional visibility.

**Recommended Sections:**

1. **Hero**  
   Nama lengkap, professional role, dan short headline tentang kemampuan membangun modern frontend experiences dan product interfaces.
2. **About**  
   Cara Anda bekerja, dengan fokus pada frontend, UI clarity, product thinking, dan execution.
3. **Featured Project**  
   Ting AI harus menjadi project utama paling menonjol dan memiliki CTA menuju halaman produk.
4. **Selected Projects**  
   Project lain tetap ditampilkan sebagai bukti variasi skill dan pengalaman.
5. **Contact**  
   Informasi kontak dan CTA untuk recruiter, client, atau collaboration.

**Homepage Message:**  
Saya adalah product-minded frontend builder, dan Ting AI adalah flagship project saya.

## 7. Ting AI Product Landing Blueprint

**Page:**  
`/ting-ai`

**Goal:**  
Menjelaskan positioning Ting AI dengan jelas dan meyakinkan.

**Recommended Sections:**

1. **Hero**  
   Headline: `Macro, Market, and Wealth Intelligence`  
   Subheadline: Ting AI membantu pengguna membaca konteks pasar lebih cepat, lebih jelas, dan lebih terarah melalui Morning Command Center.  
   CTA: `Explore Product`, `Login`, `Create Account`
2. **Problem**  
   Informasi market terlalu tersebar, noise terlalu tinggi, dan banyak user memiliki data tetapi tidak memiliki clarity.
3. **Core Experience**  
   `Morning Command Center`, `Portfolio`, dan `Personal Space`  
   Key message: Morning Command Center adalah entry utama produk.
4. **How It Works**  
   Data and signals, AI interpretation, dan daily decision support.
5. **Final CTA**  
   Masuk ke produk, buat akun, atau coba command center.

**Landing Page Message:**  
Ting AI bukan chatbot generik. Ting AI adalah operating layer untuk macro, market, dan wealth context.

## 8. Morning Command Center Blueprint

**Page:**  
`/dashboard`

**Goal:**  
Memberikan pengalaman baca pagi yang cepat, jelas, dan berguna.

**Recommended Information Hierarchy:**

1. **Dashboard Header**  
   `Morning Command Center` dengan subheadline singkat.
2. **Macro Brief**  
   Ringkasan naratif utama dengan badge status: Live, Loading, Attention.
3. **AI Briefing**  
   Panel AI untuk pertanyaan lanjutan dengan fokus pada market interpretation.
4. **Market Snapshot**  
   Gold, main indexes, dollar, rates, oil, dan crypto. Jangan tampilkan kartu kosong jika data belum siap.
5. **Portfolio Lens**  
   Ringkasan exposure, top movement, dan shortcut ke halaman Portfolio.
6. **Future Module**  
   `Scenario Tracker`, ditambahkan setelah fondasi utama stabil.

**Dashboard Principle:**
- Cepat dibaca
- Satu glance dulu, detail belakangan
- Harus terasa seperti product utility, bukan demo page

## 9. Portfolio Page Blueprint

**Page:**  
`/portfolio`

**Goal:**  
Menjadi workspace monitoring yang praktis dan tidak berlebihan.

**Main Areas:**
- Summary totals
- Holdings list
- Latest price and freshness
- Add holding flow
- Refresh prices

**Portfolio Principle:**  
Halaman ini harus fokus pada utility, bukan marketing.

## 10. Personal Space Blueprint

**Page:**  
`/personal-space`

**Goal:**  
Menjaga area personal/internal tetap tersedia tanpa mengganggu positioning utama Ting AI.

**Strategic Notes:**
- Tetap aktif
- Tetap dapat diakses
- Tidak dijadikan headline utama brand
- Lebih tepat diposisikan sebagai secondary workspace

## 11. Brand Voice Architecture

### A. Personal Voice

**Used For:**  
Homepage personal (`/`)

**Characteristics:**
- Personal
- Professional
- Credible

### B. Product Voice

**Used For:**  
`/ting-ai`

**Characteristics:**
- Strategic
- Clear
- Market-focused

### C. Utility Voice

**Used For:**  
Dashboard, Portfolio, Profile, Personal Space

**Characteristics:**
- Short
- Direct
- Functional

**Important Rule:**  
Jangan campur ketiga tone ini dalam satu surface.

## 12. Implementation Priority

1. Lock sitemap and navigation structure
2. Write final copy for Ting AI landing page
3. Refine Morning Command Center hierarchy
4. Reframe homepage personal so Ting AI becomes the flagship project
5. Audit all AI/chat prompts and public copy so they match the new brand direction

## 13. Success Criteria

Blueprint ini dianggap berhasil jika:

1. Recruiter yang membuka homepage langsung memahami siapa Faturachman Al kahfi.
2. User yang membuka `/ting-ai` langsung memahami apa itu Ting AI dan kenapa produk ini penting.
3. User yang login dan membuka `/dashboard` langsung mendapatkan utility yang jelas.
4. Personal Space tetap tersedia tanpa melemahkan positioning utama brand.

## 14. Final Recommendation

**Recommended Direction:**
- Keep the current repo
- Do not rebuild from zero
- Do not remove the personal portfolio
- Add a clear Ting AI product landing page
- Make Morning Command Center the main product experience
- Keep Personal Space as a secondary internal route

**Short Conclusion:**  
Portfolio pribadi tetap hidup. Ting AI mendapat ruang produk yang jelas. App internal tetap menjadi pusat utility. Semua berjalan dalam satu repo yang sama dengan struktur yang lebih matang.
