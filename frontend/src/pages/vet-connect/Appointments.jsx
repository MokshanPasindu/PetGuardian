// src/pages/vet-connect/Appointments.jsx
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPlus,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiTrash2,
  FiPhone,
  FiFilter,
} from 'react-icons/fi'
import { vetService } from '../../services/vetService'
import { usePets } from '../../hooks/usePets'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner, {
  LoadingPage,
} from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

// ── Time slot options ─────────────────────────────────────────────────────
const TIME_OPTIONS = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
]

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
]

// ── Status Badge Helper ───────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { variant: 'warning', icon: FiClock, label: 'Pending' },
    CONFIRMED: { variant: 'success', icon: FiCheck, label: 'Confirmed' },
    CANCELLED: { variant: 'danger', icon: FiX, label: 'Cancelled' },
    COMPLETED: { variant: 'info', icon: FiCheck, label: 'Completed' },
  }
  const c = config[status] || { variant: 'default', label: status }
  return (
    <Badge variant={c.variant} icon={c.icon}>
      {c.label}
    </Badge>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
const Appointments = () => {
  const [searchParams] = useSearchParams()
  const preselectedVetId = searchParams.get('vetId')

  const { pets, fetchPets } = usePets()

  const [appointments, setAppointments] = useState([])
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Modals
  const [showBookingModal, setShowBookingModal] = useState(
    !!preselectedVetId
  )
  const [cancelModal, setCancelModal] = useState({
    open: false,
    appointmentId: null,
    petName: '',
  })
  const [viewModal, setViewModal] = useState({
    open: false,
    appointment: null,
  })

  // Booking form
  const [bookingData, setBookingData] = useState({
    petId: '',
    clinicId: preselectedVetId || '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  })
  const [bookingErrors, setBookingErrors] = useState({})

  // ── Load data ───────────────────────────────────────────────────
  const loadAppointments = useCallback(async () => {
    try {
      const data = await vetService.getAppointments()
      setAppointments(data || [])
    } catch (error) {
      console.error('Failed to load appointments:', error)
      toast.error('Failed to load appointments')
    }
  }, [])

  const loadVets = useCallback(async () => {
    try {
      const data = await vetService.getAllVets()
      setVets(data || [])
    } catch (error) {
      console.error('Failed to load vets:', error)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchPets(), loadAppointments(), loadVets()])
      setLoading(false)
    }
    init()
  }, [fetchPets, loadAppointments, loadVets])

  // ── Filter appointments by tab ──────────────────────────────────
  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'all') return true
    return a.status === activeTab
  })

  // ── Booking form ────────────────────────────────────────────────
  const handleBookingChange = (field, value) => {
    setBookingData((prev) => ({ ...prev, [field]: value }))
    if (bookingErrors[field]) {
      setBookingErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateBooking = () => {
    const errors = {}
    if (!bookingData.petId) errors.petId = 'Please select a pet'
    if (!bookingData.clinicId) errors.clinicId = 'Please select a clinic'
    if (!bookingData.date) errors.date = 'Please select a date'
    else {
      const selected = new Date(bookingData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selected <= today) errors.date = 'Date must be in the future'
    }
    if (!bookingData.time) errors.time = 'Please select a time'
    if (!bookingData.reason?.trim())
      errors.reason = 'Please enter a reason for visit'
    setBookingErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleBookAppointment = async () => {
    if (!validateBooking()) return

    try {
      setSubmitting(true)

      // ✅ Build payload matching CreateAppointmentRequest
      const payload = {
        petId: Number(bookingData.petId),
        clinicId: Number(bookingData.clinicId),
        date: bookingData.date,         // LocalDate: "2024-03-15"
        time: bookingData.time + ':00', // LocalTime: "10:00:00"
        reason: bookingData.reason,
        notes: bookingData.notes || '',
      }

      const newAppointment = await vetService.createAppointment(payload)
      setAppointments((prev) => [newAppointment, ...prev])

      toast.success('Appointment booked successfully! 🎉')
      setShowBookingModal(false)
      setBookingData({
        petId: '',
        clinicId: '',
        date: '',
        time: '',
        reason: '',
        notes: '',
      })
    } catch (error) {
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Cancel appointment ──────────────────────────────────────────
  const handleCancelAppointment = async () => {
    try {
      setSubmitting(true)
      await vetService.cancelAppointment(cancelModal.appointmentId)
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelModal.appointmentId
            ? { ...a, status: 'CANCELLED' }
            : a
        )
      )
      toast.success('Appointment cancelled')
      setCancelModal({ open: false, appointmentId: null, petName: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to cancel appointment')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Options for selects ────────────────────────────────────────
  const petOptions = pets.map((pet) => ({
    value: String(pet.id),
    label: `${pet.name} (${pet.type})`,
  }))

  const clinicOptions = vets.map((vet) => ({
    value: String(vet.id),
    label: vet.name,
  }))

  // Tomorrow as min date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // ── Tab counts ─────────────────────────────────────────────────
  const tabCounts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab.id] =
      tab.id === 'all'
        ? appointments.length
        : appointments.filter((a) => a.status === tab.id).length
    return acc
  }, {})

  if (loading) {
    return <LoadingPage message="Loading appointments..." />
  }

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {appointments.length} total appointment
            {appointments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/vets">
            <Button variant="secondary" icon={FiMapPin}>
              Find Vet
            </Button>
          </Link>
          <Button icon={FiPlus} onClick={() => setShowBookingModal(true)}>
            Book Appointment
          </Button>
        </div>
      </motion.div>

      {/* ── Summary Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total',
            value: appointments.length,
            color: 'text-gray-600',
            bg: 'bg-gray-100 dark:bg-gray-700',
          },
          {
            label: 'Pending',
            value: appointments.filter((a) => a.status === 'PENDING').length,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          },
          {
            label: 'Confirmed',
            value: appointments.filter((a) => a.status === 'CONFIRMED').length,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/30',
          },
          {
            label: 'Completed',
            value: appointments.filter((a) => a.status === 'COMPLETED').length,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
          },
        ].map((stat) => (
          <Card key={stat.label} className={`text-center ${stat.bg} border-0`}>
            <p className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {tabCounts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Appointments List ─────────────────────────────────────── */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card
                className={`transition-all ${
                  appointment.status === 'CANCELLED'
                    ? 'opacity-60'
                    : 'hover:shadow-medium'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Pet Image */}
                  <div className="flex-shrink-0">
                    {appointment.petImage ? (
                      <img
                        src={appointment.petImage}
                        alt={appointment.petName}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-2xl">🐾</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {appointment.petName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {appointment.reason || 'General visit'}
                        </p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <FiMapPin className="w-4 h-4 text-red-400" />
                        {appointment.clinicName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="w-4 h-4 text-blue-400" />
                        {formatDate(appointment.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock className="w-4 h-4 text-purple-400" />
                        {appointment.time
                          ? appointment.time.substring(0, 5)
                          : '—'}
                      </span>
                    </div>

                    {/* Notes preview */}
                    {appointment.notes && (
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-1.5">
                        📝 {appointment.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setViewModal({ open: true, appointment })
                      }
                    >
                      Details
                    </Button>
                    {(appointment.status === 'PENDING' ||
                      appointment.status === 'CONFIRMED') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={FiX}
                        onClick={() =>
                          setCancelModal({
                            open: true,
                            appointmentId: appointment.id,
                            petName: appointment.petName,
                          })
                        }
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Cancel
                      </Button>
                    )}
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
            title={
              activeTab === 'all'
                ? 'No appointments yet'
                : `No ${activeTab.toLowerCase()} appointments`
            }
            description={
              activeTab === 'all'
                ? 'Book your first appointment with a nearby veterinary clinic.'
                : `You have no ${activeTab.toLowerCase()} appointments.`
            }
            action={
              activeTab === 'all'
                ? () => setShowBookingModal(true)
                : undefined
            }
            actionLabel="Book Appointment"
          />
        </Card>
      )}

      {/* ── Booking Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false)
          setBookingErrors({})
        }}
        title="Book Appointment"
        description="Schedule a visit with a veterinary clinic"
        size="md"
      >
        <div className="space-y-4 mt-4">
          {/* Pet Selection */}
          <Select
            label="Select Pet"
            options={petOptions}
            value={bookingData.petId}
            onChange={(val) => handleBookingChange('petId', val)}
            placeholder="Choose your pet"
            required
            error={bookingErrors.petId}
          />

          {/* Clinic Selection */}
          <Select
            label="Select Clinic"
            options={clinicOptions}
            value={bookingData.clinicId}
            onChange={(val) => handleBookingChange('clinicId', val)}
            placeholder="Choose a clinic"
            required
            error={bookingErrors.clinicId}
          />

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={bookingData.date}
              min={minDate}
              onChange={(e) => handleBookingChange('date', e.target.value)}
              required
              error={bookingErrors.date}
            />
            <Select
              label="Time"
              options={TIME_OPTIONS}
              value={bookingData.time}
              onChange={(val) => handleBookingChange('time', val)}
              placeholder="Select time"
              required
              error={bookingErrors.time}
            />
          </div>

          {/* Reason */}
          <Input
            label="Reason for Visit"
            name="reason"
            value={bookingData.reason}
            onChange={(e) =>
              handleBookingChange('reason', e.target.value)
            }
            placeholder="e.g., Annual checkup, Vaccination, Skin issue"
            required
            error={bookingErrors.reason}
          />

          {/* Notes */}
          <Textarea
            label="Additional Notes"
            value={bookingData.notes}
            onChange={(e) =>
              handleBookingChange('notes', e.target.value)
            }
            placeholder="Any additional information for the vet..."
            rows={2}
          />

          {/* Link to find vet */}
          {vets.length === 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                No clinics available.{' '}
                <Link
                  to="/vets"
                  className="font-medium underline"
                  onClick={() => setShowBookingModal(false)}
                >
                  Find a vet first
                </Link>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => {
                setShowBookingModal(false)
                setBookingErrors({})
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookAppointment}
              loading={submitting}
              icon={FiCalendar}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── View Details Modal ────────────────────────────────────── */}
      <Modal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, appointment: null })}
        title="Appointment Details"
        size="md"
      >
        {viewModal.appointment && (
          <div className="space-y-4 mt-4">
            {/* Status */}
            <div className="flex justify-center">
              <StatusBadge status={viewModal.appointment.status} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Pet',
                  value: viewModal.appointment.petName,
                },
                {
                  label: 'Clinic',
                  value: viewModal.appointment.clinicName,
                },
                {
                  label: 'Date',
                  value: formatDate(viewModal.appointment.date),
                },
                {
                  label: 'Time',
                  value: viewModal.appointment.time?.substring(0, 5),
                },
                {
                  label: 'Address',
                  value: viewModal.appointment.clinicAddress,
                  full: true,
                },
                {
                  label: 'Reason',
                  value: viewModal.appointment.reason,
                  full: true,
                },
              ]
                .filter((item) => item.value)
                .map((item) => (
                  <div
                    key={item.label}
                    className={item.full ? 'col-span-2' : ''}
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      {item.label}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.value}
                    </p>
                  </div>
                ))}
            </div>

            {/* Notes */}
            {viewModal.appointment.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  {viewModal.appointment.notes}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() =>
                  setViewModal({ open: false, appointment: null })
                }
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Cancel Confirmation Modal ─────────────────────────────── */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() =>
          setCancelModal({ open: false, appointmentId: null, petName: '' })
        }
        title="Cancel Appointment"
        description={`Are you sure you want to cancel the appointment for ${cancelModal.petName}? This cannot be undone.`}
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() =>
              setCancelModal({
                open: false,
                appointmentId: null,
                petName: '',
              })
            }
            disabled={submitting}
          >
            Keep Appointment
          </Button>
          <Button
            variant="danger"
            icon={FiX}
            onClick={handleCancelAppointment}
            loading={submitting}
          >
            Yes, Cancel
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Appointments