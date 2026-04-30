import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMenu, FiX, FiBell, FiSearch,
  FiMoon, FiSun, FiUser, FiSettings,
  FiLogOut, FiChevronDown, FiTrash2,
  FiCheckCircle,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import { useNotifications, getNotificationConfig }
  from '../../context/NotificationContext'
import Avatar from '../common/Avatar'

// ── Time formatter ─────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  <  7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { user, logout }            = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate                     = useNavigate()
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearRead,
  } = useNotifications()

  const [showUserMenu, setShowUserMenu]           = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery]             = useState('')

  const notifRef = useRef(null)
  const userRef  = useRef(null)

  // ── Close dropdowns on outside click ──────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Handle notification click ──────────────────────────────
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      setShowNotifications(false)
      navigate(notification.actionUrl)
    }
  }

  // ── User display name ──────────────────────────────────────
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email ?? 'User'

  const firstName = user?.firstName ?? user?.email?.split('@')[0] ?? 'User'

  return (
    <nav className="fixed top-0 left-0 right-0 z-40
                    bg-white/80 dark:bg-gray-900/80
                    backdrop-blur-lg border-b
                    border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">

        {/* ── Left ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100
                       dark:hover:bg-gray-800 lg:hidden transition-colors"
          >
            {isSidebarOpen
              ? <FiX className="w-6 h-6" />
              : <FiMenu className="w-6 h-6" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br
                            from-primary-500 to-primary-600
                            flex items-center justify-center">
              <span className="text-white font-bold text-lg">🐾</span>
            </div>
            <span className="hidden sm:block text-xl font-display
                             font-bold text-gray-900 dark:text-white">
              PetGuardian
            </span>
          </Link>
        </div>

        {/* ── Center Search ── */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pets, records, vets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100
                         dark:bg-gray-800 rounded-xl border-none
                         focus:outline-none focus:ring-2
                         focus:ring-primary-500 text-gray-900
                         dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* ── Right ── */}
        <div className="flex items-center gap-2">

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100
                       dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode
              ? <FiSun  className="w-5 h-5 text-yellow-500" />
              : <FiMoon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative p-2 rounded-lg hover:bg-gray-100
                         dark:hover:bg-gray-800 transition-colors"
            >
              <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 min-w-[18px] h-[18px]
                             bg-red-500 text-white text-xs rounded-full
                             flex items-center justify-center px-1 font-bold"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-96 bg-white
                             dark:bg-gray-800 rounded-2xl shadow-xl
                             border border-gray-200 dark:border-gray-700
                             overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between
                                  p-4 border-b border-gray-200
                                  dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900
                                     dark:text-white">
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
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary-600
                                     dark:text-primary-400
                                     hover:underline flex items-center gap-1"
                        >
                          <FiCheckCircle className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                      {notifications.some(n => n.read) && (
                        <button
                          onClick={clearRead}
                          className="text-xs text-gray-400
                                     hover:text-red-500 transition-colors"
                          title="Clear read notifications"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-[420px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <FiBell className="w-10 h-10 mx-auto text-gray-300
                                           dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const cfg = getNotificationConfig(n.type)
                        return (
                          <div
                            key={n.id}
                            className={`
                              group flex items-start gap-3 p-4
                              border-b border-gray-100 dark:border-gray-700
                              last:border-0 cursor-pointer
                              transition-colors hover:bg-gray-50
                              dark:hover:bg-gray-700/50
                              ${!n.read
                                ? 'bg-primary-50/40 dark:bg-primary-900/10'
                                : ''}
                            `}
                            onClick={() => handleNotificationClick(n)}
                          >
                            {/* Icon */}
                            <div className={`w-9 h-9 rounded-xl ${cfg.bg}
                                            flex items-center justify-center
                                            flex-shrink-0 text-lg`}>
                              {cfg.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm font-medium
                                              text-gray-900 dark:text-white
                                              leading-tight
                                              ${!n.read ? 'font-semibold' : ''}`}>
                                  {n.title}
                                </p>
                                {/* Unread dot */}
                                {!n.read && (
                                  <span className="w-2 h-2 bg-primary-500
                                                   rounded-full flex-shrink-0
                                                   mt-1" />
                                )}
                              </div>
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

                            {/* Delete button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(n.id)
                              }}
                              className="opacity-0 group-hover:opacity-100
                                         p-1 text-gray-400 hover:text-red-500
                                         transition-all rounded flex-shrink-0"
                              title="Delete"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200
                                    dark:border-gray-700 text-center">
                      <span className="text-xs text-gray-400">
                        {notifications.length} notification
                        {notifications.length !== 1 ? 's' : ''} total
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── User Menu ── */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2 p-1.5 rounded-lg
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-colors"
            >
              <Avatar
                src={user?.avatar}
                name={displayName}
                size="sm"
                status="online"
              />
              <span className="hidden md:block text-sm font-medium
                               text-gray-700 dark:text-gray-300">
                {firstName}
              </span>
              <FiChevronDown className="hidden md:block w-4 h-4
                                        text-gray-400" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white
                             dark:bg-gray-800 rounded-xl shadow-lg
                             border border-gray-200 dark:border-gray-700
                             overflow-hidden z-50"
                >
                  {/* User info */}
                  <div className="p-4 border-b border-gray-200
                                  dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white
                                  truncate">
                      {displayName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400
                                  truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5
                                     bg-primary-100 dark:bg-primary-900/30
                                     text-primary-700 dark:text-primary-400
                                     text-xs rounded-full font-medium">
                      {user?.role}
                    </span>
                  </div>

                  {/* Links */}
                  <div className="p-2">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2
                                 rounded-lg hover:bg-gray-100
                                 dark:hover:bg-gray-700 transition-colors
                                 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <FiUser className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2
                                 rounded-lg hover:bg-gray-100
                                 dark:hover:bg-gray-700 transition-colors
                                 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <FiSettings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="p-2 border-t border-gray-200
                                  dark:border-gray-700">
                    <button
                      onClick={() => { setShowUserMenu(false); logout() }}
                      className="flex items-center gap-3 px-3 py-2 w-full
                                 rounded-lg hover:bg-red-50
                                 dark:hover:bg-red-900/20 text-red-600
                                 transition-colors text-sm"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                               w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800
                       rounded-xl border-none focus:outline-none
                       focus:ring-2 focus:ring-primary-500
                       text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>
      </div>
    </nav>
  )
}

export default Navbar