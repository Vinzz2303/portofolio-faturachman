# Portofolio Faturachman Alkahfi — Next-Gen 3D & AI Builder Showcase

Rencana arsitektur dan peningkatan komprehensif untuk mengangkat website portofolio Faturachman Alkahfi ke tingkat kelas dunia (berstandar Awwwards & terinspirasi dari `david-estrada.dev`), mengombinasikan interaktivitas 3D WebGL taktil, modal studi kasus arsitektur mendalam, dan *signature feature* AI Playground yang membuktikan kapabilitas sebagai Full-stack Engineer & AI Builder.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan sesi klarifikasi tahap 1, berikut keputusan yang telah disepakati untuk menghadirkan *"Wah Moment"* maksimal:

- **Confirmed Decision 1 (Prioritas Utama)**: Interaktivitas 3D fisika langsung (*Raycaster + Spring Physics Drag & Momentum*) pada objek squircle Three.js sehingga pengunjung dapat mengeklik, menarik (*drag*), melempar (*flick*), dan melihat objek memantul kembali ke jangkar DOM dengan inersia alami.
- **Confirmed Decision 2 (Case Study Presentation)**: Menggunakan **Interactive Slide-over Drawer / Deep Modal** di dalam website tanpa mengalihkan pengunjung ke tab baru. Modal ini menyajikan *engineering breakdown*, problem & solution, arsitektur sistem, metrik dampak, dan live preview.
- **Confirmed Decision 3 (AI Builder Signature Experience)**: Mengimplementasikan **Interactive AI Terminal & System Playground** terintegrasi, di mana pengunjung dapat mengetik perintah CLI (`help`, `whoami`, `projects`, `ask-ai`, `sysinfo`, `benchmark`) untuk mendemonstrasikan keahlian AI & Full-stack secara nyata.
- **Confirmed Decision 4 (Polish & Atmosfer)**: Menambahkan **Live Jakarta Availability Pill** (status aktif & jam lokal real-time GMT+7) serta **Synthesized Web Audio Taktil** (efek suara mekanik haptic opsional dengan sakelar mute/unmute).

---

## 1. Overview & Core Concept

- **What It Does**: Website portofolio interaktif tingkat tinggi yang memadukan estetika editorial modern (palet warna hitam *ink*, abu-abu *paper*, aksen *signal orange*) dengan pengalaman WebGL 3D interaktif, transisi panggung scroll yang dipin (*pinned theatre*), eksplorasi studi kasus rekayasa sistem yang mendalam, dan *live interactive developer CLI*.
- **Target Audience / Persona**: Klien korporat internasional, *founders* startup teknologi berbasis AI, *lead engineering recruiters*, dan desainer produk yang mencari Full-stack Engineer & AI Builder dengan standar estetika dan rekayasa setara agensi papan atas global.
- **Key Value**: Mengubah portofolio yang sebelumnya pasif menjadi instrumen konversi interaktif yang membuktikan kompetensi teknis (WebGL, React/TypeScript, AI engineering, system architecture) secara langsung dalam hitungan detik pertama.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Hero Entry & Immediate Tactile Play**:
   - Pengunjung disambut tipografi tegas *"Full-stack Engineer & AI Builder"*, jam lokal Jakarta real-time, dan status ketersediaan.
   - Objek 3D squircle (Gold Emblem, React, TypeScript, Next.js) melayang halus. Pengunjung dapat langsung mengarahkan kursor atau menyentuh di layar sentuh untuk menarik (*drag*) dan melemparnya; objek akan merespons elastisitas fisik (*spring-mass damping*).
2. **Pinned Work Theatre & Case Study Exploration**:
   - Scroll mengunci layar pada panggung *"Selected [ 3D ] work"*. Kartu meluncur bergantian (kanan-kiri) dengan HUD indeks proyek dinamis.
   - Mengklik kartu proyek atau tombol *"Explore Architecture"* tidak langsung membawa pengunjung pergi, melainkan membuka **Deep Engineering Drawer** dari sisi kanan layar dengan animasi *backdrop blur*.
   - Di dalam drawer: arsitektur sistem, keputusan teknologi, metrik performa (misal: *latency under 200ms, 10k+ monthly active users*), galeri antarmuka, dan tombol *"Open Live Production App ↗"*.
3. **Interactive AI Terminal & Capabilities Playground**:
   - Di bagian khusus setelah Selected Work, terdapat konsol developer berbasis web bergaya *modern dark glass*.
   - Pengunjung dapat mengetik perintah CLI atau memilih *quick actions* untuk mengeksekusi demo kapabilitas AI (misal: simulasi query RAG, analisis kesehatan portofolio saham, atau penjelasan arsitektur).
4. **Services, Skills & About Narrative**:
   - Grid layanan modular dengan tipografi unboxed (tanpa kapsul pil statis berlebih), menampilkan keahlian dalam Full-stack Web, AI Agent & RAG Pipelines, Cloud Architecture, dan Modern UI/UX.
5. **High-Conversion Contact & WhatsApp Handoff**:
   - Footer dengan warna aksen *signal orange* yang mencolok, kontak email *click-to-copy* instan dengan animasi toast "Copied to clipboard", dan tombol direct WhatsApp dengan pesan pembuka otomatis.

### Visual Identity & Theme Tokens

- **Aesthetic Direction**: *Tactile Engineering Brutalism & Avant-Garde Editorial* — terinspirasi dari karya David Estrada dan Linear.app.
- **Color Palette**:
  - Background Utama: `bg-[#0a0a0a]` (Ink Dark) & `bg-[#f4f3ef]` (Warm Paper) untuk kontras panggung ganda.
  - Aksen Utama: `#c84b15` (Signal Orange) & `#df561b` (Signal Orange Hover) untuk fokus interaksi primer.
  - Border & Framing: `border-white/[0.08]` (Dark Mode) dan `border-black/[0.08]` (Paper Mode).
  - Teks: `text-white` (primer), `text-neutral-400` (sekunder), `text-neutral-500` (metadata tenang).
- **Typography**:
  - Headings: `Inter` / `Plus Jakarta Sans` dengan tracking rapat (`tracking-[-0.045em]`) dan leading ketat (`leading-[0.92]`).
  - Monospace & Metadata: `JetBrains Mono` untuk HUD, koordinat, metrik, timestamp, dan CLI prompt.
- **Anti-Slop Discipline**:
  - *Zero Static Pills*: Metadata kategori dan tech stack disajikan menggunakan pemisah tipografi bersih (`·`, `/`) tanpa pembungkus kapsul statis berwarna-warni.
  - *No Purple/Generic AI Gradients*: Menggunakan pencahayaan studio 3D realistis dan warna material solid berkarakter.

### Interactive Feedback, Audio & Motion

- **3D Physics Engine**: Three.js Raycaster mendeteksi *pointerdown*, *pointermove*, dan *pointerup*. Simulasi fisika pegas menggunakan formula Euler teredam ($a = -k \cdot x - c \cdot v$).
- **Synthesized Haptic Audio (Web Audio API)**:
  - Efek klik mikro sintesis (gelombang sinus/segitiga pendek 15ms) saat hover tombol atau beralih kartu.
  - Efek resonansi *whoosh* rendah saat membuka drawer studi kasus.
  - Toggle audio di navbar (ikon speaker dengan status ON/OFF, default: muted untuk menghormati preferensi pengguna).
- **Magnetic Micro-interaction**: Kursor kustom dan tombol CTA memiliki tarikan magnetis lembut saat kursor berada dalam radius 40px.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Three.js Interactive Raycasting & Verlet/Spring Physics
- **Chosen Approach**: Mengembangkan modul interaksi pointer berbasis Raycaster yang mengikat mesh 3D dengan partikel pegas virtual. Saat disentuh atau di-drag, posisi mesh ditarik ke kursor; saat dilepas, inersia kecepatan dihitung dan ditarik kembali ke koordinat anchor DOM.
- **Why**: Memberikan kepuasan taktil instan (*tactile joy*) tanpa memerlukan pustaka fisika eksternal yang berat seperti Cannon.js atau Rapier.
- **Alternatives Considered**: Menggunakan Cannon-es (ditolak karena ukuran bundle ekstra 150KB dan kompleksitas berlebih untuk floating squircle).

### Decision 2: In-Page Deep Case Study Drawer
- **Chosen Approach**: Membangun komponen Slide-over Drawer dengan *focus trapping*, *backdrop blur*, navigasi keyboard `ESC`, dan animasi *smooth slide-in*.
- **Why**: Mencegah pengunjung terpental (*bounce off*) saat pertama kali membuka portofolio; menjaga konteks presentasi rekayasa sistem secara utuh.
- **Alternatives Considered**: Membuat halaman rute `/project/ting-ai` terpisah (ditolak karena memutus kesinambungan alur panggung scroll 3D yang sudah dinikmati pengunjung).

### Decision 3: Lightweight Client-Side AI Developer CLI
- **Chosen Approach**: Konsol terminal interaktif berbasis React dengan autocomplete perintah, histori perintah (`Up`/`Down`), dan respons cerdas simulasi AI yang membedah keahlian teknis Faturachman.
- **Why**: Menghadirkan diferensiasi tajam terhadap portofolio desainer murni dan memberikan pengalaman *gamified* bagi recruiter dan tech leads.

### Decision 4: Web Audio API Sintetis (Zero-Asset Audio)
- **Chosen Approach**: Menghasilkan efek audio mikro murni melalui `AudioContext.createOscillator()` dan `GainNode`.
- **Why**: Bebas dari risiko file audio eksternal gagal dimuat (zero HTTP request, zero 404), latency nol mikrodetik, dan ukuran kode di bawah 2KB.

---

## 4. Technical Architecture & Component Hierarchy

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             APP CONTAINER                                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ NAVBAR (Adaptive Color · Time & Live Status · Audio Toggle · WA CTA)  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ FULLSCREEN WEBGL CANVAS (Three.js Engine)                             │  │
│  │  - PBR Studio Lighting & Raycaster Pointer Layer                      │  │
│  │  - 3D Squircle Meshes (Gold Emblem, React, TS, Next.js)               │  │
│  │  - Spring Physics Solver (Drag, Flick, Inertia & Anchor Snap)        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ SCROLL STAGES (Lenis Smooth Scroll + ScrollTrigger Sync)              │  │
│  │                                                                       │  │
│  │  1. HERO SECTION                                                      │  │
│  │     - Giant Typography ("Full-stack Engineer & AI Builder")           │  │
│  │     - DOM Anchor Positions for 3D Mesh Tracking                       │  │
│  │     - Background Giant Name Cutout ("Faturachman")                    │  │
│  │                                                                       │  │
│  │  2. SELECTED WORK (Pinned Scroll Theatre)                             │  │
│  │     - Center Fixed Title: "Selected [ 3D Slot ] work"                 │  │
│  │     - Floating Interactive Project Cards (Left/Right alternating)     │  │
│  │     - Dynamic HUD Controller (Active Project, Index, Quick Open)      │  │
│  │                                                                       │  │
│  │  3. AI BUILDER INTERACTIVE CLI & PLAYGROUND                           │  │
│  │     - Terminal Window (System Info, Command History, AI Prompt)       │  │
│  │     - Quick Action Command Chips ('whoami', 'skills', 'architecture') │  │
│  │                                                                       │  │
│  │  4. SERVICES & SYSTEM ARCHITECTURE CAPABILITIES                       │  │
│  │     - Bento Grid: Fullstack Apps, AI & RAG, Scalable Systems          │  │
│  │                                                                       │  │
│  │  5. ABOUT & TIMELINE EXPERIENCE                                       │  │
│  │     - Bio, Verified Metrics (10k+ MAU, 99.9% SLA), Education          │  │
│  │                                                                       │  │
│  │  6. CONTACT & FOOTER                                                  │  │
│  │     - Signal Orange Canvas, Click-to-Copy Email, Direct WhatsApp     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ OVERLAY SYSTEMS                                                       │  │
│  │  - Custom Magnetic Cursor Pill ("Visit project ↗" / "Drag 3D")       │  │
│  │  - Deep Case Study Drawer (System Architecture, Tech Decisions, Demo) │  │
│  │  - Web Audio Sound Manager (Tactile Clicks & Ambient Feedback)        │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Planned Verification & Execution Steps

Setelah rencana ini disetujui:
1. **Penyusunan Modul & Komponen**:
   - Memperbarui `index.html` dan `metadata.json` dengan identitas nama portofolio, meta deskripsi, dan OpenGraph tag.
   - Mengintegrasikan kode portofolio yang ada di `user_source` ke dalam struktur React + Vite modern di `src/App.tsx` dan modul komponen pendukung.
2. **Implementasi Three.js Drag & Spring Engine**:
   - Menambahkan raycasting interaktif pada kanvas Three.js.
   - Mengimplementasikan kalkulasi pegas dan momentum sehingga objek 3D dapat di-drag dan dilempar bebas dengan kursor/sentuhan sebelum kembali ke posisinya.
3. **Pembangunan Case Study Drawer**:
   - Menyiapkan data proyek terstruktur (Ting AI, Universitas Primagraha, Enterprise AI RAG Pipeline, dll.) mencakup *Overview, Problem, Solution, Architecture, Tech Stack*, dan *Live URL*.
   - Membuat drawer overlay interaktif yang halus dan responsif di mobile maupun desktop.
4. **Pembangunan Interactive AI Terminal**:
   - Membuat komponen terminal CLI dengan dukungan perintah lengkap, auto-scroll, dan respon interaktif.
5. **Live Time & Availability Widget & Sound Engine**:
   - Menghubungkan jam live Jakarta (`Asia/Jakarta`) dan status ketersediaan di navbar.
   - Menambahkan Web Audio synthesizer untuk efek haptic audio yang dapat dimatikan/dihidupkan.
6. **Verifikasi Kompilasi & Pengujian**:
   - Menjalankan `compile_applet` untuk memastikan seluruh kode TypeScript dan Tailwind v4 terkompilasi bersih tanpa peringatan atau kesalahan runtime.
