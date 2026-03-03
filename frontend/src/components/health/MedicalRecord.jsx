// src/components/health/MedicalRecord.jsx
import { FiFileText, FiCalendar, FiUser, FiMoreVertical } from 'react-icons/fi'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatDate } from '../../utils/helpers'

const MedicalRecord = ({ record, onView, onEdit, onDelete }) => {
  const getTypeColor = (type) => {
    const colors = {
      checkup: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      vaccination: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      treatment: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      surgery: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      ai_scan: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    }
    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${getTypeColor(record.type)}`}>
          <FiFileText className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {record.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FiCalendar className="w-4 h-4" />
                <span>{formatDate(record.date)}</span>
                {record.vet && (
                  <>
                    <span>•</span>
                    <FiUser className="w-4 h-4" />
                    <span>{record.vet}</span>
                  </>
                )}
              </div>
            </div>
            <Badge variant="info" className="capitalize">
              {record.type.replace('_', ' ')}
            </Badge>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {record.description}
          </p>
          
          {record.notes && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              {record.notes}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onView?.(record)}>
            View
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default MedicalRecord