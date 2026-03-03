// src/components/layout/Navbar.jsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiMoon,
  FiSun,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import Avatar from '../common/Avatar'

const Navbar = ({ onMenuClick, isSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const notifications = [
    {
      id: 1,
      title: 'Vaccination Reminder',
      message: "Max's rabies vaccination is due in 3 days",
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 2,
      title: 'AI Scan Complete',
      message: 'Your recent skin scan results are ready',
      time: '5 hours ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Community Response',
      message: 'Someone replied to your post',
      time: '1 day ago',
      unread: false,
    },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden transition-colors"
          >
            {isSidebarOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🐾</span>
            </div>
            <span className="hidden sm:block text-xl font-display font-bold text-gray-900 dark:text-white">
              PetGuardian
            </span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pets, records, vets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? (
              <FiSun className="w-5 h-5 text-yellow-500" />
            ) : (
              <FiMoon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                          notification.unread ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <span className="w-2 h-2 mt-2 bg-primary-500 rounded-full flex-shrink-0" />
                          )}
                          <div className={notification.unread ? '' : 'ml-5'}>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-center text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Avatar
                src={user?.avatar}
                name={user?.name}
                size="sm"
                status="online"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name?.split(' ')[0]}
              </span>
              <FiChevronDown className="hidden md:block w-4 h-4 text-gray-400" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        logout()
                      }}
                      className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20 text-danger-600 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Logout</span>
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
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
          />
        </div>
      </div>
    </nav>
  )
}

export default Navbar