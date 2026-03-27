import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import AiChat from './components/AiChat'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollToHash from './components/ScrollToHash'
import Dashboard from './pages/Dashboard'
import LifeOS from './pages/LifeOS'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './pages/ProtectedRoute'

const sections = [
  'hero',
  'about',
  'projects',
  'ai',
  'contact'
]

function HomePage() {
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const elements = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      entries => {
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
    <main>
      <Hero sectionId={sections[0]} />
      <About sectionId={sections[1]} />
      <Projects sectionId={sections[2]} />
      <AiChat sectionId={sections[3]} />
      <Contact sectionId={sections[4]} />
    </main>
  )
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lifeos"
          element={
            <ProtectedRoute>
              <LifeOS />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Footer />
    </div>
  )
}
