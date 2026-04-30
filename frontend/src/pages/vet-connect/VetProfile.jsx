// src/pages/vet-connect/VetProfile.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiStar,
  FiNavigation,
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle,
  FiExternalLink,
} from 'react-icons/fi'
import { vetService } from '../../services/vetService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatDistance } from '../../utils/formatters'

const VetProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vet, setVet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVet = async () => {
      try {
        setLoading(true)
        const data = await vetService.getVetById(id)
        setVet(data)
      } catch (error) {
        console.error('Failed to fetch vet:', error)
        setError('Clinic not found')
      } finally {
        setLoading(false)
      }
    }
    fetchVet()
  }, [id])

  const handleGetDirections = () => {
    if (!vet) return
    const dest =
      vet.latitude && vet.longitude
        ? `${vet.latitude},${vet.longitude}`
        : encodeURIComponent(vet.address)
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      '_blank'
    )
  }

  const handleBookAppointment = () => {
    navigate(`/appointments?vetId=${id}`)
  }

  if (loading) return <LoadingPage message="Loading clinic details..." />

  if (error || !vet) {
    return (
      <div className="text-center py-16">
        <FiMapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Clinic Not Found
        </h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => navigate('/vets')} icon={FiArrowLeft}>
          Back to Search
        </Button>
      </div>
    )
  }

  // Parse services from comma-separated string or array
  const services = Array.isArray(vet.services)
    ? vet.services
    : vet.services
    ? vet.services
        .toString()
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button
        variant="ghost"
        icon={FiArrowLeft}
        onClick={() => navigate('/vets')}
      >
        Back to Search
      </Button>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card padding="none" className="overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-56 md:h-72">
            <img
              src={
                vet.image ||
                'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=300&fit=crop'
              }
              alt={vet.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex flex-wrap gap-2 mb-3">
                {vet.isOpen ? (
                  <Badge variant="success" icon={FiCheckCircle}>
                    Open Now
                  </Badge>
                ) : (
                  <Badge variant="default">Closed</Badge>
                )}
                {vet.isEmergency && (
                  <Badge variant="danger" icon={FiAlertTriangle}>
                    24/7 Emergency
                  </Badge>
                )}
                {vet.distance && (
                  <Badge variant="info">
                    {formatDistance(vet.distance)} away
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                {vet.name}
              </h1>
              <p className="text-white/80 mt-1">{vet.specialization}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-6">
            {/* Rating */}
            {vet.rating && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(vet.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-lg">
                  {vet.rating}
                </span>
                {vet.reviewCount && (
                  <span className="text-gray-500 dark:text-gray-400">
                    ({vet.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Button
                icon={FiCalendar}
                onClick={handleBookAppointment}
                className="w-full"
              >
                Book Appointment
              </Button>
              <Button
                variant="secondary"
                icon={FiNavigation}
                onClick={handleGetDirections}
                className="w-full"
              >
                Get Directions
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <Card>
          <Card.Header>
            <Card.Title>Contact Information</Card.Title>
          </Card.Header>
          <div className="space-y-4">
            {[
              {
                icon: FiMapPin,
                label: 'Address',
                value: vet.address,
                color: 'text-red-500',
                bg: 'bg-red-100 dark:bg-red-900/30',
                action: handleGetDirections,
                actionLabel: 'Directions',
              },
              {
                icon: FiPhone,
                label: 'Phone',
                value: vet.phone,
                color: 'text-green-500',
                bg: 'bg-green-100 dark:bg-green-900/30',
                href: `tel:${vet.phone}`,
              },
              {
                icon: FiMail,
                label: 'Email',
                value: vet.email,
                color: 'text-blue-500',
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                href: `mailto:${vet.email}`,
              },
              {
                icon: FiClock,
                label: 'Hours',
                value: vet.hours,
                color: 'text-purple-500',
                bg: 'bg-purple-100 dark:bg-purple-900/30',
              },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.value}
                      </p>
                    )}
                    {item.action && (
                      <button
                        onClick={item.action}
                        className="text-xs text-primary-500 hover:underline mt-1 flex items-center gap-1"
                      >
                        <FiExternalLink className="w-3 h-3" />
                        {item.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>

        {/* Services + Description */}
        <div className="space-y-6">
          {/* Services */}
          {services.length > 0 && (
            <Card>
              <Card.Header>
                <Card.Title>Services Offered</Card.Title>
              </Card.Header>
              <div className="flex flex-wrap gap-2">
                {services.map((service, index) => (
                  <Badge key={index} variant="primary" size="sm">
                    {service.trim()}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Description */}
          {vet.description && (
            <Card>
              <Card.Header>
                <Card.Title>About This Clinic</Card.Title>
              </Card.Header>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {vet.description}
              </p>
            </Card>
          )}

          {/* Emergency Banner */}
          {vet.isEmergency && (
            <Card className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <FiAlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-400 mb-1">
                    24/7 Emergency Services
                  </h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    This clinic provides round-the-clock emergency veterinary
                    care. Call immediately for urgent cases.
                  </p>
                  {vet.phone && (
                    <a
                      href={`tel:${vet.phone}`}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      <FiPhone className="w-4 h-4" />
                      Call Now: {vet.phone}
                    </a>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Book Appointment CTA */}
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">
              Ready to book an appointment?
            </h3>
            <p className="text-primary-100">
              Schedule a visit with {vet.name} for your pet's health needs.
            </p>
          </div>
          <Button
            onClick={handleBookAppointment}
            className="bg-white text-primary-600 hover:bg-primary-50 border-0 whitespace-nowrap"
            icon={FiCalendar}
          >
            Book Now
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default VetProfile