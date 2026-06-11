import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Morning Command Center | Ting AI',
  description: 'Daily cross-asset market summary, macro context, and AI-based reasoning for Ting AI members.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/dashboard' },
}

export default function DashboardPage() {
  return <NextClientRoutePage />
}
