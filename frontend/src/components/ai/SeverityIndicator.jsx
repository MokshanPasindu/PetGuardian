// src/components/ai/SeverityIndicator.jsx
import { motion } from 'framer-motion'
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'
import { SEVERITY_LEVELS } from '../../utils/constants'

const SeverityIndicator = ({ severity, confidence }) => {
  const severityInfo = SEVERITY_LEVELS[severity?.toUpperCase()] || SEVERITY_LEVELS.MILD

  const getIcon = () => {
    switch (severity?.toUpperCase()) {
      case 'SEVERE':
        return <FiAlertCircle className="w-8 h-8" />
      case 'MODERATE':
        return <FiAlertTriangle className="w-8 h-8" />
      default:
        return <FiCheckCircle className="w-8 h-8" />
    }
  }

  const getColor = () => {
    switch (severity?.toUpperCase()) {
      case 'SEVERE':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-500',
          bar: 'bg-red-500',
        }
      case 'MODERATE':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-600 dark:text-yellow-400',
          border: 'border-yellow-500',
          bar: 'bg-yellow-500',
        }
      default:
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-600 dark:text-green-400',
          border: 'border-green-500',
          bar: 'bg-green-500',
        }
    }
  }

  const colors = getColor()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${colors.bg} ${colors.border} border-l-4 rounded-xl p-6`}
    >
      <div className="flex items-start gap-4">
        <div className={`${colors.text}`}>{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xl font-semibold ${colors.text}`}>
              {severityInfo.label} Severity
            </h3>
            <span className={`font-bold ${colors.text}`}>
              {(confidence * 100).toFixed(1)}% Confidence
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {severityInfo.description}
          </p>

          {/* Confidence Bar */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full ${colors.bar} rounded-full`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default SeverityIndicator