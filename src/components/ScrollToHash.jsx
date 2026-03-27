import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const id = location.hash.replace('#', '')
    const target = document.getElementById(id)
    if (!target) return

    const timer = setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)

    return () => clearTimeout(timer)
  }, [location])

  return null
}
