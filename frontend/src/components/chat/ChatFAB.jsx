// src/components/chatbot/ChatFAB.jsx
import { useState } from 'react'
import { FiMessageSquare, FiX } from 'react-icons/fi'
import ChatWindow from './ChatWindow'
import { useAuth } from '../../hooks/useAuth'

export default function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[360px] sm:w-[400px]
                        animate-slide-up">
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full
                   gradient-primary text-white shadow-2xl shadow-primary-500/40
                   flex items-center justify-center
                   hover:scale-110 active:scale-95 transition-transform duration-200"
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageSquare className="w-6 h-6" />}
      </button>
    </>
  )
}