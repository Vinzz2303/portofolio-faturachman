import React from 'react'

export default function Contact({ sectionId }){
  return (
    <section id={sectionId} className="contact container reveal">
      <h2>Contact</h2>
      <p>
        Butuh landing page atau UI yang rapi? Kirim email aja.
        Reach out anytime: <a href="mailto:faturachmanalkahfi7@gmail.com">faturachmanalkahfi7@gmail.com</a>
      </p>
      <div className="faq">
        <h3>FAQ</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Berapa lama pengerjaan?</h4>
            <p>Biasanya 3–10 hari tergantung scope dan revisi.</p>
          </div>
          <div className="faq-item">
            <h4>Bisa desain dari nol?</h4>
            <p>Bisa. Kamu cukup kasih brief dan referensi, sisanya saya rapikan.</p>
          </div>
          <div className="faq-item">
            <h4>Bisa maintenance setelah launch?</h4>
            <p>Bisa. Termasuk update konten kecil dan perbaikan minor.</p>
          </div>
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
