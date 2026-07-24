import type { AuthUserProfile } from '../types'

const ADMIN_EMAILS = ['faturachmanalkahfi7@gmail.com']

export const isAdminEmail = (email?: string | null) =>
  Boolean(email) && ADMIN_EMAILS.includes(email?.trim().toLowerCase() ?? '')

const hasFutureDate = (value?: string | null) => {
  if (!value) return false
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) && timestamp > Date.now()
}

export const hasProAccess = (user?: Partial<AuthUserProfile> | null) => {
  if (!user) return false

  return (
    user.isPro === true ||
    user.is_pro === true ||
    String(user.plan || '').toLowerCase() === 'pro' ||
    String(user.subscriptionStatus || user.subscription_status || '').toLowerCase() === 'active' ||
    hasFutureDate(user.proUntil || user.pro_until || user.planExpiresAt) ||
    isAdminEmail(user.email)
  )
}
