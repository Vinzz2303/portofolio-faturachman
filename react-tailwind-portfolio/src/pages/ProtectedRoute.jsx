import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const STORAGE_KEY = 'lux-auth';

export const isAuthenticated = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (err) {
    return false;
  }
};

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;
