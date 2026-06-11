import { clearAuth, getStoredToken } from './auth'

const SESSION_EXPIRED_MESSAGE = 'Session expired. Please login again.'

const createHeadersWithToken = (headers?: HeadersInit) => {
  const mergedHeaders = new Headers(headers)
  const token = getStoredToken()

  if (token) {
    mergedHeaders.set('Authorization', `Bearer ${token}`)
  }

  return mergedHeaders
}

export const getSessionExpiredMessage = () => SESSION_EXPIRED_MESSAGE

export const fetchWithSession = async (input: RequestInfo | URL, init: RequestInit = {}) => {
  const response = await fetch(input, {
    ...init,
    headers: createHeadersWithToken(init.headers)
  })

  if (response.status === 401) {
    clearAuth()
    throw new Error(SESSION_EXPIRED_MESSAGE)
  }

  return response
}

export const readResponseError = async (response: Response, fallback: string) => {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      const data = (await response.json()) as { error?: string; message?: string }
      if (data.error) return data.error
      if (data.message) return data.message
    } catch {
      // Fall back to plain text parsing.
    }
  }

  try {
    const text = await response.text()
    if (text.trim()) return text
  } catch {
    // Ignore body read errors and use fallback instead.
  }

  return fallback
}
