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
} from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { calculateAge, formatDate } from '../../utils/helpers'
import { PET_TYPES } from '../../utils/constants'

const PetDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedPet: pet, getPetById, deletePet, loading } = usePets()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    getPetById(id)
  }, [id, getPetById])

  const handleDelete = async () => {
    try {
      await deletePet(id)
      navigate('/pets')
    } catch (error) {
      // Error handled in context
    }
  }

  if (loading || !pet) {
    return <LoadingPage message="Loading pet details..." />
  }

  const petType = PET_TYPES.find((t) => t.value === pet.type)

  const quickActions = [
    {
      icon: FiCamera,
      label: 'AI Scan',
      path: `/scan?petId=${pet.id}`,
      color: 'bg-blue-500',
    },
    {
      icon: FiFileText,
      label: 'Health Records',
      path: `/health/${pet.id}`,
      color: 'bg-green-500',
    },
    {
      icon: FiCalendar,
      label: 'Vaccinations',
      path: `/health/${pet.id}/vaccinations`,
      color: 'bg-purple-500',
    },
    {
      icon: FiGrid,
      label: 'QR Code',
      path: `/qr?petId=${pet.id}`,
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        icon={FiArrowLeft}
        onClick={() => navigate(-1)}
      >
        Back to My Pets
      </Button>

      {/* Pet Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card padding="none" className="overflow-hidden">
          <div className="relative h-64 md:h-80">
            <img
              src={pet.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop'}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-display font-bold">
                      {pet.name}
                    </h1>
                    <span className="text-4xl">{petType?.icon}</span>
                  </div>
                  <p className="text-white/80 text-lg">{pet.breed}</p>
                </div>
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

          {/* Pet Info */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <FiCalendar className="w-6 h-6 mx-auto mb-2 text-primary-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {calculateAge(pet.birthDate)}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <FiHeart className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">
                  {pet.gender}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <FiActivity className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Weight</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {pet.weight ? `${pet.weight} kg` : 'Not set'}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-6 h-6 mx-auto mb-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Color</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {pet.color || 'Not set'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex flex-col items-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div
                    className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {action.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Additional Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Pet Information</Card.Title>
          </Card.Header>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Type</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {petType?.label} {petType?.icon}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Birth Date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatDate(pet.birthDate)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Microchip ID</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {pet.microchipId || 'Not registered'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500 dark:text-gray-400">Status</span>
              <Badge variant="success">Healthy</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Notes</Card.Title>
          </Card.Header>
          <p className="text-gray-600 dark:text-gray-400">
            {pet.notes || 'No additional notes for this pet.'}
          </p>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Pet"
        description="Are you sure you want to delete this pet? This action cannot be undone."
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete Pet
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default PetDetails