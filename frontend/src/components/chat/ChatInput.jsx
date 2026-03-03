// src/components/chat/ChatInput.jsx
import { useState } from 'react'
import { FiSend, FiPaperclip } from 'react-icons/fi'

const ChatInput = ({ onSend, disabled, placeholder }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || 'Type your message...'}
          disabled={disabled}
          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500 disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
      >
        <FiSend className="w-5 h-5" />
      </button>
    </form>
  )
}

export default ChatInput