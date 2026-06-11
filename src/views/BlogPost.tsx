import React from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { blogPosts } from '../data/posts'
import { useLanguagePreference } from '../utils/language'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { language } = useLanguagePreference()
  const isEn = language === 'en'
  
  const post = blogPosts.find(p => p.slug === slug)

  if (!post) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-[#0b0d12]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article not found</h1>
          <Link to="/blog" className="text-accent hover:underline">
            &larr; Back to blog
          </Link>
        </div>
      </div>
    )
  }

  const contentToRender = isEn ? post.contentEn : post.content

  return (
    <div className="min-h-screen pt-32 pb-24 bg-[#0b0d12]">
      <div className="container-saas max-w-3xl">
        <Link to="/blog" className="text-white/40 hover:text-white transition-colors text-sm font-mono mb-8 inline-block">
          &larr; {isEn ? 'Back to blog' : 'Kembali ke blog'}
        </Link>
        
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
              {post.category}
            </span>
            <span className="text-xs text-white/40 font-mono">
              {post.date} • {post.readTime}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
            {isEn ? post.titleEn : post.title}
          </h1>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-bold">
              FA
            </div>
            <div>
              <div className="text-sm font-bold text-white/90">Faturachman Alkahfi</div>
              <div className="text-xs text-white/40">AI Product Builder</div>
            </div>
          </div>
        </div>
        
        <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-a:text-accent hover:prose-a:text-accent/80 prose-img:rounded-xl prose-pre:bg-white/[0.03] prose-pre:border prose-pre:border-white/[0.08]">
          <ReactMarkdown>
            {contentToRender}
          </ReactMarkdown>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 glass-card hover-glow font-mono text-sm transition-colors"
          >
            &larr; {isEn ? 'Read more articles' : 'Baca artikel lainnya'}
          </Link>
        </div>
      </div>
    </div>
  )
}
