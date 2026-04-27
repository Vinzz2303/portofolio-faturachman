import React from 'react'
import type { SectionProps } from '../types'
import { useLanguagePreference } from '../utils/language'

export default function Contact({ sectionId }: SectionProps) {
  const { language } = useLanguagePreference()
  const isEnglish = language === 'en'

  const copy = isEnglish
    ? {
        title: 'Contact',
        body:
          'If you need an AI product builder who can turn product direction into a clear interface, reach me at',
        faq: 'FAQ',
        items: [
          {
            title: 'What do you build?',
            text: 'Frontend product pages, dashboard surfaces, and product-first landing pages.'
          },
          {
            title: 'Can you shape the structure too?',
            text: 'Yes. I help define hierarchy, flow, and messaging so the interface feels easier to use.'
          },
          {
            title: 'Do you support iteration?',
            text: 'Yes. I can continue with refinement, polish, and the next stage after launch.'
          }
        ]
      }
    : {
        title: 'Kontak',
        body:
          'Jika Anda butuh AI product builder yang bisa menerjemahkan arah produk menjadi interface yang jelas, hubungi saya di',
        faq: 'FAQ',
        items: [
          {
            title: 'Apa yang saya bangun?',
            text: 'Halaman produk frontend, dashboard, dan landing page yang berfokus pada produk.'
          },
          {
            title: 'Bisa bantu struktur juga?',
            text: 'Ya. Saya juga membantu menyusun hierarchy, flow, dan messaging agar interface lebih mudah dipakai.'
          },
          {
            title: 'Bisa lanjut iterasi?',
            text: 'Ya. Saya bisa lanjut untuk refinement, polish, dan tahap berikutnya setelah launch.'
          }
        ]
      }

  return (
    <section id={sectionId} className="contact container reveal">
      <h2>{copy.title}</h2>
      <p>
        {copy.body} <a href="mailto:faturachmanalkahfi7@gmail.com">faturachmanalkahfi7@gmail.com</a>.
      </p>
      <div className="faq">
        <h3>{copy.faq}</h3>
        <div className="faq-grid">
          {copy.items.map((item) => (
            <div key={item.title} className="faq-item">
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="social-links">
        <a href="https://github.com/Vinzz2303" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/faturachman-al-kahfi-662283304/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="https://instagram.com/alvinstzy" target="_blank" rel="noreferrer">Instagram</a>
        <a href="https://wa.me/62895618466907" target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </section>
  )
}
