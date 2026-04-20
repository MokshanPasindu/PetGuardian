// src/components/vet/VetDetails.jsx
import { FiMapPin, FiPhone, FiMail, FiClock, FiStar, FiNavigation, FiCalendar } from 'react-icons/fi'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import { formatDistance } from '../../utils/formatters'

const VetDetails = ({ vet, onBookAppointment, onGetDirections }) => {
  if (!vet) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card padding="none" className="overflow-hidden">
        <div className="relative h-48">
          <img
            src={vet.image || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=300&fit=crop'}
            alt={vet.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              {vet.isOpen && <Badge variant="success">Open Now</Badge>}
              {vet.emergency && <Badge variant="danger">24/7 Emergency</Badge>}
            </div>
            <h1 className="text-2xl font-bold">{vet.name}</h1>
            <p className="text-white/80">{vet.specialization}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-bold text-gray-900 dark:text-white">{vet.rating}</span>
              <span className="text-gray-500">({vet.reviewCount} reviews)</span>
            </div>
            {vet.distance && (
              <Badge variant="info">{formatDistance(vet.distance)}</Badge>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button icon={FiCalendar} onClick={onBookAppointment}>
              Book Appointment
            </Button>
            <Button variant="secondary" icon={FiNavigation} onClick={onGetDirections}>
              Get Directions
            </Button>
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contact Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FiMapPin className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
              <p className="text-gray-900 dark:text-white">{vet.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FiPhone className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <a href={`tel:${vet.phone}`} className="text-primary-600 dark:text-primary-400">
                {vet.phone}
              </a>
            </div>
          </div>

          {vet.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <FiMail className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <a href={`mailto:${vet.email}`} className="text-primary-600 dark:text-primary-400">
                  {vet.email}
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FiClock className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hours</p>
              <p className="text-gray-900 dark:text-white">{vet.hours}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Services */}
      {vet.services && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Services
          </h2>
          <div className="flex flex-wrap gap-2">
            {vet.services.map((service, index) => (
              <Badge key={index} variant="default">
                {service}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default VetDetails