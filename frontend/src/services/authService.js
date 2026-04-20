import api from './api'

export const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      throw new Error(message)
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
      
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      throw new Error(message)
    }
  },

  // Get Current User
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user')
    }
  },

  // Update Profile
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', null, {
        params: { currentPassword, newPassword },
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password')
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email')
    }
  },

  // Reset Password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password')
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  },

  // Refresh Token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await api.post('/auth/refresh-token', refreshToken)

      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
      }

      return response.data
    } catch (error) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      throw error
    }
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token')
  },
}

export default authService