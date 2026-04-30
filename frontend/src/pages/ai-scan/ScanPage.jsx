import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCamera, FiInfo, FiWifi, FiWifiOff } from 'react-icons/fi'
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
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const { pets, fetchPets } = usePets()

  const [selectedPetId, setSelectedPetId] = useState(
    searchParams.get('petId') || ''
  )
  const [selectedImage, setSelectedImage] = useState(null)
  const [analyzing, setAnalyzing]         = useState(false)
  const [result, setResult]               = useState(null)
  const [flaskOnline, setFlaskOnline]     = useState(null) // null = unknown

  // ── Fetch pets + check Flask on mount ─────────────────────
  useEffect(() => {
    fetchPets()
    checkFlask()
  }, [fetchPets])

  const checkFlask = async () => {
    try {
      const health = await aiService.checkFlaskHealth()
      setFlaskOnline(health?.flaskAlive ?? false)
    } catch {
      setFlaskOnline(false)
    }
  }

  const petOptions = (pets || []).map((pet) => ({
    value: String(pet.id),
    label: pet.name,
  }))

  const handleImageSelect  = (file) => { setSelectedImage(file); setResult(null) }
  const handleClearImage   = ()     => { setSelectedImage(null); setResult(null) }
  const handleRetry        = ()     => { setSelectedImage(null); setResult(null) }

  // ── Real API call ─────────────────────────────────────────
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
      const data           = await aiService.analyzeSkinImage(selectedImage, selectedPetId)
      const analysisResult = data?.data ?? data
      setResult(analysisResult)
      toast.success('Analysis complete!')

      // If SEVERE → navigate to vets after short delay
      if (analysisResult?.severity === 'SEVERE' ||
          analysisResult?.vetConnectTrigger === true) {
        setTimeout(() => {
          toast('Redirecting to Vet Connect…', { icon: '🏥' })
        }, 2000)
      }

    } catch (err) {
      const msg = err?.response?.data?.message
                  ?? err?.message
                  ?? 'Analysis failed. Please try again.'
      toast.error(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {analyzing && (
        <LoadingOverlay message="AI is analyzing your image… this may take a few seconds" />
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500
                          to-primary-500 flex items-center justify-center">
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

          {/* Flask status indicator */}
          <div className="ml-auto flex items-center gap-1 text-xs">
            {flaskOnline === true && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <FiWifi className="w-4 h-4" /> AI Online
              </span>
            )}
            {flaskOnline === false && (
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <FiWifiOff className="w-4 h-4" /> AI Offline (mock)
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Flask offline warning */}
      {flaskOnline === false && (
        <Alert variant="warning">
          The AI service is currently offline. Results will use a mock response
          for demonstration purposes.
        </Alert>
      )}

      {!result ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="space-y-6">
              {/* Pet selection */}
              <Select
                label="Select Pet"
                options={petOptions}
                value={selectedPetId}
                onChange={setSelectedPetId}
                placeholder="Choose which pet this scan is for"
                required
              />

              {/* Image upload */}
              <ImageUploader
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                onClear={handleClearImage}
              />

              {/* Analyze button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleAnalyze}
                disabled={!selectedImage || !selectedPetId || analyzing}
                loading={analyzing}
                icon={FiCamera}
              >
                {analyzing ? 'Analyzing…' : 'Analyze Image'}
              </Button>
            </div>
          </Card>

          {/* How it works */}
          <Card className="mt-6 border-l-4 border-l-blue-500">
            <div className="flex gap-4">
              <FiInfo className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  How AI Skin Analysis Works
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li><strong>1. Upload:</strong> Take a clear photo of the affected skin area</li>
                  <li><strong>2. Analysis:</strong> CNN model analyses the image (23 disease classes)</li>
                  <li><strong>3. Results:</strong> Get severity level + care recommendations</li>
                  <li><strong>4. Action:</strong> If severe, find nearby vets automatically</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <AnalysisResult
          result={result}
          onRetry={handleRetry}
          petId={selectedPetId}
        />
      )}
    </div>
  )
}

export default ScanPage