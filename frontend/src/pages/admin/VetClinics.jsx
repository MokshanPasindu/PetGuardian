// src/pages/admin/VetClinics.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  FiMapPin,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiMail,
  FiClock,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
  FiSave,
} from 'react-icons/fi'
import { adminService } from '../../services/adminService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import { LoadingPage } from '../../components/common/LoadingSpinner'

// ─── Clinic Form (used in both Create & Edit modal) ───────────────────────────
const ClinicForm = ({ formData, onChange, errors }) => {
  const fields = [
    { name: 'name', label: 'Clinic Name *', placeholder: 'e.g. City Animal Hospital', type: 'text', required: true },
    { name: 'specialization', label: 'Specialization', placeholder: 'e.g. General, Surgery, Dermatology', type: 'text' },
    { name: 'address', label: 'Address *', placeholder: 'Full clinic address', type: 'text', required: true },
    { name: 'phone', label: 'Phone', placeholder: '+1 (555) 000-0000', type: 'text' },
    { name: 'email', label: 'Email', placeholder: 'clinic@example.com', type: 'email' },
    { name: 'hours', label: 'Operating Hours', placeholder: 'e.g. Mon-Fri: 8AM-6PM', type: 'text' },
    { name: 'latitude', label: 'Latitude', placeholder: 'e.g. 14.5995', type: 'number' },
    { name: 'longitude', label: 'Longitude', placeholder: 'e.g. 120.9842', type: 'number' },
    { name: 'rating', label: 'Rating (0-5)', placeholder: 'e.g. 4.5', type: 'number' },
    { name: 'services', label: 'Services (comma-separated)', placeholder: 'Vaccination, Surgery, Dental', type: 'text' },
    { name: 'description', label: 'Description', placeholder: 'Brief description of the clinic...', type: 'text' },
  ]

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      {/* Text fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.name} className={
            ['address', 'services', 'description'].includes(field.name)
              ? 'sm:col-span-2'
              : ''
          }>
            <Input
              label={field.label}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => onChange(field.name, e.target.value)}
              error={errors?.[field.name]}
            />
          </div>
        ))}
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
            formData.isEmergency ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
            onClick={() => onChange('isEmergency', !formData.isEmergency)}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              formData.isEmergency ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Emergency</p>
            <p className="text-xs text-gray-500">24/7 emergency service</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
            formData.isOpen ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
            onClick={() => onChange('isOpen', !formData.isOpen)}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              formData.isOpen ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Currently Open</p>
            <p className="text-xs text-gray-500">Mark as open now</p>
          </div>
        </label>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const VetClinics = () => {
  const [clinics, setClinics] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingClinic, setEditingClinic] = useState(null) // null = create mode
  const [saving, setSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Confirm delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [clinicToDelete, setClinicToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Form data
  const emptyForm = {
    name: '',
    specialization: '',
    address: '',
    phone: '',
    email: '',
    hours: '',
    latitude: '',
    longitude: '',
    rating: '',
    services: '',
    description: '',
    isEmergency: false,
    isOpen: true,
  }
  const [formData, setFormData] = useState(emptyForm)

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchClinics = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllClinics()
      const list = Array.isArray(data) ? data : []
      setClinics(list)
      setFiltered(list)
    } catch (error) {
      toast.error(error.message || 'Failed to load clinics')
      setClinics([])
      setFiltered([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClinics()
  }, [])

  // ─── Search filter ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(clinics)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      clinics.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.address?.toLowerCase().includes(q) ||
          c.specialization?.toLowerCase().includes(q)
      )
    )
  }, [search, clinics])

  // ─── Form helpers ────────────────────────────────────────────────────────────
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const errs = {}
    if (!formData.name?.trim()) errs.name = 'Clinic name is required'
    if (!formData.address?.trim()) errs.address = 'Address is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const buildPayload = () => ({
    name: formData.name?.trim(),
    specialization: formData.specialization?.trim() || null,
    address: formData.address?.trim(),
    phone: formData.phone?.trim() || null,
    email: formData.email?.trim() || null,
    hours: formData.hours?.trim() || null,
    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    rating: formData.rating ? parseFloat(formData.rating) : null,
    services: formData.services?.trim() || null,
    description: formData.description?.trim() || null,
    isEmergency: formData.isEmergency,
    isOpen: formData.isOpen,
  })

  // ─── Open Create Modal ───────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingClinic(null)
    setFormData(emptyForm)
    setFormErrors({})
    setShowModal(true)
  }

  // ─── Open Edit Modal ─────────────────────────────────────────────────────────
  const openEditModal = (clinic) => {
    setEditingClinic(clinic)
    setFormData({
      name: clinic.name || '',
      specialization: clinic.specialization || '',
      address: clinic.address || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      hours: clinic.hours || '',
      latitude: clinic.latitude || '',
      longitude: clinic.longitude || '',
      rating: clinic.rating || '',
      services: Array.isArray(clinic.services)
        ? clinic.services.join(', ')
        : clinic.services || '',
      description: clinic.description || '',
      isEmergency: clinic.isEmergency || false,
      isOpen: clinic.isOpen !== undefined ? clinic.isOpen : true,
    })
    setFormErrors({})
    setShowModal(true)
  }

  // ─── Save (Create or Update) ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const payload = buildPayload()

      if (editingClinic) {
        await adminService.updateClinic(editingClinic.id, payload)
        toast.success('Clinic updated successfully!')
      } else {
        await adminService.createClinic(payload)
        toast.success('Clinic created successfully!')
      }

      setShowModal(false)
      fetchClinics()
    } catch (error) {
      toast.error(error.message || 'Failed to save clinic')
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete ──────────────────────────────────────────────────────────────────
  const openDeleteConfirm = (clinic) => {
    setClinicToDelete(clinic)
    setShowDeleteConfirm(true)
  }

  const handleDelete = async () => {
    if (!clinicToDelete) return
    setDeleting(true)
    try {
      await adminService.deleteClinic(clinicToDelete.id)
      toast.success('Clinic deleted successfully!')
      setShowDeleteConfirm(false)
      setClinicToDelete(null)
      fetchClinics()
    } catch (error) {
      toast.error(error.message || 'Failed to delete clinic')
    } finally {
      setDeleting(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (loading) return <LoadingPage message="Loading vet clinics..." />

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Vet Clinic Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add, edit and remove veterinary clinics
          </p>
        </div>
        <Button variant="primary" icon={FiPlus} onClick={openCreateModal}>
          Add Clinic
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Clinics', value: clinics.length, color: 'text-blue-500' },
          { label: 'Emergency', value: clinics.filter((c) => c.isEmergency).length, color: 'text-red-500' },
          { label: 'Currently Open', value: clinics.filter((c) => c.isOpen).length, color: 'text-green-500' },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <Input
          type="text"
          placeholder="Search by name, address or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={FiSearch}
        />
      </Card>

      {/* Clinic List */}
      {filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((clinic, index) => (
            <motion.div
              key={clinic.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="hover:shadow-medium transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <FiMapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {clinic.name}
                      </h3>
                      {clinic.isEmergency && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-medium">
                          Emergency
                        </span>
                      )}
                      {clinic.isOpen ? (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3" /> Open
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full font-medium flex items-center gap-1">
                          <FiX className="w-3 h-3" /> Closed
                        </span>
                      )}
                    </div>

                    {clinic.specialization && (
                      <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">
                        {clinic.specialization}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3.5 h-3.5" />
                        {clinic.address}
                      </span>
                      {clinic.phone && (
                        <span className="flex items-center gap-1">
                          <FiPhone className="w-3.5 h-3.5" />
                          {clinic.phone}
                        </span>
                      )}
                      {clinic.email && (
                        <span className="flex items-center gap-1">
                          <FiMail className="w-3.5 h-3.5" />
                          {clinic.email}
                        </span>
                      )}
                      {clinic.hours && (
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          {clinic.hours}
                        </span>
                      )}
                    </div>

                    {/* Services tags */}
                    {clinic.services && clinic.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(Array.isArray(clinic.services)
                          ? clinic.services
                          : clinic.services.split(',')
                        ).slice(0, 4).map((s, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rating */}
                    {clinic.rating && (
                      <p className="text-xs text-gray-400 mt-1">
                        ⭐ {clinic.rating} / 5.0
                        {clinic.reviewCount ? ` (${clinic.reviewCount} reviews)` : ''}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEditModal(clinic)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit Clinic"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(clinic)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete Clinic"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiMapPin}
            title={search ? 'No clinics match your search' : 'No vet clinics registered'}
            description={search ? 'Try a different search term' : 'Add the first vet clinic to get started'}
            action={search ? () => setSearch('') : openCreateModal}
            actionLabel={search ? 'Clear Search' : 'Add Clinic'}
          />
        </Card>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={showModal}
        onClose={() => !saving && setShowModal(false)}
        title={editingClinic ? 'Edit Vet Clinic' : 'Add New Vet Clinic'}
        size="lg"
      >
        <ClinicForm
          formData={formData}
          onChange={handleFormChange}
          errors={formErrors}
        />
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={saving}
            icon={FiX}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            icon={FiSave}
          >
            {editingClinic ? 'Save Changes' : 'Create Clinic'}
          </Button>
        </div>
      </Modal>

      {/* ── Delete Confirm ───────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => !deleting && setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Vet Clinic"
        message={`Are you sure you want to permanently delete "${clinicToDelete?.name}"? This cannot be undone.`}
        confirmText="Delete Clinic"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}

export default VetClinics