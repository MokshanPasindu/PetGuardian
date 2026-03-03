// src/services/vetService.js
import api from './api'

export const vetService = {
  getNearbyVets: async (lat, lng, radius = 10) => {
    const response = await api.get('/vets/nearby', {
      params: { lat, lng, radius },
    })
    return response.data
  },

  getAllVets: async (filters = {}) => {
    const response = await api.get('/vets', { params: filters })
    return response.data
  },

  getVetById: async (id) => {
    const response = await api.get(`/vets/${id}`)
    return response.data
  },

  createVet: async (vetData) => {
    const response = await api.post('/vets', vetData)
    return response.data
  },

  updateVet: async (id, vetData) => {
    const response = await api.put(`/vets/${id}`, vetData)
    return response.data
  },

  deleteVet: async (id) => {
    const response = await api.delete(`/vets/${id}`)
    return response.data
  },

  getAppointments: async () => {
    const response = await api.get('/appointments')
    return response.data
  },

  createAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData)
    return response.data
  },

  updateAppointment: async (id, appointmentData) => {
    const response = await api.put(`/appointments/${id}`, appointmentData)
    return response.data
  },

  cancelAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`)
    return response.data
  },
}