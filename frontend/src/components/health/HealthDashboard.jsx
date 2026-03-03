// src/components/health/HealthDashboard.jsx
import { Link } from 'react-router-dom'
import { FiCalendar, FiActivity, FiHeart, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatDate } from '../../utils/helpers'

const HealthDashboard = ({ pet, healthData }) => {
  const stats = [
    {
      label: 'Last Checkup',
      value: healthData?.lastCheckup ? formatDate(healthData.lastCheckup) : 'No records',
      icon: FiCalendar,
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Weight',
      value: healthData?.weight ? `${healthData.weight} kg` : 'Not recorded',
      icon: FiActivity,
      color: 'text-green-500 bg-green-100 dark:bg-green-900/30',
      trend: healthData?.weightTrend,
    },
    {
      label: 'Next Vaccination',
      value: healthData?.nextVaccination ? formatDate(healthData.nextVaccination) : 'Up to date',
      icon: FiHeart,
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Health Status',
      value: healthData?.status || 'Good',
      icon: FiTrendingUp,
      color: 'text-primary-500 bg-primary-100 dark:bg-primary-900/30',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {healthData?.alerts?.length > 0 && (
        <Card className="border-l-4 border-l-warning-500">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Health Alerts
              </h3>
              <ul className="space-y-1">
                {healthData.alerts.map((alert, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400 text-sm">
                    • {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className={`w-12 h-12 mx-auto rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {stat.label}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            {stat.trend && (
              <Badge
                variant={stat.trend === 'up' ? 'success' : stat.trend === 'down' ? 'danger' : 'default'}
                size="sm"
                className="mt-2"
              >
                {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'} {stat.trend}
              </Badge>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to={`/health/${pet.id}/history`}>
          <Card hover className="text-center">
            <FiCalendar className="w-8 h-8 mx-auto text-primary-500 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Medical History</p>
          </Card>
        </Link>
        <Link to={`/health/${pet.id}/vaccinations`}>
          <Card hover className="text-center">
            <FiHeart className="w-8 h-8 mx-auto text-pink-500 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Vaccinations</p>
          </Card>
        </Link>
        <Link to={`/scan?petId=${pet.id}`}>
          <Card hover className="text-center">
            <FiActivity className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">AI Health Scan</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default HealthDashboard