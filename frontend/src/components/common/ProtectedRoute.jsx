// src/components/common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingPage } from './LoadingSpinner'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <LoadingPage message="Authenticating..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  // If children passed (wrapping Layout), render children
  // If used as wrapper only, render Outlet
  return children ? children : <Outlet />
}

export default ProtectedRoute