// src/pages/community/CreatePost.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiImage, FiX } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'
import { communityService } from '../../services/communityService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Select from '../../components/common/Select'
import TagInput from '../../components/community/TagInput' // ✅ NEW
import { POST_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const CreatePost = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [tags, setTags] = useState([]) // ✅ NEW

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

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

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await communityService.createPost({
        ...data,
        tags, // ✅ NEW
        images: images.map((img) => img.file),
      })
      toast.success('Post created successfully!')
      navigate('/community')
    } catch (error) {
      toast.error(error.message || 'Failed to create post')
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
              <Card.Title>Create New Post</Card.Title>
              <Card.Description>
                Share your experience, ask questions, or help others
              </Card.Description>
            </div>
          </Card.Header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Title"
              placeholder="Give your post a descriptive title"
              required
              error={errors.title?.message}
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 10,
                  message: 'Title must be at least 10 characters',
                },
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

            {/* ✅ NEW: Tags */}
            <TagInput tags={tags} onChange={setTags} maxTags={5} />

            <Textarea
              label="Content"
              placeholder="Share your thoughts, experiences, or questions..."
              rows={8}
              required
              error={errors.content?.message}
              {...register('content', {
                required: 'Content is required',
                minLength: {
                  value: 50,
                  message: 'Content must be at least 50 characters',
                },
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
                  <p className="text-gray-400 text-xs mt-1">
                    Max 4 images, 5MB each
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Publish Post
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreatePost