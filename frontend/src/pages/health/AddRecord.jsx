// src/pages/health/AddRecord.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiSave, FiFileText } from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import { useHealth } from '../../hooks/useHealth'
import { healthService } from '../../services/healthService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const RECORD_TYPE_OPTIONS = [
  { value: 'CHECKUP', label: '🩺 Checkup' },
  { value: 'VACCINATION', label: '💉 Vaccination' },
  { value: 'TREATMENT', label: '💊 Treatment' },
  { value: 'SURGERY', label: '🔬 Surgery' },
  { value: 'MEDICATION', label: '🧪 Medication' },
  { value: 'AI_SCAN', label: '🤖 AI Scan' },
  { value: 'OTHER', label: '📋 Other' },
]

const DEFAULT_FORM = {
  type: 'CHECKUP',
  title: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  vetName: '',
  clinicName: '',
  notes: '',
  prescription: '',
}

const AddRecord = () => {
  // ✅ Get BOTH petId and recordId from URL params
  const { petId, recordId } = useParams()
  const navigate = useNavigate()

  const { selectedPet: pet, getPetById } = usePets()
  const { createMedicalRecord, updateMedicalRecord, loading } = useHealth()

  // ✅ isEdit is true when recordId exists in URL
  const isEdit = !!recordId

  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [errors, setErrors] = useState({})
  const [pageLoading, setPageLoading] = useState(false)

  // ─── Load pet info ──────────────────────────────────────────────
  useEffect(() => {
    if (petId) {
      getPetById(petId)
    }
  }, [petId])

  // ─── Load existing record when editing ──────────────────────────
  useEffect(() => {
    if (isEdit && petId && recordId) {
      loadExistingRecord()
    }
  }, [isEdit, petId, recordId])

  const loadExistingRecord = async () => {
    try {
      setPageLoading(true)
      // ✅ Call healthService directly (not through context)
      const record = await healthService.getMedicalRecordById(petId, recordId)

      // ✅ Populate form with existing record data
      setFormData({
        type: record.type || 'CHECKUP',
        title: record.title || '',
        description: record.description || '',
        // ✅ Handle date format from backend (LocalDate → string)
        date: record.date
          ? new Date(record.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        vetName: record.vetName || '',
        clinicName: record.clinicName || '',
        notes: record.notes || '',
        prescription: record.prescription || '',
      })
    } catch (error) {
      console.error('Failed to load record:', error)
      toast.error('Failed to load medical record')
      // ✅ Navigate back if record not found
      navigate(`/health/${petId}/history`)
    } finally {
      setPageLoading(false)
    }
  }

  // ─── Form handlers ───────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSelectChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // ─── Validation ──────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.type) {
      newErrors.type = 'Record type is required'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ─── Submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    try {
      if (isEdit) {
        // ✅ UPDATE existing record
        await updateMedicalRecord(petId, recordId, formData)
        // navigate back to history after update
        navigate(`/health/${petId}/history`)
      } else {
        // ✅ CREATE new record
        await createMedicalRecord(petId, formData)
        // navigate back to history after create
        navigate(`/health/${petId}/history`)
      }
    } catch (error) {
      // Error handled inside context (toast shown there)
      console.error('Submit error:', error)
    }
  }

  // ─── Loading states ───────────────────────────────────────────────
  if (pageLoading) {
    return (
      <LoadingPage
        message={isEdit ? 'Loading record...' : 'Preparing form...'}
      />
    )
  }

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate(`/health/${petId}/history`)}
          className="mb-4"
        >
          Back to Medical History
        </Button>

        <Card>
          {/* Header */}
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <Card.Title>
                  {isEdit ? 'Edit Medical Record' : 'Add Medical Record'}
                </Card.Title>
                <Card.Description>
                  {pet
                    ? `For ${pet.name}`
                    : 'Loading pet info...'}
                  {isEdit && (
                    <span className="ml-2 text-xs text-primary-500">
                      Editing record #{recordId}
                    </span>
                  )}
                </Card.Description>
              </div>
            </div>
          </Card.Header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Row 1: Type + Title */}
            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Record Type"
                options={RECORD_TYPE_OPTIONS}
                value={formData.type}
                onChange={handleSelectChange('type')}
                required
                error={errors.type}
              />
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Annual Checkup, Rabies Treatment"
                required
                error={errors.title}
              />
            </div>

            {/* Row 2: Date */}
            <Input
              label="Visit Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              error={errors.date}
              // Prevent future dates
              max={new Date().toISOString().split('T')[0]}
            />

            {/* Row 3: Vet Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Veterinarian Name"
                name="vetName"
                value={formData.vetName}
                onChange={handleChange}
                placeholder="Dr. Smith"
                helperText="Optional"
              />
              <Input
                label="Clinic Name"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                placeholder="City Vet Clinic"
                helperText="Optional"
              />
            </div>

            {/* Row 4: Description */}
            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the visit, findings, diagnosis, or treatment details..."
              rows={4}
              helperText="Optional but recommended"
            />

            {/* Row 5: Prescription */}
            <Input
              label="Prescription / Medication"
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              placeholder="e.g., Amoxicillin 250mg twice daily for 7 days"
              helperText="Optional - list any medications prescribed"
            />

            {/* Row 6: Notes */}
            <Textarea
              label="Additional Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional observations, follow-up instructions, or reminders..."
              rows={3}
              helperText="Optional"
            />

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/health/${petId}/history`)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={FiSave}
              >
                {isEdit ? 'Update Record' : 'Save Record'}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default AddRecord