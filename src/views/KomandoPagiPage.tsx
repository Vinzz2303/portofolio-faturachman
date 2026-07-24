/**
 * KomandoPagiPage.tsx
 * Route page for /komando-pagi.
 * Wraps the KomandoPagi component with greeting + quick nav.
 * All copy via morningCommandI18n — zero hardcoded strings.
 */

import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import KomandoPagi from '../components/KomandoPagi'
import { useAuthSession } from '../utils/useAuthSession'
import { useLanguagePreference } from '../utils/language'
import { getGreeting, getMorningCommandCopy } from '../utils/morningCommandI18n'
import MulaiDariSiniCard from '../components/MulaiDariSiniCard'
export default function KomandoPagiPage() {
  const navigate = useNavigate()
  const { user } = useAuthSession()
  const { language } = useLanguagePreference()

  const userPlan = useMemo(() => {
    try { return localStorage.getItem('lifeOS_user_plan') || 'free' }
    catch { return 'free' }
  }, [])

  const copy = useMemo(() => getMorningCommandCopy(language), [language])
  const name = user?.fullname?.split(' ')[0] || ''
  const greeting = useMemo(() => getGreeting(language, name), [language, name])

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(20,184,166,0.06) 0%, transparent 60%), #080a0f',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Ambient grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-2xl mx-auto px-4 pt-28 pb-10 space-y-6">

        {/* Greeting */}
        <div className="space-y-0.5 animate-in fade-in duration-500">
          <p className="label-uppercase text-[10px]">{copy.subtitle}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{greeting}</h1>
        </div>

        {/* Komando Pagi briefing */}
        <KomandoPagi userPlan={userPlan} />

        {/* Quick links — compact */}
        <div className="flex flex-wrap gap-2 animate-in fade-in duration-700 pt-2" style={{ animationDelay: '200ms' }}>
          {[
            { to: '/portfolio', label: copy.ctaViewPortfolio },
            { to: '/explore-intelligence', label: copy.ctaExploreIntelligence },
            { to: '/ting-ai', label: copy.ctaTingAi },
          ].map(link => (
            <button
              key={link.to}
              type="button"
              onClick={() => navigate(link.to)}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.06] text-slate-500 hover:text-slate-300 hover:border-white/[0.12] transition-all"
            >
              {link.label} →
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
