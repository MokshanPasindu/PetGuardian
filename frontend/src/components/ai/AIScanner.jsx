// src/components/ai/AIScanner.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCamera, FiUpload, FiAlertCircle } from 'react-icons/fi'
import Card from '../common/Card'
import Button from '../common/Button'
import ImageUploader from './ImageUploader'
import AnalysisResult from './AnalysisResult'
import { LoadingOverlay } from '../common/LoadingSpinner'
import Alert from '../common/Alert'
import { aiService } from '../../services/aiService'
import toast from 'react-hot-toast'

const AIScanner = ({ petId, petName, onComplete }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setResult(null)
    setError(null)
  }

  const handleClearImage = () => {
    setSelectedImage(null)
    setResult(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first')
      return
    }

    try {
      setAnalyzing(true)
      setError(null)
      const analysisResult = await aiService.analyzeSkinImage(selectedImage, petId)
      setResult(analysisResult)
      onComplete?.(analysisResult)
      toast.success('Analysis complete!')
    } catch (err) {
      setError('Failed to analyze image. Please try again.')
      toast.error('Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRetry = () => {
    setSelectedImage(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {analyzing && <LoadingOverlay message="Analyzing image with AI..." />}

      {/* Scanner Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-primary-500 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <FiCamera className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Skin Analysis</h2>
            <p className="text-white/80">
              {petName ? `Scanning for ${petName}` : 'Upload a photo for analysis'}
            </p>
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Scanner Content */}
      {!result ? (
        <Card>
          <ImageUploader
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            onClear={handleClearImage}
          />

          <div className="mt-6">
            <Button
              className="w-full"
              size="lg"
              onClick={handleAnalyze}
              disabled={!selectedImage}
              loading={analyzing}
              icon={FiCamera}
            >
              Analyze Image
            </Button>
          </div>
        </Card>
      ) : (
        <AnalysisResult result={result} onRetry={handleRetry} petId={petId} />
      )}

      {/* Disclaimer */}
      <Alert variant="info" icon={FiAlertCircle}>
        <strong>Important:</strong> This AI analysis is for preliminary screening only and 
        does not replace professional veterinary diagnosis. Always consult a veterinarian 
        for proper medical advice.
      </Alert>
    </div>
  )
}

export default AIScanner