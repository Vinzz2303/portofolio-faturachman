import type { ProjectCaseStudy } from './projects';

/**
 * Sistem internal Universitas Primagraha yang dibangun & dioperasikan sendiri.
 * Angka (metrics) hanya memakai data yang terlihat langsung di halaman live masing-masing sistem.
 */
export const CAMPUS_PROJECTS: ProjectCaseStudy[] = [
  {
    id: 'opac-upg',
    index: '',
    role: 'FULL-STACK DEVELOPER · SYSTEM OWNER',
    year: '2025 — 2026',
    title: 'OPAC Perpustakaan',
    subtitle: 'Online Public Access Catalog — Katalog Koleksi Library Universitas Primagraha',
    shortDesc:
      'Katalog digital perpustakaan kampus dengan pencarian koleksi, buku tamu, berita, dan area anggota. 3.070 judul koleksi.',
    tech: 'PHP / SLiMS / MySQL / Windows IIS',
    techList: ['SLiMS', 'PHP', 'MySQL', 'Windows IIS', 'PM2 Process Supervision', 'Custom Theme'],
    image: '/works/opac.png',
    liveUrl: 'https://opac.upg.ac.id',
    isExternal: true,
    statusLabel: 'Production ↗',
    metrics: [
      { label: 'Judul Koleksi', value: '3.070', context: 'Terindeks & dapat dicari publik lewat katalog OPAC' },
      { label: 'Eksemplar Buku', value: '5.751', context: 'Eksemplar fisik terhubung ke data sirkulasi' },
      { label: 'Kunjungan Digital', value: '51.209', context: 'Counter kunjungan yang tampil di beranda' },
    ],
    problem:
      'Pencarian koleksi perpustakaan kampus masih bergantung pada tampilan bawaan yang kaku dan tidak ramah mobile, sehingga mahasiswa sulit menemukan literatur secara mandiri.',
    solution:
      'Membangun ulang antarmuka OPAC di atas SLiMS dengan tema kustom: pencarian kata kunci yang menonjol di hero, statistik koleksi real-time, buku tamu, berita, serta pintu masuk staf dan anggota.',
    architectureNodes: [
      {
        layer: '01 · Public Catalog UI',
        name: 'Custom SLiMS Theme',
        spec: 'Hero Search · Live Collection Counters',
        detail: 'Antarmuka katalog responsif dengan pencarian koleksi sebagai aksi utama halaman.',
      },
      {
        layer: '02 · Application Core',
        name: 'SLiMS (PHP)',
        spec: 'Bibliographic · Circulation · Membership',
        detail: 'Mesin katalog dan sirkulasi yang menjadi sumber data koleksi dan anggota.',
      },
      {
        layer: '03 · Hosting',
        name: 'Windows IIS + PM2',
        spec: 'Reverse proxy · Process supervision',
        detail: 'Dilayani lewat IIS pada domain opac.upg.ac.id dengan proses yang diawasi PM2.',
      },
    ],
    engineeringDecisions: [
      {
        title: 'Memperluas SLiMS, Bukan Mengganti',
        rationale:
          'Data bibliografi dan sirkulasi tetap di SLiMS agar pustakawan tidak perlu migrasi; yang diubah hanya lapisan presentasi.',
      },
    ],
  },
  {
    id: 'lpm-upg',
    index: '',
    role: 'FULL-STACK DEVELOPER · SYSTEM OWNER',
    year: '2026',
    title: 'LPM Universitas Primagraha',
    subtitle: 'Portal Lembaga Penjaminan Mutu — SPMI, SPME, Akreditasi & AMI',
    shortDesc:
      'Pusat dokumen mutu, akreditasi, dan audit internal kampus: SPMI, SPME, Akreditasi, AMI, dan survei.',
    tech: 'Node.js / Web Portal / Windows IIS',
    techList: ['Node.js', 'PM2', 'Windows IIS', 'Document Repository', 'Survey Module'],
    image: '/works/lpm.png',
    liveUrl: 'https://lpm.primagraha.ac.id',
    isExternal: true,
    statusLabel: 'Production ↗',
    metrics: [
      { label: 'Modul Mutu', value: '5 Modul', context: 'SPMI, SPME, Akreditasi, AMI, dan Survei dalam satu portal' },
      { label: 'Akses Dokumen', value: 'Satu Pintu', context: 'Dokumen SPMI dan status akreditasi dari beranda' },
      { label: 'Integrasi', value: 'Terhubung', context: 'Tertaut ke portal utama primagraha.ac.id' },
    ],
    problem:
      'Dokumen mutu, hasil akreditasi, dan jadwal audit internal tersebar di banyak berkas sehingga sulit ditemukan oleh sivitas akademika maupun auditor.',
    solution:
      'Satu portal terstruktur untuk LPM: navigasi per siklus mutu (SPMI, SPME, AMI), halaman status akreditasi, dan akses dokumen yang tegas dari beranda.',
    architectureNodes: [
      {
        layer: '01 · Portal UI',
        name: 'Institutional Landing',
        spec: 'Hero · CTA Dokumen SPMI & Status Akreditasi',
        detail: 'Dua aksi utama yang paling sering dicari pengguna langsung tersedia di layar pertama.',
      },
      {
        layer: '02 · Quality Modules',
        name: 'SPMI · SPME · AMI · Survei',
        spec: 'Terstruktur per siklus penjaminan mutu',
        detail: 'Setiap modul memiliki halaman dan repositori dokumen sendiri.',
      },
    ],
    engineeringDecisions: [
      {
        title: 'Navigasi Mengikuti Siklus Mutu',
        rationale:
          'Menu disusun mengikuti istilah yang dipakai auditor dan dosen sehari-hari, sehingga tidak perlu pelatihan untuk menemukan dokumen.',
      },
    ],
  },
  {
    id: 'lppm-upg',
    index: '',
    role: 'FULL-STACK DEVELOPER · SYSTEM OWNER',
    year: '2026',
    title: 'LPPM Universitas Primagraha',
    subtitle: 'Portal Penelitian, Pengabdian, Publikasi & HKI',
    shortDesc:
      'Portal Lembaga Penelitian dan Pengabdian kepada Masyarakat: profil, penelitian, pengabdian, publikasi & HKI, serta dashboard data.',
    tech: 'Next.js / React / TypeScript / Windows IIS',
    techList: ['Next.js', 'React', 'TypeScript', 'PM2', 'Windows IIS', 'Data Dashboard'],
    image: '/works/lppm.png',
    liveUrl: 'https://lppm.primagraha.ac.id',
    isExternal: true,
    statusLabel: 'Production ↗',
    metrics: [
      { label: 'Kanal Utama', value: '4 Kanal', context: 'Penelitian, Pengabdian, Publikasi & HKI, Data & Dashboard' },
      { label: 'Statistik', value: 'Terbuka', context: 'Statistik LPPM ditampilkan publik langsung di beranda' },
      { label: 'Layanan', value: 'Terpadu', context: 'Berita dan layanan dalam satu navigasi' },
    ],
    problem:
      'Informasi hibah penelitian, kegiatan pengabdian, dan capaian publikasi/HKI dosen tidak memiliki satu etalase publik yang rapi.',
    solution:
      'Membangun portal LPPM berbasis Next.js dengan navigasi bertingkat, halaman statistik, dan dashboard data agar capaian riset kampus transparan.',
    architectureNodes: [
      {
        layer: '01 · Portal UI',
        name: 'Next.js App Router',
        spec: 'Mega-menu · Statistik LPPM',
        detail: 'Navigasi bertingkat untuk Profil, Penelitian, Pengabdian, dan Publikasi & HKI.',
      },
      {
        layer: '02 · Data & Dashboard',
        name: 'Research Data Views',
        spec: 'Agregasi capaian penelitian & pengabdian',
        detail: 'Menyajikan data capaian sebagai statistik dan dashboard publik.',
      },
    ],
    engineeringDecisions: [
      {
        title: 'Statistik Sebagai Elemen Kepercayaan',
        rationale:
          'Angka capaian ditempatkan di beranda sebagai bukti kinerja institusi, bukan disembunyikan di halaman laporan.',
      },
    ],
  },
  {
    id: 'perpus-upg',
    index: '',
    role: 'FULL-STACK DEVELOPER · SYSTEM OWNER',
    year: '2026',
    title: 'Open Library Primagraha',
    subtitle: 'Portal Layanan Perpustakaan Terpadu dengan SSO, Repositori & E-Journal',
    shortDesc:
      'Portal perpustakaan terpadu: katalog 128.450 koleksi fisik & digital, repositori, e-journal OJS, reservasi ruangan, dan SSO.',
    tech: 'Next.js / React / SSO / Windows IIS',
    techList: ['Next.js', 'React', 'SSO Login', 'OPAC Integration', 'Repository', 'OJS E-Journals', 'PM2'],
    image: '/works/perpus.png',
    liveUrl: 'https://perpus.primagraha.ac.id',
    isExternal: true,
    statusLabel: 'Production ↗',
    metrics: [
      { label: 'Koleksi', value: '128.450', context: 'Koleksi fisik & digital yang dapat ditelusuri' },
      { label: 'Quick Access', value: '10 Layanan', context: 'Katalog, repositori, e-journal, reservasi ruangan, ketersediaan PC, dll.' },
      { label: 'Bahasa', value: 'ID / EN', context: 'Antarmuka dwibahasa dengan SSO Login' },
    ],
    problem:
      'Layanan perpustakaan (katalog, repositori, jurnal, reservasi ruang) berada di banyak aplikasi terpisah dengan login berbeda-beda.',
    solution:
      'Satu portal Open Library sebagai pintu depan: pencarian koleksi terpadu, menu akses cepat ke setiap layanan, survei kepuasan, dan login tunggal (SSO).',
    architectureNodes: [
      {
        layer: '01 · Unified Search',
        name: 'Federated Collection Search',
        spec: 'Judul · Pengarang · Subjek · Penerbit · Advanced',
        detail: 'Satu kolom pencarian di bagian atas untuk koleksi fisik maupun digital.',
      },
      {
        layer: '02 · Quick Access Hub',
        name: 'Service Launcher',
        spec: 'OPAC · Repo · OJS · Reservasi · PC',
        detail: 'Grid akses cepat yang mengarahkan ke tiap sistem perpustakaan.',
      },
      {
        layer: '03 · Identity',
        name: 'SSO Login',
        spec: 'Satu akun untuk semua layanan',
        detail: 'Mengurangi login berulang antara portal, katalog, dan layanan anggota.',
      },
    ],
    engineeringDecisions: [
      {
        title: 'Portal Sebagai Orkestrator, Bukan Pengganti',
        rationale:
          'Sistem yang sudah berjalan (OPAC, repositori, OJS) tetap dipakai; portal hanya menyatukan akses dan identitas pengguna.',
      },
    ],
  },
];
