// src/pages/profile/Settings.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  FiBell, FiLock, FiGlobe, FiMoon,
  FiTrash2, FiDownload, FiShield,
  FiEye, FiEyeOff, FiCheck,
} from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Alert from '../../components/common/Alert'
import toast from 'react-hot-toast'

// ─── Toggle Switch component ───────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
      checked ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
    }`}
  >
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
      checked ? 'translate-x-6' : 'translate-x-0.5'
    }`} />
  </button>
)

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const { logout, changePassword }   = useAuth()

  const [showDeleteModal,   setShowDeleteModal]   = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [changingPassword,  setChangingPassword]  = useState(false)
  const [showCurrentPw,     setShowCurrentPw]     = useState(false)
  const [showNewPw,         setShowNewPw]         = useState(false)
  const [showConfirmPw,     setShowConfirmPw]     = useState(false)
  const [passwordChanged,   setPasswordChanged]   = useState(false)

  const [notifications, setNotifications] = useState({
    email:            true,
    push:             true,
    vaccineReminders: true,
    communityUpdates: false,
    marketing:        false,
  })

  // ─── Password form ─────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: pwErrors },
  } = useForm()

  const newPassword = watch('newPassword')

  const onChangePassword = async (data) => {
    setChangingPassword(true)
    try {
      await changePassword(data.currentPassword, data.newPassword)
      setPasswordChanged(true)
      resetPasswordForm()
      setTimeout(() => setPasswordChanged(false), 4000)
    } catch {
      // handled in context
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account preferences and security
        </p>
      </motion.div>

      {/* ── Appearance ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <Card.Title>Appearance</Card.Title>
            </div>
          </Card.Header>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark theme
              </p>
            </div>
            <Toggle checked={darkMode} onChange={toggleDarkMode} />
          </div>
        </Card>
      </motion.div>

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <FiBell className="w-5 h-5 text-blue-500" />
              </div>
              <Card.Title>Notifications</Card.Title>
            </div>
          </Card.Header>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[
              { key: 'email',            label: 'Email Notifications',  desc: 'Receive updates and alerts via email' },
              { key: 'push',             label: 'Push Notifications',   desc: 'In-browser push notifications' },
              { key: 'vaccineReminders', label: 'Vaccine Reminders',    desc: 'Alerts for upcoming vaccinations' },
              { key: 'communityUpdates', label: 'Community Updates',    desc: 'Replies and likes on your posts' },
              { key: 'marketing',        label: 'Marketing Emails',     desc: 'News, tips and promotional content' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
                <Toggle
                  checked={notifications[item.key]}
                  onChange={() => setNotifications(p => ({ ...p, [item.key]: !p[item.key] }))}
                />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ── Security / Change Password ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <FiLock className="w-5 h-5 text-green-500" />
              </div>
              <Card.Title>Security</Card.Title>
            </div>
          </Card.Header>

          {/* Success banner */}
          {passwordChanged && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
            >
              <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Password changed successfully! Please use your new password next time you log in.
              </p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Change Password
            </h4>

            {/* Current password */}
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrentPw ? 'text' : 'password'}
                placeholder="Enter your current password"
                error={pwErrors.currentPassword?.message}
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(p => !p)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showCurrentPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>

            {/* New password */}
            <div className="relative">
              <Input
                label="New Password"
                type={showNewPw ? 'text' : 'password'}
                placeholder="At least 8 characters"
                helperText="Use uppercase, lowercase, numbers and symbols"
                error={pwErrors.newPassword?.message}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  validate: v =>
                    v !== watch('currentPassword') || 'New password must differ from current',
                })}
              />
              <button
                type="button"
                onClick={() => setShowNewPw(p => !p)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNewPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="Repeat new password"
                error={pwErrors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: v => v === newPassword || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(p => !p)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              icon={FiLock}
              loading={changingPassword}
            >
              Update Password
            </Button>
          </form>

          {/* 2FA */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="secondary" icon={FiShield} size="sm">
              Enable 2FA
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* ── Data & Privacy ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <FiGlobe className="w-5 h-5 text-purple-500" />
              </div>
              <Card.Title>Data & Privacy</Card.Title>
            </div>
          </Card.Header>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Download data */}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Download Your Data
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Export all your data including pets and health records
                </p>
              </div>
              <Button
                variant="secondary"
                icon={FiDownload}
                size="sm"
                onClick={() => toast('Data export coming soon!', { icon: '📦' })}
              >
                Export
              </Button>
            </div>

            {/* Delete account */}
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-danger-600 dark:text-danger-400">
                  Delete Account
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="danger"
                icon={FiTrash2}
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Delete Account Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <Alert variant="error">
            <strong>This action is permanent.</strong> All your data including pet
            profiles, health records, scan history and community posts will be
            deleted and cannot be recovered.
          </Alert>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Type <strong className="text-gray-900 dark:text-white">DELETE</strong> to
            confirm:
          </p>

          <input
            type="text"
            value={deleteConfirmText}
            onChange={e => setDeleteConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={FiTrash2}
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={() => toast('Account deletion requires backend implementation', { icon: '⚠️' })}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Settings