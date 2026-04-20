// src/components/pet/PetProfile.jsx
import { Link } from 'react-router-dom'
import { FiEdit, FiCalendar, FiHeart, FiActivity, FiCamera } from 'react-icons/fi'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import { calculateAge } from '../../utils/helpers'
import { PET_TYPES } from '../../utils/constants'

const PetProfile = ({ pet, onEdit, onDelete }) => {
  const petType = PET_TYPES.find((t) => t.value === pet.type)

  return (
    <Card>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Pet Image */}
        <div className="relative">
          <img
            src={pet.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop'}
            alt={pet.name}
            className="w-full md:w-48 h-48 rounded-2xl object-cover"
          />
          <button className="absolute bottom-2 right-2 p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
            <FiCamera className="w-4 h-4" />
          </button>
        </div>

        {/* Pet Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {pet.name}
                <span className="text-2xl">{petType?.icon}</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{pet.breed}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={FiEdit} onClick={onEdit}>
                Edit
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <FiCalendar className="w-5 h-5 mx-auto mb-1 text-primary-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {calculateAge(pet.birthDate)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <FiHeart className="w-5 h-5 mx-auto mb-1 text-pink-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm capitalize">
                {pet.gender}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <FiActivity className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {pet.weight ? `${pet.weight} kg` : 'N/A'}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Color</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {pet.color || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to={`/health/${pet.id}`}>
              <Badge variant="primary">View Health Passport</Badge>
            </Link>
            <Link to={`/scan?petId=${pet.id}`}>
              <Badge variant="info">AI Scan</Badge>
            </Link>
            <Link to={`/qr?petId=${pet.id}`}>
              <Badge variant="success">QR Code</Badge>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default PetProfile