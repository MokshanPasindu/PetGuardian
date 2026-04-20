// src/components/vet/VetCard.jsx
import { Link } from 'react-router-dom'
import { FiMapPin, FiPhone, FiClock, FiStar, FiNavigation } from 'react-icons/fi'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatDistance } from '../../utils/formatters'

const VetCard = ({ vet, onGetDirections }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden hover:shadow-medium transition-all duration-300">
      <div className="relative h-40">
        <img
          src={vet.image || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=200&fit=crop'}
          alt={vet.name}
          className="w-full h-full object-cover"
        />
        {vet.isOpen && (
          <div className="absolute top-3 left-3">
            <Badge variant="success" dot>Open Now</Badge>
          </div>
        )}
        {vet.emergency && (
          <div className="absolute top-3 right-3">
            <Badge variant="danger">24/7 Emergency</Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {vet.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {vet.specialization}
            </p>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <FiStar className="w-4 h-4 fill-current" />
            <span className="font-medium">{vet.rating}</span>
            <span className="text-gray-400 text-sm">({vet.reviewCount})</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiMapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{vet.address}</span>
            {vet.distance && (
              <Badge variant="info" size="sm">
                {formatDistance(vet.distance)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiPhone className="w-4 h-4 text-gray-400" />
            <span>{vet.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiClock className="w-4 h-4 text-gray-400" />
            <span>{vet.hours}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/vets/${vet.id}`} className="flex-1">
            <Button variant="primary" className="w-full" size="sm">
              View Details
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="sm"
            icon={FiNavigation}
            onClick={() => onGetDirections?.(vet)}
          >
            Directions
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VetCard