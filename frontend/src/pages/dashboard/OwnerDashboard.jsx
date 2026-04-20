// src/pages/dashboard/OwnerDashboard.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHeart,
  FiCamera,
  FiCalendar,
  FiMapPin,
  FiPlus,
  FiArrowRight,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { usePets } from '../../hooks/usePets'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import PetCard from '../../components/pet/PetCard'
import { formatDate, formatRelativeTime } from '../../utils/helpers'

const OwnerDashboard = () => {
  const { user } = useAuth()
  const { pets, fetchPets, loading } = usePets()
  const [stats, setStats] = useState({
    totalPets: 0,
    upcomingVaccinations: 0,
    recentScans: 0,
    pendingAppointments: 0,
  })

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  useEffect(() => {
    if (pets.length > 0) {
      setStats({
        totalPets: pets.length,
        upcomingVaccinations: 3,
        recentScans: 5,
        pendingAppointments: 2,
      })
    }
  }, [pets])

  const quickActions = [
    {
      icon: FiCamera,
      label: 'AI Scan',
      description: 'Analyze skin condition',
      path: '/scan',
      color: 'bg-blue-500',
    },
    {
      icon: FiPlus,
      label: 'Add Pet',
      description: 'Register new pet',
      path: '/pets/add',
      color: 'bg-green-500',
    },
    {
      icon: FiMapPin,
      label: 'Find Vet',
      description: 'Nearby clinics',
      path: '/vets',
      color: 'bg-purple-500',
    },
    {
      icon: FiCalendar,
      label: 'Appointments',
      description: 'Schedule visit',
      path: '/appointments',
      color: 'bg-orange-500',
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'scan',
      title: 'AI Scan Completed',
      description: 'Skin analysis for Max - No issues detected',
      time: '2 hours ago',
      icon: FiCamera,
      color: 'text-blue-500 bg-blue-100',
    },
    {
      id: 2,
      type: 'vaccination',
      title: 'Vaccination Due',
      description: 'Rabies vaccination for Bella due in 5 days',
      time: '5 hours ago',
      icon: FiAlertTriangle,
      color: 'text-yellow-500 bg-yellow-100',
    },
    {
      id: 3,
      type: 'appointment',
      title: 'Appointment Confirmed',
      description: 'Checkup with Dr. Smith on Dec 15',
      time: '1 day ago',
      icon: FiCalendar,
      color: 'text-green-500 bg-green-100',
    },
  ]

  if (loading) {
    return <LoadingPage message="Loading your dashboard..." />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-100">
              Here's what's happening with your pets today
            </p>
          </div>
          <Link to="/scan">
            <Button
              className="bg-white text-primary-600 hover:bg-primary-50"
              icon={FiCamera}
            >
              Start AI Scan
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Pets',
            value: stats.totalPets,
            icon: FiHeart,
            color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
            change: '+1 this month',
          },
          {
            label: 'AI Scans',
            value: stats.recentScans,
            icon: FiCamera,
            color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
            change: '+3 this week',
          },
          {
            label: 'Upcoming Vaccinations',
            value: stats.upcomingVaccinations,
            icon: FiCalendar,
            color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
            change: 'Next in 5 days',
          },
          {
            label: 'Appointments',
            value: stats.pendingAppointments,
            icon: FiClock,
            color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
            change: '2 scheduled',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                    <FiTrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="group flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div
                className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                {action.label}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Pets */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>My Pets</Card.Title>
              <Link to="/pets">
                <Button variant="ghost" size="sm" icon={FiArrowRight} iconPosition="right">
                  View All
                </Button>
              </Link>
            </Card.Header>

            {pets.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {pets.slice(0, 4).map((pet) => (
                  <PetCard key={pet.id} pet={pet} compact />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FiHeart}
                title="No pets yet"
                description="Add your first pet to start tracking their health"
                action={() => (window.location.href = '/pets/add')}
                actionLabel="Add Pet"
              />
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title>Recent Activity</Card.Title>
            </Card.Header>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button variant="ghost" className="w-full" size="sm">
                View All Activity
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Health Alerts */}
      <Card className="border-l-4 border-l-warning-500">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
            <FiAlertTriangle className="w-6 h-6 text-warning-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Upcoming Vaccination Reminder
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Bella's rabies vaccination is due in 5 days. Schedule an appointment with your vet.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/appointments">
                <Button size="sm">Schedule Now</Button>
              </Link>
              <Button variant="ghost" size="sm">
                Remind Me Later
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default OwnerDashboard