import React from 'react'

const projects = [
  {
    id: 1,
    title: 'Central Jual Emas (Concept Project)',
    desc:
      'Landing page konsep untuk layanan jual emas dengan fokus edukasi & konversi. ' +
      'Built as a solo developer (AI-assisted).',
    stack: 'HTML, CSS, JavaScript, React, Vite, API',
    highlights: [
      'Kalkulator estimasi harga emas',
      'Harga emas otomatis via API (XAUSD/world data)',
      'CTA WhatsApp, testimoni, FAQ, lokasi'
    ],
    note: 'Data pelanggan/cabang/testimoni memakai mock data untuk kebutuhan desain.',
    links: [
      { label: 'Demo', href: 'https://central-jual-emas.netlify.app/' },
      { label: 'Admin', href: 'https://central-jual-emas.netlify.app/admin.html' },
      { label: 'Repo', href: 'https://github.com/Vinzz2303/central-jual-emas' }
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
            <div className="card-body">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <p className="card-meta"><strong>Stack:</strong> {p.stack}</p>
              <ul className="card-list">
                {p.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
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
