import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Profile | Ting AI',
  description: 'Validated account summary for the currently active Ting AI session.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/profile' },
}

export default function ProfilePage() {
  return <NextClientRoutePage />
}
