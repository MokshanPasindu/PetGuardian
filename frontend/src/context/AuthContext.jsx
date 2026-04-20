// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // ✅ Role-based redirect helper
  const redirectBasedOnRole = useCallback((role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin-dashboard')
        break
      case 'VET':
        navigate('/vet-dashboard')
        break
      case 'OWNER':
      default:
        navigate('/dashboard')
        break
    }
  }, [navigate])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      
      // Store tokens
      localStorage.setItem('token', response.token)
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }
      
      // Set user state
      setUser(response.user)
      setIsAuthenticated(true)
      
      // Show welcome message with role
      const roleLabel = {
        ADMIN: 'Admin',
        VET: 'Dr.',
        OWNER: ''
      }[response.user.role] || ''
      
      toast.success(`Welcome back, ${roleLabel} ${response.user.firstName}!`)
      
      // ✅ Redirect based on role
      redirectBasedOnRole(response.user.role)
      
      return response
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)
      
      // Store tokens
      localStorage.setItem('token', response.token)
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }
      
      // Set user state
      setUser(response.user)
      setIsAuthenticated(true)
      
      toast.success('Account created successfully!')
      
      // ✅ Redirect based on role
      redirectBasedOnRole(response.user.role)
      
      return response
    } catch (error) {
      console.error('Register error:', error)
      toast.error(error.message || 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Logged out successfully')
    navigate('/')
  }, [navigate])

  const updateProfile = async (data) => {
    try {
      const updatedUser = await authService.updateProfile(data)
      setUser(updatedUser)
      toast.success('Profile updated successfully!')
      return updatedUser
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
      throw error
    }
  }

  // ✅ Role checking helpers
  const hasRole = useCallback((requiredRole) => {
    if (!user) return false
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role)
    }
    return user.role === requiredRole
  }, [user])

  const isAdmin = useCallback(() => {
    return user?.role === 'ADMIN'
  }, [user])

  const isVet = useCallback(() => {
    return user?.role === 'VET' || user?.role === 'ADMIN'
  }, [user])

  const isOwner = useCallback(() => {
    return user?.role === 'OWNER'
  }, [user])

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
    hasRole,
    isAdmin,
    isVet,
    isOwner,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}