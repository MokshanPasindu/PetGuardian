import api from './api'

export const aiService = {

  // POST /ai/analyze
  // Sends image + petId to Spring Boot → Flask → CNN
  analyzeSkinImage: async (imageFile, petId) => {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('petId', petId)

    const response = await api.post('/ai/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s for AI inference
    })
    return response.data
  },

  // GET /ai/scans/{petId}
  getScanHistory: async (petId) => {
    const response = await api.get(`/ai/scans/${petId}`)
    return response.data
  },

  // GET /ai/scans/detail/{scanId}
  getScanById: async (scanId) => {
    const response = await api.get(`/ai/scans/detail/${scanId}`)
    return response.data
  },

  // GET /ai/scans
  getAllUserScans: async () => {
    const response = await api.get('/ai/scans')
    return response.data
  },

  // POST /ai/scans/{scanId}/save-to-history
  saveToMedicalHistory: async (scanId) => {
    const response = await api.post(`/ai/scans/${scanId}/save-to-history`)
    return response.data
  },

  // GET /ai/health
  checkFlaskHealth: async () => {
    const response = await api.get('/ai/health')
    return response.data
  },
}

export default aiService