import React from 'react'
import { motion } from 'framer-motion'
import { useLanguagePreference } from '../utils/language'

export default function SystemStack() {
  const { language } = useLanguagePreference()
  const isEn = language === 'en'

  return (
    <section className="py-24 relative overflow-hidden bg-[#0d1117] border-y border-[#30363d]">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-[#8b949e]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
            </svg>
            <span className="text-sm font-semibold text-[#c9d1d9]">faturachman / stack</span>
            <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e] text-[10px] font-medium">Public</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#c9d1d9] tracking-tight">
            {isEn ? 'Tech Stack & Capabilities' : 'Tech Stack & Keahlian'}
          </h2>
          <p className="text-sm text-[#8b949e] mt-3 max-w-lg leading-relaxed">
            {isEn
              ? 'Core technologies I use to build scalable products and AI systems.'
              : 'Teknologi utama yang saya gunakan untuk membangun produk berskala besar dan sistem AI.'}
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border border-[#30363d] rounded-xl bg-[#0d1117] overflow-hidden shadow-2xl"
        >
          {/* IDE Header */}
          <div className="bg-[#161b22] px-4 py-3 border-b border-[#30363d] flex items-center gap-3">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
               <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
               <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
             </div>
             <div className="flex-1 text-center text-xs font-mono text-[#8b949e] mr-12 flex justify-center items-center gap-2">
               <svg className="w-4 h-4 text-[#8b949e]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
               package.json
             </div>
          </div>
          
          {/* Code Body */}
          <div className="p-4 md:p-6 overflow-x-auto text-xs md:text-sm font-mono leading-[1.6] text-[#c9d1d9] selection:bg-[#1f6feb] selection:text-white">
            <pre className="!bg-transparent !p-0 !m-0">
              <code>
                <span className="text-[#8b949e]">{"{"}</span>{'\n'}
                <span className="text-[#79c0ff]">  "name"</span>: <span className="text-[#a5d6ff]">"faturachman-stack"</span>,{'\n'}
                <span className="text-[#79c0ff]">  "version"</span>: <span className="text-[#a5d6ff]">"2.0.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">  "role"</span>: <span className="text-[#a5d6ff]">"Full Stack AI Developer"</span>,{'\n'}
                <span className="text-[#79c0ff]">  "dependencies"</span>: <span className="text-[#8b949e]">{"{"}</span>{'\n'}
                <span className="text-[#8b949e] italic">    // 1. Frontend & Interfaces</span>{'\n'}
                <span className="text-[#79c0ff]">    "react"</span>: <span className="text-[#a5d6ff]">"^18.2.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "next.js"</span>: <span className="text-[#a5d6ff]">"^15.0.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "typescript"</span>: <span className="text-[#a5d6ff]">"^5.0.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "tailwind-css"</span>: <span className="text-[#a5d6ff]">"^3.4.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "framer-motion"</span>: <span className="text-[#a5d6ff]">"^12.0.0"</span>,{'\n'}
                {'\n'}
                <span className="text-[#8b949e] italic">    // 2. Backend & AI Layer</span>{'\n'}
                <span className="text-[#79c0ff]">    "python"</span>: <span className="text-[#a5d6ff]">"^3.11.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "fastapi"</span>: <span className="text-[#a5d6ff]">"^0.100.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "node.js"</span>: <span className="text-[#a5d6ff]">"^20.0.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "gemini-pro"</span>: <span className="text-[#a5d6ff]">"latest"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "langchain"</span>: <span className="text-[#a5d6ff]">"latest"</span>,{'\n'}
                {'\n'}
                <span className="text-[#8b949e] italic">    // 3. Database & Infrastructure</span>{'\n'}
                <span className="text-[#79c0ff]">    "postgresql"</span>: <span className="text-[#a5d6ff]">"^15.0.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "redis"</span>: <span className="text-[#a5d6ff]">"^7.0.0"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "github-actions-ci"</span>: <span className="text-[#a5d6ff]">"latest"</span>,{'\n'}
                <span className="text-[#79c0ff]">    "linux-pm2"</span>: <span className="text-[#a5d6ff]">"stable"</span>{'\n'}
                <span className="text-[#8b949e]">  {"}"}</span>{'\n'}
                <span className="text-[#8b949e]">{"}"}</span>
              </code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
