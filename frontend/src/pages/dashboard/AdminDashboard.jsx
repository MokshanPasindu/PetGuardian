// src/pages/dashboard/AdminDashboard.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiActivity,
  FiMapPin,
  FiMessageSquare,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiEye,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AdminDashboard = () => {
  const { user } = useAuth()

  const stats = [
    {
      label: 'Total Users',
      value: '12,543',
      icon: FiUsers,
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
      change: '+15%',
      changeType: 'positive',
    },
    {
      label: 'AI Scans Today',
      value: '1,234',
      icon: FiActivity,
      color: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      change: '+23%',
      changeType: 'positive',
    },
    {
      label: 'Registered Vets',
      value: '456',
      icon: FiMapPin,
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
      change: '+8%',
      changeType: 'positive',
    },
    {
      label: 'Community Posts',
      value: '8,901',
      icon: FiMessageSquare,
      color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
      change: '+42%',
      changeType: 'positive',
    },
  ]

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [1200, 1900, 2400, 2800, 3200, 4100],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const scansByTypeData = {
    labels: ['Skin Disease', 'Wound', 'Infection', 'Allergy', 'Other'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          '#3b82f6',
          '#22c55e',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
      },
    ],
  }

  const pendingActions = [
    {
      id: 1,
      type: 'vet_verification',
      title: 'New Vet Registration',
      description: 'Dr. Emily Chen - City Animal Hospital',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'report',
      title: 'Content Report',
      description: 'Inappropriate post flagged by users',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'vet_verification',
      title: 'New Vet Registration',
      description: 'Dr. James Wilson - Pet Care Plus',
      time: '1 day ago',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              System overview and management controls
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" icon={FiAlertTriangle}>
              {pendingActions.length} Pending Actions
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
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
                  <p
                    className={`text-xs mt-1 flex items-center gap-1 ${
                      stat.changeType === 'positive'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    <FiTrendingUp className="w-3 h-3" />
                    {stat.change} this month
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

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title>User Growth</Card.Title>
            </Card.Header>
            <div className="h-80">
              <Line
                data={userGrowthData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0,0,0,0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </Card>
        </div>

        <Card>
          <Card.Header>
            <Card.Title>Scans by Type</Card.Title>
          </Card.Header>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={scansByTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>

      {/* Pending Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Pending Actions</Card.Title>
          <Badge variant="danger">{pendingActions.length} Pending</Badge>
        </Card.Header>
        <div className="space-y-4">
          {pendingActions.map((action) => (
            <div
              key={action.id}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    action.type === 'vet_verification'
                      ? 'bg-blue-100 text-blue-500'
                      : 'bg-red-100 text-red-500'
                  }`}
                >
                  {action.type === 'vet_verification' ? (
                    <FiUsers className="w-5 h-5" />
                  ) : (
                    <FiAlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {action.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{action.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" icon={FiEye}>
                  Review
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-500 hover:bg-green-50"
                  icon={FiCheck}
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  icon={FiX}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboard