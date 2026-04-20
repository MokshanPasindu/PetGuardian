// src/services/chatService.js
import api from './api'

export const chatService = {
  // Send message to chatbot
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chatbot/message', { message })
      return response.data  // Returns ChatResponse directly
    } catch (error) {
      console.error('Send Message Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to send message')
    }
  },

  // Get chat history
  getChatHistory: async (limit = 50) => {
    try {
      const response = await api.get('/chatbot/history', {
        params: { limit },
      })
      return response.data  // Returns List<ChatResponse> directly
    } catch (error) {
      console.error('Get Chat History Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to get chat history')
    }
  },

  // Clear chat history
  clearChatHistory: async () => {
    try {
      const response = await api.delete('/chatbot/history')
      return response.data  // Returns ApiResponse
    } catch (error) {
      console.error('Clear Chat History Error:', error)
      throw new Error(error.response?.data?.message || 'Failed to clear chat history')
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/chatbot/health')
      return response.data
    } catch (error) {
      console.error('Health Check Error:', error)
      throw new Error('Chatbot service unavailable')
    }
  },
}

export default chatService