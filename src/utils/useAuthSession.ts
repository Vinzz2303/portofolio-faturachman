import { useEffect, useState } from 'react'
import type { AuthUserProfile } from '../types'
import { authEventName, fetchAuthSession, getStoredToken, getStoredProfile } from './auth'

type AuthSessionState = {
  loading: boolean
  authenticated: boolean
  user: AuthUserProfile | null
}

const initialState = (): AuthSessionState => {
  const token = getStoredToken()
  const user = getStoredProfile()

  return {
    loading: Boolean(token) && !user,
    authenticated: Boolean(user),
    user
  }
}

export const useAuthSession = () => {
  const [state, setState] = useState<AuthSessionState>(initialState)

  useEffect(() => {
    let active = true
    let controller: AbortController | null = null

    const syncAuth = async () => {
      controller?.abort()
      controller = new AbortController()

      const token = getStoredToken()
      if (!token) {
        if (!active) return
        setState({
          loading: false,
          authenticated: false,
          user: null
        })
        return
      }

      if (!active) return
      setState((prev) => ({
        loading: true,
        authenticated: prev.authenticated,
        user: prev.user
      }))

      try {
        const user = await fetchAuthSession(controller.signal)
        if (!active) return

        setState({
          loading: false,
          authenticated: Boolean(user),
          user
        })
      } catch (err: any) {
        if (!active) return
        if (err?.name === 'AbortError') return

        setState({
          loading: false,
          authenticated: false,
          user: null
        })
      }
    }

    void syncAuth()

    const handleStorage = () => {
      void syncAuth()
    }

    window.addEventListener(authEventName, handleStorage)
    window.addEventListener('storage', handleStorage)

    return () => {
      active = false
      controller?.abort()
      window.removeEventListener(authEventName, handleStorage)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  return state
}
