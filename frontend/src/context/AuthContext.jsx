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
        localStorage.removeItem('token')
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      toast.success('Welcome back!')
      navigate('/dashboard')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)
      localStorage.setItem('token', response.token)
      setUser(response.user)
      setIsAuthenticated(true)
      toast.success('Account created successfully!')
      navigate('/dashboard')
      return response
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
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
      toast.error(error.response?.data?.message || 'Failed to update profile')
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}