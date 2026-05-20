// src/pages/profile/Settings.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  FiBell, FiLock, FiGlobe, FiMoon, FiSun,
  FiTrash2, FiDownload, FiShield,
  FiEye, FiEyeOff, FiCheck, FiAlertTriangle,
  FiMail, FiSmartphone, FiMessageSquare,
  FiTrendingUp, FiKey, FiChevronRight,
} from 'react-icons/fi'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

// ── Toggle Switch ──────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    aria-checked={checked}
    role="switch"
    className={`
      relative w-12 h-6 rounded-full transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-primary-500
      focus:ring-offset-2 dark:focus:ring-offset-gray-800
      disabled:opacity-50 disabled:cursor-not-allowed
      ${checked
        ? 'bg-primary-500 shadow-primary-500/30 shadow-md'
        : 'bg-gray-200 dark:bg-gray-600'
      }
    `}
  >
    <span className={`
      absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md
      transition-transform duration-300 ease-spring
      ${checked ? 'translate-x-6' : 'translate-x-0.5'}
    `} />
  </button>
)

// ── Section Header ─────────────────────────────────────────
const SectionHeader = ({ icon: Icon, label, color }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
      {label}
    </h2>
  </div>
)

// ── Setting Row ────────────────────────────────────────────
const SettingRow = ({
  icon: Icon,
  label,
  description,
  children,
  last = false,
}) => (
  <div className={`
    flex items-center justify-between gap-4 py-4
    ${!last
      ? 'border-b border-gray-100 dark:border-gray-700/50'
      : ''}
  `}>
    <div className="flex items-start gap-3 flex-1 min-w-0">
      {Icon && (
        <div className="p-1.5 bg-gray-100 dark:bg-gray-700
                        rounded-lg flex-shrink-0 mt-0.5">
          <Icon className="w-3.5 h-3.5 text-gray-500
                           dark:text-gray-400" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900
                      dark:text-white">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400
                        mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
)

// ── Password Strength ──────────────────────────────────────
const PasswordStrength = ({ password }) => {
  if (!password) return null

  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase',     pass: /[A-Z]/.test(password) },
    { label: 'Number',        pass: /\d/.test(password) },
    { label: 'Symbol',        pass: /[^A-Za-z0-9]/.test(password) },
  ]

  const score = checks.filter(c => c.pass).length
  const colors = ['bg-red-400', 'bg-orange-400',
                  'bg-yellow-400', 'bg-green-400']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : 'bg-gray-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
      {/* Chips */}
      <div className="flex flex-wrap gap-1.5">
        {checks.map(c => (
          <span
            key={c.label}
            className={`
              text-xs px-2 py-0.5 rounded-full font-medium
              transition-all duration-200
              ${c.pass
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              }
            `}
          >
            {c.pass ? '✓ ' : '○ '}{c.label}
          </span>
        ))}
        <span className={`
          text-xs px-2 py-0.5 rounded-full font-bold
          ${score === 4
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : score >= 2
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
          }
        `}>
          {labels[score - 1] || 'Too weak'}
        </span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const Settings = () => {
  const { darkMode, toggleDarkMode }   = useTheme()
  const { logout, changePassword }     = useAuth()

  // ── State ──────────────────────────────────────────────────
  const [showDeleteModal,   setShowDeleteModal]   = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [changingPassword,  setChangingPassword]  = useState(false)
  const [showCurrentPw,     setShowCurrentPw]     = useState(false)
  const [showNewPw,         setShowNewPw]         = useState(false)
  const [showConfirmPw,     setShowConfirmPw]     = useState(false)
  const [passwordChanged,   setPasswordChanged]   = useState(false)
  const [deletingAccount,   setDeletingAccount]   = useState(false)
  const [activeSection,     setActiveSection]     = useState('appearance')

  const [notifSettings, setNotifSettings] = useState({
    emailAlerts:      true,
    pushNotifications:true,
    vaccineReminders: true,
    appointmentAlerts:true,
    communityReplies: false,
    aiScanAlerts:     true,
    marketing:        false,
  })

  // ── Password form ──────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: pwErrors },
  } = useForm()

  const newPassword    = watch('newPassword', '')
  const currentPassword = watch('currentPassword', '')

  const onChangePassword = async (data) => {
    setChangingPassword(true)
    try {
      await changePassword(data.currentPassword, data.newPassword)
      setPasswordChanged(true)
      resetPasswordForm()
      setTimeout(() => setPasswordChanged(false), 5000)
    } catch {
      // handled in context
    } finally {
      setChangingPassword(false)
    }
  }

  // ── Notification toggle ────────────────────────────────────
  const toggleNotif = (key) => {
    setNotifSettings(prev => {
      const next = { ...prev, [key]: !prev[key] }
      toast.success(
        `${next[key] ? 'Enabled' : 'Disabled'} notifications`,
        { duration: 1500 }
      )
      return next
    })
  }

  // ── Nav items ──────────────────────────────────────────────
  const navItems = [
    { id: 'appearance',    label: 'Appearance',    icon: FiMoon   },
    { id: 'notifications', label: 'Notifications', icon: FiBell   },
    { id: 'security',      label: 'Security',      icon: FiLock   },
    { id: 'privacy',       label: 'Privacy',       icon: FiGlobe  },
  ]

  return (
    <div className="max-w-5xl mx-auto px-0 sm:px-0">

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account preferences and security
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left Nav (desktop) / Tabs (mobile) ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-56 flex-shrink-0"
        >
          {/* Mobile: horizontal scroll tabs */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl
                  text-sm font-medium whitespace-nowrap flex-shrink-0
                  transition-all duration-200
                  ${activeSection === item.id
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical nav */}
          <div className="hidden lg:block bg-white dark:bg-gray-800
                          rounded-2xl border border-gray-200
                          dark:border-gray-700 overflow-hidden
                          shadow-sm">
            {navItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-3.5 text-sm font-medium
                  transition-all duration-200 group
                  ${idx !== navItems.length - 1
                    ? 'border-b border-gray-100 dark:border-gray-700/50'
                    : ''}
                  ${activeSection === item.id
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                {activeSection === item.id && (
                  <div className="w-1.5 h-1.5 bg-primary-500
                                  rounded-full" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Right Content ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">

            {/* ════════════════════════════════════════════════
                APPEARANCE
            ════════════════════════════════════════════════ */}
            {activeSection === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-gray-800 rounded-2xl
                           border border-gray-200 dark:border-gray-700
                           shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <SectionHeader
                    icon={FiMoon}
                    label="Appearance"
                    color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  />

                  {/* Theme toggle — visual cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Light */}
                    <button
                      onClick={() => darkMode && toggleDarkMode()}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all
                        duration-200 text-left group
                        ${!darkMode
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      {/* Preview */}
                      <div className="w-full h-16 bg-white rounded-lg
                                      border border-gray-200 mb-3
                                      overflow-hidden shadow-sm">
                        <div className="h-3 bg-gray-100 flex items-center
                                        px-2 gap-1">
                          <div className="w-1.5 h-1.5 rounded-full
                                          bg-red-400" />
                          <div className="w-1.5 h-1.5 rounded-full
                                          bg-yellow-400" />
                          <div className="w-1.5 h-1.5 rounded-full
                                          bg-green-400" />
                        </div>
                        <div className="p-2 space-y-1">
                          <div className="h-1.5 bg-gray-200 rounded
                                          w-3/4" />
                          <div className="h-1.5 bg-gray-100 rounded
                                          w-1/2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiSun className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-semibold
                                           text-gray-900 dark:text-white">
                            Light
                          </span>
                        </div>
                        {!darkMode && (
                          <div className="w-5 h-5 bg-primary-500
                                          rounded-full flex items-center
                                          justify-center">
                            <FiCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Dark */}
                    <button
                      onClick={() => !darkMode && toggleDarkMode()}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all
                        duration-200 text-left group
                        ${darkMode
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }
                      `}
                    >
                      {/* Preview */}
                      <div className="w-full h-16 bg-gray-900 rounded-lg
                                      border border-gray-700 mb-3
                                      overflow-hidden shadow-sm">
                        <div className="h-3 bg-gray-800 flex items-center
                                        px-2 gap-1">
                          <div className="w-1.5 h-1.5 rounded-full
                                          bg-red-400" />
                          <div className="w-1.5 h-1.5 rounded-full
                                          bg-yellow-400" />
                          <div className="w-1.5 h-1.5 rounded-full
                                          bg-green-400" />
                        </div>
                        <div className="p-2 space-y-1">
                          <div className="h-1.5 bg-gray-700 rounded
                                          w-3/4" />
                          <div className="h-1.5 bg-gray-800 rounded
                                          w-1/2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiMoon className="w-4 h-4 text-indigo-400" />
                          <span className="text-sm font-semibold
                                           text-gray-900 dark:text-white">
                            Dark
                          </span>
                        </div>
                        {darkMode && (
                          <div className="w-5 h-5 bg-primary-500
                                          rounded-full flex items-center
                                          justify-center">
                            <FiCheck className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Current status */}
                  <div className="flex items-center gap-3 p-4
                                  bg-gray-50 dark:bg-gray-700/50
                                  rounded-xl">
                    {darkMode
                      ? <FiMoon className="w-5 h-5 text-indigo-400" />
                      : <FiSun  className="w-5 h-5 text-yellow-500" />
                    }
                    <div>
                      <p className="text-sm font-semibold text-gray-900
                                    dark:text-white">
                        {darkMode ? 'Dark mode active' : 'Light mode active'}
                      </p>
                      <p className="text-xs text-gray-500
                                    dark:text-gray-400">
                        {darkMode
                          ? 'Easy on the eyes in low-light environments'
                          : 'Classic bright theme for daytime use'
                        }
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Toggle
                        checked={darkMode}
                        onChange={toggleDarkMode}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════
                NOTIFICATIONS
            ════════════════════════════════════════════════ */}
            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-gray-800 rounded-2xl
                           border border-gray-200 dark:border-gray-700
                           shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <SectionHeader
                    icon={FiBell}
                    label="Notifications"
                    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  />

                  {/* Groups */}
                  {[
                    {
                      groupLabel: '🏥 Health & Safety',
                      items: [
                        {
                          key: 'aiScanAlerts',
                          icon: FiAlertTriangle,
                          label: 'AI Scan Alerts',
                          desc: 'Notifications when AI detects conditions in your pet',
                        },
                        {
                          key: 'vaccineReminders',
                          icon: FiBell,
                          label: 'Vaccine Reminders',
                          desc: 'Alerts before vaccinations become due or overdue',
                        },
                        {
                          key: 'appointmentAlerts',
                          icon: FiCheck,
                          label: 'Appointment Updates',
                          desc: 'Booking confirmations, reminders and cancellations',
                        },
                      ],
                    },
                    {
                      groupLabel: '📣 Communication',
                      items: [
                        {
                          key: 'emailAlerts',
                          icon: FiMail,
                          label: 'Email Notifications',
                          desc: 'Receive alerts and updates via email',
                        },
                        {
                          key: 'pushNotifications',
                          icon: FiSmartphone,
                          label: 'In-App Notifications',
                          desc: 'Bell icon updates in the navigation bar',
                        },
                        {
                          key: 'communityReplies',
                          icon: FiMessageSquare,
                          label: 'Community Activity',
                          desc: 'Replies and interactions on your posts',
                        },
                      ],
                    },
                    {
                      groupLabel: '📊 Other',
                      items: [
                        {
                          key: 'marketing',
                          icon: FiTrendingUp,
                          label: 'Marketing Emails',
                          desc: 'News, tips and promotional content',
                        },
                      ],
                    },
                  ].map(group => (
                    <div key={group.groupLabel} className="mb-6">
                      <p className="text-xs font-bold text-gray-400
                                    dark:text-gray-500 uppercase
                                    tracking-wider mb-3">
                        {group.groupLabel}
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-700/30
                                      rounded-xl overflow-hidden
                                      border border-gray-100
                                      dark:border-gray-700">
                        {group.items.map((item, idx) => (
                          <SettingRow
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            description={item.desc}
                            last={idx === group.items.length - 1}
                          >
                            <Toggle
                              checked={notifSettings[item.key]}
                              onChange={() => toggleNotif(item.key)}
                            />
                          </SettingRow>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        const all = Object.fromEntries(
                          Object.keys(notifSettings).map(k => [k, true])
                        )
                        setNotifSettings(all)
                        toast.success('All notifications enabled')
                      }}
                      className="text-sm text-primary-600 dark:text-primary-400
                                 hover:underline font-medium"
                    >
                      Enable all
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      onClick={() => {
                        const none = Object.fromEntries(
                          Object.keys(notifSettings).map(k => [k, false])
                        )
                        setNotifSettings(none)
                        toast('All notifications disabled', { icon: '🔕' })
                      }}
                      className="text-sm text-gray-500 hover:underline font-medium"
                    >
                      Disable all
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════
                SECURITY
            ════════════════════════════════════════════════ */}
            {activeSection === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Change Password */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl
                                border border-gray-200 dark:border-gray-700
                                shadow-sm p-6">
                  <SectionHeader
                    icon={FiLock}
                    label="Change Password"
                    color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  />

                  {/* Success Banner */}
                  <AnimatePresence>
                    {passwordChanged && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-green-50 dark:bg-green-900/20
                                        border border-green-200 dark:border-green-800
                                        rounded-xl flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full
                                          flex items-center justify-center
                                          flex-shrink-0">
                            <FiCheck className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold
                                          text-green-800 dark:text-green-300">
                              Password updated successfully!
                            </p>
                            <p className="text-xs text-green-600
                                          dark:text-green-400 mt-0.5">
                              Use your new password next time you log in.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form
                    onSubmit={handleSubmit(onChangePassword)}
                    className="space-y-4"
                  >
                    {/* Current Password */}
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
                        className="absolute right-3 top-9 text-gray-400
                                   hover:text-gray-600 dark:hover:text-gray-300
                                   transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showCurrentPw
                          ? <FiEyeOff className="w-4 h-4" />
                          : <FiEye   className="w-4 h-4" />
                        }
                      </button>
                    </div>

                    {/* New Password */}
                    <div className="relative">
                      <Input
                        label="New Password"
                        type={showNewPw ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        error={pwErrors.newPassword?.message}
                        {...register('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                          },
                          validate: v =>
                            v !== currentPassword ||
                            'New password must differ from current',
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(p => !p)}
                        className="absolute right-3 top-9 text-gray-400
                                   hover:text-gray-600 dark:hover:text-gray-300
                                   transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showNewPw
                          ? <FiEyeOff className="w-4 h-4" />
                          : <FiEye   className="w-4 h-4" />
                        }
                      </button>
                      <PasswordStrength password={newPassword} />
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <Input
                        label="Confirm New Password"
                        type={showConfirmPw ? 'text' : 'password'}
                        placeholder="Repeat your new password"
                        error={pwErrors.confirmPassword?.message}
                        {...register('confirmPassword', {
                          required: 'Please confirm your new password',
                          validate: v =>
                            v === newPassword || 'Passwords do not match',
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(p => !p)}
                        className="absolute right-3 top-9 text-gray-400
                                   hover:text-gray-600 dark:hover:text-gray-300
                                   transition-colors p-1"
                        tabIndex={-1}
                      >
                        {showConfirmPw
                          ? <FiEyeOff className="w-4 h-4" />
                          : <FiEye   className="w-4 h-4" />
                        }
                      </button>
                    </div>

                    <Button
                      type="submit"
                      icon={FiKey}
                      loading={changingPassword}
                      className="w-full sm:w-auto"
                    >
                      Update Password
                    </Button>
                  </form>
                </div>

                {/* 2FA Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl
                                border border-gray-200 dark:border-gray-700
                                shadow-sm p-6">
                  <div className="flex items-center justify-between
                                  flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30
                                      rounded-xl flex-shrink-0">
                        <FiShield className="w-6 h-6 text-purple-600
                                             dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900
                                       dark:text-white">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-gray-500
                                      dark:text-gray-400 mt-1">
                          Add an extra layer of security.
                          Currently <span className="text-orange-500
                          font-medium">not enabled</span>.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      icon={FiShield}
                      size="sm"
                      onClick={() =>
                        toast('2FA setup coming soon!', { icon: '🔐' })
                      }
                    >
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════
                PRIVACY
            ════════════════════════════════════════════════ */}
            {activeSection === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Data */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl
                                border border-gray-200 dark:border-gray-700
                                shadow-sm p-6">
                  <SectionHeader
                    icon={FiGlobe}
                    label="Data & Privacy"
                    color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                  />

                  {/* Export */}
                  <div className="flex items-center justify-between
                                  gap-4 p-4 bg-blue-50 dark:bg-blue-900/20
                                  border border-blue-100 dark:border-blue-900/30
                                  rounded-xl mb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/40
                                      rounded-lg flex-shrink-0">
                        <FiDownload className="w-4 h-4 text-blue-600
                                               dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900
                                      dark:text-white">
                          Export Your Data
                        </p>
                        <p className="text-xs text-gray-500
                                      dark:text-gray-400 mt-0.5">
                          Download all your pets, health records
                          and scan history as a file.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      icon={FiDownload}
                      size="sm"
                      onClick={() =>
                        toast('Data export coming soon!', { icon: '📦' })
                      }
                    >
                      Export
                    </Button>
                  </div>

                  {/* Privacy info */}
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Data Encryption',
                        desc: 'All your data is encrypted at rest and in transit',
                        status: 'Active',
                        statusColor: 'text-green-600 dark:text-green-400',
                      },
                      {
                        label: 'QR Profile Visibility',
                        desc: 'Public QR profiles only show emergency contact info',
                        status: 'Limited',
                        statusColor: 'text-blue-600 dark:text-blue-400',
                      },
                      {
                        label: 'Data Sharing',
                        desc: 'Your data is never sold to third parties',
                        status: 'Never',
                        statusColor: 'text-green-600 dark:text-green-400',
                      },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between
                                   p-3 bg-gray-50 dark:bg-gray-700/40
                                   rounded-xl"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900
                                        dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-xs text-gray-500
                                        dark:text-gray-400 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        <span className={`text-xs font-bold
                                          ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl
                                border-2 border-red-100 dark:border-red-900/30
                                shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-red-100 dark:bg-red-900/30
                                    rounded-xl">
                      <FiAlertTriangle className="w-5 h-5 text-red-600
                                                   dark:text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-red-600
                                   dark:text-red-400">
                      Danger Zone
                    </h2>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20
                                  rounded-xl border border-red-100
                                  dark:border-red-900/30 mb-4">
                    <p className="text-sm text-red-700 dark:text-red-300
                                  leading-relaxed">
                      ⚠️ Deleting your account is <strong>permanent
                      and irreversible</strong>. All your pet profiles,
                      health records, scan history and community posts
                      will be permanently deleted.
                    </p>
                  </div>

                  <Button
                    variant="danger"
                    icon={FiTrash2}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete My Account
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── Delete Account Modal ── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!deletingAccount) {
            setShowDeleteModal(false)
            setDeleteConfirmText('')
          }
        }}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          {/* Warning */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20
                          border border-red-200 dark:border-red-800
                          rounded-xl">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-red-600
                                          dark:text-red-400 flex-shrink-0
                                          mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800
                              dark:text-red-300">
                  This action cannot be undone
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400
                               mt-2 space-y-1 list-disc list-inside">
                  <li>All pet profiles deleted</li>
                  <li>All health records deleted</li>
                  <li>All AI scan history deleted</li>
                  <li>All community posts deleted</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700
                               dark:text-gray-300 mb-2">
              Type <strong className="text-gray-900 dark:text-white
                                      font-mono">
                DELETE
              </strong> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e =>
                setDeleteConfirmText(e.target.value.toUpperCase())
              }
              placeholder="Type DELETE here"
              autoComplete="off"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700
                         border border-gray-200 dark:border-gray-600
                         rounded-xl text-gray-900 dark:text-white
                         placeholder-gray-400 font-mono
                         focus:outline-none focus:ring-2
                         focus:ring-red-500 focus:border-transparent
                         transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmText('')
              }}
              disabled={deletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={FiTrash2}
              loading={deletingAccount}
              disabled={
                deleteConfirmText !== 'DELETE' || deletingAccount
              }
              onClick={() =>
                toast(
                  'Account deletion requires backend implementation',
                  { icon: '⚠️' }
                )
              }
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