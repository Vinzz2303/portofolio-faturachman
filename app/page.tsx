import type { Metadata } from 'next'
import NextClientRoutePage from './_components/NextClientRoutePage'

export const metadata: Metadata = {
  title: 'Faturachman Alkahfi | AI Product Builder & Full Stack Developer',
  description:
    'Personal portfolio of Faturachman Alkahfi, AI Product Builder and Full Stack Developer. Explore Ting AI, full stack systems, and modern AI-driven interfaces.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return <NextClientRoutePage />
}

