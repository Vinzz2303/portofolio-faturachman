import type { AuthUserProfile } from '../types'

const ADMIN_EMAILS = ['faturachmanalkahfi7@gmail.com']

export const isAdminEmail = (email?: string | null) =>
  Boolean(email) && ADMIN_EMAILS.includes(email?.trim().toLowerCase() ?? '')

export const hasProAccess = (user?: Pick<AuthUserProfile, 'email' | 'plan'> | null) =>
  Boolean(user) && (user?.plan === 'pro' || isAdminEmail(user?.email))
