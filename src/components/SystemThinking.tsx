import React from 'react'
import { motion } from 'framer-motion'

const steps = [
  "User Input", 
  "Data Layer", 
  "Cara Ting AI membaca data", 
  "Analisis risiko", 
  "Kesimpulan untuk kamu"
]

export default function SystemThinking() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container-saas text-center">
        <div className="panel-label mb-2 text-accent">Process Architecture</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-20 text-gradient">System Intelligence Flow</h2>

        <div className="md:hidden mt-8 text-left">
          <details className="group border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden">
            <summary className="p-4 text-sm font-medium text-white cursor-pointer hover:bg-white/[0.04] transition-colors list-none flex justify-between items-center">
              <span>Lihat penjelasan lengkap (System Flow)</span>
              <span className="text-white/40 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-4 pt-0 flex flex-col gap-3">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-dark text-[10px] text-white/50 font-sans border border-white/10 rounded">0{i+1}</div>
                  <span className="text-xs text-white/70 font-mono">{step}</span>
                </div>
              ))}
            </div>
          </details>
        </div>

        <div className="hidden md:flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-4 mt-12">
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="glass-card px-8 py-5 font-mono text-sm border-white/10 hover:border-accent/30 transition-colors relative group will-change-transform"
              >
                <div className="absolute -top-3 left-4 px-2 bg-dark text-[10px] text-white/30 font-sans border border-white/5">0{i+1}</div>
                {step}
              </motion.div>
              {i < steps.length - 1 && (
                <motion.div 
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 0.3 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.12 + 0.3 }}
                  className="hidden lg:block w-12 h-px bg-gradient-to-r from-accent/50 to-transparent origin-left"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
