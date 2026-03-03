// src/components/chat/ChatBot.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageCircle, FiX, FiSend, FiMinimize2 } from 'react-icons/fi'
import { useChat } from '../../hooks/useChat'
import Avatar from '../common/Avatar'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { messages, loading, sendMessage } = useChat()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim() && !loading) {
      sendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const quickReplies = [
    'What are common skin conditions in dogs?',
    'How often should I vaccinate my pet?',
    'Signs of allergies in cats?',
    'When to visit a vet?',
  ]

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
          >
            <FiMessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
              1
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    🐾
                  </div>
                  <div>
                    <h3 className="font-semibold">PetGuardian Assistant</h3>
                    <p className="text-sm text-white/80 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiMinimize2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Quick questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(reply)}
                      className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about pet care..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || loading}
                  className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                I provide general guidance only. Always consult a vet for medical advice.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot