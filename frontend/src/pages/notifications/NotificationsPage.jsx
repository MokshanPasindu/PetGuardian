// src/pages/notifications/NotificationsPage.jsx

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiBell, FiCheckCircle, FiTrash2,
  FiRefreshCw, FiX,
} from 'react-icons/fi'
import {
  useNotifications,
  getNotificationConfig,
} from '../../context/NotificationContext'

// ── Time formatter ─────────────────────────────────────────
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
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ── Filter config ──────────────────────────────────────────
const FILTERS = [
  { key: 'ALL',         label: 'All' },
  { key: 'UNREAD',      label: 'Unread' },
  { key: 'AI',          label: '🔬 AI Scans' },
  { key: 'APPOINTMENT', label: '📅 Appointments' },
  { key: 'VACCINATION', label: '💉 Vaccinations' },
  { key: 'COMMUNITY',   label: '💬 Community' },
  { key: 'SYSTEM',      label: 'ℹ️ System' },
]

const TYPE_TO_FILTER = {
  AI_SCAN_COMPLETE:      'AI',
  AI_SCAN_SEVERE:        'AI',
  APPOINTMENT_BOOKED:    'APPOINTMENT',
  APPOINTMENT_CONFIRMED: 'APPOINTMENT',
  APPOINTMENT_CANCELLED: 'APPOINTMENT',
  APPOINTMENT_REMINDER:  'APPOINTMENT',
  VACCINATION_DUE:       'VACCINATION',
  VACCINATION_OVERDUE:   'VACCINATION',
  COMMUNITY_REPLY:       'COMMUNITY',
  COMMUNITY_LIKE:        'COMMUNITY',
  SYSTEM:                'SYSTEM',
  WELCOME:               'SYSTEM',
}

const NotificationsPage = () => {
  const navigate = useNavigate()
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearRead,
  } = useNotifications()

  const [activeFilter, setActiveFilter] = useState('ALL')

  // ── Filtered list ──────────────────────────────────────────
  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'ALL':    return notifications
      case 'UNREAD': return notifications.filter(n => !n.read)
      default:
        return notifications.filter(
          n => TYPE_TO_FILTER[n.type] === activeFilter
        )
    }
  }, [notifications, activeFilter])

  // ── Handle notification click ──────────────────────────────
  const handleClick = async (n) => {
    if (!n.read) await markAsRead(n.id)
    if (n.actionUrl) navigate(n.actionUrl)
  }

  // ── Filter count ───────────────────────────────────────────
  const getCount = (key) => {
    if (key === 'ALL')    return notifications.length
    if (key === 'UNREAD') return unreadCount
    return notifications.filter(
      n => TYPE_TO_FILTER[n.type] === key
    ).length
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100
                          dark:bg-primary-900/30
                          flex items-center justify-center">
            <FiBell className="w-5 h-5 text-primary-600
                               dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold
                           text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'All caught up!'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            disabled={loading}
            title="Refresh"
            className="p-2 rounded-lg hover:bg-gray-100
                       dark:hover:bg-gray-800 transition-colors
                       text-gray-500 disabled:opacity-50"
          >
            <FiRefreshCw className={`w-4 h-4 ${
              loading ? 'animate-spin' : ''
            }`} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5
                         text-sm font-medium text-primary-600
                         dark:text-primary-400 hover:bg-primary-50
                         dark:hover:bg-primary-900/20
                         rounded-lg transition-colors"
            >
              <FiCheckCircle className="w-4 h-4" />
              Mark all read
            </button>
          )}

          {notifications.some(n => n.read) && (
            <button
              onClick={clearRead}
              className="flex items-center gap-1.5 px-3 py-1.5
                         text-sm font-medium text-red-500
                         hover:bg-red-50 dark:hover:bg-red-900/20
                         rounded-lg transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              Clear read
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 mb-6
                      overflow-x-auto pb-2 scrollbar-hide">
        {FILTERS.map(f => {
          const count = getCount(f.key)
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-xl
                text-sm font-medium whitespace-nowrap
                transition-all flex-shrink-0
                ${activeFilter === f.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {f.label}
              {count > 0 && (
                <span className={`
                  min-w-[20px] h-5 rounded-full text-xs
                  font-bold flex items-center justify-center px-1
                  ${activeFilter === f.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }
                `}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── List ── */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {filtered.length === 0 ? (

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto rounded-full
                              bg-gray-100 dark:bg-gray-800
                              flex items-center justify-center mb-4">
                <FiBell className="w-10 h-10 text-gray-300
                                   dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold
                             text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {activeFilter === 'UNREAD'
                  ? "You're all caught up!"
                  : 'No notifications in this category yet.'}
              </p>
            </motion.div>

          ) : filtered.map((n, idx) => {
            const cfg = getNotificationConfig(n.type)

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => handleClick(n)}
                className={`
                  group relative flex items-start gap-4
                  p-4 rounded-2xl border cursor-pointer
                  transition-all hover:shadow-md
                  ${!n.read
                    ? 'bg-primary-50/60 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  w-11 h-11 rounded-xl ${cfg.bg}
                  flex items-center justify-center
                  text-xl flex-shrink-0
                `}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start
                                  justify-between gap-2">
                    <h4 className={`
                      text-sm text-gray-900 dark:text-white
                      leading-tight
                      ${!n.read ? 'font-semibold' : 'font-medium'}
                    `}>
                      {n.title}
                    </h4>
                    <span className="text-xs text-gray-400
                                     dark:text-gray-500
                                     flex-shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600
                                dark:text-gray-400 mt-1
                                leading-relaxed">
                    {n.message}
                  </p>

                  <span className={`
                    inline-block mt-2 text-xs px-2 py-0.5
                    rounded-full font-medium
                    ${cfg.bg} ${cfg.color}
                  `}>
                    {n.type.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="w-2.5 h-2.5 bg-primary-500
                                  rounded-full flex-shrink-0
                                  mt-1.5" />
                )}

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeNotification(n.id)
                  }}
                  className="absolute top-3 right-3 p-1.5
                             opacity-0 group-hover:opacity-100
                             text-gray-400 hover:text-red-500
                             hover:bg-red-50 dark:hover:bg-red-900/20
                             rounded-lg transition-all"
                  title="Delete"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-6">
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}
    </div>
  )
}

export default NotificationsPage