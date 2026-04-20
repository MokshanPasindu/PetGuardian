// src/pages/health/Vaccinations.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft,
  FiPlus,
  FiCheck,
  FiClock,
  FiAlertTriangle,
  FiCalendar,
} from 'react-icons/fi'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

const Vaccinations = () => {
  const { petId } = useParams()
  const [vaccinations, setVaccinations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data
    setVaccinations([
      {
        id: 1,
        name: 'Rabies',
        lastDate: '2023-12-01',
        nextDue: '2024-12-01',
        status: 'completed',
        provider: 'City Animal Hospital',
      },
      {
        id: 2,
        name: 'DHPP (Distemper)',
        lastDate: '2023-06-15',
        nextDue: '2024-06-15',
        status: 'completed',
        provider: 'Pet Care Plus',
      },
      {
        id: 3,
        name: 'Bordetella',
        lastDate: '2023-09-01',
        nextDue: '2024-02-20',
        status: 'upcoming',
        provider: 'City Animal Hospital',
      },
      {
        id: 4,
        name: 'Lyme Disease',
        lastDate: '2022-05-01',
        nextDue: '2023-05-01',
        status: 'overdue',
        provider: 'Pet Care Plus',
      },
    ])
    setLoading(false)
  }, [petId])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" icon={FiCheck}>
            Up to Date
          </Badge>
        )
      case 'upcoming':
        return (
          <Badge variant="warning" icon={FiClock}>
            Due Soon
          </Badge>
        )
      case 'overdue':
        return (
          <Badge variant="danger" icon={FiAlertTriangle}>
            Overdue
          </Badge>
        )
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-l-green-500'
      case 'upcoming':
        return 'border-l-yellow-500'
      case 'overdue':
        return 'border-l-red-500'
      default:
        return 'border-l-gray-500'
    }
  }

  if (loading) {
    return <LoadingPage message="Loading vaccination records..." />
  }

  const completedCount = vaccinations.filter((v) => v.status === 'completed').length
  const upcomingCount = vaccinations.filter((v) => v.status === 'upcoming').length
  const overdueCount = vaccinations.filter((v) => v.status === 'overdue').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={`/health/${petId}`}>
            <Button variant="ghost" icon={FiArrowLeft}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Vaccination Records
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage vaccination schedule
            </p>
          </div>
        </div>
        <Button icon={FiPlus}>Add Vaccination</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center bg-green-50 dark:bg-green-900/20">
          <FiCheck className="w-8 h-8 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedCount}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">Up to Date</p>
        </Card>
        <Card className="text-center bg-yellow-50 dark:bg-yellow-900/20">
          <FiClock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {upcomingCount}
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">Due Soon</p>
        </Card>
        <Card className="text-center bg-red-50 dark:bg-red-900/20">
          <FiAlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-2" />
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdueCount}
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">Overdue</p>
        </Card>
      </div>

      {/* Vaccination List */}
      <div className="space-y-4">
        {vaccinations.map((vaccination, index) => (
          <motion.div
            key={vaccination.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-l-4 ${getStatusColor(vaccination.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <FiCalendar className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {vaccination.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last: {formatDate(vaccination.lastDate)} • Next: {formatDate(vaccination.nextDue)}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {vaccination.provider}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(vaccination.status)}
                  <Button variant="ghost" size="sm">
                    Update
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Vaccinations