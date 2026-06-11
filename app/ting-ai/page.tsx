import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Ting AI | Macro, Market, and Wealth Intelligence',
  description:
    'Product overview for Ting AI, a market intelligence surface focused on macro context, portfolio visibility, and AI-assisted decision support.',
  alternates: { canonical: '/ting-ai' },
}

export default function TingAiPage() {
  return <NextClientRoutePage />
}
