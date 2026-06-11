import type { Metadata } from 'next'
import NextClientRoutePage from '../_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Komando Pagi | Ting AI',
  description: 'Ringkasan harian kondisi portofolio dan arah pikiran sebelum market bergerak.',
  robots: 'noindex, nofollow',
  alternates: { canonical: '/komando-pagi' },
}

export default function KomandoPagiPage() {
  return <NextClientRoutePage />
}
