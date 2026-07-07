import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import MobileBottomNav from './components/MobileBottomNav'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedProduct from './components/FeaturedProduct'
import Projects from './components/Projects'
import Footer from './components/Footer'
import Dashboard from './views/Dashboard'
import LifeOS from './views/LifeOS'
import Login from './views/Login'
import Signup from './views/Signup'
import ForgotPassword from './views/ForgotPassword'
import ResetPassword from './views/ResetPassword'
import ProtectedRoute from './views/ProtectedRoute'
import Profile from './views/Profile'
import Upgrade from './views/Upgrade'
import AdminPro from './views/AdminPro'
import Portfolio from './views/Portfolio'
import TingAi from './views/TingAi'
import TingAiTwo from './views/TingAiTwo'
import KomandoPagiPage from './views/KomandoPagiPage'
import VerifyEmail from './views/VerifyEmail'
import ExploreIntelligence from './views/ExploreIntelligence'
import Founder from './components/Founder'
import Experience from './components/Experience'
import Contact from './components/Contact'
import SystemStack from './components/SystemStack'
import SystemThinking from './components/SystemThinking'
import Philosophy from './components/Philosophy'
import BlogList from './views/BlogList'
import BlogPost from './views/BlogPost'
import { useLanguagePreference } from './utils/language'
import { useDocumentMetadata } from './utils/metadata'

const sections = ['hero', 'system-stack', 'founder', 'experience', 'featured', 'system-flow', 'projects', 'philosophy', 'contact'] as const

function HomePage() {
  React.useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
    scrollTop()
  }, [])

  return (
    <main className="home-page overflow-x-hidden">
      <div className="spotlight spotlight-1" />
      <div className="spotlight spotlight-2" />
      
      <Hero sectionId={sections[0]} />
      <SystemStack />
      <Founder />
      <Experience sectionId={sections[3]} />
      <FeaturedProduct sectionId={sections[4]} />
      <SystemThinking />
      <Projects sectionId={sections[6]} />
      <Philosophy />
      <Contact sectionId={sections[8]} />
    </main>
  )
}

function RouteMetadata() {
  const location = useLocation()
  const { language } = useLanguagePreference()

  const metadata = React.useMemo(() => {
    switch (location.pathname) {
      case '/ting-ai':
        return {
          title:
            language === 'en'
              ? 'Ting AI | Macro, Market, and Wealth Intelligence'
              : 'Ting AI | Inteligensi Makro, Pasar, dan Portofolio',
          description:
            language === 'en'
              ? 'Product overview for Ting AI, a market intelligence surface focused on macro context, portfolio visibility, and AI-assisted decision support.'
              : 'Ikhtisar produk Ting AI yang berfokus pada konteks makro, visibilitas portofolio, dan dukungan keputusan berbasis AI.',
          path: '/ting-ai'
        }
      case '/ting-ai-2':
        return {
          title: 'Ting AI 2.0 - AI Financial Intelligence Layer',
          description:
            'Ting AI 2.0 is an AI financial intelligence layer focused on market context, risk awareness, narratives, and portfolio insight before financial decisions.',
          path: '/ting-ai-2'
        }
      case '/login':
        return {
          title: 'Login | Ting AI',
          description:
            'Secure login for Ting AI users to access the Morning Command Center, portfolio workspace, and personal account surfaces.',
          path: '/login',
          robots: 'noindex, nofollow'
        }
      case '/signup':
        return {
          title: 'Create Account | Ting AI',
          description:
            'Create a Ting AI account to access the market brief, portfolio workspace, and personal decision tools.',
          path: '/signup',
          robots: 'noindex, nofollow'
        }
      case '/forgot':
        return {
          title: 'Forgot Password | Ting AI',
          description: 'Reset your Ting AI password and recover access to your account securely.',
          path: '/forgot',
          robots: 'noindex, nofollow'
        }
      case '/reset':
        return {
          title: 'Reset Password | Ting AI',
          description: 'Set a new Ting AI password to restore access to your account.',
          path: '/reset',
          robots: 'noindex, nofollow'
        }
      case '/dashboard':
        return {
          title: language === 'en' ? 'Morning Command Center | Ting AI' : 'Pusat Komando Pagi | Ting AI',
          description:
            language === 'en'
              ? 'Daily cross-asset market summary, macro context, and AI-based reasoning for Ting AI members.'
              : 'Ringkasan pasar harian lintas aset, konteks makro, dan penjelasan AI untuk pengguna Ting AI.',
          path: '/dashboard',
          robots: 'noindex, nofollow'
        }
      case '/portfolio':
        return {
          title: language === 'en' ? 'Portfolio Workspace | Ting AI' : 'Workspace Portofolio | Ting AI',
          description:
            language === 'en'
              ? 'Track holdings, portfolio concentration, and current market value inside Ting AI.'
              : 'Pantau kepemilikan, konsentrasi portofolio, dan nilai pasar terkini di dalam Ting AI.',
          path: '/portfolio',
          robots: 'noindex, nofollow'
        }
      case '/profile':
        return {
          title: language === 'en' ? 'Profile | Ting AI' : 'Profil | Ting AI',
          description:
            language === 'en'
              ? 'Validated account summary for the currently active Ting AI session.'
              : 'Ringkasan akun tervalidasi untuk sesi Ting AI yang sedang aktif.',
          path: '/profile',
          robots: 'noindex, nofollow'
        }
      case '/upgrade':
        return {
          title: 'Upgrade Pro | Ting AI',
          description: 'Naik ke Ting AI Pro dengan alur manual payment untuk validasi awal.',
          path: '/upgrade',
          robots: 'noindex, nofollow'
        }
      case '/explore-intelligence':
        return {
          title: language === 'en' ? 'Explore Intelligence | Ting AI' : 'Explore Intelligence | Ting AI',
          description: language === 'en'
            ? 'Real market pulse, smart chart, and portfolio relevance — no trading signals.'
            : 'Denyut pasar nyata, grafik cerdas, dan relevansi portofolio — tanpa sinyal trading.',
          path: '/explore-intelligence',
          robots: 'noindex, nofollow'
        }
      case '/komando-pagi':
        return {
          title: 'Komando Pagi | Ting AI',
          description: 'Ringkasan harian kondisi portofolio dan arah pikiran sebelum market bergerak.',
          path: '/komando-pagi',
          robots: 'noindex, nofollow'
        }
      case '/admin/pro':
        return {
          title: 'Admin Pro | Ting AI',
          description: 'Panel admin untuk memantau request Pro, user baru, dan verifikasi manual.',
          path: '/admin/pro',
          robots: 'noindex, nofollow'
        }
      case '/personal-space':
      case '/lifeos':
        return {
          title: language === 'en' ? 'Personal Space | Ting AI' : 'Ruang Personal | Ting AI',
          description:
            language === 'en'
              ? 'Private Ting AI workspace that combines market brief, portfolio context, and personal operational metrics.'
              : 'Workspace privat Ting AI yang menggabungkan ringkasan pasar, konteks portofolio, dan metrik operasional personal.',
          path: '/personal-space',
          robots: 'noindex, nofollow'
        }
      case '/blog':
        return {
          title: language === 'en' ? 'Blog & Insights | Faturachman Alkahfi' : 'Blog & Wawasan | Faturachman Alkahfi',
          description: language === 'en' 
            ? 'Notes on building AI products, full-stack systems, and financial abstractions.'
            : 'Catatan tentang membangun produk AI, sistem full-stack, dan abstraksi finansial.',
          path: '/blog',
          robots: 'index, follow'
        }
      default:
        const isPersonal = typeof window !== 'undefined' ? window.location.hostname === 'faturachman.my.id' : true;
        if (!isPersonal) {
          return {
            title:
              language === 'en'
                ? 'Ting AI | Macro, Market, and Wealth Intelligence'
                : 'Ting AI | Inteligensi Makro, Pasar, dan Portofolio',
            description:
              language === 'en'
                ? 'Product overview for Ting AI, a market intelligence surface focused on macro context, portfolio visibility, and AI-assisted decision support.'
                : 'Ikhtisar produk Ting AI yang berfokus pada konteks makro, visibilitas portofolio, dan dukungan keputusan berbasis AI.',
            path: '/'
          }
        }
        return {
          title: 'Faturachman Alkahfi | AI Product Builder & Full Stack Developer',
          description:
            'Personal portfolio of Faturachman Alkahfi, AI Product Builder and Full Stack Developer. Explore Ting AI, full stack product systems, and modern AI-driven interfaces.',
          path: '/'
        }
    }
  }, [language, location.pathname])

  useDocumentMetadata(metadata)

  React.useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return null
}

const STANDALONE_PATHS = ['/login', '/signup', '/forgot', '/reset', '/verify-email', '/ting-ai']

function AppShell() {
  const location = useLocation()
  
  // Domain router logic: If not on faturachman.my.id, default '/' to Ting AI Landing
  const isPersonalDomain = typeof window !== 'undefined' ? window.location.hostname === 'faturachman.my.id' : true
  const isTingAiRoot = !isPersonalDomain && location.pathname === '/'

  const isStandalone = STANDALONE_PATHS.some(p => location.pathname.startsWith(p)) || isTingAiRoot

  if (isStandalone) {
    return (
      <>
        <RouteMetadata />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/ting-ai" element={<TingAi />} />
          {isTingAiRoot && <Route path="/" element={<TingAi />} />}
        </Routes>
        <MobileBottomNav />
      </>
    )
  }

  return (
    <div className="app pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <Navbar />
      <RouteMetadata />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ting-ai-2" element={<Navigate to="/explore-intelligence" replace />} />
        <Route path="/decision-briefing" element={<Navigate to="/explore-intelligence" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/personal-space"
          element={
            <ProtectedRoute>
              <LifeOS />
            </ProtectedRoute>
          }
        />
        <Route path="/lifeos" element={<Navigate to="/personal-space" replace />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upgrade"
          element={
            <ProtectedRoute>
              <Upgrade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pro"
          element={
            <ProtectedRoute>
              <AdminPro />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore-intelligence"
          element={
            <ProtectedRoute>
              <ExploreIntelligence />
            </ProtectedRoute>
          }
        />
        <Route
          path="/morning-command"
          element={
            <ProtectedRoute>
              <KomandoPagiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/komando-pagi"
          element={
            <ProtectedRoute>
              <KomandoPagiPage />
            </ProtectedRoute>
          }
        />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}

export default function App() {
  return <AppShell />
}
