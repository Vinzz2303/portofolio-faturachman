import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { ProtectedRouteProps } from '../types'

const STORAGE_KEY = 'lifeos-auth'

type JwtPayload = {
  exp?: number
}

type AuthStatus = {
  valid: boolean
}

const getTokenExpiry = (token: string) => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return 0

    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    ) as JwtPayload

    if (typeof decoded.exp === 'number') {
      return decoded.exp * 1000
    }

    return 0
  } catch (error) {
    console.error('Error decoding token:', error)
    return 0
  }
}

export const clearAuth = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem('lifeOS_user')
    window.localStorage.removeItem('lifeOS_token')
    window.dispatchEvent(new Event('lifeos-auth'))
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}

export const getAuthStatus = (): AuthStatus => {
  try {
    const token = window.localStorage.getItem('lifeOS_token')
    const user = window.localStorage.getItem('lifeOS_user')

    if (!token || !user) {
      return { valid: false }
    }

    const expiry = getTokenExpiry(token)
    if (Date.now() >= expiry) {
      return { valid: false }
    }

    return { valid: true }
  } catch (error) {
    console.error('Error in getAuthStatus:', error)
    return { valid: false }
  }
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()
  const { valid } = getAuthStatus()

  if (!valid) {
    clearAuth()
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
