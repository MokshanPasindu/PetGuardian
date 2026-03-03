// src/pages/vet-connect/Appointments.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPlus,
  FiCheck,
  FiX,
} from 'react-icons/fi'
import { vetService } from '../../services/vetService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import EmptyState from '../../components/common/EmptyState'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatDate, formatDateTime } from '../../utils/helpers'
import { usePets } from '../../hooks/usePets'
import toast from 'react-hot-toast'

const Appointments = () => {
  const [searchParams] = useSearchParams()
  const { pets, fetchPets } = usePets()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    petId: '',
    vetId: searchParams.get('vetId') || '',
    date: '',
    time: '',
    reason: '',
  })

  useEffect(() => {
    fetchPets()
    // Fetch appointments
    setAppointments([
      {
        id: 1,
        petName: 'Max',
        petImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop',
        vetName: 'City Animal Hospital',
        vetAddress: '123 Main Street',
        date: '2024-02-15',
        time: '10:00 AM',
        status: 'confirmed',
        reason: 'Annual checkup',
      },
      {
        id: 2,
        petName: 'Bella',
        petImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop',
        vetName: 'Pet Care Plus',
        vetAddress: '456 Oak Avenue',
        date: '2024-02-20',
        time: '2:30 PM',
        status: 'pending',
        reason: 'Vaccination',
      },
    ])
    setLoading(false)
  }, [fetchPets])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success" icon={FiCheck}>Confirmed</Badge>
      case 'pending':
        return <Badge variant="warning" icon={FiClock}>Pending</Badge>
      case 'cancelled':
        return <Badge variant="danger" icon={FiX}>Cancelled</Badge>
      case 'completed':
        return <Badge variant="info">Completed</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const handleBookAppointment = () => {
    if (!bookingData.petId || !bookingData.date || !bookingData.time) {
      toast.error('Please fill in all required fields')
      return
    }
    
    toast.success('Appointment booked successfully!')
    setShowBookingModal(false)
    // Add to appointments list
    setAppointments((prev) => [
      {
        id: Date.now(),
        petName: pets.find((p) => p.id === bookingData.petId)?.name || 'Pet',
        vetName: 'Selected Clinic',
        date: bookingData.date,
        time: bookingData.time,
        status: 'pending',
        reason: bookingData.reason,
      },
      ...prev,
    ])
  }

  const petOptions = pets.map((pet) => ({
    value: pet.id,
    label: pet.name,
    icon: pet.type === 'dog' ? '🐕' : '🐈',
  }))

  if (loading) {
    return <LoadingPage message="Loading appointments..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your veterinary appointments
          </p>
        </div>
        <Button icon={FiPlus} onClick={() => setShowBookingModal(true)}>
          Book Appointment
        </Button>
      </div>

      {/* Appointments List */}
      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-center gap-4">
                  {appointment.petImage && (
                    <img
                      src={appointment.petImage}
                      alt={appointment.petName}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {appointment.petName}
                      </h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {appointment.reason}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-4 h-4" />
                        {appointment.vetName}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(appointment.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {appointment.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {appointment.status === 'pending' && (
                      <Button variant="danger" size="sm">
                        Cancel
                      </Button>
                    )}
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiCalendar}
            title="No appointments"
            description="You don't have any upcoming appointments"
            action={() => setShowBookingModal(true)}
            actionLabel="Book Appointment"
          />
        </Card>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book Appointment"
        description="Schedule a visit with a veterinary clinic"
        size="md"
      >
        <div className="space-y-4 mt-4">
          <Select
            label="Select Pet"
            options={petOptions}
            value={bookingData.petId}
            onChange={(value) => setBookingData({ ...bookingData, petId: value })}
            required
          />

          <Input
            label="Date"
            type="date"
            value={bookingData.date}
            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
            required
          />

          <Select
            label="Time"
            options={[
              { value: '09:00', label: '9:00 AM' },
              { value: '10:00', label: '10:00 AM' },
              { value: '11:00', label: '11:00 AM' },
              { value: '14:00', label: '2:00 PM' },
              { value: '15:00', label: '3:00 PM' },
              { value: '16:00', label: '4:00 PM' },
            ]}
            value={bookingData.time}
            onChange={(value) => setBookingData({ ...bookingData, time: value })}
            required
          />

          <Textarea
            label="Reason for Visit"
            placeholder="Describe the reason for your appointment..."
            value={bookingData.reason}
            onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookAppointment}>
              Book Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Appointments