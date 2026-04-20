// src/services/adminService.js
import api from './api'

export const adminService = {
  // Get all users with pagination and filters
  getAllUsers: async (params = {}) => {
    try {
      console.log('📡 Fetching users with params:', params)
      const response = await api.get('/admin/users', { params })
      console.log('✅ Full API Response:', response)
      console.log('✅ Response data:', response.data)
      return response.data // This should be the PagedResponse object
    } catch (error) {
      console.error('❌ Get Users Error:', error)
      console.error('❌ Error response:', error.response)
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Get User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  },

  // Change user role
  changeUserRole: async (userId, role) => {
    try {
      console.log(`🔄 Changing user ${userId} role to ${role}`)
      const response = await api.put(`/admin/users/${userId}/role`, { role })
      console.log('✅ Role changed:', response.data)
      return response.data
    } catch (error) {
      console.error('Change Role Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to change role')
    }
  },

  // Ban/Unban user
  toggleUserBan: async (userId) => {
    try {
      console.log(`🚫 Toggling ban for user ${userId}`)
      const response = await api.put(`/admin/users/${userId}/ban`)
      console.log('✅ Ban toggled:', response.data)
      return response.data
    } catch (error) {
      console.error('Toggle Ban Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to toggle ban')
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      console.log(`🗑️ Deleting user ${userId}`)
      const response = await api.delete(`/admin/users/${userId}`)
      console.log('✅ User deleted:', response.data)
      return response.data
    } catch (error) {
      console.error('Delete User Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      console.log('📊 Fetching statistics')
      const response = await api.get('/admin/stats')
      console.log('✅ Stats fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('Get Stats Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics')
    }
  },

  // Get recent users
  getRecentUsers: async (limit = 10) => {
    try {
      const response = await api.get('/admin/users/recent', { params: { limit } })
      return response.data
    } catch (error) {
      console.error('Get Recent Users Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch recent users')
    }
  },

  // Get users by role
  getUsersByRole: async () => {
    try {
      const response = await api.get('/admin/users/by-role')
      return response.data
    } catch (error) {
      console.error('Get Users By Role Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch user counts')
    }
  },
}

export default adminService