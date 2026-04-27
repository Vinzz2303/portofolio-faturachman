import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguagePreference } from '../utils/language'
import TingAiV2Hero from '../components/ting-ai-v2/TingAiV2Hero'

export default function TingAiTwo() {
  const { language } = useLanguagePreference()
  const isEnglish = language === 'en'

  const copy = isEnglish
    ? {
        understandsTitle: 'What Ting AI understands',
        pillars: [
          {
            title: 'Market Context',
            text: 'Reads cross-asset conditions to understand what the market may be pricing in.'
          },
          {
            title: 'Risk Awareness',
            text: 'Highlights portfolio exposure, volatility pressure, and concentration risk.'
          },
          {
            title: 'Narratives',
            text: 'Connects news, price action, and market reaction to avoid shallow interpretation.'
          },
          {
            title: 'Portfolio Insight',
            text: 'Explains how current market conditions relate to the user’s portfolio.'
          }
        ],
        previewTitle: 'What this page is',
        previewBody:
          'Use the workspace to read portfolio conditions and risk directly.',
        note: 'Open the workspace to continue with the active product.',
        proofTitle: 'Current proof, future vision',
        currentTitle: 'Ting AI v1.9.2',
        currentBody:
          'The current working version focuses on Today Status, portfolio-aware insight, risk labels, trade-offs, and explainable reasoning.',
        futureTitle: 'Ting AI 2.0',
        futureBody:
          'The next evolution expands the experience into market context, risk awareness, narratives, and portfolio intelligence with a cleaner intelligence-first interface.',
        dashboardCta: 'Open Portfolio Workspace'
      }
    : {
        understandsTitle: 'Apa yang dipahami Ting AI',
        pillars: [
          {
            title: 'Konteks Pasar',
            text: 'Membaca kondisi lintas aset untuk memahami apa yang kemungkinan sedang dihargai pasar.'
          },
          {
            title: 'Kesadaran Risiko',
            text: 'Menyoroti eksposur portofolio, tekanan volatilitas, dan risiko konsentrasi.'
          },
          {
            title: 'Narasi',
            text: 'Menghubungkan berita, pergerakan harga, dan reaksi pasar agar pengguna tidak salah tafsir.'
          },
          {
            title: 'Insight Portofolio',
            text: 'Menjelaskan hubungan kondisi pasar saat ini dengan portofolio pengguna.'
          }
        ],
        previewTitle: 'Apa fungsi halaman ini',
        previewBody:
          'Gunakan workspace untuk membaca kondisi portofolio dan risiko secara langsung.',
        note: 'Buka workspace untuk melanjutkan ke produk yang aktif digunakan.',
        proofTitle: 'Bukti saat ini, arah berikutnya',
        currentTitle: 'Ting AI v1.9.2',
        currentBody:
          'Versi yang berjalan saat ini berfokus pada Status Hari Ini, insight sadar portofolio, label risiko, konsekuensi, dan penjelasan yang dapat dipahami.',
        futureTitle: 'Ting AI 2.0',
        futureBody:
          'Evolusi berikutnya memperluas pengalaman ke konteks pasar, kesadaran risiko, narasi, dan inteligensi portofolio dengan antarmuka yang lebih bersih dan berfokus pada pemahaman.',
        dashboardCta: 'Buka Portfolio Workspace'
      }

  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    scrollTop()
    const frameId = window.requestAnimationFrame(scrollTop)
    const timer = window.setTimeout(scrollTop, 50)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <section className="ting-ai-two-page">
      <div className="container ting-ai-two-container">
        <TingAiV2Hero />

        <div className="ting-ai-two-grid">
          <article className="ting-ai-two-card">
            <p className="eyebrow">{copy.understandsTitle}</p>
            <div className="ting-ai-two-pillars">
              {copy.pillars.map((pillar) => (
                <div key={pillar.title} className="ting-ai-two-pillar">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="ting-ai-two-card ting-ai-two-card-soft">
            <p className="eyebrow">{copy.previewTitle}</p>
            <p>{copy.previewBody}</p>
            <p className="ting-ai-two-note-text">{copy.note}</p>
          </article>
        </div>

        <section className="ting-ai-two-proof" aria-labelledby="ting-ai-two-proof-title">
          <p className="eyebrow" id="ting-ai-two-proof-title">
            {copy.proofTitle}
          </p>

          <div className="ting-ai-two-proof-grid">
            <article className="ting-ai-two-card">
              <h3>{copy.currentTitle}</h3>
              <p>{copy.currentBody}</p>
            </article>

            <article className="ting-ai-two-card ting-ai-two-card-soft">
              <h3>{copy.futureTitle}</h3>
              <p>{copy.futureBody}</p>
            </article>
          </div>

          <div className="ting-ai-two-proof-cta">
            <Link className="btn" to="/dashboard">
              
              {copy.dashboardCta}
            </Link>
          </div>
        </section>
      </div>
    </section>
  )
}
