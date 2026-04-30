// src/hooks/useChat.js
// UPDATED — adds suggestVet field mapping

import { useState, useCallback, useEffect } from 'react'
import { chatService } from '../services/chatService'
import toast from 'react-hot-toast'

export const useChat = () => {
  const [messages,    setMessages]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [initialized, setInitialized] = useState(false)

  // ── Load chat history on mount ─────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatService.getChatHistory()

        if (history && history.length > 0) {
          setMessages(history.map(msg => ({
            id:         msg.id,
            type:       msg.bot ? 'bot' : 'user',
            content:    msg.message,
            suggestVet: msg.suggestVet ?? false,  // ← NEW
            timestamp:  msg.timestamp,
          })))
        } else {
          // Welcome message if no history
          setMessages([{
            id:         Date.now(),
            type:       'bot',
            content:    "Hello! 👋 I'm **PetGuardian Assistant**, " +
                        "your AI companion for pet health and care.\n\n" +
                        "I can help you with:\n" +
                        "✅ Skin condition concerns\n" +
                        "✅ Vaccination schedules\n" +
                        "✅ Nutrition and diet advice\n" +
                        "✅ Finding nearby vets\n" +
                        "✅ Emergency guidance\n\n" +
                        "How can I assist your pet today? 🐾",
            suggestVet: false,                     // ← NEW
            timestamp:  new Date().toISOString(),
          }])
        }
      } catch (error) {
        console.error('Failed to load chat history:', error)
        setMessages([{
          id:         Date.now(),
          type:       'bot',
          content:    "Hello! 👋 I'm **PetGuardian Assistant**. " +
                      "How can I help you today? 🐾",
          suggestVet: false,                       // ← NEW
          timestamp:  new Date().toISOString(),
        }])
      } finally {
        setInitialized(true)
      }
    }

    if (!initialized) {
      loadHistory()
    }
  }, [initialized])

  // ── Send message ───────────────────────────────────────
  const sendMessage = useCallback(async (content) => {
    const userMessage = {
      id:         Date.now(),
      type:       'user',
      content,
      suggestVet: false,                           // ← NEW
      timestamp:  new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await chatService.sendMessage(content)

      const botMessage = {
        id:         response.id,
        type:       'bot',
        content:    response.message,
        suggestVet: response.suggestVet ?? false,  // ← NEW
        timestamp:  response.timestamp,
      }

      setMessages(prev => [...prev, botMessage])

    } catch (error) {
      console.error('Chat error:', error)

      setMessages(prev => [...prev, {
        id:         Date.now() + 1,
        type:       'bot',
        content:    "I'm sorry, I encountered an error. " +
                    "Please try again or contact support " +
                    "if the issue persists.",
        suggestVet: false,                         // ← NEW
        isError:    true,
        timestamp:  new Date().toISOString(),
      }])

      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Clear messages ─────────────────────────────────────
  const clearMessages = useCallback(async () => {
    try {
      await chatService.clearChatHistory()
      setMessages([{
        id:         Date.now(),
        type:       'bot',
        content:    "Chat history cleared! " +
                    "How can I help you today? 🐾",
        suggestVet: false,                         // ← NEW
        timestamp:  new Date().toISOString(),
      }])
      toast.success('Chat history cleared')
    } catch (error) {
      console.error('Failed to clear history:', error)
      toast.error('Failed to clear chat history')
    }
  }, [])

  return { messages, loading, sendMessage, clearMessages }
}

export default useChat