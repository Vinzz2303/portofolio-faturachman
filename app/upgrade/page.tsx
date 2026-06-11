import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Upgrade Pro | Ting AI',
  description: 'Naik ke Ting AI Pro dengan alur manual payment untuk validasi awal.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/upgrade' },
}

export default function UpgradePage() {
  return <NextClientRoutePage />
}
