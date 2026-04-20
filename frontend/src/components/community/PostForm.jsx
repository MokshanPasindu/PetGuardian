// src/components/community/PostForm.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { FiImage, FiX } from 'react-icons/fi'
import Card from '../common/Card'
import Button from '../common/Button'
import Input from '../common/Input'
import Textarea from '../common/Textarea'
import Select from '../common/Select'
import { POST_CATEGORIES } from '../../utils/constants'

const PostForm = ({ initialData, onSubmit, loading, onCancel }) => {
  const [images, setImages] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      title: '',
      category: '',
      content: '',
    },
  })

  const category = watch('category')

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 4,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      setImages((prev) => [...prev, ...newImages].slice(0, 4))
    },
  })

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      images: images.map((img) => img.file),
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Title"
        placeholder="Give your post a descriptive title"
        required
        error={errors.title?.message}
        {...register('title', {
          required: 'Title is required',
          minLength: { value: 10, message: 'Title must be at least 10 characters' },
        })}
      />

      <Select
        label="Category"
        options={POST_CATEGORIES}
        value={category}
        onChange={(value) => setValue('category', value)}
        required
        error={errors.category?.message}
      />

      <Textarea
        label="Content"
        placeholder="Share your thoughts, experiences, or questions..."
        rows={8}
        required
        error={errors.content?.message}
        {...register('content', {
          required: 'Content is required',
          minLength: { value: 50, message: 'Content must be at least 50 characters' },
        })}
      />

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Images (Optional)
        </label>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {images.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {images.length < 4 && (
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
          >
            <input {...getInputProps()} />
            <FiImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Drag & drop images or click to browse
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Post' : 'Publish Post'}
        </Button>
      </div>
    </form>
  )
}

export default PostForm