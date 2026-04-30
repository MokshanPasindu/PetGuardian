// src/services/healthService.js
import api from './api'

export const healthService = {
  // ==================== MEDICAL RECORDS ====================

  getMedicalRecords: async (petId) => {
    try {
      const response = await api.get(`/health/${petId}/history`)
      return response.data
    } catch (error) {
      console.error('Get Medical Records Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to get medical records'
      )
    }
  },

  getMedicalRecordsByType: async (petId, type) => {
    try {
      const response = await api.get(`/health/${petId}/history`, {
        params: { type },
      })
      return response.data
    } catch (error) {
      console.error('Get Medical Records By Type Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to get medical records'
      )
    }
  },

  getMedicalRecordById: async (petId, recordId) => {
    try {
      const response = await api.get(
        `/health/${petId}/records/${recordId}`
      )
      return response.data
    } catch (error) {
      console.error('Get Medical Record By ID Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to get medical record'
      )
    }
  },

  createMedicalRecord: async (petId, recordData) => {
    try {
      const response = await api.post(`/health/${petId}/records`, recordData)
      return response.data
    } catch (error) {
      console.error('Create Medical Record Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to create medical record'
      )
    }
  },

  updateMedicalRecord: async (petId, recordId, recordData) => {
    try {
      const response = await api.put(
        `/health/${petId}/records/${recordId}`,
        recordData
      )
      return response.data
    } catch (error) {
      console.error('Update Medical Record Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to update medical record'
      )
    }
  },

  deleteMedicalRecord: async (petId, recordId) => {
    try {
      const response = await api.delete(
        `/health/${petId}/records/${recordId}`
      )
      return response.data
    } catch (error) {
      console.error('Delete Medical Record Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to delete medical record'
      )
    }
  },

  // ==================== VACCINATIONS ====================

  getVaccinations: async (petId) => {
    try {
      const response = await api.get(`/health/${petId}/vaccinations`)
      return response.data
    } catch (error) {
      console.error('Get Vaccinations Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to get vaccinations'
      )
    }
  },

  createVaccination: async (petId, vaccinationData) => {
    try {
      const response = await api.post(
        `/health/${petId}/vaccinations`,
        vaccinationData
      )
      return response.data
    } catch (error) {
      console.error('Create Vaccination Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to create vaccination'
      )
    }
  },

  updateVaccination: async (petId, vaccinationId, vaccinationData) => {
    try {
      const response = await api.put(
        `/health/${petId}/vaccinations/${vaccinationId}`,
        vaccinationData
      )
      return response.data
    } catch (error) {
      console.error('Update Vaccination Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to update vaccination'
      )
    }
  },

  deleteVaccination: async (petId, vaccinationId) => {
    try {
      const response = await api.delete(
        `/health/${petId}/vaccinations/${vaccinationId}`
      )
      return response.data
    } catch (error) {
      console.error('Delete Vaccination Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to delete vaccination'
      )
    }
  },

  // ==================== HEALTH SUMMARY ====================

  getHealthSummary: async (petId) => {
    try {
      const response = await api.get(`/health/${petId}/summary`)
      return response.data
    } catch (error) {
      console.error('Get Health Summary Error:', error)
      throw new Error(
        error.response?.data?.message || 'Failed to get health summary'
      )
    }
  },
}

export default healthService