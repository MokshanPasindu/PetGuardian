// src/services/healthService.js
import api from './api'

export const healthService = {
  getMedicalHistory: async (petId) => {
    const response = await api.get(`/health/${petId}/history`)
    return response.data
  },

  addMedicalRecord: async (petId, recordData) => {
    const response = await api.post(`/health/${petId}/records`, recordData)
    return response.data
  },

  updateMedicalRecord: async (petId, recordId, recordData) => {
    const response = await api.put(`/health/${petId}/records/${recordId}`, recordData)
    return response.data
  },

  deleteMedicalRecord: async (petId, recordId) => {
    const response = await api.delete(`/health/${petId}/records/${recordId}`)
    return response.data
  },

  getVaccinations: async (petId) => {
    const response = await api.get(`/health/${petId}/vaccinations`)
    return response.data
  },

  addVaccination: async (petId, vaccinationData) => {
    const response = await api.post(`/health/${petId}/vaccinations`, vaccinationData)
    return response.data
  },

  updateVaccination: async (petId, vaccinationId, vaccinationData) => {
    const response = await api.put(`/health/${petId}/vaccinations/${vaccinationId}`, vaccinationData)
    return response.data
  },

  deleteVaccination: async (petId, vaccinationId) => {
    const response = await api.delete(`/health/${petId}/vaccinations/${vaccinationId}`)
    return response.data
  },

  getHealthSummary: async (petId) => {
    const response = await api.get(`/health/${petId}/summary`)
    return response.data
  },
}