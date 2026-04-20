// src/components/pet/PetForm.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiX, FiCalendar } from 'react-icons/fi'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import Button from '../common/Button'
import { PET_TYPES } from '../../utils/constants'

const PetForm = ({ initialData, onSubmit, loading }) => {
  const [imagePreview, setImagePreview] = useState(initialData?.image || null)
  const [imageFile, setImageFile] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      name: '',
      type: '',
      breed: '',
      birthDate: '',
      gender: '',
      weight: '',
      color: '',
      microchipId: '',
      notes: '',
    },
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        setImageFile(file)
        setImagePreview(URL.createObjectURL(file))
      }
    },
  })

  const handleFormSubmit = (data) => {
    onSubmit({ ...data, image: imageFile })
  }

  const petType = watch('type')

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pet Photo
        </label>
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
            }
          `}
        >
          <input {...getInputProps()} />
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Pet preview"
                className="w-32 h-32 rounded-xl object-cover mx-auto"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setImagePreview(null)
                  setImageFile(null)
                }}
                className="absolute -top-2 -right-2 p-1 bg-danger-500 text-white rounded-full hover:bg-danger-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="py-4">
              <FiUpload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag & drop an image, or click to select'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Max file size: 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Pet Name"
          placeholder="Enter pet's name"
          required
          error={errors.name?.message}
          {...register('name', { required: 'Pet name is required' })}
        />

        <Select
          label="Pet Type"
          options={PET_TYPES}
          value={petType}
          onChange={(value) => setValue('type', value)}
          required
          error={errors.type?.message}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Breed"
          placeholder="e.g., Golden Retriever"
          error={errors.breed?.message}
          {...register('breed')}
        />

        <Input
          label="Date of Birth"
          type="date"
          required
          error={errors.birthDate?.message}
          {...register('birthDate', { required: 'Birth date is required' })}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Select
          label="Gender"
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
          value={watch('gender')}
          onChange={(value) => setValue('gender', value)}
        />

        <Input
          label="Weight (kg)"
          type="number"
          step="0.1"
          placeholder="e.g., 25.5"
          {...register('weight')}
        />

        <Input
          label="Color"
          placeholder="e.g., Golden"
          {...register('color')}
        />
      </div>

      <Input
        label="Microchip ID (Optional)"
        placeholder="Enter microchip number"
        {...register('microchipId')}
      />

      <Textarea
        label="Additional Notes"
        placeholder="Any special needs, allergies, or medical conditions..."
        rows={3}
        {...register('notes')}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Pet' : 'Add Pet'}
        </Button>
      </div>
    </form>
  )
}

export default PetForm