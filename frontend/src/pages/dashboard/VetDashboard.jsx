// src/pages/dashboard/VetDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiCalendar,
  FiFileText,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'

const VetDashboard = () => {
  const { user } = useAuth()
  const [todayAppointments, setTodayAppointments] = useState([
    {
      id: 1,
      petName: 'Max',
      petType: 'Dog',
      ownerName: 'John Smith',
      time: '09:00 AM',
      type: 'Checkup',
      status: 'completed',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop',
    },
    {
      id: 2,
      petName: 'Bella',
      petType: 'Cat',
      ownerName: 'Sarah Johnson',
      time: '10:30 AM',
      type: 'Vaccination',
      status: 'in-progress',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop',
    },
    {
      id: 3,
      petName: 'Charlie',
      petType: 'Dog',
      ownerName: 'Mike Davis',
      time: '02:00 PM',
      type: 'AI Scan Review',
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&h=100&fit=crop',
    },
  ])

  const [pendingReviews, setPendingReviews] = useState([
    {
      id: 1,
      petName: 'Luna',
      condition: 'Skin Irritation',
      severity: 'moderate',
      aiConfidence: 87,
      submittedAt: '2 hours ago',
    },
    {
      id: 2,
      petName: 'Rocky',
      condition: 'Possible Fungal Infection',
      severity: 'severe',
      aiConfidence: 92,
      submittedAt: '4 hours ago',
    },
  ])

  const stats = [
    {
      label: "Today's Appointments",
      value: 8,
      icon: FiCalendar,
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      change: '+2 from yesterday',
    },
    {
      label: 'Pending Reviews',
      value: pendingReviews.length,
      icon: FiFileText,
      color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
      change: 'Needs attention',
    },
    {
      label: 'Patients This Week',
      value: 34,
      icon: FiUsers,
      color: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      change: '+12% from last week',
    },
    {
      label: 'AI Scans Reviewed',
      value: 156,
      icon: FiActivity,
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      change: 'This month',
    },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" dot>Completed</Badge>
      case 'in-progress':
        return <Badge variant="info" dot>In Progress</Badge>
      case 'pending':
        return <Badge variant="warning" dot>Pending</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'mild':
        return <Badge variant="success">Mild</Badge>
      case 'moderate':
        return <Badge variant="warning">Moderate</Badge>
      case 'severe':
        return <Badge variant="danger">Severe</Badge>
      default:
        return <Badge variant="default">{severity}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-2xl p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Good morning, Dr. {user?.name?.split(' ')[1] || user?.name}! 🩺
            </h1>
            <p className="text-white/80">
              You have {todayAppointments.filter((a) => a.status === 'pending').length} appointments 
              and {pendingReviews.length} AI scans pending review today
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-white text-primary-600 hover:bg-primary-50"
              icon={FiCalendar}
            >
              View Schedule
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>Today's Appointments</Card.Title>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Card.Header>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={appointment.image}
                    alt={appointment.petName}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {appointment.petName}
                      </p>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {appointment.petType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Owner: {appointment.ownerName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="info">{appointment.type}</Badge>
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {appointment.time}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Scans Pending Review */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                AI Scans to Review
                <Badge variant="danger">{pendingReviews.length}</Badge>
              </Card.Title>
            </Card.Header>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {review.petName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {review.condition}
                      </p>
                    </div>
                    {getSeverityBadge(review.severity)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      AI Confidence: {review.aiConfidence}%
                    </span>
                    <span className="text-gray-400">
                      {review.submittedAt}
                    </span>
                  </div>
                  <Button variant="primary" size="sm" className="w-full mt-3">
                    Review Scan
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default VetDashboard