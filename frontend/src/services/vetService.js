// src/services/vetService.js
import api from './api'

export const vetService = {
  // Get nearby vets based on location
  getNearbyVets: async (latitude, longitude, radius = 10) => {
    try {
      const response = await api.post('/vets/nearby', {
        latitude,
        longitude,
        radius,
      })
      return response.data
    } catch (error) {
      console.error('Get Nearby Vets Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get nearby vets')
    }
  },

  // Get all vets with filters
  getAllVets: async (filters = {}) => {
    try {
      const response = await api.get('/vets/search', { params: filters })
      return response.data
    } catch (error) {
      console.error('Get All Vets Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get vets')
    }
  },

  // Get vet by ID
  getVetById: async (id) => {
    try {
      const response = await api.get(`/vets/${id}`)
      return response.data
    } catch (error) {
      console.error('Get Vet Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get vet details')
    }
  },

  // Create vet clinic (admin/vet only)
  createVet: async (vetData) => {
    try {
      const response = await api.post('/vets', vetData)
      return response.data
    } catch (error) {
      console.error('Create Vet Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create vet clinic')
    }
  },

  // Update vet clinic
  updateVet: async (id, vetData) => {
    try {
      const response = await api.put(`/vets/${id}`, vetData)
      return response.data
    } catch (error) {
      console.error('Update Vet Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update vet clinic')
    }
  },

  // Delete vet clinic
  deleteVet: async (id) => {
    try {
      const response = await api.delete(`/vets/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete Vet Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete vet clinic')
    }
  },

  // Appointments
  getAppointments: async () => {
    try {
      const response = await api.get('/appointments')
      return response.data
    } catch (error) {
      console.error('Get Appointments Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get appointments')
    }
  },

  getAppointmentById: async (id) => {
    try {
      const response = await api.get(`/appointments/${id}`)
      return response.data
    } catch (error) {
      console.error('Get Appointment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get appointment')
    }
  },

  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments', appointmentData)
      return response.data
    } catch (error) {
      console.error('Create Appointment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to create appointment')
    }
  },

  updateAppointment: async (id, appointmentData) => {
    try {
      const response = await api.put(`/appointments/${id}`, appointmentData)
      return response.data
    } catch (error) {
      console.error('Update Appointment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update appointment')
    }
  },

  cancelAppointment: async (id) => {
    try {
      const response = await api.patch(`/appointments/${id}/cancel`)
      return response.data
    } catch (error) {
      console.error('Cancel Appointment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment')
    }
  },

  deleteAppointment: async (id) => {
    try {
      const response = await api.delete(`/appointments/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete Appointment Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete appointment')
    }
  },
}

export default vetService