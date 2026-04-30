// src/services/adminService.js
import api from './api'

export const adminService = {

  // ─── User Management ──────────────────────────────────────────────────────

  getAllUsers: async (params = {}) => {
    try {
      console.log('📡 Fetching users with params:', params)
      const response = await api.get('/admin/users', { params })
      return response.data
    } catch (error) {
      console.error('❌ Get Users Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch users')
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user')
    }
  },

  changeUserRole: async (userId, role) => {
    try {
      console.log(`🔄 Changing user ${userId} role to ${role}`)
      const response = await api.put(`/admin/users/${userId}/role`, { role })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change role')
    }
  },

  toggleUserBan: async (userId) => {
    try {
      console.log(`🚫 Toggling ban for user ${userId}`)
      const response = await api.put(`/admin/users/${userId}/ban`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to toggle ban')
    }
  },

  deleteUser: async (userId) => {
    try {
      console.log(`🗑️ Deleting user ${userId}`)
      const response = await api.delete(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user')
    }
  },

  getStatistics: async () => {
    try {
      console.log('📊 Fetching statistics')
      const response = await api.get('/admin/stats')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics')
    }
  },

  getRecentUsers: async (limit = 10) => {
    try {
      const response = await api.get('/admin/users/recent', { params: { limit } })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent users')
    }
  },

  getUsersByRole: async () => {
    try {
      const response = await api.get('/admin/users/by-role')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user counts')
    }
  },

  // ─── Vet Clinic Management (NEW) ─────────────────────────────────────────

  getAllClinics: async () => {
    try {
      console.log('🏥 Fetching all vet clinics')
      const response = await api.get('/vets')
      return response.data
    } catch (error) {
      console.error('❌ Get Clinics Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch clinics')
    }
  },

  getClinicById: async (id) => {
    try {
      const response = await api.get(`/vets/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clinic')
    }
  },

  createClinic: async (clinicData) => {
    try {
      console.log('➕ Creating vet clinic:', clinicData.name)
      const response = await api.post('/vets', clinicData)
      console.log('✅ Clinic created:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Create Clinic Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create clinic')
    }
  },

  updateClinic: async (id, clinicData) => {
    try {
      console.log(`✏️ Updating vet clinic ${id}`)
      const response = await api.put(`/vets/${id}`, clinicData)
      console.log('✅ Clinic updated:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Update Clinic Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update clinic')
    }
  },

  deleteClinic: async (id) => {
    try {
      console.log(`🗑️ Deleting vet clinic ${id}`)
      const response = await api.delete(`/vets/${id}`)
      console.log('✅ Clinic deleted')
      return response.data
    } catch (error) {
      console.error('❌ Delete Clinic Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete clinic')
    }
  },
}

export default adminService