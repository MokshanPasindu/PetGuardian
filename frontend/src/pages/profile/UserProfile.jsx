// src/pages/profile/UserProfile.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCamera,
  FiEdit,
  FiShield,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'

const UserProfile = () => {
  const { user, updateProfile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await updateProfile(data)
      setIsEditing(false)
    } catch (error) {
      // Error handled in context
    }
  }

  const stats = [
    { label: 'Pets', value: 3 },
    { label: 'AI Scans', value: 12 },
    { label: 'Posts', value: 5 },
    { label: 'Member Since', value: '2023' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar
                src={user?.avatar}
                name={user?.name}
                size="2xl"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors">
                <FiCamera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  {user?.name}
                </h1>
                <Badge variant="primary" icon={FiShield}>
                  {user?.role || 'Pet Owner'}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {user?.email}
              </p>

              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              icon={FiEdit}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>Personal Information</Card.Title>
          </Card.Header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                icon={FiUser}
                disabled={!isEditing}
                error={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
              />

              <Input
                label="Email"
                type="email"
                icon={FiMail}
                disabled={!isEditing}
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />

              <Input
                label="Phone"
                type="tel"
                icon={FiPhone}
                disabled={!isEditing}
                {...register('phone')}
              />

              <Input
                label="Address"
                icon={FiMapPin}
                disabled={!isEditing}
                {...register('address')}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </Card>
      </motion.div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <Card.Header>
            <Card.Title>Emergency Contact</Card.Title>
            <Card.Description>
              This information will be shown when someone scans your pet's QR code
            </Card.Description>
          </Card.Header>

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Emergency Contact Name"
              placeholder="John Doe"
              disabled={!isEditing}
            />
            <Input
              label="Emergency Phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              disabled={!isEditing}
            />
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default UserProfile