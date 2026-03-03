// src/hooks/useChat.js
import { useState, useCallback } from 'react'
import { chatService } from '../services/chatService'

export const useChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm PetGuardian Assistant. How can I help you with your pet's health today?",
      timestamp: new Date(),
    },
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = useCallback(async (content) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await chatService.sendMessage(content)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Hello! I'm PetGuardian Assistant. How can I help you with your pet's health today?",
        timestamp: new Date(),
      },
    ])
  }, [])

  return { messages, loading, sendMessage, clearMessages }
}