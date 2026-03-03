// src/components/health/VaccinationCard.jsx
import { FiCheck, FiClock, FiAlertTriangle, FiCalendar } from 'react-icons/fi'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatDate } from '../../utils/helpers'

const VaccinationCard = ({ vaccination, onUpdate }) => {
  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        icon: FiCheck,
        badge: <Badge variant="success" icon={FiCheck}>Up to Date</Badge>,
        borderColor: 'border-l-green-500',
      },
      upcoming: {
        icon: FiClock,
        badge: <Badge variant="warning" icon={FiClock}>Due Soon</Badge>,
        borderColor: 'border-l-yellow-500',
      },
      overdue: {
        icon: FiAlertTriangle,
        badge: <Badge variant="danger" icon={FiAlertTriangle}>Overdue</Badge>,
        borderColor: 'border-l-red-500',
      },
    }
    return configs[status] || configs.completed
  }

  const config = getStatusConfig(vaccination.status)

  return (
    <Card className={`border-l-4 ${config.borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <FiCalendar className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {vaccination.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last: {formatDate(vaccination.lastDate)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Next Due: {formatDate(vaccination.nextDue)}
            </p>
            {vaccination.provider && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {vaccination.provider}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {config.badge}
          <Button variant="ghost" size="sm" onClick={() => onUpdate?.(vaccination)}>
            Update
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default VaccinationCard