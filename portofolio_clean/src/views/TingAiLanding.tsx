import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MicroLearningCards from '../components/ting-ai-v2/MicroLearningCards'
import { useLanguagePreference } from '../utils/language'

export default function TingAiLanding() {
  const { language } = useLanguagePreference()
  
  useEffect(() => {
    // Reset any portfolio specific body styles if needed
    document.body.style.backgroundColor = '#000000'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  const text = {
    badge: language === 'id' ? 'TING AI · THINKING PARTNER' : 'TING AI · THINKING PARTNER',
    title: language === 'id' 
      ? 'Bukan memberi sinyal, tapi menyadarkan realita.' 
      : 'Not giving signals, just showing reality.',
    subtitle: language === 'id'
      ? 'Trading tanpa membedah risiko adalah judi. Ting AI dirancang sebagai teman diskusi agar kamu bisa membaca konteks pasar dan kelemahan portofoliomu sendiri sebelum bertindak.'
      : 'Trading without analyzing risk is gambling. Ting AI is designed as a thinking partner to help you read market context and portfolio weaknesses before acting.',
    btnPrimary: language === 'id' ? 'Cek Kesehatan Portofolio' : 'Check Portfolio Health',
    btnSecondary: language === 'id' ? 'Masuk ke Dashboard' : 'Enter Dashboard',
    disclaimer: language === 'id' 
      ? 'Sepenuhnya bebas dari rekomendasi beli/jual.' 
      : 'Strictly free from buy/sell recommendations.'
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-teal-500/30 overflow-hidden relative">
      
      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at 50% 0%, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, black 40%, transparent 80%)'
          }}
        />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Modern Minimal Navbar */}
      <nav className="relative z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="font-semibold tracking-tight text-white/90">Ting AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-white/60">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] font-mono tracking-widest uppercase mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            {text.badge}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-8 max-w-4xl leading-[1.1]"
          >
            {text.title}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 max-w-2xl leading-relaxed mb-12"
          >
            {text.subtitle}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link 
              to="/ting-ai" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2"
            >
              {text.btnPrimary}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-semibold flex items-center justify-center"
            >
              {text.btnSecondary}
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-8 font-mono text-[10px] text-white/40 uppercase tracking-widest"
          >
            {text.disclaimer}
          </motion.div>
        </section>

        {/* DEMO / PHILOSOPHY MOCKUP */}
        <section className="mb-32">
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl">
            <div className="h-10 border-b border-white/10 flex items-center px-4 bg-[#111]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <div className="w-3 h-3 rounded-full bg-white/20" />
              </div>
              <div className="mx-auto text-[11px] font-mono text-white/40">app.tingsai.my.id</div>
            </div>
            <div className="p-8 md:p-12 flex flex-col gap-6">
              <div className="max-w-2xl ml-auto bg-white/5 border border-white/10 p-5 rounded-2xl rounded-tr-sm text-sm text-white/80 leading-relaxed">
                Apakah portofolio saya aman jika suku bunga The Fed turun bulan depan?
              </div>
              <div className="max-w-2xl mr-auto flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-2">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div className="bg-transparent border border-white/10 p-6 rounded-2xl rounded-tl-sm text-sm text-white/80 leading-relaxed space-y-4">
                  <p>Saya melihat portofoliomu terkonsentrasi 70% di sektor perbankan (BBCA & BMRI).</p>
                  <p>Secara historis, suku bunga turun bisa menekan margin bunga bersih (NIM) bank. Meskipun The Fed jauh, BI biasanya mengekor arah The Fed yang akan berimbas pada perbankan lokal.</p>
                  <p>Risiko terbesarmu saat ini bukan pasar yang anjlok, melainkan <span className="text-teal-400 font-semibold">kurangnya perlindungan</span> jika satu sektor ini terpukul. Apakah kamu punya ruang <em>cash</em> untuk bereaksi jika ini terjadi?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MICRO-LEARNING */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="pt-16">
            <MicroLearningCards />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-tight text-white/70">Ting AI</span>
            <span className="text-white/30 text-sm">© {new Date().getFullYear()}</span>
          </div>
          <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest text-center md:text-right">
            Designed to help you think.<br/>Not to tell you what to do.
          </div>
        </div>
      </footer>
    </div>
  )
}
