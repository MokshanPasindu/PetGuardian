// src/pages/community/CreatePost.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiArrowLeft,
  FiImage,
  FiX,
  FiSend,
  FiEye,
  FiInfo,
} from 'react-icons/fi'
import { useDropzone } from 'react-dropzone'
import { communityService } from '../../services/communityService'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../../components/common/Avatar'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import TagInput from '../../components/community/TagInput'
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

const CreatePost = () => {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const [loading,   setLoading]   = useState(false)
  const [image,     setImage]     = useState(null)  // { file, preview }
  const [tags,      setTags]      = useState([])
  const [preview,   setPreview]   = useState(false)
  const [charCount, setCharCount] = useState(0)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm()
  const watchedCategory = watch('category')
  const watchedTitle    = watch('title',   '')
  const watchedContent  = watch('content', '')

  // ─── Dropzone ─────────────────────────────────────────────────────────────
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    onDrop: files => {
      if (files[0]) setImage({ file: files[0], preview: URL.createObjectURL(files[0]) })
    },
    onDropRejected: () => toast.error('Image must be JPG/PNG/WebP and under 5MB'),
  })

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (!data.category) { toast.error('Please select a category'); return }
    try {
      setLoading(true)
      await communityService.createPost({
        ...data,
        tags,
        images: image ? [image.file] : [],
      })
      toast.success('Post published! 🎉')
      navigate('/community')
    } catch (error) {
      toast.error(error.message || 'Failed to publish post')
    } finally {
      setLoading(false)
    }
  }

  const selectedStyle = CATEGORY_STYLES[watchedCategory] || null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── Header ───────────────────────────────────────────────────────── */}
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiEye className="w-4 h-4" />
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Main form ───────────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Author strip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-5 flex items-center gap-3"
              >
                <Avatar
                  src={user?.avatar}
                  name={user?.name || `${user?.firstName} ${user?.lastName}`}
                  size="md"
                />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {watchedCategory
                      ? `Posting in ${POST_CATEGORIES.find(c => c.value === watchedCategory)?.label}`
                      : 'Select a category below'}
                  </p>
                </div>
              </motion.div>

              {/* Main content card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6 space-y-5"
              >
                {/* Title */}
                <div>
                  <input
                    type="text"
                    placeholder="What's your post about? Give it a great title..."
                    className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600 resize-none"
                    {...register('title', {
                      required: 'Title is required',
                      minLength: { value: 10, message: 'Title must be at least 10 characters' },
                    })}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Content */}
                <div>
                  <textarea
                    placeholder="Share your thoughts, tips, questions, or story with the community..."
                    rows={10}
                    className="w-full text-gray-700 dark:text-gray-300 bg-transparent border-none focus:outline-none placeholder-gray-300 dark:placeholder-gray-600 resize-none text-base leading-relaxed"
                    {...register('content', {
                      required: 'Content is required',
                      minLength: { value: 50, message: 'Content must be at least 50 characters' },
                      onChange: e => setCharCount(e.target.value.length),
                    })}
                  />
                  {errors.content && (
                    <p className="text-xs text-red-500">{errors.content.message}</p>
                  )}
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${charCount < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                      {charCount} characters {charCount < 50 ? `(${50 - charCount} more needed)` : ''}
                    </span>
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-700" />

                {/* Image upload */}
                <div>
                  <AnimatePresence mode="wait">
                    {image ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative rounded-xl overflow-hidden"
                      >
                        <img
                          src={image.preview}
                          alt="Upload preview"
                          className="w-full max-h-64 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => setImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          {(image.file.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          isDragActive
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-750'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <FiImage className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-primary-500' : 'text-gray-300'}`} />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isDragActive ? 'Drop your image here!' : 'Drag & drop an image or click to browse'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6"
              >
                <TagInput tags={tags} onChange={setTags} maxTags={5} />
              </motion.div>

              {/* Submit (mobile) */}
              <div className="lg:hidden">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-soft transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      Publish Post
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* ── Right sidebar ────────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Category picker */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-5"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Category <span className="text-red-400">*</span>
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Choose the most relevant category
                </p>

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
                            ? `${s.bg} text-white shadow-sm ring-2 ring-offset-1 ${s.ring} dark:ring-offset-gray-800`
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.label.replace(/^\S+\s/, '')}</span>
                        {isSelected && (
                          <span className="ml-auto text-xs bg-white/25 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-2">{errors.category.message}</p>
                )}
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FiInfo className="w-4 h-4 text-primary-500" />
                  <h4 className="font-semibold text-primary-700 dark:text-primary-400 text-sm">
                    Writing Tips
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-primary-600 dark:text-primary-400">
                  {[
                    'Use a clear, specific title',
                    'Add an image to get more engagement',
                    'Use tags to help others find your post',
                    'Be descriptive and helpful',
                    'Proofread before publishing',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-0.5">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Publish button (desktop) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:block space-y-2"
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-soft transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      Publish Post
                    </>
                  )}
                </motion.button>
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

export default CreatePost