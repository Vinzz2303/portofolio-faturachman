import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Explore Intelligence | Ting AI',
  description: 'Real market pulse, smart chart, and portfolio relevance without trading signals.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/explore-intelligence' },
}

export default function ExploreIntelligencePage() {
  return <NextClientRoutePage />
}
