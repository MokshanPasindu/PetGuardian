// src/components/pet/PetCard.jsx
import { Link } from 'react-router-dom'
import { FiCalendar, FiHeart, FiMoreVertical } from 'react-icons/fi'
import Badge from '../common/Badge'
import { calculateAge } from '../../utils/helpers'
import { PET_TYPES } from '../../utils/constants'

const PetCard = ({ pet, compact = false }) => {
  const petType = PET_TYPES.find((t) => t.value === pet.type)

  if (compact) {
    return (
      <Link
        to={`/pets/${pet.id}`}
        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <img
          src={pet.image || `https://ui-avatars.com/api/?name=${pet.name}&background=22c55e&color=fff`}
          alt={pet.name}
          className="w-12 h-12 rounded-xl object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {pet.name}
            <span>{petType?.icon}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {calculateAge(pet.birthDate)} old
          </p>
        </div>
        <Badge variant="success" size="sm">Healthy</Badge>
      </Link>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300 group">
      <div className="relative h-48">
        <img
          src={pet.image || `https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop`}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <button className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors">
            <FiMoreVertical className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge variant="success">{petType?.label || pet.type}</Badge>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {pet.name}
              <span className="text-2xl">{petType?.icon}</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400">{pet.breed}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <FiCalendar className="w-4 h-4" />
            {calculateAge(pet.birthDate)}
          </span>
          <span className="flex items-center gap-1">
            <FiHeart className="w-4 h-4" />
            {pet.gender}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/pets/${pet.id}`}
            className="flex-1 text-center py-2 px-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
          >
            View Profile
          </Link>
          <Link
            to={`/health/${pet.id}`}
            className="py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Health
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PetCard