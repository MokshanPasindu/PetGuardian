// src/components/chatbot/ChatWindow.jsx
import { useState, useRef, useEffect } from 'react'
import { FiSend, FiTrash2, FiX } from 'react-icons/fi'
import ChatMessage from './ChatMessage'

const botResponses = {
  hello: "Hello! 🐾 I'm PetGuardian's assistant. I can help with common pet care questions. How can I help you today?",
  skin: "For skin issues, I recommend: 1) Keep the area clean and dry. 2) Don't let your pet scratch. 3) Use our AI Skin Analysis for preliminary screening. 4) If symptoms persist, visit a vet. Would you like to try the AI analysis?",
  food: "A balanced diet is essential! Dogs need protein, healthy fats, and carbs. Cats are obligate carnivores and need high protein. Avoid: chocolate, onions, grapes, and xylitol. Would you like more specific advice?",
  vaccine: "Core vaccines are essential for all pets. Dogs: DHPP, Rabies. Cats: FVRCP, Rabies. Keep records updated in your Digital Health Passport. Check with your vet for a personalized schedule!",
  emergency: "🚨 In an emergency: 1) Stay calm. 2) Secure your pet safely. 3) Use our Vet Connect feature to find the nearest clinic. 4) Call the clinic before arriving. Would you like me to open Vet Connect?",
  default: "I'm here to help with general pet care questions. I can't diagnose conditions — please use our AI Analysis tool or consult a veterinarian for medical concerns. What would you like to know about?",
}

function getBotResponse(input) {
  const lower = input.toLowerCase()
  if (lower.match(/hi|hello|hey/)) return botResponses.hello
  if (lower.match(/skin|rash|itch|scratch|wound|infection/)) return botResponses.skin
  if (lower.match(/food|eat|diet|nutrition|feed/)) return botResponses.food
  if (lower.match(/vaccine|vaccination|shot|immuniz/)) return botResponses.vaccine
  if (lower.match(/emergency|urgent|serious|severe|bleeding/)) return botResponses.emergency
  return botResponses.default
}

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Hello! 🐾 I'm PetGuardian's assistant. Ask me about pet care, symptoms, vaccinations, or emergencies. Note: I don't diagnose or prescribe — always consult your vet!" }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { id: Date.now(), sender: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: getBotResponse(input) }
      setMessages(prev => [...prev, botMsg])
    }, 600)
  }

  const handleClear = () => {
    setMessages([{ id: Date.now(), sender: 'bot', text: "Chat cleared. How can I help you?" }])
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800
                    flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800
                       bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🤖</div>
          <div>
            <h3 className="font-bold text-sm">PetGuardian Assistant</h3>
            <p className="text-xs text-white/70">Online • Ask me anything</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleClear}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <FiTrash2 className="w-4 h-4" />
          </button>
          <button onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1 !py-2.5 !rounded-xl"
          />
          <button type="submit"
            className="p-2.5 rounded-xl gradient-primary text-white hover:opacity-90 transition-opacity">
            <FiSend className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          ⚠️ This chatbot provides general information only. Not a substitute for veterinary advice.
        </p>
      </div>
    </div>
  )
}