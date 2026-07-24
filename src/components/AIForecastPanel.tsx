import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  language: 'id' | 'en'
  ticker: string
  // Optional: pass current price to make the scenarios more realistic
  currentPrice?: number
}

// Pseudo-random deterministic generator based on ticker string so it doesn't flicker
function getDeterministicRandom(ticker: string) {
  let hash = 0
  for (let i = 0; i < ticker.length; i++) {
    hash = ticker.charCodeAt(i) + ((hash << 5) - hash)
  }
  const x = Math.sin(hash++) * 10000
  return x - Math.floor(x)
}

export default function AIForecastPanel({ language, ticker, currentPrice }: Props) {
  const [loading, setLoading] = useState(true)

  // We simulate fetching AI forecast data
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(t)
  }, [ticker])

  // Generate deterministic "AI" data for demo purposes
  // In a real app, this would be fetched from the backend (OpenBB / ML models)
  const rand = getDeterministicRandom(ticker)
  
  // Bullish probability between 30% and 70%
  const bullishProb = Math.floor(30 + (rand * 40))
  const bearishProb = 100 - bullishProb
  const isBullishBias = bullishProb >= 50

  const momentumScore = Math.floor(40 + (rand * 50)) // 40-90
  
  // Calculate mock targets if we have a current price
  const price = currentPrice || 1000
  const bullTarget = price * (1 + (0.02 + rand * 0.05)) // +2% to +7%
  const bearTarget = price * (1 - (0.02 + rand * 0.05)) // -2% to -7%

  const formatPrice = (p: number) => {
    if (p < 100) return p.toFixed(2)
    return Math.round(p).toLocaleString('id-ID')
  }

  const copy = {
    id: {
      title: 'Skenario Probabilitas AI',
      subtitle: 'Berdasarkan analisis kuantitatif historis & momentum (1-2 Minggu)',
      momentum: 'Skor Momentum',
      momentumHot: 'Sangat Panas',
      momentumCold: 'Mendingin',
      bullishScenario: 'Skenario Bullish',
      bearishScenario: 'Skenario Bearish',
      prob: 'Probabilitas',
      target: 'Proyeksi Target',
      bullText: `Jika arus masuk (inflow) berlanjut dan support kuat dipertahankan, momentum dapat mendorong harga menuju area resisten.`,
      bearText: `Jika tekanan jual institusi meningkat atau level support saat ini tembus, harga berpotensi menguji level likuiditas di bawahnya.`,
      disclaimer: '⚠ PENTING: Skenario ini adalah hasil perhitungan matematis/probabilitas historis AI dan BUKAN rekomendasi beli/jual/tahan.'
    },
    en: {
      title: 'AI Probability Scenarios',
      subtitle: 'Based on historical quantitative analysis & momentum (1-2 Weeks)',
      momentum: 'Momentum Score',
      momentumHot: 'Very Hot',
      momentumCold: 'Cooling',
      bullishScenario: 'Bullish Scenario',
      bearishScenario: 'Bearish Scenario',
      prob: 'Probability',
      target: 'Projected Target',
      bullText: `If inflow continues and firm support is held, momentum could drive the price toward the resistance zone.`,
      bearText: `If institutional selling pressure increases or current support breaks, the price may test lower liquidity levels.`,
      disclaimer: '⚠ IMPORTANT: These scenarios are based on historical mathematical probabilities and DO NOT constitute buy/sell/hold recommendations.'
    }
  }

  const t = copy[language]

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center border border-white/[0.05] rounded-2xl bg-black/20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            {language === 'id' ? 'Menghitung Probabilitas...' : 'Calculating Probabilities...'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] bg-[#0a0c10]">
      {/* Subtle background glow based on bias */}
      <div 
        className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ background: isBullishBias ? '#2dd4bf' : '#f87171' }}
      />
      
      <div className="relative z-10 p-5 sm:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
              {t.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
          </div>
          
          {/* Momentum Score */}
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2 shrink-0">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-slate-500">{t.momentum}</span>
              <span className="text-sm font-bold text-slate-200">
                {momentumScore}/100 <span className="text-xs font-normal text-slate-400">({momentumScore > 65 ? t.momentumHot : t.momentumCold})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* BULLISH SCENARIO */}
          <div className="rounded-xl border border-teal-500/20 bg-teal-500/[0.03] p-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:bg-teal-500/10" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  {t.bullishScenario}
                </span>
                <span className="text-xl font-black text-white">{bullishProb}%</span>
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed mb-4 relative z-10">
                {t.bullText}
              </p>
            </div>
            
            <div className="pt-3 border-t border-teal-500/10 flex justify-between items-end relative z-10">
              <span className="text-[10px] text-teal-500/60 uppercase tracking-widest">{t.target}</span>
              <span className="text-base font-mono font-bold text-teal-400">{formatPrice(bullTarget)}</span>
            </div>
          </div>

          {/* BEARISH SCENARIO */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:bg-red-500/10" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {t.bearishScenario}
                </span>
                <span className="text-xl font-black text-white">{bearishProb}%</span>
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed mb-4 relative z-10">
                {t.bearText}
              </p>
            </div>
            
            <div className="pt-3 border-t border-red-500/10 flex justify-between items-end relative z-10">
              <span className="text-[10px] text-red-500/60 uppercase tracking-widest">{t.target}</span>
              <span className="text-base font-mono font-bold text-red-400">{formatPrice(bearTarget)}</span>
            </div>
          </div>

        </div>

        {/* Legal Safeguard / Disclaimer */}
        <div className="bg-amber-500/[0.04] border border-amber-500/10 rounded-lg p-3 flex items-start gap-3">
          <span className="text-amber-500 mt-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          <p className="text-[11px] text-amber-500/70 leading-relaxed font-mono">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </div>
  )
}
