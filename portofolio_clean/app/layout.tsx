import type { Metadata, Viewport } from 'next'
import '../src/styles.css'
import '../src/styles-portfolio-modern-patch.css'
import '../src/premium-dashboard.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://faturachman.my.id'),
  title: 'Faturachman Alkahfi | AI Product Builder & Full Stack Developer',
  description:
    'Personal portfolio of Faturachman Alkahfi, AI Product Builder and Full Stack Developer. Explore Ting AI, full stack systems, and modern AI-driven interfaces.',
  robots: 'index, follow',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Faturachman Alkahfi | AI Product Builder & Full Stack Developer',
    description:
      'Personal portfolio of Faturachman Alkahfi, AI Product Builder and Full Stack Developer. Explore Ting AI, full stack systems, and modern AI-driven interfaces.',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Faturachman Alkahfi and Ting AI site preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faturachman Alkahfi | AI Product Builder & Full Stack Developer',
    description:
      'Personal portfolio of Faturachman Alkahfi, AI Product Builder and Full Stack Developer. Explore Ting AI, full stack systems, and modern AI-driven interfaces.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'nhtyf6PgK8NlsVFvHOK1pLbv4964RGe7lrBH8KD6dlY',
  },
  other: {
    'dicoding:email': 'faturachmanalkahfi7@gmail.com',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0d12',
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Faturachman Alkahfi',
  jobTitle: 'AI Product Builder & Full Stack Developer',
  url: 'https://faturachman.my.id/',
  description:
    'Faturachman Alkahfi is an AI Product Builder and Full Stack Developer based in Indonesia, specializing in building intelligence layers for decision support, full-stack systems, and open-source contributions.',
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'Universitas Multimedia Nusantara',
  },
  knowsAbout: [
    'React',
    'TypeScript',
    'FastAPI',
    'Python',
    'Artificial Intelligence',
    'Model Context Protocol',
    'PCB Design',
    'Full Stack Web Development',
  ],
  sameAs: [
    'https://github.com/Vinzz2303',
    'https://www.linkedin.com/in/faturachman-al-kahfi-662283304/',
    'https://instagram.com/alvinstzy',
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Faturachman Alkahfi - Portfolio & Ting AI',
  url: 'https://faturachman.my.id/',
  inLanguage: 'en',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
