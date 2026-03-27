import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const STORAGE_KEY = 'lifeos-auth'

const getTokenExpiry = token => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return 0
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : 0
  } catch (err) {
    return 0
  }
}

const clearAuth = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem('lifeOS_user')
    window.localStorage.removeItem('lifeOS_token')
    window.dispatchEvent(new Event('lifeos-auth'))
  } catch (err) {
    // ignore
  }
}

export const isAuthenticated = () => {
  try {
    const token = window.localStorage.getItem('lifeOS_token') || ''
    const isFlagged = window.localStorage.getItem(STORAGE_KEY) === 'true'
    const user = window.localStorage.getItem('lifeOS_user')
    if (!isFlagged || !user || !token) {
      clearAuth()
      return false
    }
    const expiry = getTokenExpiry(token)
    if (!expiry || Date.now() >= expiry) {
      clearAuth()
      return false
    }
    return true
  } catch (err) {
    clearAuth()
    return false
  }
}

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
