// src/components/ai/ImageUploader.jsx
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiX, FiImage, FiCamera } from 'react-icons/fi'
import Button from '../common/Button'

const ImageUploader = ({ onImageSelect, selectedImage, onClear }) => {
  const [preview, setPreview] = useState(selectedImage || null)

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
        onImageSelect(file)
      }
    },
    [onImageSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  const handleClear = () => {
    setPreview(null)
    onClear?.()
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
              ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <FiUpload className="w-10 h-10 text-primary-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop the image here' : 'Upload Pet Skin Image'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Drag and drop an image, or click to browse
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button type="button" variant="primary" icon={FiImage}>
                  Browse Files
                </Button>
                <Button type="button" variant="secondary" icon={FiCamera}>
                  Take Photo
                </Button>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">
                Supported formats: JPEG, PNG, WebP (Max 10MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            <img
              src={preview}
              alt="Selected pet skin"
              className="w-full h-80 object-contain"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-sm">
                Image ready for analysis. Click "Analyze" to proceed.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          📸 Tips for Best Results
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Ensure good lighting on the affected area</li>
          <li>• Take a close-up photo of the skin condition</li>
          <li>• Keep the camera steady to avoid blur</li>
          <li>• Include some surrounding healthy skin for comparison</li>
        </ul>
      </div>
    </div>
  )
}

export default ImageUploader