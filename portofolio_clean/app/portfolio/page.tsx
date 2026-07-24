import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Portfolio Workspace | Ting AI',
  description: 'Track holdings, portfolio concentration, and current market value inside Ting AI.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/portfolio' },
}

export default function PortfolioPage() {
  return <NextClientRoutePage />
}
