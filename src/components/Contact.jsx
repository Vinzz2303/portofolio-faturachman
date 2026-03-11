import React from 'react'

export default function Contact({ sectionId }){
  return (
    <section id={sectionId} className="contact container reveal">
      <h2>Contact</h2>
      <p>
        Need a clean landing page or UI? Send me an email.
        Reach out anytime: <a href="mailto:faturachmanalkahfi7@gmail.com">faturachmanalkahfi7@gmail.com</a>
      </p>
      <div className="faq">
        <h3>FAQ</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How long does it take?</h4>
            <p>Usually 3-10 days depending on scope and revisions.</p>
          </div>
          <div className="faq-item">
            <h4>Can you design from scratch?</h4>
            <p>Yes. Share your brief and references, I will handle the rest.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer maintenance after launch?</h4>
            <p>Yes. It includes small content updates and minor fixes.</p>
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
