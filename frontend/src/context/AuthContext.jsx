// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import api from '../services/api'
import toast from 'react-hot-toast'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,            setUser]            = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  // ─── Track inactivity for auto-logout ─────────────────────────────────────
  const inactivityTimer = useRef(null)
  const INACTIVITY_LIMIT = 60 * 60 * 1000 // 1 hour

  const resetInactivityTimer = useCallback(() => {
    if (!localStorage.getItem('token')) return
    clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      toast('Session expired due to inactivity', { icon: '⏱️' })
      handleLogout()
    }, INACTIVITY_LIMIT)
  }, [])

  // Listen for user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetInactivityTimer))
    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer))
      clearTimeout(inactivityTimer.current)
    }
  }, [resetInactivityTimer])

  // ─── Check auth on mount ───────────────────────────────────────────────────
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
        setIsAuthenticated(true)
        resetInactivityTimer()
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setUser(null)
        setIsAuthenticated(false)
      }
    }
    setLoading(false)
  }, [resetInactivityTimer])

  useEffect(() => { checkAuth() }, [checkAuth])

  // ─── Role-based redirect ───────────────────────────────────────────────────
  const redirectBasedOnRole = useCallback((role) => {
    switch (role) {
      case 'ADMIN': navigate('/admin-dashboard'); break
      case 'VET':   navigate('/vet-dashboard');   break
      default:      navigate('/dashboard');       break
    }
  }, [navigate])

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      localStorage.setItem('token', response.token)
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }
      setUser(response.user)
      setIsAuthenticated(true)
      resetInactivityTimer()

      const roleLabel = { ADMIN: 'Admin', VET: 'Dr.' }[response.user.role] || ''
      toast.success(`Welcome back, ${roleLabel} ${response.user.firstName}!`)
      redirectBasedOnRole(response.user.role)
      return response
    } catch (error) {
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)
      localStorage.setItem('token', response.token)
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }
      setUser(response.user)
      setIsAuthenticated(true)
      resetInactivityTimer()
      toast.success('Account created successfully! Welcome to PetGuardian 🐾')
      redirectBasedOnRole(response.user.role)
      return response
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    clearTimeout(inactivityTimer.current)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setIsAuthenticated(false)
    navigate('/')
  }, [navigate])

  const logout = useCallback(() => {
    toast.success('Logged out successfully')
    handleLogout()
  }, [handleLogout])

  // ─── Update profile ────────────────────────────────────────────────────────
  const updateProfile = async (data) => {
    try {
      const updated = await authService.updateProfile(data)
      setUser(updated)
      toast.success('Profile updated successfully!')
      return updated
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
      throw error
    }
  }

  // ─── Upload avatar ─────────────────────────────────────────────────────────
  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // response.data is the updated UserDTO
      setUser(prev => ({ ...prev, avatar: response.data.avatar }))
      toast.success('Profile photo updated!')
      return response.data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo')
      throw error
    }
  }

  // ─── Change password ───────────────────────────────────────────────────────
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to change password')
      throw error
    }
  }

  // ─── Role helpers ──────────────────────────────────────────────────────────
  const hasRole    = useCallback((r) => Array.isArray(r) ? r.includes(user?.role) : user?.role === r, [user])
  const isAdmin    = useCallback(() => user?.role === 'ADMIN', [user])
  const isVet      = useCallback(() => user?.role === 'VET' || user?.role === 'ADMIN', [user])
  const isOwner    = useCallback(() => user?.role === 'OWNER', [user])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateProfile,
      uploadAvatar,
      changePassword,
      checkAuth,
      hasRole,
      isAdmin,
      isVet,
      isOwner,
    }}>
      {children}
    </AuthContext.Provider>
  )
}