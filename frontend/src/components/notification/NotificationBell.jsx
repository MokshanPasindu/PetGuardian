// src/components/notification/NotificationBell.jsx

import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiCheckCircle, FiTrash2, FiX } from 'react-icons/fi'
import {
  useNotifications,
  getNotificationConfig,
} from '../../context/NotificationContext'

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  <  7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const NotificationBell = () => {
  const navigate  = useNavigate()
  const ref       = useRef(null)
  const [open, setOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearRead,
  } = useNotifications()

  // Preview: show only latest 5
  const preview = notifications.slice(0, 5)

  // ── Close on outside click ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = async (n) => {
    if (!n.read) await markAsRead(n.id)
    if (n.actionUrl) {
      setOpen(false)
      navigate(n.actionUrl)
    }
  }

  return (
    <div className="relative" ref={ref}>

      {/* Bell Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-xl hover:bg-gray-100
                   dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <FiBell className={`w-5 h-5 transition-colors ${
          unreadCount > 0
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-600 dark:text-gray-400'
        }`} />

        {/* Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                         bg-red-500 text-white text-[10px] font-bold
                         rounded-full flex items-center justify-center
                         px-1 border-2 border-white dark:border-gray-900"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 bg-white
                       dark:bg-gray-800 rounded-2xl shadow-2xl
                       border border-gray-200 dark:border-gray-700
                       overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4
                            border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-100
                                   dark:bg-red-900/30 text-red-600
                                   dark:text-red-400 text-xs
                                   font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    title="Mark all read"
                    className="p-1.5 text-gray-400 hover:text-primary-600
                               hover:bg-primary-50 dark:hover:bg-primary-900/20
                               rounded-lg transition-colors"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                  </button>
                )}
                {notifications.some(n => n.read) && (
                  <button
                    onClick={clearRead}
                    title="Clear read"
                    className="p-1.5 text-gray-400 hover:text-red-500
                               hover:bg-red-50 dark:hover:bg-red-900/20
                               rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto">
              {preview.length === 0 ? (
                <div className="py-12 text-center">
                  <FiBell className="w-10 h-10 mx-auto text-gray-200
                                     dark:text-gray-700 mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No notifications yet
                  </p>
                </div>
              ) : (
                preview.map(n => {
                  const cfg = getNotificationConfig(n.type)
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`
                        group relative flex items-start gap-3
                        p-4 border-b border-gray-50
                        dark:border-gray-700/50 last:border-0
                        cursor-pointer transition-colors
                        hover:bg-gray-50 dark:hover:bg-gray-700/50
                        ${!n.read
                          ? 'bg-primary-50/40 dark:bg-primary-900/10'
                          : ''
                        }
                      `}
                    >
                      {/* Icon */}
                      <div className={`
                        w-9 h-9 rounded-xl ${cfg.bg}
                        flex items-center justify-center
                        text-base flex-shrink-0
                      `}>
                        {cfg.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <p className={`
                          text-sm leading-tight text-gray-900
                          dark:text-white
                          ${!n.read ? 'font-semibold' : 'font-medium'}
                        `}>
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-500
                                      dark:text-gray-400 mt-0.5
                                      line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-xs text-gray-400
                                      dark:text-gray-500 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!n.read && (
                        <div className="w-2 h-2 bg-primary-500
                                        rounded-full flex-shrink-0
                                        mt-1.5" />
                      )}

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(n.id)
                        }}
                        className="absolute top-2 right-2
                                   opacity-0 group-hover:opacity-100
                                   p-1 text-gray-400 hover:text-red-500
                                   transition-all rounded"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer — View All */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100
                              dark:border-gray-700">
                <button
                  onClick={() => {
                    setOpen(false)
                    navigate('/notifications')
                  }}
                  className="w-full py-2 text-sm font-medium
                             text-primary-600 dark:text-primary-400
                             hover:bg-primary-50
                             dark:hover:bg-primary-900/20
                             rounded-xl transition-colors"
                >
                  View all {notifications.length} notifications →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell