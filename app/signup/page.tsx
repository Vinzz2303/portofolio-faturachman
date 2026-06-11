import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Create Account | Ting AI',
  description: 'Create a Ting AI account to access the market brief, portfolio workspace, and personal decision tools.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/signup' },
}

export default function SignupPage() {
  return <NextClientRoutePage />
}
