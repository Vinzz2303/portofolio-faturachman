import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguagePreference } from '../../utils/language'

const C = {
  surface: 'rgba(255,255,255,0.025)',
  border: 'rgba(255,255,255,0.07)',
  teal: '#14b8a6',
  amber: '#f59e0b',
  slate400: '#94a3b8',
  slate500: '#64748b',
  white: '#ffffff',
  mono: "'SF Mono', 'Fira Mono', 'JetBrains Mono', monospace",
}

const CARDS_ID = [
  {
    id: 'concentration',
    title: 'Apa itu Konsentrasi Portofolio?',
    content: 'Saat >50% uangmu ada di 1 aset, pergerakan aset itu akan menyetir seluruh portofoliomu. Ting AI membantu mendeteksi aset mana yang secara diam-diam memegang kendali.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    id: 'volatility',
    title: 'Bahaya Volatilitas Rendah',
    content: 'Pasar yang terlalu tenang (volatilitas rendah) seringkali adalah "calm before the storm". Rasa nyaman ini bisa membuatmu tidak siap saat harga tiba-tiba anjlok.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    )
  },
  {
    id: 'diversification',
    title: 'Sebar vs Diversifikasi',
    content: 'Punya 10 saham di sektor yang sama (misal perbankan) itu namanya "sebar aset", bukan diversifikasi. Kalau sektor itu jatuh, ke-10 sahammu akan jatuh bersamaan.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  {
    id: 'nosignal',
    title: 'Kenapa Tidak Ada Sinyal Buy/Sell?',
    content: 'Karena uangmu adalah tanggung jawabmu. Ting AI bertindak sebagai "thinking partner" untuk menunjukkan realita & risiko tersembunyi, bukan mendikte keputusanmu.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  }
]

const CARDS_EN = [
  {
    id: 'concentration',
    title: 'What is Portfolio Concentration?',
    content: 'When >50% of your money is in 1 asset, its movement steers your entire portfolio. Ting AI helps detect which asset is silently holding the wheel.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    id: 'volatility',
    title: 'The Danger of Low Volatility',
    content: 'A market that is too calm (low volatility) is often the "calm before the storm". This comfort can leave you unprepared when prices suddenly drop.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    )
  },
  {
    id: 'diversification',
    title: 'Spreading vs Diversification',
    content: 'Owning 10 stocks in the same sector (e.g. banking) is spreading, not diversifying. If the sector drops, all 10 stocks drop together.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  {
    id: 'nosignal',
    title: 'Why No Buy/Sell Signals?',
    content: 'Because your money is your responsibility. Ting AI acts as a "thinking partner" to show reality & hidden risks, not to dictate your decisions.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  }
]

export default function MicroLearningCards() {
  const { language } = useLanguagePreference()
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const cards = language === 'id' ? CARDS_ID : CARDS_EN
  const title = language === 'id' ? 'Pahami Sebelum Bertindak' : 'Understand Before Acting'
  const subtitle = language === 'id' 
    ? 'Kebanyakan orang rugi bukan karena salah aset, tapi karena tidak sadar risikonya.'
    : 'Most people lose money not because of bad assets, but because they are unaware of the risks.'

  return (
    <section className="py-10 border-t" style={{ borderColor: C.border }}>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2" style={{ color: C.white }}>{title}</h3>
        <p className="text-sm" style={{ color: C.slate400 }}>{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(card => (
          <div 
            key={card.id}
            onMouseEnter={() => setActiveId(card.id)}
            onMouseLeave={() => setActiveId(null)}
            className="p-5 rounded-2xl border transition-all duration-300"
            style={{ 
              background: activeId === card.id ? 'rgba(255,255,255,0.04)' : C.surface,
              borderColor: activeId === card.id ? 'rgba(20,184,166,0.3)' : C.border,
              boxShadow: activeId === card.id ? '0 4px 20px rgba(20,184,166,0.05)' : 'none'
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
                style={{ 
                  background: activeId === card.id ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.03)',
                  color: activeId === card.id ? C.teal : C.slate400
                }}
              >
                {card.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: C.white }}>{card.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: C.slate400 }}>
                  {card.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
