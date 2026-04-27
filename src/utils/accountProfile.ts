import type { AccountProfileResponse, AuthUserProfile } from '../types'
import { API_URL } from './api'
import { fetchWithSession, readResponseError } from './authFetch'

const normalizeProfile = (user?: Partial<AuthUserProfile> | null): AuthUserProfile | null => {
  const fullname = user?.fullname?.trim() || ''
  const email = user?.email?.trim() || ''
  const id = typeof user?.id === 'number' && Number.isFinite(user.id) ? user.id : undefined
  const plan = user?.plan === 'pro' ? 'pro' : 'free'
  const planExpiresAt = user?.planExpiresAt || null
  const emailVerified = Boolean(user?.emailVerified)

  if (!fullname || !email) return null

  return {
    ...(id ? { id } : {}),
    fullname,
    email,
    plan,
    ...(planExpiresAt ? { planExpiresAt } : {}),
    emailVerified
  }
}

export const fetchAccountProfile = async (): Promise<AuthUserProfile | null> => {
  const response = await fetchWithSession(`${API_URL}/api/me`)

  if (!response.ok) {
    throw new Error(await readResponseError(response, 'Gagal memuat profil akun.'))
  }

  const data = (await response.json()) as AccountProfileResponse
  return normalizeProfile(data.user)
}
