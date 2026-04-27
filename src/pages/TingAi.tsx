import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AiChat from '../components/AiChat'
import { hasProAccess } from '../utils/entitlements'
import { useAuthSession } from '../utils/useAuthSession'
import { useLanguagePreference } from '../utils/language'

export default function TingAi() {
  const { authenticated, user } = useAuthSession()
  const { language } = useLanguagePreference()
  const isProUser = hasProAccess(user)
  const isEnglish = language === 'en'
  const text = isEnglish
    ? {
        heroTitle: 'Intelligence grounded in understanding',
        heroLead:
          'Ting AI is designed to reduce noise, surface decisions, and keep AI focused on context and reasoning.',
        badges: ['Today Status', 'Portfolio Fit', 'AI Explanation'],
        proBadge: 'Pro Mode',
        openStatus: 'View Today Status',
        createAccount: 'Create Account',
        whyItExists: 'Why this was made',
        whyItExistsBody:
          'We do not lack data. What we need is a clearer way to understand and make decisions.',
        problem: 'Problem',
        problemTitle: 'Too much information, too little clarity',
        problemBody:
          'Market information is spread across many sources: news, charts, and apps. Without clear context, users struggle to understand what actually matters.',
        approach: 'Approach',
        approachTitle: 'One decision point, then deeper exploration',
        approachBody:
          'The experience starts with Today Status, then continues into portfolio analysis and advanced features as needed.',
        core: 'Core Experience',
        coreTitle: 'What Ting AI is for',
        coreBody:
          'The product keeps daily orientation, decision flow, and supporting workflows distinct so each part stays easier to understand.',
        proNote:
          'Free users see the product in preview mode. Pro opens a fuller briefing rhythm and deeper supporting features.',
        reasoningDesk: 'AI Explanation',
        reasoningTitle: 'Ask Ting AI about the situation, not just the data',
        reasoningBody:
          'This is a guided AI space. Ask a concise question and let the model respond with context, implications, and what deserves attention.',
        backToStatus: 'Back to Today Status',
        login: 'Sign In',
        unlockPro: 'Unlock Pro',
        modules: [
          {
            title: 'Briefing',
            text: 'A single entry point to understand today, not a catalog of features.'
          },
          {
            title: 'Explanation',
            text: 'AI responses stay concise, contextual, and focused on implications.'
          },
          {
            title: 'Portfolio',
            text: 'Portfolio analysis stays as supporting context, not a competing main screen.'
          }
        ]
      }
    : {
        heroTitle: 'Pahami kondisi portofoliomu sebelum mengambil keputusan.',
        heroLead:
          'Ting AI membantu membaca risiko, konteks pasar, dan dampaknya ke portofoliomu.',
        badges: ['Konteks pasar', 'Risiko portofolio', 'Insight keputusan'],
        proBadge: 'Mode Pro',
        openStatus: 'Buka Portfolio Workspace',
        createAccount: 'Buat Akun',
        whyItExists: 'Kenapa ini dibuat',
        whyItExistsBody:
          'Kita tidak kekurangan data. Yang dibutuhkan adalah cara memahami dan mengambil keputusan dengan lebih jelas.',
        problem: 'Masalah',
        problemTitle: 'Terlalu banyak informasi, terlalu sedikit kejelasan',
        problemBody:
          'Informasi pasar tersebar di berbagai sumber: berita, chart, dan aplikasi. Tanpa konteks yang jelas, pengguna kesulitan memahami apa yang benar-benar penting.',
        approach: 'Pendekatan',
        approachTitle: 'Satu titik keputusan, lalu eksplorasi yang lebih dalam',
        approachBody:
          'Pengalaman dimulai dari Status Hari Ini, kemudian dapat dilanjutkan ke analisis portofolio dan fitur lanjutan sesuai kebutuhan pengguna.',
        core: 'Pengalaman Inti',
        coreTitle: 'Untuk apa Ting AI',
        coreBody:
          'Struktur produk menjaga orientasi harian, alur keputusan, dan fitur pendukung tetap terpisah agar tiap bagian lebih mudah dipahami.',
        proNote:
          'Pengguna gratis melihat sistem produk dalam mode pratinjau. Pro membuka ritme briefing yang lebih utuh dan fitur pendukung yang lebih mendalam.',
        reasoningDesk: 'Ting AI',
        reasoningTitle: 'Tanyakan ke Ting AI',
        reasoningBody:
          'Tanyakan konteks pasar, dampaknya ke portofolio, atau langkah yang perlu dipertimbangkan.',
        backToStatus: 'Lihat Status Portofolio',
        login: 'Masuk',
        unlockPro: 'Buka Pro',
        modules: [
          {
            title: 'Briefing',
            text: 'Satu titik masuk untuk memahami kondisi hari ini, bukan katalog fitur.'
          },
          {
            title: 'Penjelasan',
            text: 'Jawaban AI dirancang singkat, kontekstual, dan langsung ke implikasi.'
          },
          {
            title: 'Portofolio',
            text: 'Gunakan workspace untuk membaca kondisi portofolio dan risiko secara langsung.'
          }
        ]
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
    <section className="ting-ai-page">
      <div className="container ting-ai-hero">
        <div className="ting-ai-hero-copy">
          <div className="eyebrow">Ting AI</div>
          <h1>{text.heroTitle}</h1>
          <p className="lead">{text.heroLead}</p>
          <div className="hero-badges">
            {text.badges.map((badge) => (
              <span className="badge" key={badge}>
                {badge}
              </span>
            ))}
            <span className="badge">{text.proBadge}</span>
          </div>
          <div className="hero-cta">
            <Link className="btn" to="/dashboard">
              {text.openStatus}
            </Link>
            {!authenticated ? (
              <Link className="btn secondary" to="/signup">
                {text.createAccount}
              </Link>
            ) : null}
          </div>
        </div>
        <div className="ting-ai-hero-art">
          <img
            className="ting-ai-hero-logo"
            src="/ting-ai-logo-horizontal-final.png"
            alt="Ting AI primary logo"
          />
          <div className="ting-ai-hero-note">
            <h3>{text.whyItExists}</h3>
            <p>{text.whyItExistsBody}</p>
          </div>
        </div>
      </div>

      <div className="container ting-ai-grid">
        <article className="card ting-ai-card">
          <div className="eyebrow">{text.problem}</div>
          <h2>{text.problemTitle}</h2>
          <p>{text.problemBody}</p>
        </article>
        <article className="card ting-ai-card">
          <div className="eyebrow">{text.approach}</div>
          <h2>{text.approachTitle}</h2>
          <p>{text.approachBody}</p>
        </article>
      </div>

      <div className="container ting-ai-modules">
        <div className="ting-ai-section-head">
          <div className="eyebrow">{text.core}</div>
          <h2>{text.coreTitle}</h2>
          <p className="lead">{text.coreBody}</p>
          {!isProUser ? (
            <p className="card-note">{text.proNote}</p>
          ) : null}
        </div>
        <div className="value-grid">
          {text.modules.map((module) => (
            <article key={module.title} className="value-card ting-ai-module-card">
              <h3>{module.title}</h3>
              <p>{module.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="container ting-ai-reasoning">
        <div className="ting-ai-section-head">
          <div className="eyebrow">{text.reasoningDesk}</div>
          <h2>{text.reasoningTitle}</h2>
          <p className="lead">{text.reasoningBody}</p>
        </div>
        <AiChat
          variant="panel"
          language={language}
          userPlan={isProUser ? 'pro' : 'free'}
          userEmail={user?.email}
        />
        <div className="ting-ai-actions">
          <Link className="btn secondary" to="/portfolio">
            {isEnglish ? 'Open Portfolio Workspace' : 'Buka Portfolio Workspace'}
          </Link>
          {authenticated ? (
            <Link className="btn" to="/portfolio">
              {text.backToStatus}
            </Link>
          ) : (
            <Link className="btn" to="/login">
              {text.login}
            </Link>
          )}
          {!isProUser ? (
            <Link className="btn secondary" to="/upgrade">
              {text.unlockPro}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
