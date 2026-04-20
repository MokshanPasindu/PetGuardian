// src/pages/profile/Settings.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiBell,
  FiLock,
  FiGlobe,
  FiMoon,
  FiTrash2,
  FiDownload,
  FiShield,
} from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Alert from '../../components/common/Alert'

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { logout } = useAuth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    vaccineReminders: true,
    communityUpdates: false,
    marketing: false,
  })

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <FiMoon className="w-5 h-5 text-gray-500" />
              <Card.Title>Appearance</Card.Title>
            </div>
          </Card.Header>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Toggle between light and dark theme
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                darkMode ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'left-8' : 'left-1'
                }`}
              />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <FiBell className="w-5 h-5 text-gray-500" />
              <Card.Title>Notifications</Card.Title>
            </div>
          </Card.Header>

          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
              { key: 'vaccineReminders', label: 'Vaccine Reminders', desc: 'Get reminded about upcoming vaccinations' },
              { key: 'communityUpdates', label: 'Community Updates', desc: 'New posts and replies' },
              { key: 'marketing', label: 'Marketing', desc: 'News and promotional emails' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    notifications[item.key] ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications[item.key] ? 'left-8' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <FiLock className="w-5 h-5 text-gray-500" />
              <Card.Title>Security</Card.Title>
            </div>
          </Card.Header>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                Change Password
              </h4>
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="••••••••"
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                />
                <Button>Update Password</Button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="secondary" icon={FiShield}>
                  Enable 2FA
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Data & Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <FiGlobe className="w-5 h-5 text-gray-500" />
              <Card.Title>Data & Privacy</Card.Title>
            </div>
          </Card.Header>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Download Your Data
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get a copy of all your data including pet profiles and health records
                </p>
              </div>
              <Button variant="secondary" icon={FiDownload}>
                Download
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-medium text-danger-600">Delete Account</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="danger"
                icon={FiTrash2}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
      >
        <Alert variant="error" className="mb-4">
          This action cannot be undone. All your data, including pet profiles, 
          health records, and scan history will be permanently deleted.
        </Alert>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please type <strong>DELETE</strong> to confirm:
        </p>
        <Input placeholder="Type DELETE to confirm" className="mb-4" />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger">Delete My Account</Button>
        </div>
      </Modal>
    </div>
  )
}

export default Settings