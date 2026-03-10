import React from 'react'

const projects = [
  {
    id: 1,
    cover: '/projects/central-emas.png',
    title: 'Central Jual Emas (Concept Project)',
    desc:
      'Landing page konsep untuk layanan jual emas dengan fokus edukasi dan konversi. ' +
      'A conversion-focused landing page with pricing insights and clear CTAs.',
    stack: 'HTML, CSS, JavaScript, React, Vite, REST API',
    highlights: [
      'Kalkulator estimasi harga emas',
      'Harga emas otomatis via API (XAUSD/world data)',
      'CTA WhatsApp, testimoni, FAQ, lokasi'
    ],
    caseStudy: [
      { label: 'Problem', text: 'Pengunjung butuh estimasi cepat dan rasa aman saat menjual emas.' },
      { label: 'Solution', text: 'Buat kalkulator harga otomatis + CTA WhatsApp yang jelas.' },
      { label: 'Result', text: 'Alur lebih ringkas dan fokus ke konversi.' }
    ],
    note: 'Data pelanggan/cabang/testimoni memakai mock data untuk kebutuhan desain.',
    links: [
      { label: 'Demo', href: 'https://central-jual-emas.netlify.app/' },
      { label: 'Admin', href: 'https://central-jual-emas.netlify.app/admin.html' },
      { label: 'Repo', href: 'https://github.com/Vinzz2303/central-jual-emas' }
    ]
  },
  {
    id: 2,
    cover: '/projects/queen-cell.png',
    title: 'For My Queen Cell (Client Project)',
    desc:
      'Website bucin bertema romantis untuk "HTS", berisi pesan personal, mood switch, dan alur cerita hangat. ' +
      'A soft, mobile-first experience with playful interactions.',
    stack: 'HTML, CSS, JavaScript, React (UMD)',
    highlights: [
      'Hero dengan pesan personal + toggle pesan',
      'Mood switch untuk ganti suasana',
      'Timeline perjalanan kecil + audio player',
      'Floating hearts animation'
    ],
    caseStudy: [
      { label: 'Problem', text: 'Klien ingin hadiah digital yang personal dan terasa hangat.' },
      { label: 'Solution', text: 'Storytelling lembut dengan mood switch + audio.' },
      { label: 'Result', text: 'Experience terasa intimate dan berkesan di mobile.' }
    ],
    note: 'Project client: copy dan konten disesuaikan kebutuhan pemesan.',
    links: [
      { label: 'Demo', href: 'https://formyqueencell.netlify.app/' },
      { label: 'Repo', href: 'https://github.com/Vinzz2303/buatcelyn' }
    ]
  }
]

export default function Projects({ sectionId }){
  return (
    <section id={sectionId} className="projects container reveal">
      <h2>Projects</h2>
      <div className="grid">
        {projects.map(p => (
          <article key={p.id} className="card">
            <div className="card-cover">
              <img src={p.cover} alt={`${p.title} cover`} loading="lazy" decoding="async" />
            </div>
            <div className="card-body">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <p className="card-meta"><strong>Stack:</strong> {p.stack}</p>
              <ul className="card-list">
                {p.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
              <div className="case-study">
                {p.caseStudy.map((item, i) => (
                  <div key={i} className="case-row">
                    <span className="case-label">{item.label}</span>
                    <span className="case-text">{item.text}</span>
                  </div>
                ))}
              </div>
              <p className="card-note">{p.note}</p>
              <div className="card-links">
                {p.links.map(l => (
                  <a key={l.label} className="btn-outline" href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
