// src/pages/ai-scan/ScanPage.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCamera, FiInfo } from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import { aiService } from '../../services/aiService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Alert from '../../components/common/Alert'
import ImageUploader from '../../components/ai/ImageUploader'
import AnalysisResult from '../../components/ai/AnalysisResult'
import { LoadingOverlay } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const ScanPage = () => {
  const [searchParams] = useSearchParams()
  const { pets, fetchPets } = usePets()
  const [selectedPetId, setSelectedPetId] = useState(searchParams.get('petId') || '')
  const [selectedImage, setSelectedImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  const petOptions = pets.map((pet) => ({
    value: pet.id,
    label: pet.name,
    icon: pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐾',
  }))

  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setResult(null)
  }

  const handleClearImage = () => {
    setSelectedImage(null)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!selectedPetId) {
      toast.error('Please select a pet first')
      return
    }
    if (!selectedImage) {
      toast.error('Please upload an image first')
      return
    }

    try {
      setAnalyzing(true)
      const analysisResult = await aiService.analyzeSkinImage(selectedImage, selectedPetId)
      setResult(analysisResult)
      toast.success('Analysis complete!')
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRetry = () => {
    setSelectedImage(null)
    setResult(null)
  }

  // Mock result for demo
  const mockAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setResult({
        prediction: 'Bacterial Dermatitis',
        confidence: 0.87,
        severity: 'MODERATE',
        possibleConditions: [
          { name: 'Bacterial Dermatitis', probability: 0.87 },
          { name: 'Fungal Infection', probability: 0.08 },
          { name: 'Allergic Reaction', probability: 0.05 },
        ],
        recommendations: [
          'Keep the affected area clean and dry',
          'Avoid scratching or irritating the area',
          'Consider scheduling a vet appointment within the next few days',
          'Monitor for any changes in size or appearance',
          'Apply pet-safe antiseptic if recommended by your vet',
        ],
      })
      setAnalyzing(false)
    }, 3000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {analyzing && <LoadingOverlay message="Analyzing image with AI..." />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-primary-500 flex items-center justify-center">
            <FiCamera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              AI Skin Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload a photo for preliminary skin condition assessment
            </p>
          </div>
        </div>
      </motion.div>

      {!result ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="space-y-6">
              {/* Pet Selection */}
              <Select
                label="Select Pet"
                options={petOptions}
                value={selectedPetId}
                onChange={setSelectedPetId}
                placeholder="Choose which pet this scan is for"
                required
              />

              {/* Image Upload */}
              <ImageUploader
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onClear={handleClearImage}
              />

              {/* Analyze Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={mockAnalyze}
                disabled={!selectedImage || !selectedPetId}
                icon={FiCamera}
              >
                Analyze Image
              </Button>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 border-l-4 border-l-blue-500">
            <div className="flex gap-4">
              <FiInfo className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How AI Skin Analysis Works
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>
                    <strong>1. Upload:</strong> Take or upload a clear photo of the affected skin area
                  </li>
                  <li>
                    <strong>2. Analysis:</strong> Our AI model analyzes the image using trained algorithms
                  </li>
                  <li>
                    <strong>3. Results:</strong> Get preliminary assessment with severity level and recommendations
                  </li>
                  <li>
                    <strong>4. Action:</strong> Based on severity, find nearby vets or save to health records
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <AnalysisResult result={result} onRetry={handleRetry} petId={selectedPetId} />
      )}
    </div>
  )
}

export default ScanPage