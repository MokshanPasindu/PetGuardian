// src/pages/health/MedicalHistory.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft,
  FiPlus,
  FiFilter,
  FiFileText,
  FiCalendar,
  FiUser,
  FiCamera,
} from 'react-icons/fi'
import { healthService } from '../../services/healthService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { formatDate } from '../../utils/helpers'

const MedicalHistory = () => {
  const { petId } = useParams()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Mock data
        setRecords([
          {
            id: 1,
            type: 'checkup',
            title: 'Annual Checkup',
            description: 'Routine annual health examination. All vitals normal.',
            date: '2024-01-15',
            vet: 'Dr. Sarah Smith',
            clinic: 'City Animal Hospital',
            notes: 'Weight stable, coat healthy, no concerns.',
          },
          {
            id: 2,
            type: 'vaccination',
            title: 'Rabies Vaccination',
            description: 'Annual rabies vaccine administered.',
            date: '2023-12-01',
            vet: 'Dr. Mike Johnson',
            clinic: 'Pet Care Plus',
            notes: 'Next due: December 2024',
          },
          {
            id: 3,
            type: 'ai_scan',
            title: 'AI Skin Analysis',
            description: 'AI-powered skin condition screening.',
            date: '2023-11-20',
            result: 'No issues detected',
            severity: 'mild',
            confidence: 0.95,
          },
          {
            id: 4,
            type: 'treatment',
            title: 'Dental Cleaning',
            description: 'Professional dental cleaning and examination.',
            date: '2023-10-15',
            vet: 'Dr. Sarah Smith',
            clinic: 'City Animal Hospital',
            notes: 'Mild tartar buildup removed. Recommend dental treats.',
          },
        ])
      } catch (error) {
        console.error('Failed to fetch records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [petId])

  const getRecordIcon = (type) => {
    switch (type) {
      case 'checkup':
        return <FiUser className="w-5 h-5" />
      case 'vaccination':
        return <FiCalendar className="w-5 h-5" />
      case 'ai_scan':
        return <FiCamera className="w-5 h-5" />
      default:
        return <FiFileText className="w-5 h-5" />
    }
  }

  const getRecordColor = (type) => {
    switch (type) {
      case 'checkup':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
      case 'vaccination':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
      case 'ai_scan':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
      case 'treatment':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  const filteredRecords = filter === 'all' 
    ? records 
    : records.filter((r) => r.type === filter)

  if (loading) {
    return <LoadingPage message="Loading medical history..." />
  }

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
              Medical History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete health records timeline
            </p>
          </div>
        </div>
        <Link to={`/health/${petId}/add-record`}>
          <Button icon={FiPlus}>Add Record</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: 'All' },
          { value: 'checkup', label: 'Checkups' },
          { value: 'vaccination', label: 'Vaccinations' },
          { value: 'ai_scan', label: 'AI Scans' },
          { value: 'treatment', label: 'Treatments' },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      {filteredRecords.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-6">
            {filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-14"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-4 w-5 h-5 rounded-full ${getRecordColor(record.type)} flex items-center justify-center`}
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>

                <Card>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${getRecordColor(record.type)}`}>
                      {getRecordIcon(record.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {record.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(record.date)}
                            {record.vet && ` • ${record.vet}`}
                          </p>
                        </div>
                        <Badge variant="info" className="capitalize">
                          {record.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {record.description}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <strong>Notes:</strong> {record.notes}
                        </p>
                      )}
                      {record.severity && (
                        <div className="mt-2">
                          <Badge
                            variant={
                              record.severity === 'mild'
                                ? 'success'
                                : record.severity === 'moderate'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {record.severity} - {(record.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiFileText}
            title="No records found"
            description="Start building your pet's medical history"
            action={() => (window.location.href = `/health/${petId}/add-record`)}
            actionLabel="Add First Record"
          />
        </Card>
      )}
    </div>
  )
}

export default MedicalHistory