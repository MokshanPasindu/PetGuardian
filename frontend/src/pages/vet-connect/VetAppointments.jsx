import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FiCalendar, FiClock, FiCheck, FiX,
  FiFilter, FiSearch, FiMapPin, FiEdit,
} from 'react-icons/fi'
import { vetService } from '../../services/vetService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

const STATUS_TABS = [
  { id: 'ALL',       label: 'All' },
  { id: 'PENDING',   label: 'Pending' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'CANCELLED', label: 'Cancelled' },
]

const StatusBadge = ({ status }) => {
  const map = {
    PENDING:   { variant: 'warning', label: 'Pending' },
    CONFIRMED: { variant: 'success', label: 'Confirmed' },
    COMPLETED: { variant: 'info',    label: 'Completed' },
    CANCELLED: { variant: 'danger',  label: 'Cancelled' },
  }
  const c = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={c.variant}>{c.label}</Badge>
}

const VetAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('ALL')
  const [search, setSearch]             = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')

  // Notes modal
  const [notesModal, setNotesModal] = useState({
    open: false, appointmentId: null, notes: ''
  })
  const [savingNotes, setSavingNotes] = useState(false)

  // Detail modal
  const [detailModal, setDetailModal] = useState({
    open: false, appointment: null
  })

  // ── Load ─────────────────────────────────────────────────
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const data = await vetService.getVetAllAppointments()
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      setAppointments(list)
    } catch (err) {
      toast.error('Failed to load appointments')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAppointments() }, [loadAppointments])

  // ── Filter ────────────────────────────────────────────────
  const filtered = appointments.filter((a) => {
    const matchTab = activeTab === 'ALL' || a.status === activeTab
    const matchSearch = !search ||
      a.petName?.toLowerCase().includes(search.toLowerCase()) ||
      a.reason?.toLowerCase().includes(search.toLowerCase()) ||
      a.clinicName?.toLowerCase().includes(search.toLowerCase())
    const matchDate = !selectedDate ||
      a.date?.toString() === selectedDate
    return matchTab && matchSearch && matchDate
  })

  // ── Tab counts ────────────────────────────────────────────
  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t.id] = t.id === 'ALL'
      ? appointments.length
      : appointments.filter(a => a.status === t.id).length
    return acc
  }, {})

  // ── Actions ───────────────────────────────────────────────
  const handleAction = async (id, action) => {
    try {
      setActionLoading(id)
      if (action === 'confirm')  await vetService.confirmAppointment(id)
      if (action === 'complete') await vetService.completeAppointment(id)
      if (action === 'cancel')   await vetService.vetCancelAppointment(id)

      const labels = {
        confirm: 'Appointment confirmed!',
        complete: 'Marked as completed!',
        cancel: 'Appointment cancelled',
      }
      toast.success(labels[action])
      loadAppointments()
    } catch {
      toast.error(`Failed to ${action} appointment`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true)
      await vetService.addVetNotes(notesModal.appointmentId, notesModal.notes)
      toast.success('Notes saved!')
      setNotesModal({ open: false, appointmentId: null, notes: '' })
      loadAppointments()
    } catch {
      toast.error('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) return <LoadingPage message="Loading appointments..." />

  return (
    <div className="space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center
                   justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold
                         text-gray-900 dark:text-white">
            Manage Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {appointments.length} total appointments
          </p>
        </div>
      </motion.div>

      {/* Search + Date Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2
                               w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by pet, reason, clinic…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border
                       border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800
                       text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2
                       focus:ring-primary-500"
          />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-300
                     dark:border-gray-600 bg-white dark:bg-gray-800
                     text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2
                     focus:ring-primary-500"
        />
        {selectedDate && (
          <Button variant="secondary" onClick={() => setSelectedDate('')}>
            Clear Date
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200
                      dark:border-gray-700 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2
                        transition-colors whitespace-nowrap
                        ${activeTab === tab.id
                          ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full
                              text-xs font-semibold
                              ${activeTab === tab.id
                                ? 'bg-primary-100 text-primary-600'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
                              }`}>
              {counts[tab.id]}
            </span>
          </button>
        ))}
      </div>

      {/* Appointment List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={FiCalendar}
            title="No appointments found"
            description="No appointments match your current filters"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt, i) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className={apt.status === 'CANCELLED' ? 'opacity-60' : ''}>
                <div className="flex items-start gap-4">

                  {/* Pet avatar */}
                  {apt.petImage ? (
                    <img src={apt.petImage} alt={apt.petName}
                         className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary-100
                                    dark:bg-primary-900/30 flex items-center
                                    justify-center flex-shrink-0 text-2xl">
                      🐾
                    </div>
                  )}

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {apt.petName}
                      </h3>
                      <StatusBadge status={apt.status} />
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {apt.reason ?? 'General visit'}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs
                                    text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3 h-3 text-blue-400" />
                        {formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3 text-purple-400" />
                        {apt.time?.toString().substring(0, 5)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3 text-red-400" />
                        {apt.clinicName}
                      </span>
                    </div>

                    {/* Notes */}
                    {apt.notes && (
                      <p className="mt-2 text-xs text-gray-400
                                    bg-gray-50 dark:bg-gray-700/50
                                    rounded-lg px-3 py-1.5">
                        📝 {apt.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">

                    {/* View detail */}
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setDetailModal({ open: true, appointment: apt })}
                    >
                      Details
                    </Button>

                    {/* Add notes */}
                    <Button
                      variant="ghost" size="sm" icon={FiEdit}
                      onClick={() => setNotesModal({
                        open: true,
                        appointmentId: apt.id,
                        notes: apt.notes ?? ''
                      })}
                    >
                      Notes
                    </Button>

                    {/* Status actions */}
                    {apt.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAction(apt.id, 'confirm')}
                          disabled={actionLoading === apt.id}
                          className="p-1.5 bg-green-100 dark:bg-green-900/30
                                     text-green-600 rounded-lg hover:bg-green-200
                                     transition-colors disabled:opacity-50"
                          title="Confirm"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(apt.id, 'cancel')}
                          disabled={actionLoading === apt.id}
                          className="p-1.5 bg-red-100 dark:bg-red-900/30
                                     text-red-600 rounded-lg hover:bg-red-200
                                     transition-colors disabled:opacity-50"
                          title="Decline"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {apt.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleAction(apt.id, 'complete')}
                        disabled={actionLoading === apt.id}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600
                                   text-white text-xs font-medium rounded-lg
                                   transition-colors disabled:opacity-50"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Notes Modal */}
      <Modal
        isOpen={notesModal.open}
        onClose={() => setNotesModal({ open: false, appointmentId: null, notes: '' })}
        title="Add / Edit Notes"
        description="Add your clinical notes for this appointment"
      >
        <div className="space-y-4 mt-4">
          <textarea
            value={notesModal.notes}
            onChange={(e) => setNotesModal(prev => ({ ...prev, notes: e.target.value }))}
            rows={5}
            placeholder="Enter diagnosis, treatment notes, prescriptions..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300
                       dark:border-gray-600 bg-white dark:bg-gray-800
                       text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-primary-500
                       resize-none"
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setNotesModal({ open: false, appointmentId: null, notes: '' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotes}
              loading={savingNotes}
              icon={FiEdit}
            >
              Save Notes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal.open}
        onClose={() => setDetailModal({ open: false, appointment: null })}
        title="Appointment Details"
        size="md"
      >
        {detailModal.appointment && (
          <div className="space-y-4 mt-4">
            <div className="flex justify-center">
              <StatusBadge status={detailModal.appointment.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Pet',     value: detailModal.appointment.petName },
                { label: 'Clinic',  value: detailModal.appointment.clinicName },
                { label: 'Date',    value: formatDate(detailModal.appointment.date) },
                { label: 'Time',    value: detailModal.appointment.time?.toString().substring(0,5) },
                { label: 'Address', value: detailModal.appointment.clinicAddress, full: true },
                { label: 'Reason',  value: detailModal.appointment.reason, full: true },
                { label: 'Notes',   value: detailModal.appointment.notes, full: true },
              ].filter(i => i.value).map((item) => (
                <div key={item.label} className={item.full ? 'col-span-2' : ''}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    {item.label}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setDetailModal({ open: false, appointment: null })}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default VetAppointments