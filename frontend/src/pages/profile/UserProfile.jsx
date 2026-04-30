// src/pages/profile/UserProfile.jsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  FiUser, FiMail, FiPhone, FiMapPin,
  FiCamera, FiEdit2, FiShield, FiSave,
  FiX, FiCheck,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const UserProfile = () => {
  const { user, updateProfile, uploadAvatar, loading } = useAuth()
  const [isEditing,      setIsEditing]      = useState(false)
  const [avatarLoading,  setAvatarLoading]  = useState(false)
  const [avatarPreview,  setAvatarPreview]  = useState(null)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName:  user?.lastName  || '',
      email:     user?.email     || '',
      phone:     user?.phone     || '',
      address:   user?.address   || '',
    },
  })

  // ─── Submit profile update ─────────────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      await updateProfile(data)
      setIsEditing(false)
    } catch {
      // handled in context
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  // ─── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    // Show preview immediately
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)

    // Upload
    setAvatarLoading(true)
    try {
      await uploadAvatar(file)
      // Preview stays until next page load (user.avatar will update)
    } catch {
      setAvatarPreview(null) // revert preview on error
    } finally {
      setAvatarLoading(false)
      e.target.value = ''
    }
  }

  // ─── Role badge ────────────────────────────────────────────────────────────
  const roleBadge = {
    ADMIN: { label: 'Administrator', variant: 'warning' },
    VET:   { label: 'Veterinarian',  variant: 'info' },
    OWNER: { label: 'Pet Owner',     variant: 'success' },
  }[user?.role] || { label: user?.role, variant: 'default' }

  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  const currentAvatar = avatarPreview || user?.avatar

  if (!user) return <LoadingPage message="Loading profile..." />

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Profile Header Card ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

            {/* Avatar + upload */}
            <div className="relative flex-shrink-0">
              <div className="relative">
                <Avatar
                  src={currentAvatar}
                  name={displayName || user?.email}
                  size="2xl"
                />
                {/* Loading overlay */}
                {avatarLoading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="absolute bottom-0 right-0 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-md transition-colors disabled:opacity-60"
                title="Change profile photo"
              >
                <FiCamera className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  {displayName || 'Your Name'}
                </h1>
                <Badge variant={roleBadge.variant} icon={FiShield}>
                  {roleBadge.label}
                </Badge>
              </div>

              <p className="text-gray-500 dark:text-gray-400 mb-1">
                {user.email}
              </p>
              {user.phone && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {user.phone}
                </p>
              )}
              {user.address && (
                <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 justify-center md:justify-start mt-1">
                  <FiMapPin className="w-3.5 h-3.5" />
                  {user.address}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-3">
                Click the camera icon to update your profile photo
              </p>
            </div>

            {/* Edit toggle */}
            <div className="flex-shrink-0">
              {!isEditing ? (
                <Button
                  variant="secondary"
                  icon={FiEdit2}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  icon={FiX}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Personal Information ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>Personal Information</Card.Title>
            {isEditing && (
              <span className="text-xs text-primary-500 font-medium bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-full">
                ✏️ Editing
              </span>
            )}
          </Card.Header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-5">

              <Input
                label="First Name"
                icon={FiUser}
                placeholder="John"
                disabled={!isEditing}
                error={errors.firstName?.message}
                {...register('firstName', { required: 'First name is required' })}
              />

              <Input
                label="Last Name"
                icon={FiUser}
                placeholder="Doe"
                disabled={!isEditing}
                error={errors.lastName?.message}
                {...register('lastName', { required: 'Last name is required' })}
              />

              <Input
                label="Email Address"
                type="email"
                icon={FiMail}
                placeholder="you@example.com"
                disabled={!isEditing}
                error={errors.email?.message}
                helperText={isEditing ? 'Changing email requires re-verification' : ''}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
              />

              <Input
                label="Phone Number"
                type="tel"
                icon={FiPhone}
                placeholder="+1 (555) 000-0000"
                disabled={!isEditing}
                {...register('phone')}
              />

              <div className="md:col-span-2">
                <Input
                  label="Address"
                  icon={FiMapPin}
                  placeholder="Your city or address"
                  disabled={!isEditing}
                  {...register('address')}
                />
              </div>
            </div>

            {/* Save / Cancel buttons */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-end gap-3 pt-2"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    icon={FiX}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    icon={FiSave}
                    loading={loading}
                    disabled={!isDirty}
                  >
                    Save Changes
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>
      </motion.div>

      {/* ── Emergency Contact ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Card.Header>
            <div>
              <Card.Title>Emergency Contact</Card.Title>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Shown when someone scans your pet's QR code
              </p>
            </div>
          </Card.Header>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-5">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              💡 Your <strong>phone</strong> and <strong>email</strong> from your profile
              are automatically shown on your pet's public QR profile. Keep them up to date above.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Input
              label="Your Phone (from profile)"
              icon={FiPhone}
              value={user?.phone || 'Not set'}
              disabled
            />
            <Input
              label="Your Email (from profile)"
              icon={FiMail}
              value={user?.email || ''}
              disabled
            />
          </div>
        </Card>
      </motion.div>

      {/* ── Account Info ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>Account Information</Card.Title>
          </Card.Header>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Account Role',   value: roleBadge.label,         icon: FiShield },
              { label: 'Account Status', value: user?.enabled ? 'Active' : 'Suspended', icon: FiCheck },
              { label: 'User ID',        value: `#${user?.id}`,          icon: FiUser },
            ].map(item => (
              <div key={item.label} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default UserProfile