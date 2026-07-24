import type { Metadata, Viewport } from 'next'
import '../src/styles.css'
import '../src/styles-portfolio-modern-patch.css'
import '../src/premium-dashboard.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://faturachman.my.id'),
  title: 'Faturachman Alkahfi | AI Specialist & Full-Stack Architect Indonesia',
  description:
    'Portfolio of Faturachman Alkahfi, an AI Specialist and Full-Stack Architect based in Indonesia. Specializing in real AI systems, LLM orchestration, and production-ready architectures.',
  keywords: ['AI Specialist Indonesia', 'AI Engineer Jakarta', 'Full-Stack Architect', 'Next.js Developer Indonesia', 'LLM Integration', 'AI Product Builder'],
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Faturachman Alkahfi | AI Specialist & Full-Stack Architect',
    description:
      'Portfolio of Faturachman Alkahfi, an AI Specialist and Full-Stack Architect based in Indonesia. Building intelligence layers and production-ready AI architectures.',
    type: 'website',
    url: '/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Faturachman Alkahfi - AI Specialist Indonesia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faturachman Alkahfi | AI Specialist & Full-Stack Architect',
    description:
      'Portfolio of Faturachman Alkahfi, an AI Specialist and Full-Stack Architect based in Indonesia. Building intelligence layers and production-ready AI architectures.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'nhtyf6PgK8NlsVFvHOK1pLbv4964RGe7lrBH8KD6dlY',
  },
  other: {
    'dicoding:email': 'faturachmanalkahfi7@gmail.com',
    'geo.region': 'ID-JK',
    'geo.placename': 'Jakarta, Indonesia',
    'geo.position': '-6.2088;106.8456',
    'ICBM': '-6.2088, 106.8456'
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
  jobTitle: 'AI Specialist & Full-Stack Architect',
  url: 'https://faturachman.my.id/',
  description:
    'Faturachman Alkahfi is an AI Specialist and Full-Stack Architect based in Indonesia, specializing in building intelligence layers, real LLM orchestration, and production-ready full-stack architectures.',
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'Universitas Multimedia Nusantara',
  },
  knowsAbout: [
    'Artificial Intelligence Architecture',
    'LLM Orchestration',
    'Model Context Protocol',
    'React',
    'TypeScript',
    'FastAPI',
    'Full Stack Web Development',
    'PostgreSQL',
    'Cloud Architecture'
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
