// src/pages/health/AddRecord.jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiCalendar, FiUser, FiFileText } from 'react-icons/fi'
import { healthService } from '../../services/healthService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Select from '../../components/common/Select'
import toast from 'react-hot-toast'

const recordTypes = [
  { value: 'checkup', label: 'General Checkup' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'medication', label: 'Medication' },
  { value: 'other', label: 'Other' },
]

const AddRecord = () => {
  const { petId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const recordType = watch('type')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await healthService.addMedicalRecord(petId, data)
      toast.success('Medical record added successfully!')
      navigate(`/health/${petId}/history`)
    } catch (error) {
      toast.error('Failed to add record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Back
        </Button>

        <Card>
          <Card.Header>
            <div>
              <Card.Title>Add Medical Record</Card.Title>
              <Card.Description>
                Document a new health record for your pet
              </Card.Description>
            </div>
          </Card.Header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Select
              label="Record Type"
              options={recordTypes}
              value={recordType}
              onChange={(value) => setValue('type', value)}
              required
              error={errors.type?.message}
            />

            <Input
              label="Title"
              placeholder="e.g., Annual Checkup, Rabies Vaccination"
              icon={FiFileText}
              required
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />

            <Input
              label="Date"
              type="date"
              icon={FiCalendar}
              required
              error={errors.date?.message}
              {...register('date', { required: 'Date is required' })}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Veterinarian"
                placeholder="Dr. Name"
                icon={FiUser}
                {...register('vet')}
              />
              <Input
                label="Clinic"
                placeholder="Clinic name"
                {...register('clinic')}
              />
            </div>

            <Textarea
              label="Description"
              placeholder="Describe the visit, diagnosis, or procedure..."
              rows={4}
              required
              error={errors.description?.message}
              {...register('description', { required: 'Description is required' })}
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="Any additional notes, follow-up instructions, etc."
              rows={3}
              {...register('notes')}
            />

            {recordType === 'medication' && (
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Medication Name"
                  placeholder="Enter medication name"
                  {...register('medicationName')}
                />
                <Input
                  label="Dosage"
                  placeholder="e.g., 10mg twice daily"
                  {...register('dosage')}
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Add Record
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default AddRecord