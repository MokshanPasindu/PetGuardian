// src/hooks/useChat.js
import { useState, useCallback, useEffect } from 'react'
import { chatService } from '../services/chatService'
import toast from 'react-hot-toast'

export const useChat = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatService.getChatHistory()
        
        if (history && history.length > 0) {
          // ✅ Map to frontend format
          setMessages(history.map(msg => ({
            id: msg.id,
            type: msg.bot ? 'bot' : 'user',  // ✅ Note: backend uses isBot
            content: msg.message,
            timestamp: msg.timestamp,
          })))
        } else {
          // Add welcome message if no history
          setMessages([{
            id: Date.now(),
            type: 'bot',
            content: "Hello! 👋 I'm **PetGuardian Assistant**, your AI companion for pet health and care.\n\nHow can I assist your pet today? 🐾",
            timestamp: new Date().toISOString(),
          }])
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
        // Add welcome message on error
        setMessages([{
          id: Date.now(),
          type: 'bot',
          content: "Hello! 👋 I'm **PetGuardian Assistant**. How can I help you today? 🐾",
          timestamp: new Date().toISOString(),
        }])
      } finally {
        setInitialized(true)
      }
    }

    if (!initialized) {
      loadHistory()
    }
  }, [initialized])

  const sendMessage = useCallback(async (content) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await chatService.sendMessage(content)
      
      const botMessage = {
        id: response.id,
        type: 'bot',
        content: response.message,
        timestamp: response.timestamp,
      }
      
      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date().toISOString(),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(async () => {
    try {
      await chatService.clearChatHistory()
      setMessages([{
        id: Date.now(),
        type: 'bot',
        content: "Chat history cleared! How can I help you today? 🐾",
        timestamp: new Date().toISOString(),
      }])
      toast.success('Chat history cleared')
    } catch (error) {
      console.error('Failed to clear history:', error)
      toast.error('Failed to clear chat history')
    }
  }, [])

  return { messages, loading, sendMessage, clearMessages }
}