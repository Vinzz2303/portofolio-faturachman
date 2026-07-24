import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

export default function Philosophy() {
  const { language } = useLanguagePreference()

  return (
    <section className="py-32 bg-accent/[0.02]">
      <div className="container-saas text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div className="text-accent mb-8">
            <svg className="w-12 h-12 mx-auto opacity-40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H10.017C8.91243 16 8.017 16.8954 8.017 18V21H14.017ZM20 11.5C20 12.8807 18.8807 14 17.5 14H6.5C5.11929 14 4 12.8807 4 11.5V9C4 7.61929 5.11929 6.5 6.5 6.5H17.5C18.8807 6.5 20 7.61929 20 9V11.5ZM17.5 8H6.5C5.94772 8 5.5 8.44772 5.5 9V11.5C5.5 12.0523 5.94772 12.5 6.5 12.5H17.5C18.0523 12.5 18.5 12.0523 18.5 11.5V9C18.5 8.44772 18.0523 8 17.5 8Z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-5xl font-light italic text-white/80 max-w-4xl mx-auto leading-tight">
            {language === 'en'
              ? '"AI should not replace thinking, but enhance decision clarity."'
              : '"AI seharusnya tidak menggantikan pemikiran, tetapi meningkatkan kejelasan keputusan."'}
          </h2>
        </motion.div>
      </div>
    </section>
  )
}
