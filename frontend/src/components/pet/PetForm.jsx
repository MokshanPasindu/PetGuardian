// src/components/pet/PetForm.jsx
import { useState } from 'react'
import { FiUpload, FiX } from 'react-icons/fi'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import Button from '../common/Button'
import { PET_TYPES } from '../../utils/constants'

const PetForm = ({ initialData = null, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || '',
    breed: initialData?.breed || '',
    birthDate: initialData?.birthDate || '',
    gender: initialData?.gender || '',
    weight: initialData?.weight || '',
    color: initialData?.color || '',
    microchipId: initialData?.microchipId || '',
    notes: initialData?.notes || '',
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image || null)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must be less than 10MB' }))
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file' }))
        return
      }

      setImageFile(file)
      setErrors((prev) => ({ ...prev, image: '' }))

      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(initialData?.image || null)
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required'
    }

    if (!formData.type) {
      newErrors.type = 'Pet type is required'
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required'
    } else {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      if (birthDate > today) {
        newErrors.birthDate = 'Birth date cannot be in the future'
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (formData.weight && (isNaN(formData.weight) || formData.weight <= 0)) {
      newErrors.weight = 'Please enter a valid weight'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const data = { ...formData }
    if (imageFile) {
      data.image = imageFile
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pet Photo
        </label>
        {imagePreview ? (
          <div className="relative w-full h-64 rounded-xl overflow-hidden group">
            <img
              src={imagePreview}
              alt="Pet preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors bg-gray-50 dark:bg-gray-700/30">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <FiUpload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, WEBP (MAX. 10MB)
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
        {errors.image && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Pet Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g., Max, Bella"
            error={errors.name}
          />
        </div>

        <div>
          <Select
            label="Pet Type"
            name="type"
            value={formData.type}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, type: value }))
              if (errors.type) setErrors((prev) => ({ ...prev, type: '' }))
            }}
            options={PET_TYPES}
            required
            error={errors.type}
          />
        </div>

        <div>
          <Input
            label="Breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            placeholder="e.g., Golden Retriever"
          />
        </div>

        <div>
          <Input
            label="Birth Date"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            required
            error={errors.birthDate}
          />
        </div>

        <div>
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, gender: value }))
              if (errors.gender) setErrors((prev) => ({ ...prev, gender: '' }))
            }}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
            required
            error={errors.gender}
          />
        </div>

        <div>
          <Input
            label="Weight (kg)"
            name="weight"
            type="number"
            step="0.1"
            min="0"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g., 25.5"
            error={errors.weight}
          />
        </div>

        <div>
          <Input
            label="Color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="e.g., Brown, Black & White"
          />
        </div>

        <div>
          <Input
            label="Microchip ID"
            name="microchipId"
            value={formData.microchipId}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Textarea
          label="Notes & Special Information"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any special information about your pet (allergies, behavior, medical conditions, etc.)"
          rows={4}
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => window.history.back()}
          disabled={loading}
        >
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