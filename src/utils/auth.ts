import { API_URL } from './api'
import type { AuthSessionResponse, AuthUserProfile } from '../types'

const AUTH_EVENT = 'lifeos-auth'
const TOKEN_KEY = 'lifeOS_token'
// Display cache only. Backend session remains the source of truth for identity.
const USER_KEY = 'lifeOS_user'
const USER_EMAIL_KEY = 'lifeOS_user_email'
const USER_PLAN_KEY = 'lifeOS_user_plan'
const AUTH_KEY = 'lifeos-auth'

const normalizeProfile = (user?: Partial<AuthUserProfile> | null): AuthUserProfile | null => {
  const fullname = user?.fullname?.trim() || ''
  const email = user?.email?.trim() || ''
  const id = typeof user?.id === 'number' && Number.isFinite(user.id) ? user.id : undefined
  const plan = user?.plan === 'pro' ? 'pro' : 'free'
  const planExpiresAt = user?.planExpiresAt || null

  if (!fullname || !email) return null

  return {
    ...(id ? { id } : {}),
    fullname,
    email,
    plan,
    ...(planExpiresAt ? { planExpiresAt } : {})
  }
}

const dispatchAuthEvent = () => {
  window.dispatchEvent(new Event(AUTH_EVENT))
}

export const getStoredToken = () => window.localStorage.getItem(TOKEN_KEY)?.trim() || ''

export const getStoredProfile = (): AuthUserProfile | null =>
  normalizeProfile({
    fullname: window.localStorage.getItem(USER_KEY) || '',
    email: window.localStorage.getItem(USER_EMAIL_KEY) || '',
    plan: window.localStorage.getItem(USER_PLAN_KEY) === 'pro' ? 'pro' : 'free'
  })

export const persistAuthSession = (
  token: string,
  user?: Partial<AuthUserProfile> | null,
  notify = true
) => {
  const profile = normalizeProfile(user)

  window.localStorage.setItem(AUTH_KEY, 'true')
  window.localStorage.setItem(TOKEN_KEY, token.trim())

  if (profile) {
    window.localStorage.setItem(USER_KEY, profile.fullname)
    window.localStorage.setItem(USER_EMAIL_KEY, profile.email)
    window.localStorage.setItem(USER_PLAN_KEY, profile.plan || 'free')
  } else {
    window.localStorage.removeItem(USER_KEY)
    window.localStorage.removeItem(USER_EMAIL_KEY)
    window.localStorage.removeItem(USER_PLAN_KEY)
  }

  if (notify) {
    dispatchAuthEvent()
  }
}

export const clearAuth = () => {
  window.localStorage.removeItem(AUTH_KEY)
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(USER_KEY)
  window.localStorage.removeItem(USER_EMAIL_KEY)
  window.localStorage.removeItem(USER_PLAN_KEY)
  dispatchAuthEvent()
}

export const getAuthStatus = () => ({
  valid: Boolean(getStoredToken())
})

export const fetchAuthSession = async (signal?: AbortSignal): Promise<AuthUserProfile | null> => {
  const token = getStoredToken()
  if (!token) return null

  const response = await fetch(`${API_URL}/api/auth/session`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    signal
  })

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth()
      return null
    }

    throw new Error((await response.text()) || 'Failed to validate session')
  }

  const data = (await response.json()) as AuthSessionResponse
  const profile = normalizeProfile(data.user)

  if (!profile) {
    clearAuth()
    return null
  }

  persistAuthSession(token, profile, false)
  return profile
}

export const authEventName = AUTH_EVENT
