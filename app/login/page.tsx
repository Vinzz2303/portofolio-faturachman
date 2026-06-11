import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Login | Ting AI',
  description: 'Secure login for Ting AI users to access the Morning Command Center, portfolio workspace, and personal account surfaces.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/login' },
}

export default function LoginPage() {
  return <NextClientRoutePage />
}
