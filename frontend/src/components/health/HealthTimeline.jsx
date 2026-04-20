// src/components/health/HealthTimeline.jsx
import { motion } from 'framer-motion'
import { FiFileText, FiCalendar, FiUser, FiCamera, FiHeart } from 'react-icons/fi'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatDate } from '../../utils/helpers'

const HealthTimeline = ({ records }) => {
  const getRecordIcon = (type) => {
    const icons = {
      checkup: FiUser,
      vaccination: FiHeart,
      ai_scan: FiCamera,
      treatment: FiFileText,
    }
    return icons[type] || FiFileText
  }

  const getRecordColor = (type) => {
    const colors = {
      checkup: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      vaccination: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      ai_scan: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      treatment: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    }
    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }

  if (!records || records.length === 0) {
    return (
      <Card className="text-center py-8">
        <FiCalendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No health records yet</p>
      </Card>
    )
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-6">
        {records.map((record, index) => {
          const Icon = getRecordIcon(record.type)
          
          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-14"
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-4 w-5 h-5 rounded-full ${getRecordColor(record.type)} flex items-center justify-center`}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              <Card>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getRecordColor(record.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {record.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(record.date)}
                          {record.vet && ` • ${record.vet}`}
                        </p>
                      </div>
                      <Badge variant="info" className="capitalize">
                        {record.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {record.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default HealthTimeline