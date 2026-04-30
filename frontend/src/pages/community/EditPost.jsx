// src/pages/community/EditPost.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowLeft, FiImage, FiX, FiSave, FiInfo } from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'
import { communityService } from '../../services/communityService'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../../components/common/Avatar'
import TagInput from '../../components/community/TagInput'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { POST_CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

const CATEGORY_STYLES = {
  GENERAL:       { bg: 'bg-slate-500',  ring: 'ring-slate-400' },
  HEALTH:        { bg: 'bg-red-500',    ring: 'ring-red-400' },
  NUTRITION:     { bg: 'bg-orange-500', ring: 'ring-orange-400' },
  TRAINING:      { bg: 'bg-blue-500',   ring: 'ring-blue-400' },
  EMERGENCY:     { bg: 'bg-rose-600',   ring: 'ring-rose-400' },
  SUCCESS_STORY: { bg: 'bg-yellow-500', ring: 'ring-yellow-400' },
}

const EditPost = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newImage,   setNewImage]   = useState(null)    // { file, preview }
  const [existingImage, setExistingImage] = useState(null)
  const [tags,       setTags]       = useState([])
  const [charCount,  setCharCount]  = useState(0)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm()
  const watchedCategory = watch('category')

  useEffect(() => { fetchPost() }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const data = await communityService.getPostById(id)
      setValue('title', data.title)
      setValue('content', data.content)
      setValue('category', data.category)
      setCharCount(data.content?.length || 0)
      if (data.tags)     setTags([...data.tags])
      if (data.imageUrl) setExistingImage(data.imageUrl)
    } catch {
      toast.error('Failed to load post')
      navigate('/community')
    } finally {
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    onDrop: files => {
      if (files[0]) {
        setNewImage({ file: files[0], preview: URL.createObjectURL(files[0]) })
        setExistingImage(null)
      }
    },
  })

  const onSubmit = async (data) => {
    if (!data.category) { toast.error('Please select a category'); return }
    try {
      setSubmitting(true)
      await communityService.updatePost(id, {
        ...data,
        tags,
        images: newImage ? [newImage.file] : [],
      })
      toast.success('Post updated! ✅')
      navigate(`/community/post/${id}`)
    } catch (error) {
      toast.error(error.message || 'Failed to update post')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingPage message="Loading post..." />

  const currentImageSrc = newImage?.preview || existingImage

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-500 font-medium transition-colors group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <span className="text-sm text-gray-400 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full font-medium">
            ✏️ Editing post
          </span>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-5">

              {/* Author strip */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-5 flex items-center gap-3">
                <Avatar src={user?.avatar} name={`${user?.firstName} ${user?.lastName}`} size="md" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-400">Editing your post</p>
                </div>
              </div>

              {/* Content card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 space-y-5"
              >
                {/* Title */}
                <div>
                  <input
                    type="text"
                    placeholder="Post title..."
                    className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
                    {...register('title', {
                      required: 'Title is required',
                      minLength: { value: 10, message: 'Min 10 characters' },
                    })}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Content */}
                <div>
                  <textarea
                    placeholder="Write your post content..."
                    rows={10}
                    className="w-full text-gray-700 dark:text-gray-300 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600 resize-none text-base leading-relaxed"
                    {...register('content', {
                      required: 'Content is required',
                      minLength: { value: 50, message: 'Min 50 characters' },
                      onChange: e => setCharCount(e.target.value.length),
                    })}
                  />
                  {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${charCount < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                      {charCount} chars
                    </span>
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Image section */}
                <div>
                  <AnimatePresence mode="wait">
                    {currentImageSrc ? (
                      <motion.div
                        key="img"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative rounded-xl overflow-hidden"
                      >
                        <img
                          src={currentImageSrc}
                          alt="Post image"
                          className="w-full max-h-64 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          {newImage && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              New image
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => { setNewImage(null); setExistingImage(null) }}
                            className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="drop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          isDragActive
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <FiImage className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">
                          {isDragActive ? 'Drop it!' : 'Add or replace image'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Tags */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                <TagInput tags={tags} onChange={setTags} maxTags={5} />
              </div>

              {/* Submit (mobile) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><FiSave className="w-5 h-5" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Category */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-5"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
                <div className="space-y-2">
                  {POST_CATEGORIES.map(cat => {
                    const s = CATEGORY_STYLES[cat.value]
                    const isSelected = watchedCategory === cat.value
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setValue('category', cat.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                          isSelected
                            ? `${s.bg} text-white shadow-sm`
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label.replace(/^\S+\s/, '')}</span>
                        {isSelected && <span className="ml-auto text-xs bg-white/25 px-2 py-0.5 rounded-full">✓</span>}
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Save (desktop) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden lg:block space-y-2"
              >
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-soft transition-all disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><FiSave className="w-5 h-5" /> Save Changes</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPost