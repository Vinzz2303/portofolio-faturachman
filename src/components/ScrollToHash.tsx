import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToHash() {
  const location = useLocation()
  const first = useRef(true)

  useEffect(() => {
    // ensure manual restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Remove default #about on first load to avoid auto-jump
    if (window.location.hash === '#about') {
      window.history.replaceState(null, '', window.location.pathname)
    }

    // always start at top on mount
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // skip first run to avoid automatic hash scroll on mount
    if (first.current) {
      first.current = false
      return
    }

    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      return
    }

    const id = location.hash.replace('#', '')
    const timer = window.setTimeout(() => {
      const target = document.getElementById(id)
      if (!target) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
        return
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)

    return () => window.clearTimeout(timer)
  }, [location.pathname, location.hash, location.search])

  return null
}
