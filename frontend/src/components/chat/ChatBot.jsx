// src/components/chat/ChatBot.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiMessageCircle, 
  FiX, 
  FiMinimize2, 
  FiTrash2,
  FiDownload,
} from 'react-icons/fi'
import { useChat } from '../../hooks/useChat'
import { useAuth } from '../../hooks/useAuth'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import ConfirmDialog from '../common/ConfirmDialog'
import toast from 'react-hot-toast'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  
  const { user } = useAuth()
  const { messages, loading, sendMessage, clearMessages } = useChat()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized])

  const handleClearHistory = async () => {
    setIsClearing(true)
    try {
      await clearMessages()
      toast.success('Chat history cleared successfully! 🧹')
      setShowClearConfirm(false)
    } catch (error) {
      toast.error('Failed to clear chat history')
    } finally {
      setIsClearing(false)
    }
  }

  const handleExportChat = () => {
    if (messages.length === 0) {
      toast.error('No messages to export')
      return
    }

    const chatText = messages
      .map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.type === 'user' ? 'You' : 'PetGuardian Assistant'}: ${m.content}`)
      .join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `petguardian-chat-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Chat exported successfully! 📄')
  }

  const quickReplies = [
    { icon: '🔍', text: 'My pet has a skin rash' },
    { icon: '💉', text: 'Vaccination schedule' },
    { icon: '🍖', text: 'What should I feed my pet?' },
    { icon: '🚨', text: 'Emergency symptoms' },
  ]

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-primary-500/50 transition-all group"
          >
            <FiMessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-semibold animate-pulse">
              1
            </span>
            <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 p-4 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg">
                    🐾
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">PetGuardian Assistant</h3>
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                      <span>Online • Here to help</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleExportChat}
                    disabled={messages.length === 0}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Export chat"
                  >
                    <FiDownload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    disabled={messages.length === 0}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Clear history"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title={isMinimized ? 'Expand' : 'Minimize'}
                  >
                    <FiMinimize2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Close"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {/* Welcome Message */}
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4 animate-bounce">🐾</div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Welcome, {user?.firstName}!
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ask me anything about your pet's health and care
                      </p>
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((message) => (
                    <ChatMessage 
                      key={message.id} 
                      message={message} 
                      isUser={message.type === 'user'}
                    />
                  ))}

                  {/* Typing Indicator */}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Quick questions:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickReplies.map((reply, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.preventDefault()
                            sendMessage(reply.text)
                          }}
                          type="button"
                          className="text-xs px-3 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 flex items-center gap-2"
                        >
                          <span>{reply.icon}</span>
                          <span className="truncate">{reply.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <ChatInput 
                    onSend={sendMessage}
                    disabled={loading}
                    placeholder="Ask me anything about pet care..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                    <span>🩺</span>
                    <span>I provide general guidance only. Always consult a vet for medical advice.</span>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Beautiful Clear History Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearHistory}
        title="Clear Chat History?"
        message="Are you sure you want to delete all your chat messages? This action cannot be undone and all conversation history will be permanently removed."
        confirmText="Yes, Clear All"
        cancelText="Cancel"
        type="danger"
        loading={isClearing}
      />
    </>
  )
}

export default ChatBot