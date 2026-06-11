import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

export default function FeaturedProduct({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()

  return (
    <section id={sectionId} className="py-24 relative">
      <div className="container-saas">
        <div className="text-center mb-20">
          <div className="panel-label mb-2 text-accent">Flagship Project</div>
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-4">Ting AI — Retail Intelligence Layer</h2>
          <div className="status-badge inline-block">Active Development · v1.9 → v2.0</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <p className="text-2xl text-white/80 leading-relaxed font-light">
              {language === 'en'
                ? 'An AI-powered decision support system for retail investors, focused on portfolio awareness, risk clarity, and insight generation — not blind trading signals.'
                : 'Sistem pendukung keputusan berbasis AI untuk investor ritel, fokus pada kesadaran portofolio, kejelasan risiko, dan pembuatan wawasan — bukan sinyal perdagangan buta.'}
            </p>
            
            <div className="flex flex-wrap gap-5">
              <Link to="/ting-ai" className="px-8 py-3 bg-accent text-dark font-bold rounded-lg hover:brightness-110 transition-all shadow-lg shadow-accent/5">
                {language === 'en' ? 'Explore Intelligence' : 'Jelajahi Inteligensi'}
              </Link>
              <Link to="/portfolio" className="px-8 py-3 glass-card hover:bg-white/5 transition-colors font-semibold">
                {language === 'en' ? 'Live Workspace' : 'Workspace Aktif'}
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 gap-4 relative"
          >
            {/* Floating Intelligence Panels */}
            <div className="glass-card p-5 space-y-2 border-accent/20 bg-accent/5 animate-float will-change-transform" style={{ animationDelay: '0s' }}>
              <div className="panel-label text-accent">Portfolio Risk</div>
              <div className="text-xl font-bold">High Concentration</div>
            </div>
            
            <div className="glass-card p-5 space-y-2 border-white/10 animate-float will-change-transform" style={{ animationDelay: '1s' }}>
              <div className="panel-label">AI Insight</div>
              <div className="text-sm text-white/70 leading-snug">BBCA.JK dominates current exposure (76.8%)</div>
            </div>
            
            <div className="glass-card p-6 col-span-2 space-y-2 border-white/10 hover-glow transition-all animate-float will-change-transform" style={{ animationDelay: '0.5s' }}>
              <div className="panel-label">Suggested Action</div>
              <div className="text-sm text-white/90">Review allocation before adding new position to tech sector. Risk offset recommended.</div>
            </div>
            
            <div className="glass-card p-4 col-span-2 bg-white/[0.01] border-dashed border-white/10">
              <div className="panel-label text-[9px] mb-3">Live Processing Layer: Market Context + Macro Signal</div>
              <div className="flex gap-1.5 h-1.5">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="flex-1 bg-accent/20 rounded-full animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
