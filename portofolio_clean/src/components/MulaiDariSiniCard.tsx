import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Target, Shield, MessageSquare } from 'lucide-react'

export default function MulaiDariSiniCard() {
  return (
    <div className="md:hidden mb-6 bg-[#161b22] border border-white/10 rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-2">Mulai dari sini</h3>
      <p className="text-sm text-white/70 mb-5 leading-relaxed">
        Ting AI bantu kamu memahami market, risiko portofolio, dan hal yang perlu dipantau — bukan memberi sinyal beli/jual.
      </p>
      
      <div className="space-y-3">
        <Link 
          to="/komando-pagi"
          className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-3.5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-white/90">Cek kondisi hari ini</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40" />
        </Link>
        
        <Link 
          to="/portfolio"
          className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-3.5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-white/90">Cek risiko portofolio</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40" />
        </Link>
        
        <Link 
          to="/ting-ai"
          className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg p-3.5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-white/90">Tanya Ting AI</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40" />
        </Link>
      </div>
    </div>
  )
}
