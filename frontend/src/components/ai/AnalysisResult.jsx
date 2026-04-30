import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiMapPin, FiFileText, FiRefreshCw,
  FiCheckCircle, FiAlertTriangle, FiAlertCircle,
} from 'react-icons/fi'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import SeverityIndicator from './SeverityIndicator'
import Alert from '../common/Alert'
import { aiService } from '../../services/aiService'
import toast from 'react-hot-toast'

const AnalysisResult = ({ result, onRetry, petId }) => {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(result?.savedToMedicalHistory ?? false)

  // Normalise field names — Flask uses predictedClass, legacy uses prediction
  const prediction       = result?.predictedClass   ?? result?.prediction      ?? 'Unknown'
  const confidence       = result?.confidence       ?? 0
  const severity         = result?.severity         ?? 'MILD'
  const guidance         = result?.guidance         ?? ''
  const disclaimer       = result?.disclaimer       ?? ''
  const vetConnectTrigger= result?.vetConnectTrigger ?? result?.vetConnectTriggered ?? false
  const homeCareSteps    = result?.homeCareSteps    ?? result?.recommendations  ?? []
  const allPredictions   = result?.allPredictions   ?? result?.possibleConditions ?? []
  const scanId           = result?.id

  // ── Save to medical history ────────────────────────────────
  const handleSaveToHistory = async () => {
    if (!scanId) {
      toast.error('Scan ID not available')
      return
    }
    try {
      setSaving(true)
      await aiService.saveToMedicalHistory(scanId)
      setSaved(true)
      toast.success('Saved to medical history!')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save to medical history'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Severity styles ───────────────────────────────────────
  const severityConfig = {
    SEVERE:   { variant: 'danger',  label: 'Severe',   icon: FiAlertCircle },
    MODERATE: { variant: 'warning', label: 'Moderate', icon: FiAlertTriangle },
    MILD:     { variant: 'success', label: 'Mild',     icon: FiCheckCircle },
  }
  const cfg = severityConfig[severity?.toUpperCase()] ?? severityConfig.MILD

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Severity Banner */}
      <SeverityIndicator severity={severity} confidence={confidence} />

      {/* Auto VetConnect trigger banner */}
      {vetConnectTrigger && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200
                     dark:border-red-800 rounded-xl p-4 flex items-center
                     justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <FiAlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-300">
                Immediate Veterinary Care Required
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                This condition has been flagged as severe. Please visit a vet immediately.
              </p>
            </div>
          </div>
          <Link to="/vets">
            <Button variant="danger" size="sm" icon={FiMapPin}>
              Find Vets
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Main Result Card */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Analysis Result
          </h3>
          <Badge variant={cfg.variant}>
            {cfg.label} Severity
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Primary Prediction */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Detected Condition
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {prediction}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Confidence: {(confidence * 100).toFixed(1)}%
            </p>
          </div>

          {/* AI Guidance */}
          {guidance && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                AI Guidance
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm">{guidance}</p>
            </div>
          )}

          {/* All Predictions */}
          {allPredictions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Possible Conditions
              </h4>
              <div className="space-y-2">
                {allPredictions.map((condition, index) => {
                  // Support both Flask format {class, confidence}
                  // and legacy format {name, probability}
                  const name  = condition.class ?? condition.name ?? 'Unknown'
                  const prob  = condition.confidence ?? condition.probability ?? 0
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3
                                 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600
                                        rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full
                                       transition-all duration-500"
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-500
                                         dark:text-gray-400 w-10 text-right">
                          {(prob * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Home Care Steps */}
          {homeCareSteps.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {homeCareSteps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3
                               bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary-100
                                     dark:bg-primary-900/30 text-primary-600
                                     dark:text-primary-400 flex items-center
                                     justify-center flex-shrink-0 text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Disclaimer */}
      {disclaimer && (
        <Alert variant="warning">
          {disclaimer}
        </Alert>
      )}
      {!disclaimer && (
        <Alert variant="warning" title="Important Disclaimer">
          This AI analysis is for preliminary screening only and does not replace
          professional veterinary diagnosis. Always consult a licensed veterinarian.
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Find Vets — always shown for SEVERE, optional otherwise */}
        {(vetConnectTrigger || severity === 'SEVERE') && (
          <Link to="/vets" className="flex-1">
            <Button className="w-full" variant="danger" icon={FiMapPin}>
              Find Nearby Vets
            </Button>
          </Link>
        )}

        {/* Save to Medical History */}
        {scanId && (
          <Button
            className="flex-1"
            variant={saved ? 'secondary' : 'primary'}
            icon={FiFileText}
            onClick={handleSaveToHistory}
            loading={saving}
            disabled={saved || saving}
          >
            {saved ? 'Saved to Records ✓' : 'Save to Medical Records'}
          </Button>
        )}

        {/* Scan Again */}
        <Button variant="secondary" icon={FiRefreshCw} onClick={onRetry}>
          Scan Again
        </Button>
      </div>
    </motion.div>
  )
}

export default AnalysisResult