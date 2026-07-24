import type { Metadata } from 'next'
import NextClientApp from '../../src/NextClientApp'

const staticRoutes = [
  'forgot',
  'reset',
  'verify-email',
  'ting-ai-2',
  'decision-briefing',
  'personal-space',
  'lifeos',
  'admin/pro',
]

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return staticRoutes.map(route => ({
    slug: route.split('/'),
  }))
}

const defaultMetadata: Metadata = {
  title: 'Faturachman Alkahfi | AI Product Builder & Full Stack Developer',
  description:
    'Personal portfolio of Faturachman Alkahfi, AI Product Builder and Full Stack Developer. Explore Ting AI, full stack product systems, and modern AI-driven interfaces.',
  alternates: { canonical: '/' },
}

const routeMetadata: Record<string, Metadata> = {
  '/ting-ai': {
    title: 'Ting AI | Macro, Market, and Wealth Intelligence',
    description:
      'Product overview for Ting AI, a market intelligence surface focused on macro context, portfolio visibility, and AI-assisted decision support.',
    alternates: { canonical: '/ting-ai' },
  },
  '/ting-ai-2': {
    title: 'Ting AI 2.0 - AI Financial Intelligence Layer',
    description:
      'Ting AI 2.0 is an AI financial intelligence layer focused on market context, risk awareness, narratives, and portfolio insight before financial decisions.',
    alternates: { canonical: '/ting-ai-2' },
  },
  '/login': {
    title: 'Login | Ting AI',
    description:
      'Secure login for Ting AI users to access the Morning Command Center, portfolio workspace, and personal account surfaces.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/login' },
  },
  '/signup': {
    title: 'Create Account | Ting AI',
    description:
      'Create a Ting AI account to access the market brief, portfolio workspace, and personal decision tools.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/signup' },
  },
  '/forgot': {
    title: 'Forgot Password | Ting AI',
    description: 'Reset your Ting AI password and recover access to your account securely.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/forgot' },
  },
  '/reset': {
    title: 'Reset Password | Ting AI',
    description: 'Set a new Ting AI password to restore access to your account.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/reset' },
  },
  '/dashboard': {
    title: 'Morning Command Center | Ting AI',
    description: 'Daily cross-asset market summary, macro context, and AI-based reasoning for Ting AI members.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/dashboard' },
  },
  '/portfolio': {
    title: 'Portfolio Workspace | Ting AI',
    description: 'Track holdings, portfolio concentration, and current market value inside Ting AI.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/portfolio' },
  },
  '/profile': {
    title: 'Profile | Ting AI',
    description: 'Validated account summary for the currently active Ting AI session.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/profile' },
  },
  '/upgrade': {
    title: 'Upgrade Pro | Ting AI',
    description: 'Naik ke Ting AI Pro dengan alur manual payment untuk validasi awal.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/upgrade' },
  },
  '/explore-intelligence': {
    title: 'Explore Intelligence | Ting AI',
    description: 'Real market pulse, smart chart, and portfolio relevance without trading signals.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/explore-intelligence' },
  },
  '/komando-pagi': {
    title: 'Komando Pagi | Ting AI',
    description: 'Ringkasan harian kondisi portofolio dan arah pikiran sebelum market bergerak.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/komando-pagi' },
  },
  '/admin/pro': {
    title: 'Admin Pro | Ting AI',
    description: 'Panel admin untuk memantau request Pro, user baru, dan verifikasi manual.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/admin/pro' },
  },
  '/personal-space': {
    title: 'Personal Space | Ting AI',
    description:
      'Private Ting AI workspace that combines market brief, portfolio context, and personal operational metrics.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/personal-space' },
  },
  '/lifeos': {
    title: 'Personal Space | Ting AI',
    description:
      'Private Ting AI workspace that combines market brief, portfolio context, and personal operational metrics.',
    robots: 'noindex, nofollow',
    alternates: { canonical: '/personal-space' },
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params
  const path = `/${resolvedParams.slug.join('/')}`
  return routeMetadata[path] ?? defaultMetadata
}

export default function Page() {
  return <NextClientApp />
}
