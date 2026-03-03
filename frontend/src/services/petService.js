// src/services/petService.js
import api from './api'

export const petService = {
  getAllPets: async () => {
    const response = await api.get('/pets')
    return response.data
  },

  getPetById: async (id) => {
    const response = await api.get(`/pets/${id}`)
    return response.data
  },

  createPet: async (petData) => {
    const formData = new FormData()
    Object.keys(petData).forEach((key) => {
      if (key === 'image' && petData[key]) {
        formData.append('image', petData[key])
      } else {
        formData.append(key, petData[key])
      }
    })
    const response = await api.post('/pets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updatePet: async (id, petData) => {
    const formData = new FormData()
    Object.keys(petData).forEach((key) => {
      if (key === 'image' && petData[key]) {
        formData.append('image', petData[key])
      } else if (petData[key] !== undefined) {
        formData.append(key, petData[key])
      }
    })
    const response = await api.put(`/pets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deletePet: async (id) => {
    const response = await api.delete(`/pets/${id}`)
    return response.data
  },

  getPetByQRCode: async (qrCode) => {
    const response = await api.get(`/pets/qr/${qrCode}`)
    return response.data
  },

  generateQRCode: async (petId) => {
    const response = await api.post(`/pets/${petId}/generate-qr`)
    return response.data
  },
}