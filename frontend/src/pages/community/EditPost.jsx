// src/pages/community/EditPost.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import TagInput from '../../components/community/TagInput' // ✅ ADDED
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { POST_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [post, setPost] = useState(null)
  const [images, setImages] = useState([])
  const [existingImage, setExistingImage] = useState(null)
  const [tags, setTags] = useState([]) // ✅ ADDED
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const category = watch('category')

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const data = await communityService.getPostById(id)
      setPost(data)
      
      // Set form values
      setValue('title', data.title)
      setValue('content', data.content)
      setValue('category', data.category)
      
      // ✅ Set tags if they exist
      if (data.tags) {
        setTags([...data.tags]) // Convert Set to Array
      }
      
      // Set existing image
      if (data.imageUrl) {
        setExistingImage(data.imageUrl)
      }
    } catch (error) {
      toast.error('Failed to load post')
      navigate('/community')
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setImages([{
          file,
          preview: URL.createObjectURL(file),
        }])
        setExistingImage(null)
      }
    },
  })

  const removeNewImage = () => {
    setImages([])
  }

  const removeExistingImage = () => {
    setExistingImage(null)
  }

  const onSubmit = async (data) => {
    try {
      setSubmitting(true)
      
      const updateData = {
        title: data.title,
        content: data.content,
        category: data.category,
        tags, // ✅ ADDED
      }
      
      // Add new image if uploaded
      if (images.length > 0) {
        updateData.images = [images[0].file]
      }
      
      await communityService.updatePost(id, updateData)
      toast.success('Post updated successfully!')
      navigate(`/community/post/${id}`)
    } catch (error) {
      toast.error(error.message || 'Failed to update post')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingPage message="Loading post..." />
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
              <Card.Title>Edit Post</Card.Title>
              <Card.Description>
                Update your post content and details
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

            {/* ✅ ADDED: Tags Input */}
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
                Image (Optional)
              </label>

              {/* Show existing image */}
              {existingImage && images.length === 0 && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={existingImage}
                    alt="Current"
                    className="w-full max-w-md h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeExistingImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-gray-500 mt-2">Current image</p>
                </div>
              )}

              {/* Show new image */}
              {images.length > 0 && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={images[0].preview}
                    alt="New upload"
                    className="w-full max-w-md h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-green-500 mt-2">New image (will replace current)</p>
                </div>
              )}

              {/* Upload area */}
              {!existingImage && images.length === 0 && (
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                >
                  <input {...getInputProps()} />
                  <FiImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Drag & drop an image or click to browse
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Max 5MB</p>
                </div>
              )}

              {/* Change image button */}
              {(existingImage || images.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setExistingImage(null)
                    setImages([])
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                >
                  Change image
                </button>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Update Post
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

export default EditPost