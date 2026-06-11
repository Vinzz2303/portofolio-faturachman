import React, { useState } from 'react'
import { useLanguagePreference } from '../../utils/language'
import { getTingAiI18n } from '../../utils/tingAiI18n'
import { validatePortfolioAllocation } from '../../utils/portfolioValidation'

interface Props {
  onAnalyze: (input: string) => void
  loading: boolean
  isPro?: boolean
}

const EXAMPLES = [
  'BBCA 40%, BBRI 30%, TLKM 30%',
  'BMRI 30%, ASII 20%, ADRO 20%, ICBP 30%',
  'GOTO 50%, TLKM 50%',
]

export default function HeroInput({ onAnalyze, loading, isPro = false }: Props) {
  const [value, setValue] = useState('')
  const [validationError, setValidationError] = useState<string | undefined>(undefined)
  const { language } = useLanguagePreference()
  const t = getTingAiI18n(language)

  const submit = () => {
    const clean = value.trim()
    if (!clean) return

    // Validate portfolio allocation
    const validation = validatePortfolioAllocation(clean)
    if (!validation.isValid) {
      setValidationError(validation.error)
      return
    }

    // Clear any previous errors and proceed
    setValidationError(undefined)
    onAnalyze(clean)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    // Clear error when user starts typing again
    if (validationError) {
      setValidationError(undefined)
    }
  }

  const errorMessage = validationError === 'negative' ? t.portfolioInputNegativeError : undefined

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, fontFamily: "'SF Mono', 'Fira Mono', 'JetBrains Mono', monospace" }}>B</span>
        </div>
        <span style={{ fontFamily: "'SF Mono', 'Fira Mono', 'JetBrains Mono', monospace", fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ffffff' }}>
          {t.portfolioInputLabel}
        </span>
      </div>

      {/* Input Area */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-[22px] bg-gradient-to-b from-white/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className={`relative bg-[#0f1116] border rounded-3xl p-2 shadow-2xl transition-all duration-300 ${errorMessage ? 'border-red-500/50' : 'border-white/10 group-focus-within:border-white/20 group-focus-within:shadow-teal-500/5'}`}>
          <textarea
            value={value}
            onChange={handleInputChange}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
            placeholder={language === 'id' ? 'Contoh: ANTM 50%, BBCA 30%, AAPL 20%' : 'Example: ANTM 50%, BBCA 30%, AAPL 20%'}
            rows={1}
            className="w-full bg-transparent border-none px-6 py-5 text-white placeholder:text-slate-600 font-medium text-lg resize-none focus:outline-none transition-colors leading-tight overflow-hidden"
            style={{ minHeight: '64px' }}
          />
          
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex gap-1.5 pl-4">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setValue(ex)
                    setValidationError(undefined)
                  }}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-slate-500 hover:text-teal-400 hover:bg-teal-400/5 hover:border-teal-400/20 transition-all"
                >
                  {language === 'id' ? 'Opsi' : 'Option'} {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={submit}
              disabled={loading || !value.trim()}
              className="premium-button px-6 py-3 bg-white text-black font-semibold rounded-2xl disabled:opacity-20 hover:bg-teal-400 transition-all min-w-[140px] text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {language === 'id' ? 'Proses' : 'Processing'}
                </span>
              ) : (language === 'id' ? 'Analisis Portofolio' : 'Analyze Portfolio')}
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          fontSize: 12,
          color: '#fca5a5',
          lineHeight: 1.5,
        }}>
          {errorMessage}
        </div>
      )}

      {/* Helper text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', lineHeight: 1.5, fontFamily: "'SF Mono', 'Fira Mono', 'JetBrains Mono', monospace" }}>
          {t.portfolioInputHelper}
        </p>
        <p style={{ margin: 0, fontSize: 10, color: '#64748b', lineHeight: 1.5, fontFamily: "'SF Mono', 'Fira Mono', 'JetBrains Mono', monospace" }}>
          {t.portfolioInputHelperDetail}
        </p>
      </div>

      <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
        {language === 'id' ? 'Tekan' : 'Press'} <kbd className="bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Ctrl + Enter</kbd> {language === 'id' ? 'untuk menganalisis cepat' : 'for quick analysis'}
      </p>
    </div>
  )
}
