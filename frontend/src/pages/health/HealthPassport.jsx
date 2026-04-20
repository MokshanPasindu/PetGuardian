// src/pages/health/HealthPassport.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiHeart,
  FiCalendar,
  FiFileText,
  FiActivity,
  FiPlus,
  FiDownload,
  FiShare2,
  FiAlertTriangle,
} from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import { healthService } from '../../services/healthService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { calculateAge, formatDate } from '../../utils/helpers'
import { PET_TYPES } from '../../utils/constants'

const HealthPassport = () => {
  const { petId } = useParams()
  const { selectedPet: pet, getPetById, loading } = usePets()
  const [healthSummary, setHealthSummary] = useState(null)

  useEffect(() => {
    getPetById(petId)
    // Fetch health summary
    setHealthSummary({
      lastCheckup: '2024-01-15',
      nextVaccination: '2024-02-20',
      weight: { current: 25.5, trend: 'stable' },
      overallHealth: 'good',
      alerts: [
        { type: 'vaccination', message: 'Rabies vaccination due in 15 days' },
      ],
      recentRecords: [
        { id: 1, type: 'Checkup', date: '2024-01-15', vet: 'Dr. Smith' },
        { id: 2, type: 'Vaccination', date: '2023-12-01', vet: 'Dr. Johnson' },
      ],
    })
  }, [petId, getPetById])

  if (loading || !pet) {
    return <LoadingPage message="Loading health passport..." />
  }

  const petType = PET_TYPES.find((t) => t.value === pet.type)

  const quickStats = [
    {
      label: 'Last Checkup',
      value: formatDate(healthSummary?.lastCheckup),
      icon: FiCalendar,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Current Weight',
      value: `${healthSummary?.weight.current} kg`,
      icon: FiActivity,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Next Vaccination',
      value: formatDate(healthSummary?.nextVaccination),
      icon: FiHeart,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      label: 'Health Status',
      value: 'Good',
      icon: FiHeart,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Pet Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-green-500 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={pet.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150&h=150&fit=crop'}
            alt={pet.name}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20"
          />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-display font-bold">{pet.name}</h1>
              <span className="text-3xl">{petType?.icon}</span>
            </div>
            <p className="text-white/80 mb-2">
              {pet.breed} • {calculateAge(pet.birthDate)} old
            </p>
            <Badge className="bg-white/20 text-white">
              Digital Health Passport
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              icon={FiDownload}
            >
              Export
            </Button>
            <Button
              variant="secondary"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              icon={FiShare2}
            >
              Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Health Alerts */}
      {healthSummary?.alerts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-warning-500">
            <div className="flex items-start gap-4">
              <FiAlertTriangle className="w-6 h-6 text-warning-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Health Alerts
                </h3>
                <ul className="space-y-2">
                  {healthSummary.alerts.map((alert, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-400">
                      {alert.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="text-center">
              <div className={`w-12 h-12 mx-auto rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to={`/health/${petId}/history`}>
          <Card hover className="text-center h-full">
            <FiFileText className="w-10 h-10 mx-auto text-primary-500 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Medical History
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              View all medical records
            </p>
          </Card>
        </Link>

        <Link to={`/health/${petId}/vaccinations`}>
          <Card hover className="text-center h-full">
            <FiHeart className="w-10 h-10 mx-auto text-pink-500 mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Vaccinations
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track vaccination schedule
            </p>
          </Card>
        </Link>

        <Link to={`/health/${petId}/add-record`}>
          <Card hover className="text-center h-full bg-primary-50 dark:bg-primary-900/20 border-2 border-dashed border-primary-300 dark:border-primary-700">
            <FiPlus className="w-10 h-10 mx-auto text-primary-500 mb-3" />
            <h3 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">
              Add Record
            </h3>
            <p className="text-sm text-primary-500/70 dark:text-primary-400/70">
              Add new medical record
            </p>
          </Card>
        </Link>
      </div>

      {/* Recent Records */}
      <Card>
        <Card.Header>
          <Card.Title>Recent Medical Records</Card.Title>
          <Link to={`/health/${petId}/history`}>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </Card.Header>

        <div className="space-y-3">
          {healthSummary?.recentRecords?.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiFileText className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {record.type}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {record.vet} • {formatDate(record.date)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default HealthPassport