import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const STORAGE_KEY = 'lifeos-auth'

export const isAuthenticated = () => {
  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) === 'true' &&
      Boolean(window.localStorage.getItem('lifeOS_user')) &&
      Boolean(window.localStorage.getItem('lifeOS_token'))
    )
  } catch (err) {
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
