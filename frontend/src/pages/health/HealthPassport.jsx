// src/pages/health/HealthPassport.jsx
import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft,
  FiHeart,
  FiActivity,
  FiCalendar,
  FiFileText,
  FiPlus,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiGrid,
} from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import { useHealth } from '../../hooks/useHealth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import LoadingSpinner, {
  LoadingPage,
} from '../../components/common/LoadingSpinner'
import { formatDate, calculateAge } from '../../utils/helpers'
import { PET_TYPES } from '../../utils/constants'

const HealthPassport = () => {
  const { petId } = useParams()
  const navigate = useNavigate()
  const { selectedPet: pet, getPetById, loading: petLoading } = usePets()
  const {
    healthSummary,
    fetchHealthSummary,
    vaccinations,
    fetchVaccinations,
    medicalRecords,
    fetchMedicalRecords,
    summaryLoading,
    vaccinationsLoading,
    recordsLoading,
  } = useHealth()

  useEffect(() => {
    getPetById(petId)
    fetchHealthSummary(petId)
    fetchVaccinations(petId)
    fetchMedicalRecords(petId)
  }, [petId])

  if (petLoading || !pet) {
    return <LoadingPage message="Loading health passport..." />
  }

  const petType = PET_TYPES.find((t) => t.value === pet.type)
  const overdueVaccinations = vaccinations.filter(
    (v) => v.status === 'OVERDUE'
  )
  const upcomingVaccinations = vaccinations.filter(
    (v) => v.status === 'UPCOMING'
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate(`/pets/${petId}`)}
        >
          Back to {pet.name}
        </Button>
        <div className="flex gap-2">
          <Link to={`/health/${petId}/records/add`}>
            <Button icon={FiPlus} size="sm">
              Add Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Pet Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
          <div className="flex items-center gap-6">
            <img
              src={
                pet.image ||
                'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop'
              }
              alt={pet.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-display font-bold">{pet.name}</h1>
                <span className="text-3xl">{petType?.icon}</span>
              </div>
              <p className="text-primary-100">
                {pet.breed || petType?.label} •{' '}
                {calculateAge(pet.birthDate)} old
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {pet.gender
                    ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)
                    : 'Unknown'}
                </span>
                {pet.weight && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {pet.weight} kg
                  </span>
                )}
                {pet.microchipId && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    Chip: {pet.microchipId}
                  </span>
                )}
              </div>
            </div>

            {/* QR Code Link */}
            <Link to={`/qr?petId=${pet.id}`}>
              <div className="flex flex-col items-center gap-1 p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                <FiGrid className="w-8 h-8" />
                <span className="text-xs">QR Code</span>
              </div>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Alert Banner */}
      {overdueVaccinations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-400">
                  Action Required: Overdue Vaccinations
                </h3>
                <ul className="mt-1 space-y-1">
                  {overdueVaccinations.map((v) => (
                    <li
                      key={v.id}
                      className="text-red-700 dark:text-red-300 text-sm"
                    >
                      • {v.name} — was due on {formatDate(v.nextDueDate)}
                    </li>
                  ))}
                </ul>
                <Link to={`/health/${petId}/vaccinations`}>
                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-3"
                    icon={FiHeart}
                  >
                    Update Vaccinations
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Medical Records',
            value: summaryLoading ? '—' : healthSummary?.totalRecords ?? 0,
            icon: FiFileText,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            link: `/health/${petId}/history`,
          },
          {
            label: 'Vaccinations',
            value: vaccinationsLoading ? '—' : vaccinations.length,
            icon: FiHeart,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            link: `/health/${petId}/vaccinations`,
          },
          {
            label: 'Upcoming',
            value: vaccinationsLoading
              ? '—'
              : upcomingVaccinations.length,
            icon: FiClock,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            link: `/health/${petId}/vaccinations`,
          },
          {
            label: 'Overdue',
            value: vaccinationsLoading
              ? '—'
              : overdueVaccinations.length,
            icon: FiAlertTriangle,
            color: overdueVaccinations.length > 0 ? 'text-red-500' : 'text-green-500',
            bg:
              overdueVaccinations.length > 0
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-green-50 dark:bg-green-900/20',
            link: `/health/${petId}/vaccinations`,
          },
        ].map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card hover className="text-center h-full">
              <div
                className={`w-12 h-12 mx-auto rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Medical Records */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-blue-500" />
              Recent Medical Records
            </Card.Title>
            <Link to={`/health/${petId}/history`}>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </Card.Header>

          {recordsLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : medicalRecords.length > 0 ? (
            <div className="space-y-3">
              {medicalRecords.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <FiFileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {record.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(record.date)}
                      {record.vetName && ` • Dr. ${record.vetName}`}
                    </p>
                  </div>
                  <Badge variant="info" size="sm" className="capitalize flex-shrink-0">
                    {record.type?.toLowerCase().replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiFileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                No medical records yet
              </p>
              <Link to={`/health/${petId}/records/add`}>
                <Button variant="primary" size="sm" icon={FiPlus}>
                  Add First Record
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Vaccination Schedule */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <FiHeart className="w-5 h-5 text-purple-500" />
              Vaccination Schedule
            </Card.Title>
            <Link to={`/health/${petId}/vaccinations`}>
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            </Link>
          </Card.Header>

          {vaccinationsLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          ) : vaccinations.length > 0 ? (
            <div className="space-y-3">
              {vaccinations.slice(0, 5).map((vac) => (
                <div
                  key={vac.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${
                    vac.status === 'OVERDUE'
                      ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                      : vac.status === 'UPCOMING'
                      ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                      : 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
                  }`}
                >
                  {vac.status === 'COMPLETED' ? (
                    <FiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : vac.status === 'UPCOMING' ? (
                    <FiClock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  ) : (
                    <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {vac.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Next due: {formatDate(vac.nextDueDate)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      vac.status === 'COMPLETED'
                        ? 'success'
                        : vac.status === 'UPCOMING'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {vac.status === 'COMPLETED'
                      ? 'Done'
                      : vac.status === 'UPCOMING'
                      ? 'Soon'
                      : 'Overdue'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiHeart className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                No vaccinations recorded
              </p>
              <Link to={`/health/${petId}/vaccinations`}>
                <Button variant="primary" size="sm" icon={FiPlus}>
                  Add Vaccination
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: FiFileText,
            label: 'Medical History',
            desc: 'Full record timeline',
            path: `/health/${petId}/history`,
            color: 'from-blue-500 to-blue-600',
          },
          {
            icon: FiHeart,
            label: 'Vaccinations',
            desc: 'Schedule & history',
            path: `/health/${petId}/vaccinations`,
            color: 'from-purple-500 to-purple-600',
          },
          {
            icon: FiActivity,
            label: 'AI Scan',
            desc: 'Skin disease detection',
            path: `/scan?petId=${petId}`,
            color: 'from-green-500 to-green-600',
          },
          {
            icon: FiCalendar,
            label: 'Find Vet',
            desc: 'Book appointment',
            path: `/vets`,
            color: 'from-orange-500 to-orange-600',
          },
        ].map((item) => (
          <Link key={item.label} to={item.path}>
            <Card
              hover
              className={`bg-gradient-to-br ${item.color} text-white border-0 text-center`}
            >
              <item.icon className="w-8 h-8 mx-auto mb-2 opacity-90" />
              <p className="font-semibold">{item.label}</p>
              <p className="text-xs opacity-80 mt-1">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HealthPassport