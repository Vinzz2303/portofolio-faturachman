import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
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
