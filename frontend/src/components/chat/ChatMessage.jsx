// src/components/chat/ChatMessage.jsx
import { motion } from 'framer-motion'
import { formatRelativeTime } from '../../utils/helpers'
import ReactMarkdown from 'react-markdown'

const ChatMessage = ({ message, isUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm flex-shrink-0 shadow-md">
            🐾
          </div>
        )}
        
        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm ${
              isUser
                ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm border border-gray-100 dark:border-gray-600'
            } ${message.isError ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200' : ''}`}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <p
            className={`text-xs mt-1 px-1 ${
              isUser ? 'text-gray-500' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {formatRelativeTime(message.timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default ChatMessage