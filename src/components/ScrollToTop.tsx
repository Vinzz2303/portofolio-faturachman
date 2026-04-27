import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    scrollTop()
    const frameId = window.requestAnimationFrame(scrollTop)
    const timer = window.setTimeout(scrollTop, 50)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timer)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (location.pathname === '/') return
    if (!location.hash) return

    const id = location.hash.replace('#', '')
    const el = document.getElementById(id)

    if (!el) return

    const frameId = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
    })
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
    }, 50)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(timer)
    }
  }, [location.hash])

  return null
}
