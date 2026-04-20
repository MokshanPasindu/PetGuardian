// src/services/healthService.js
import api from './api'

export const healthService = {
  // Medical Records
  getMedicalRecords: async (petId) => {
    try {
      const response = await api.get(`/medical/pet/${petId}/records`)
      return response.data
    } catch (error) {
      console.error('Get Medical Records Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get medical records')
    }
  },

  getMedicalRecordById: async (recordId) => {
    try {
      const response = await api.get(`/medical/records/${recordId}`)
      return response.data
    } catch (error) {
      console.error('Get Medical Record Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get medical record')
    }
  },

  createMedicalRecord: async (petId, recordData) => {
    try {
      const response = await api.post(`/medical/pet/${petId}/records`, recordData)
      return response.data
    } catch (error) {
      console.error('Create Medical Record Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create medical record')
    }
  },

  updateMedicalRecord: async (recordId, recordData) => {
    try {
      const response = await api.put(`/medical/records/${recordId}`, recordData)
      return response.data
    } catch (error) {
      console.error('Update Medical Record Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update medical record')
    }
  },

  deleteMedicalRecord: async (recordId) => {
    try {
      const response = await api.delete(`/medical/records/${recordId}`)
      return response.data
    } catch (error) {
      console.error('Delete Medical Record Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete medical record')
    }
  },

  // Vaccinations
  getVaccinations: async (petId) => {
    try {
      const response = await api.get(`/medical/pet/${petId}/vaccinations`)
      return response.data
    } catch (error) {
      console.error('Get Vaccinations Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get vaccinations')
    }
  },

  createVaccination: async (petId, vaccinationData) => {
    try {
      const response = await api.post(`/medical/pet/${petId}/vaccinations`, vaccinationData)
      return response.data
    } catch (error) {
      console.error('Create Vaccination Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create vaccination')
    }
  },

  updateVaccination: async (vaccinationId, vaccinationData) => {
    try {
      const response = await api.put(`/medical/vaccinations/${vaccinationId}`, vaccinationData)
      return response.data
    } catch (error) {
      console.error('Update Vaccination Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update vaccination')
    }
  },

  deleteVaccination: async (vaccinationId) => {
    try {
      const response = await api.delete(`/medical/vaccinations/${vaccinationId}`)
      return response.data
    } catch (error) {
      console.error('Delete Vaccination Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete vaccination')
    }
  },

  // Health Summary
  getHealthSummary: async (petId) => {
    try {
      const response = await api.get(`/medical/pet/${petId}/summary`)
      return response.data
    } catch (error) {
      console.error('Get Health Summary Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get health summary')
    }
  },

  // Health Passport
  getHealthPassport: async (petId) => {
    try {
      const response = await api.get(`/medical/pet/${petId}/passport`)
      return response.data
    } catch (error) {
      console.error('Get Health Passport Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get health passport')
    }
  },
}

export default healthService