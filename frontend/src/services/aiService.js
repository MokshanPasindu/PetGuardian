// src/services/aiService.js
import { aiApi } from './api'
import api from './api'

export const aiService = {
  analyzeSkinImage: async (imageFile, petId) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('petId', petId)
    
    const response = await aiApi.post('/analyze', formData)
    return response.data
  },

  getScanHistory: async (petId) => {
    const response = await api.get(`/ai/scans/${petId}`)
    return response.data
  },

  getScanById: async (scanId) => {
    const response = await api.get(`/ai/scans/detail/${scanId}`)
    return response.data
  },

  getAllUserScans: async () => {
    const response = await api.get('/ai/scans')
    return response.data
  },
}