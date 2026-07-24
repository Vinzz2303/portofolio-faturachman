'use client'

import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ScrollToTop from './components/ScrollToTop'

export default function NextClientApp() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  )
}
