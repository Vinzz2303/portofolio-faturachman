import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blogPosts } from '../data/posts'
import { useLanguagePreference } from '../utils/language'

export default function BlogList() {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0b0d12]">
      <div className="container-saas">
        <div className="mb-16">
          <div className="panel-label mb-2 text-accent">
            {isEn ? 'Thoughts & Insights' : 'Pemikiran & Wawasan'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            {isEn ? 'Engineering Blog' : 'Blog Engineering'}
          </h1>
          <p className="text-white/50 max-w-2xl text-lg">
            {isEn 
              ? 'Notes on building AI products, full-stack systems, and financial abstractions.'
              : 'Catatan tentang membangun produk AI, sistem full-stack, dan abstraksi finansial.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                to={`/blog/${post.slug}`}
                className="glass-card p-8 flex flex-col h-full hover-glow group transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <span className="text-xs text-white/30 font-mono">
                    {post.date}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                  {isEn ? post.titleEn : post.title}
                </h2>
                
                <p className="text-white/50 mb-6 flex-grow">
                  {isEn ? post.excerptEn : post.excerpt}
                </p>
                
                <div className="flex items-center text-sm font-mono text-white/40 group-hover:text-white/80 transition-colors">
                  {isEn ? 'Read article' : 'Baca artikel'} &rarr;
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
