// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome,
  FiHeart,
  FiCamera,
  FiMapPin,
  FiGrid,
  FiUsers,
  FiMessageCircle,
  FiSettings,
  FiShield,
  FiCalendar,
  FiChevronRight,
  FiUserCheck,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/helpers'

const menuItems = [
  {
    title: 'Main',
    items: [
      { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
      { icon: FiHeart, label: 'My Pets', path: '/pets' },
      { icon: FiCamera, label: 'AI Scan', path: '/scan', badge: 'AI' },
    ],
  },
  {
    title: 'Health',
    items: [
      { icon: FiGrid, label: 'QR & ID Cards', path: '/qr' },
      { icon: FiCalendar, label: 'Appointments', path: '/appointments' },
    ],
  },
  {
    title: 'Connect',
    items: [
      { icon: FiMapPin, label: 'Find Vets', path: '/vets' },
      { icon: FiUsers, label: 'Community', path: '/community' },
    ],
  },
]

const adminItems = [
  {
    title: 'Admin',
    items: [
      { icon: FiShield, label: 'Admin Dashboard', path: '/admin-dashboard' },
      { icon: FiUserCheck, label: 'User Management', path: '/admin/users' }, // ✅ Updated
    ],
  },
]

const vetItems = [
  {
    title: 'Veterinarian',
    items: [
      { icon: FiShield, label: 'Vet Dashboard', path: '/vet-dashboard' },
    ],
  },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  const allMenuItems = [
    ...menuItems,
    ...(user?.role === 'ADMIN' ? adminItems : []),
    ...(user?.role === 'VET' ? vetItems : []),
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo for mobile */}
      <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">🐾</span>
          </div>
          <span className="text-xl font-display font-bold text-gray-900 dark:text-white">
            PetGuardian
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {allMenuItems.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                        isActive
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-500 text-white">
                        {item.badge}
                      </span>
                    )}
                    <FiChevronRight className="w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
          <h4 className="font-semibold mb-1">Need Help?</h4>
          <p className="text-sm text-primary-100 mb-3">
            Chat with our AI assistant for quick answers
          </p>
          <button className="w-full bg-white text-primary-600 font-medium py-2 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
            <FiMessageCircle className="w-4 h-4" />
            Start Chat
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar