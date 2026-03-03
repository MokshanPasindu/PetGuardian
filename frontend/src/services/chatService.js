// src/services/chatService.js
import api from './api'

export const chatService = {
  sendMessage: async (message) => {
    const response = await api.post('/chat/message', { message })
    return response.data
  },

  getChatHistory: async () => {
    const response = await api.get('/chat/history')
    return response.data
  },

  clearChatHistory: async () => {
    const response = await api.delete('/chat/history')
    return response.data
  },
}