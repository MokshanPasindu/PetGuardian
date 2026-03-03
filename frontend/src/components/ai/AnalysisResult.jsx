// src/components/ai/AnalysisResult.jsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FiMapPin,
  FiFileText,
  FiRefreshCw,
  FiDownload,
  FiShare2,
  FiAlertTriangle,
} from 'react-icons/fi'
import Card from '../common/Card'
import Button from '../common/Button'
import Badge from '../common/Badge'
import SeverityIndicator from './SeverityIndicator'
import Alert from '../common/Alert'

const AnalysisResult = ({ result, onRetry, petId }) => {
  const {
    prediction,
    confidence,
    severity,
    recommendations,
    possibleConditions,
  } = result

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Severity Indicator */}
      <SeverityIndicator severity={severity} confidence={confidence} />

      {/* Main Result */}
      <Card>
        <Card.Header>
          <Card.Title>Analysis Result</Card.Title>
          <Badge
            variant={severity === 'SEVERE' ? 'danger' : severity === 'MODERATE' ? 'warning' : 'success'}
          >
            AI Powered
          </Badge>
        </Card.Header>

        <div className="space-y-6">
          {/* Primary Prediction */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Detected Condition
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {prediction}
            </p>
          </div>

          {/* Possible Conditions */}
          {possibleConditions && possibleConditions.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Possible Conditions
              </h4>
              <div className="space-y-2">
                {possibleConditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {condition.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${condition.probability * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-12">
                        {(condition.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Recommendations
            </h4>
            <ul className="space-y-2">
              {recommendations?.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <Alert variant="warning" title="Important Disclaimer">
        This AI analysis is for preliminary screening purposes only and does not
        replace professional veterinary diagnosis. Please consult a licensed
        veterinarian for proper diagnosis and treatment.
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {severity === 'SEVERE' && (
          <Link to="/vets" className="flex-1">
            <Button className="w-full" variant="danger" icon={FiMapPin}>
              Find Nearby Vets
            </Button>
          </Link>
        )}
        <Link to={`/health/${petId}/add-record`} className="flex-1">
          <Button className="w-full" variant="secondary" icon={FiFileText}>
            Save to Medical Records
          </Button>
        </Link>
        <Button variant="secondary" icon={FiRefreshCw} onClick={onRetry}>
          Scan Again
        </Button>
      </div>

      {/* Share/Download */}
      <div className="flex justify-center gap-4">
        <Button variant="ghost" size="sm" icon={FiDownload}>
          Download Report
        </Button>
        <Button variant="ghost" size="sm" icon={FiShare2}>
          Share with Vet
        </Button>
      </div>
    </motion.div>
  )
}

export default AnalysisResult