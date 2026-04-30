// src/pages/health/Vaccinations.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiArrowLeft,
  FiPlus,
  FiHeart,
  FiCheck,
  FiClock,
  FiAlertTriangle,
  FiEdit,
  FiTrash2,
  FiX,
  FiSave,
} from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import { useHealth } from '../../hooks/useHealth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

const defaultForm = {
  name: '',
  dateAdministered: new Date().toISOString().split('T')[0],
  nextDueDate: '',
  batchNumber: '',
  manufacturer: '',
  administeredBy: '',
  clinicName: '',
  notes: '',
}

const Vaccinations = () => {
  const { petId } = useParams()
  const navigate = useNavigate()
  const { selectedPet: pet, getPetById } = usePets()
  const {
    vaccinations,
    fetchVaccinations,
    createVaccination,
    updateVaccination,
    deleteVaccination,
    vaccinationsLoading,
    loading,
  } = useHealth()

  const [showForm, setShowForm] = useState(false)
  const [editingVaccination, setEditingVaccination] = useState(null)
  const [formData, setFormData] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    vacId: null,
    name: '',
  })
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    getPetById(petId)
    fetchVaccinations(petId)
  }, [petId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleEdit = (vaccination) => {
    setEditingVaccination(vaccination)
    setFormData({
      name: vaccination.name || '',
      dateAdministered:
        vaccination.dateAdministered ||
        new Date().toISOString().split('T')[0],
      nextDueDate: vaccination.nextDueDate || '',
      batchNumber: vaccination.batchNumber || '',
      manufacturer: vaccination.manufacturer || '',
      administeredBy: vaccination.administeredBy || '',
      clinicName: vaccination.clinicName || '',
      notes: vaccination.notes || '',
    })
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingVaccination(null)
    setFormData(defaultForm)
    setErrors({})
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Vaccine name is required'
    if (!formData.dateAdministered)
      newErrors.dateAdministered = 'Date administered is required'
    if (!formData.nextDueDate)
      newErrors.nextDueDate = 'Next due date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      if (editingVaccination) {
        await updateVaccination(petId, editingVaccination.id, formData)
      } else {
        await createVaccination(petId, formData)
      }
      handleCloseForm()
    } catch (error) {
      // handled in context
    }
  }

  const handleDelete = async () => {
    try {
      await deleteVaccination(petId, deleteModal.vacId)
      setDeleteModal({ open: false, vacId: null, name: '' })
    } catch (error) {
      // handled in context
    }
  }

  // Filter vaccinations
  const filteredVaccinations = vaccinations.filter((v) => {
    if (activeTab === 'overdue') return v.status === 'OVERDUE'
    if (activeTab === 'upcoming') return v.status === 'UPCOMING'
    if (activeTab === 'completed') return v.status === 'COMPLETED'
    return true
  })

  const overdueCnt = vaccinations.filter((v) => v.status === 'OVERDUE').length
  const upcomingCnt = vaccinations.filter(
    (v) => v.status === 'UPCOMING'
  ).length
  const completedCnt = vaccinations.filter(
    (v) => v.status === 'COMPLETED'
  ).length

  const tabs = [
    { id: 'all', label: 'All', count: vaccinations.length },
    {
      id: 'overdue',
      label: 'Overdue',
      count: overdueCnt,
      color: 'text-red-500',
    },
    {
      id: 'upcoming',
      label: 'Due Soon',
      count: upcomingCnt,
      color: 'text-yellow-500',
    },
    {
      id: 'completed',
      label: 'Completed',
      count: completedCnt,
      color: 'text-green-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            icon={FiArrowLeft}
            onClick={() => navigate(`/health/${petId}`)}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Vaccinations
            </h1>
            {pet && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {pet.name}'s vaccination schedule
              </p>
            )}
          </div>
        </div>
        {!showForm && (
          <Button icon={FiPlus} onClick={() => setShowForm(true)}>
            Add Vaccination
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Overdue',
            count: overdueCnt,
            icon: FiAlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50 dark:bg-red-900/20',
          },
          {
            label: 'Due Soon',
            count: upcomingCnt,
            icon: FiClock,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          },
          {
            label: 'Up to Date',
            count: completedCnt,
            icon: FiCheck,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
          },
        ].map((stat) => (
          <Card key={stat.label} className={`text-center ${stat.bg} border-0`}>
            <stat.icon
              className={`w-6 h-6 mx-auto mb-2 ${stat.color}`}
            />
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.count}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <Card.Header>
                <Card.Title>
                  {editingVaccination
                    ? 'Edit Vaccination'
                    : 'Add Vaccination Record'}
                </Card.Title>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={FiX}
                  onClick={handleCloseForm}
                />
              </Card.Header>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Vaccine Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Rabies, DHPP"
                    required
                    error={errors.name}
                  />
                  <Input
                    label="Date Administered"
                    name="dateAdministered"
                    type="date"
                    value={formData.dateAdministered}
                    onChange={handleChange}
                    required
                    error={errors.dateAdministered}
                  />
                  <Input
                    label="Next Due Date"
                    name="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={handleChange}
                    required
                    error={errors.nextDueDate}
                  />
                  <Input
                    label="Batch Number"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                  <Input
                    label="Manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g., Zoetis"
                  />
                  <Input
                    label="Administered By"
                    name="administeredBy"
                    value={formData.administeredBy}
                    onChange={handleChange}
                    placeholder="Dr. Smith"
                  />
                  <Input
                    label="Clinic Name"
                    name="clinicName"
                    value={formData.clinicName}
                    onChange={handleChange}
                    placeholder="City Vet Clinic"
                  />
                </div>
                <Textarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes..."
                  rows={2}
                />
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseForm}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} icon={FiSave}>
                    {editingVaccination
                      ? 'Update Vaccination'
                      : 'Save Vaccination'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            <span
              className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Vaccinations List */}
      {vaccinationsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredVaccinations.length > 0 ? (
        <div className="space-y-4">
          {filteredVaccinations.map((vac, index) => (
            <motion.div
              key={vac.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`border-l-4 ${
                  vac.status === 'OVERDUE'
                    ? 'border-l-red-500'
                    : vac.status === 'UPCOMING'
                    ? 'border-l-yellow-500'
                    : 'border-l-green-500'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Status Icon */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl flex-shrink-0 ${
                        vac.status === 'OVERDUE'
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : vac.status === 'UPCOMING'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}
                    >
                      {vac.status === 'COMPLETED' ? (
                        <FiCheck
                          className={`w-5 h-5 text-green-600`}
                        />
                      ) : vac.status === 'UPCOMING' ? (
                        <FiClock
                          className={`w-5 h-5 text-yellow-600`}
                        />
                      ) : (
                        <FiAlertTriangle
                          className={`w-5 h-5 text-red-600`}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {vac.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">Last Given: </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatDate(vac.dateAdministered)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Next Due: </span>
                          <span
                            className={`font-medium ${
                              vac.status === 'OVERDUE'
                                ? 'text-red-600'
                                : vac.status === 'UPCOMING'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {formatDate(vac.nextDueDate)}
                          </span>
                        </div>
                        {vac.administeredBy && (
                          <div>
                            <span className="text-gray-500">By: </span>
                            <span className="text-gray-900 dark:text-white">
                              Dr. {vac.administeredBy}
                            </span>
                          </div>
                        )}
                        {vac.clinicName && (
                          <div>
                            <span className="text-gray-500">Clinic: </span>
                            <span className="text-gray-900 dark:text-white">
                              {vac.clinicName}
                            </span>
                          </div>
                        )}
                        {vac.manufacturer && (
                          <div>
                            <span className="text-gray-500">Brand: </span>
                            <span className="text-gray-900 dark:text-white">
                              {vac.manufacturer}
                            </span>
                          </div>
                        )}
                        {vac.batchNumber && (
                          <div>
                            <span className="text-gray-500">Batch: </span>
                            <span className="text-gray-900 dark:text-white">
                              {vac.batchNumber}
                            </span>
                          </div>
                        )}
                      </div>
                      {vac.notes && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                          {vac.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Badge + Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge
                      variant={
                        vac.status === 'COMPLETED'
                          ? 'success'
                          : vac.status === 'UPCOMING'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {vac.status === 'COMPLETED'
                        ? 'Up to Date'
                        : vac.status === 'UPCOMING'
                        ? 'Due Soon'
                        : 'Overdue'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={FiEdit}
                        onClick={() => handleEdit(vac)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={FiTrash2}
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            vacId: vac.id,
                            name: vac.name,
                          })
                        }
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiHeart}
            title={
              activeTab !== 'all'
                ? `No ${activeTab} vaccinations`
                : 'No vaccinations recorded'
            }
            description={
              activeTab !== 'all'
                ? `No vaccinations in the ${activeTab} category.`
                : "Track your pet's vaccination schedule to stay on top of their health."
            }
            action={
              activeTab === 'all' ? () => setShowForm(true) : undefined
            }
            actionLabel="Add Vaccination"
          />
        </Card>
      )}

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, vacId: null, name: '' })
        }
        title="Delete Vaccination"
        description={`Are you sure you want to delete "${deleteModal.name}"? This cannot be undone.`}
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteModal({ open: false, vacId: null, name: '' })
            }
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            icon={FiTrash2}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Vaccinations