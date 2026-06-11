import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

const highlights = [
  "AI Product Builder",
  "Full Stack Developer",
  "Open Source Contributor",
  "React + FastAPI",
  "TypeScript · Python",
  "Retail Intelligence Systems"
]

export default function Founder() {
  const { language } = useLanguagePreference()

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container-saas">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="panel-label mb-2">Founder & AI Developer</div>
            <h2 className="text-4xl font-bold mb-6 text-gradient">Faturachman Alkahfi</h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              {language === 'en'
                ? "I'm a Full Stack developer and AI product builder focused on systems that help people think deeper before deciding. I build with React, TypeScript, FastAPI, and multi-model AI workflows — from product interfaces to open source contributions across PCB design, MCP platforms, and financial intelligence."
                : "Saya adalah pengembang Full Stack dan AI product builder yang fokus membangun sistem yang membantu orang berpikir lebih dalam sebelum memutuskan. Saya membangun dengan React, TypeScript, FastAPI, dan AI workflow multi-model — dari antarmuka produk hingga kontribusi open source di PCB design, platform MCP, dan kecerdasan finansial."}
            </p>
            <div className="flex flex-wrap gap-3">
              {highlights.map((item, i) => (
                <span key={item} className="px-4 py-1.5 glass-card text-xs font-mono text-accent/80 border-accent/10">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="glass-card aspect-square max-w-md mx-auto overflow-hidden group">
              <img 
                src="/profile.png" 
                alt="Faturachman Alkahfi" 
                className="w-100 h-100 object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-60" />
              <div className="absolute bottom-6 left-6 right-6">
                 <div className="panel-label text-accent text-[9px] mb-1">SYSTEM_ACCESS: FOUNDER</div>
                 <div className="h-0.5 w-12 bg-accent/40" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
