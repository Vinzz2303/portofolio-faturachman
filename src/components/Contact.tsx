import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

const contactItems = [
  { label: "Email", value: "faturachmanalkahfi7@gmail.com", href: "mailto:faturachmanalkahfi7@gmail.com" },
  { label: "LinkedIn", value: "linkedin.com/in/faturachman-alkahfi", href: "https://linkedin.com/in/faturachman-alkahfi" },
  { label: "GitHub", value: "github.com/Vinzz2303", href: "https://github.com/Vinzz2303" },
  { label: "Portfolio", value: "faturachman.my.id", href: "https://faturachman.my.id" }
]

export default function Contact({ sectionId }: { sectionId: string }) {
  const { language } = useLanguagePreference()

  return (
    <section id={sectionId} className="py-32 relative">
      <div className="container-saas text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="panel-label mb-2">Connect</div>
          <h2 className="text-4xl font-bold mb-6 text-gradient">Let’s Build Intelligence Together</h2>
          <p className="text-lg text-white/60 mb-12">
            {language === 'en'
              ? "Open for collaboration, research discussion, internship opportunities, product feedback, and AI-related projects."
              : "Terbuka untuk kolaborasi, diskusi riset, peluang magang, feedback produk, dan proyek terkait AI."}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {contactItems.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-left hover:bg-white/[0.05] group transition-all"
              >
                <div className="panel-label text-[9px] mb-1 group-hover:text-accent transition-colors">{item.label}</div>
                <div className="text-white/80 font-mono text-sm truncate">{item.value}</div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
