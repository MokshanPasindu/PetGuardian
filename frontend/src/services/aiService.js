// src/services/aiService.js
import { aiApi } from './api'
import api from './api'

export const aiService = {
  // Analyze skin/health image
  analyzeSkinImage: async (imageFile, petId) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    if (petId) {
      formData.append('petId', petId)
    }
    
    try {
      const response = await aiApi.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('AI Analysis Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to analyze image')
    }
  },

  // Get scan history for a specific pet
  getScanHistory: async (petId) => {
    try {
      const response = await api.get(`/ai/scans/pet/${petId}`)
      return response.data
    } catch (error) {
      console.error('Get Scan History Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get scan history')
    }
  },

  // Get specific scan details
  getScanById: async (scanId) => {
    try {
      const response = await api.get(`/ai/scans/${scanId}`)
      return response.data
    } catch (error) {
      console.error('Get Scan Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get scan details')
    }
  },

  // Get all scans for current user
  getAllUserScans: async () => {
    try {
      const response = await api.get('/ai/scans')
      return response.data
    } catch (error) {
      console.error('Get All Scans Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get scans')
    }
  },
}

export default aiService