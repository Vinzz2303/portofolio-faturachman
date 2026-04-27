import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import FeaturedProduct from './components/FeaturedProduct'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import LifeOS from './pages/LifeOS'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './pages/ProtectedRoute'
import Profile from './pages/Profile'
import Upgrade from './pages/Upgrade'
import AdminPro from './pages/AdminPro'
import Portfolio from './pages/Portfolio'
import TingAi from './pages/TingAi'
import TingAiTwo from './pages/TingAiTwo'
import { useDocumentMetadata } from './utils/metadata'
import { useLanguagePreference } from './utils/language'

const sections = ['hero', 'about', 'featured', 'projects', 'contact'] as const

function HomePage() {
  React.useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0

      const scrollContainers = document.querySelectorAll(
        '.app, .app-shell, .page-shell, .home-page, .main-content, main'
      )

      scrollContainers.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.scrollTop = 0
        }
      })
    }

    scrollTop()
    const frameId = window.requestAnimationFrame(scrollTop)
    const timer = window.setTimeout(scrollTop, 80)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timer)
    }
  }, [])

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const elements = document.querySelectorAll<HTMLElement>('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="home-page main-content">
      <Hero sectionId={sections[0]} />
      <About sectionId={sections[1]} />
      <FeaturedProduct sectionId={sections[2]} />
      <Projects sectionId={sections[3]} />
      <Contact sectionId={sections[4]} />
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
      default:
        return {
          title: 'Faturachman Al kahfi | Ting AI and Product Frontend',
          description:
            'Personal portfolio of Faturachman Al kahfi, frontend developer and builder of Ting AI. Explore product interfaces, modern React work, and macro-market product direction.',
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

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <RouteMetadata />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ting-ai" element={<TingAi />} />
        <Route path="/ting-ai-2" element={<TingAiTwo />} />
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
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
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </div>
  )
}
