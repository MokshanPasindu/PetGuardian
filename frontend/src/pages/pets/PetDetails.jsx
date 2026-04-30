// src/pages/pets/PetDetails.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiHeart,
  FiActivity,
  FiCamera,
  FiFileText,
  FiGrid,
  FiArrowLeft,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiMapPin,
  FiPlus,
} from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import { useHealth } from '../../hooks/useHealth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { calculateAge, formatDate } from '../../utils/helpers'
import { PET_TYPES } from '../../utils/constants'

const PetDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedPet: pet, getPetById, deletePet, loading } = usePets()
  const {
    healthSummary,
    fetchHealthSummary,
    vaccinations,
    fetchVaccinations,
    summaryLoading,
    vaccinationsLoading,
  } = useHealth()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    getPetById(id)
    fetchHealthSummary(id)
    fetchVaccinations(id)
  }, [id])

  const handleDelete = async () => {
    try {
      await deletePet(id)
      navigate('/pets')
    } catch (error) {
      // handled in context
    }
  }

  if (loading || !pet) {
    return <LoadingPage message="Loading pet details..." />
  }

  const petType = PET_TYPES.find((t) => t.value === pet.type)

  // Vaccination stats
  const overdueVaccinations = vaccinations.filter(
    (v) => v.status === 'OVERDUE'
  )
  const upcomingVaccinations = vaccinations.filter(
    (v) => v.status === 'UPCOMING'
  )
  const completedVaccinations = vaccinations.filter(
    (v) => v.status === 'COMPLETED'
  )

  const quickActions = [
    {
      icon: FiCamera,
      label: 'AI Scan',
      path: `/scan?petId=${pet.id}`,
      color: 'bg-blue-500',
      description: 'Skin disease detection',
    },
    {
      icon: FiFileText,
      label: 'Health Records',
      path: `/health/${pet.id}/history`,
      color: 'bg-green-500',
      description: 'View medical history',
    },
    {
      icon: FiCalendar,
      label: 'Vaccinations',
      path: `/health/${pet.id}/vaccinations`,
      color: 'bg-purple-500',
      description: `${vaccinations.length} records`,
    },
    {
      icon: FiGrid,
      label: 'QR Code',
      path: `/qr?petId=${pet.id}`,
      color: 'bg-orange-500',
      description: 'Digital ID card',
    },
    {
      icon: FiMapPin,
      label: 'Find Vet',
      path: `/vets`,
      color: 'bg-red-500',
      description: 'Nearby clinics',
    },
    {
      icon: FiPlus,
      label: 'Add Record',
      path: `/health/${pet.id}/records/add`,
      color: 'bg-teal-500',
      description: 'New health entry',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        icon={FiArrowLeft}
        onClick={() => navigate('/pets')}
      >
        Back to My Pets
      </Button>

      {/* Pet Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card padding="none" className="overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-64 md:h-80">
            <img
              src={
                pet.image ||
                'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop'
              }
              alt={pet.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Pet Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl md:text-4xl font-display font-bold">
                      {pet.name}
                    </h1>
                    <span className="text-4xl">{petType?.icon}</span>
                  </div>
                  <p className="text-white/80 text-lg">
                    {pet.breed || petType?.label}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {overdueVaccinations.length > 0 ? (
                      <Badge variant="danger" icon={FiAlertTriangle}>
                        {overdueVaccinations.length} Overdue Vaccination
                        {overdueVaccinations.length > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Badge variant="success" icon={FiCheckCircle}>
                        Vaccinations Up to Date
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link to={`/pets/${pet.id}/edit`}>
                    <Button variant="secondary" icon={FiEdit} size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    icon={FiTrash2}
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pet Stats Bar */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  icon: FiCalendar,
                  label: 'Age',
                  value: calculateAge(pet.birthDate),
                  color: 'text-primary-500',
                  bg: 'bg-primary-50 dark:bg-primary-900/20',
                },
                {
                  icon: FiHeart,
                  label: 'Gender',
                  value: pet.gender
                    ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)
                    : 'Unknown',
                  color: 'text-pink-500',
                  bg: 'bg-pink-50 dark:bg-pink-900/20',
                },
                {
                  icon: FiActivity,
                  label: 'Weight',
                  value: pet.weight ? `${pet.weight} kg` : 'Not set',
                  color: 'text-green-500',
                  bg: 'bg-green-50 dark:bg-green-900/20',
                },
                {
                  icon: FiTrendingUp,
                  label: 'Records',
                  value: healthSummary?.totalRecords ?? '—',
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`text-center p-4 ${stat.bg} rounded-xl`}
                >
                  <stat.icon
                    className={`w-6 h-6 mx-auto mb-2 ${stat.color}`}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex flex-col items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
                >
                  <div
                    className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-xs text-center">
                    {action.label}
                  </p>
                  <p className="text-gray-400 text-xs text-center hidden md:block">
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Health Summary + Vaccination Status Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Health Summary */}
        <div className="md:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-green-500" />
                Health Summary
              </Card.Title>
              <Link to={`/health/${pet.id}`}>
                <Button variant="ghost" size="sm">
                  View Full Passport
                </Button>
              </Link>
            </Card.Header>

            {summaryLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : healthSummary ? (
              <div className="space-y-4">
                {/* Alerts */}
                {healthSummary.alerts && healthSummary.alerts.length > 0 && (
                  <div className="space-y-2">
                    {healthSummary.alerts.slice(0, 3).map((alert, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                          alert.severity === 'high'
                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        <FiAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{alert.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Last Checkup',
                      value: healthSummary.lastCheckup
                        ? formatDate(healthSummary.lastCheckup)
                        : 'No records',
                      icon: FiCalendar,
                      color: 'text-blue-500',
                    },
                    {
                      label: 'Next Vaccination',
                      value: healthSummary.nextVaccination
                        ? formatDate(healthSummary.nextVaccination)
                        : 'Up to date',
                      icon: FiHeart,
                      color: 'text-purple-500',
                    },
                    {
                      label: 'Total Records',
                      value: healthSummary.totalRecords || 0,
                      icon: FiFileText,
                      color: 'text-green-500',
                    },
                    {
                      label: 'Overall Health',
                      value:
                        healthSummary.overallHealth?.charAt(0).toUpperCase() +
                          healthSummary.overallHealth?.slice(1) || 'Good',
                      icon: FiTrendingUp,
                      color: 'text-primary-500',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Records */}
                {healthSummary.recentRecords &&
                  healthSummary.recentRecords.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Recent Records
                      </h4>
                      <div className="space-y-2">
                        {healthSummary.recentRecords
                          .slice(0, 3)
                          .map((record) => (
                            <div
                              key={record.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                            >
                              <div className="flex items-center gap-2">
                                <FiFileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-white font-medium">
                                  {record.title}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(record.date)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* No records state */}
                {(!healthSummary.recentRecords ||
                  healthSummary.recentRecords.length === 0) && (
                  <div className="text-center py-4">
                    <FiFileText className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No medical records yet
                    </p>
                    <Link to={`/health/${pet.id}/records/add`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={FiPlus}
                        className="mt-2"
                      >
                        Add First Record
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiActivity className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-3">
                  No health data yet
                </p>
                <Link to={`/health/${pet.id}/records/add`}>
                  <Button variant="primary" size="sm" icon={FiPlus}>
                    Add Health Record
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Vaccination Status */}
        <div>
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center gap-2">
                <FiHeart className="w-5 h-5 text-purple-500" />
                Vaccinations
              </Card.Title>
              <Link to={`/health/${pet.id}/vaccinations`}>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </Link>
            </Card.Header>

            {vaccinationsLoading ? (
              <div className="flex justify-center py-6">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Vaccination Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xl font-bold text-green-600">
                      {completedVaccinations.length}
                    </p>
                    <p className="text-xs text-green-600">Done</p>
                  </div>
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xl font-bold text-yellow-600">
                      {upcomingVaccinations.length}
                    </p>
                    <p className="text-xs text-yellow-600">Soon</p>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xl font-bold text-red-600">
                      {overdueVaccinations.length}
                    </p>
                    <p className="text-xs text-red-600">Overdue</p>
                  </div>
                </div>

                {/* Vaccination List */}
                {vaccinations.length > 0 ? (
                  <div className="space-y-2">
                    {vaccinations.slice(0, 4).map((vac) => (
                      <div
                        key={vac.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-2">
                          {vac.status === 'COMPLETED' ? (
                            <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : vac.status === 'UPCOMING' ? (
                            <FiClock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          ) : (
                            <FiAlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                          <span className="text-xs text-gray-900 dark:text-white font-medium truncate max-w-[100px]">
                            {vac.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDate(vac.nextDueDate)}
                        </span>
                      </div>
                    ))}
                    {vaccinations.length > 4 && (
                      <Link to={`/health/${pet.id}/vaccinations`}>
                        <p className="text-xs text-center text-primary-500 hover:underline pt-1">
                          +{vaccinations.length - 4} more vaccinations
                        </p>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FiHeart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 mb-2">
                      No vaccinations recorded
                    </p>
                    <Link to={`/health/${pet.id}/vaccinations`}>
                      <Button variant="ghost" size="sm" icon={FiPlus}>
                        Add Vaccination
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Pet Information Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pet Details */}
        <Card>
          <Card.Header>
            <Card.Title>Pet Information</Card.Title>
          </Card.Header>
          <div className="space-y-0">
            {[
              {
                label: 'Type',
                value: `${petType?.label || pet.type} ${petType?.icon || ''}`,
              },
              {
                label: 'Breed',
                value: pet.breed || 'Not specified',
              },
              {
                label: 'Birth Date',
                value: formatDate(pet.birthDate),
              },
              {
                label: 'Age',
                value: calculateAge(pet.birthDate),
              },
              {
                label: 'Gender',
                value: pet.gender
                  ? pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)
                  : 'Not specified',
              },
              {
                label: 'Weight',
                value: pet.weight ? `${pet.weight} kg` : 'Not recorded',
              },
              {
                label: 'Color',
                value: pet.color || 'Not specified',
              },
              {
                label: 'Microchip ID',
                value: pet.microchipId || 'Not registered',
              },
            ].map((item, idx, arr) => (
              <div
                key={item.label}
                className={`flex justify-between py-3 ${
                  idx < arr.length - 1
                    ? 'border-b border-gray-100 dark:border-gray-700'
                    : ''
                }`}
              >
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {item.label}
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes + Health Passport Link */}
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>Notes & Allergies</Card.Title>
            </Card.Header>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {pet.notes ||
                'No special notes or allergies recorded for this pet.'}
            </p>
          </Card>

          {/* Health Passport Quick Link */}
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Digital Health Passport
                </h3>
                <p className="text-primary-100 text-sm">
                  View complete health history, vaccinations, and medical
                  records
                </p>
              </div>
              <FiHeart className="w-10 h-10 text-primary-200 flex-shrink-0 ml-4" />
            </div>
            <Link to={`/health/${pet.id}`}>
              <Button
                variant="secondary"
                className="mt-4 w-full bg-white text-primary-600 hover:bg-primary-50 border-0"
              >
                Open Health Passport
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Pet"
        description={`Are you sure you want to delete ${pet.name}? All health records and data will be permanently removed.`}
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            icon={FiTrash2}
          >
            Delete {pet.name}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default PetDetails