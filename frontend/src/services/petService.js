// src/services/petService.js
import api from './api'

export const petService = {
  // Get all pets for current user
  getAllPets: async () => {
    try {
      const response = await api.get('/pets')
      return response.data
    } catch (error) {
      console.error('Get All Pets Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get pets')
    }
  },

  // Get pet by ID
  getPetById: async (id) => {
    try {
      const response = await api.get(`/pets/${id}`)
      return response.data
    } catch (error) {
      console.error('Get Pet Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get pet')
    }
  },

  // Create new pet (with FormData)
  createPet: async (petData) => {
    try {
      const formData = new FormData()
      
      // Add all pet data fields
      if (petData.name) formData.append('name', petData.name)
      if (petData.type) formData.append('type', petData.type)
      if (petData.breed) formData.append('breed', petData.breed)
      if (petData.birthDate) formData.append('birthDate', petData.birthDate)
      if (petData.gender) formData.append('gender', petData.gender)
      if (petData.weight) formData.append('weight', petData.weight)
      if (petData.color) formData.append('color', petData.color)
      if (petData.microchipId) formData.append('microchipId', petData.microchipId)
      if (petData.notes) formData.append('notes', petData.notes)
      
      // Add image file if provided
      if (petData.image && petData.image instanceof File) {
        formData.append('image', petData.image)
      }

      const response = await api.post('/pets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Create Pet Error:', error)
      console.error('Error details:', error.response?.data)
      throw new Error(error.response?.data?.message || 'Failed to create pet')
    }
  },

  // Update pet (with FormData)
  updatePet: async (id, petData) => {
    try {
      const formData = new FormData()
      
      // Add all pet data fields
      if (petData.name !== undefined) formData.append('name', petData.name)
      if (petData.type !== undefined) formData.append('type', petData.type)
      if (petData.breed !== undefined) formData.append('breed', petData.breed)
      if (petData.birthDate !== undefined) formData.append('birthDate', petData.birthDate)
      if (petData.gender !== undefined) formData.append('gender', petData.gender)
      if (petData.weight !== undefined) formData.append('weight', petData.weight)
      if (petData.color !== undefined) formData.append('color', petData.color)
      if (petData.microchipId !== undefined) formData.append('microchipId', petData.microchipId)
      if (petData.notes !== undefined) formData.append('notes', petData.notes)
      
      // Add image file if provided
      if (petData.image && petData.image instanceof File) {
        formData.append('image', petData.image)
      }

      const response = await api.put(`/pets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Update Pet Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to update pet')
    }
  },

  // Delete pet
  deletePet: async (id) => {
    try {
      const response = await api.delete(`/pets/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete Pet Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete pet')
    }
  },

  // Get pet by QR code (public)
  getPetByQRCode: async (qrCode) => {
    try {
      const response = await api.get(`/qr/pet/${qrCode}`)
      return response.data
    } catch (error) {
      console.error('Get Pet By QR Error:', error)
      throw new Error(error.response?.data?.message || 'Pet not found')
    }
  },

  // Generate QR code for pet
  generateQRCode: async (petId) => {
    try {
      const response = await api.post(`/pets/${petId}/generate-qr`)
      return response.data
    } catch (error) {
      console.error('Generate QR Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to generate QR code')
    }
  },

  // Upload pet image separately
  uploadImage: async (petId, imageFile) => {
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await api.post(`/pets/${petId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Upload Image Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  },
}

export default petService