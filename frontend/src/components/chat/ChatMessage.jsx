// src/components/chat/ChatMessage.jsx
import Avatar from '../common/Avatar'
import { formatRelativeTime } from '../../utils/helpers'

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm flex-shrink-0">
            🐾
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? 'bg-primary-500 text-white rounded-tr-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
          } ${message.isError ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p
            className={`text-xs mt-1 ${
              isUser ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {formatRelativeTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage