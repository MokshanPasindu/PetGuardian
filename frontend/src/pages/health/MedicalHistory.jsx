// src/pages/health/MedicalHistory.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiArrowLeft,
  FiPlus,
  FiFilter,
  FiFileText,
  FiTrash2,
  FiEdit,
  FiCalendar,
  FiUser,
  FiSearch,
} from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import { useHealth } from '../../hooks/useHealth'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Select from '../../components/common/Select'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

const RECORD_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'CHECKUP', label: 'Checkup' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'TREATMENT', label: 'Treatment' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'MEDICATION', label: 'Medication' },
  { value: 'AI_SCAN', label: 'AI Scan' },
  { value: 'OTHER', label: 'Other' },
]

const RECORD_TYPE_COLORS = {
  CHECKUP: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  VACCINATION:
    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  TREATMENT:
    'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  SURGERY: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  MEDICATION:
    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  AI_SCAN:
    'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  OTHER: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

const MedicalHistory = () => {
  const { petId } = useParams()
  const navigate = useNavigate()
  const { selectedPet: pet, getPetById } = usePets()
  const {
    medicalRecords,
    fetchMedicalRecords,
    deleteMedicalRecord,
    recordsLoading,
    loading,
  } = useHealth()

  const [filterType, setFilterType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    recordId: null,
    title: '',
  })
  const [viewRecord, setViewRecord] = useState(null)

  useEffect(() => {
    getPetById(petId)
    fetchMedicalRecords(petId)
  }, [petId])

  const handleFilter = async (type) => {
    setFilterType(type)
    await fetchMedicalRecords(petId, type || null)
  }

  const handleDelete = async () => {
    try {
      await deleteMedicalRecord(petId, deleteModal.recordId)
      setDeleteModal({ open: false, recordId: null, title: '' })
    } catch (error) {
      // handled in context
    }
  }

  const filteredRecords = medicalRecords.filter(
    (r) =>
      r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vetName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
              Medical History
            </h1>
            {pet && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {pet.name}'s health records
              </p>
            )}
          </div>
        </div>
        <Link to={`/health/${petId}/records/add`}>
          <Button icon={FiPlus}>Add Record</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          {/* Type Filter */}
          <div className="w-full sm:w-48">
            <Select
              options={RECORD_TYPE_OPTIONS}
              value={filterType}
              onChange={handleFilter}
              placeholder="Filter by type"
            />
          </div>
        </div>
      </Card>

      {/* Records Count */}
      {!recordsLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredRecords.length} record
          {filteredRecords.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Records List */}
      {recordsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-medium transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${
                      RECORD_TYPE_COLORS[record.type] ||
                      RECORD_TYPE_COLORS.OTHER
                    }`}
                  >
                    <FiFileText className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {record.title}
                      </h3>
                      <Badge variant="info" size="sm" className="flex-shrink-0 capitalize">
                        {record.type?.toLowerCase().replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(record.date)}
                      </span>
                      {record.vetName && (
                        <span className="flex items-center gap-1">
                          <FiUser className="w-4 h-4" />
                          Dr. {record.vetName}
                        </span>
                      )}
                      {record.clinicName && (
                        <span className="text-gray-400">
                          {record.clinicName}
                        </span>
                      )}
                    </div>

                    {record.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {record.description}
                      </p>
                    )}

                    {record.prescription && (
                      <div className="mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          💊 Prescription: {record.prescription}
                        </p>
                      </div>
                    )}
                  </div>


                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* View Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiFileText}
                      onClick={() => setViewRecord(record)}
                    >
                      View
                    </Button>

                    {/* ✅ Edit Button - correct path */}
                    <Link to={`/health/${petId}/records/${record.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={FiEdit}
                      />
                    </Link>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiTrash2}
                      onClick={() =>
                        setDeleteModal({
                          open: true,
                          recordId: record.id,
                          title: record.title,
                        })
                      }
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiFileText}
            title="No medical records"
            description={
              searchQuery || filterType
                ? 'No records match your search. Try different filters.'
                : "No medical records yet. Add your first record to start tracking your pet's health."
            }
            action={
              !searchQuery && !filterType
                ? () => navigate(`/health/${petId}/records/add`)
                : undefined
            }
            actionLabel="Add First Record"
          />
        </Card>
      )}

      {/* View Record Modal */}
      <Modal
        isOpen={!!viewRecord}
        onClose={() => setViewRecord(null)}
        title={viewRecord?.title}
        size="lg"
      >
        {viewRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(viewRecord.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <Badge variant="info" className="capitalize mt-1">
                  {viewRecord.type?.toLowerCase().replace('_', ' ')}
                </Badge>
              </div>
              {viewRecord.vetName && (
                <div>
                  <p className="text-sm text-gray-500">Veterinarian</p>
                  <p className="font-medium">Dr. {viewRecord.vetName}</p>
                </div>
              )}
              {viewRecord.clinicName && (
                <div>
                  <p className="text-sm text-gray-500">Clinic</p>
                  <p className="font-medium">{viewRecord.clinicName}</p>
                </div>
              )}
            </div>
            {viewRecord.description && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  {viewRecord.description}
                </p>
              </div>
            )}
            {viewRecord.notes && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  {viewRecord.notes}
                </p>
              </div>
            )}
            {viewRecord.prescription && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Prescription</p>
                <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                  💊 {viewRecord.prescription}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <Link to={`/health/${petId}/records/${viewRecord.id}/edit`}>
                <Button variant="secondary" icon={FiEdit}>
                  Edit Record
                </Button>
              </Link>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({ open: false, recordId: null, title: '' })
        }
        title="Delete Medical Record"
        description={`Are you sure you want to delete "${deleteModal.title}"? This cannot be undone.`}
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteModal({ open: false, recordId: null, title: '' })
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
            Delete Record
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default MedicalHistory