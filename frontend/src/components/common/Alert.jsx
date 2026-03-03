// src/components/common/Alert.jsx
import { cn } from '../../utils/helpers'
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi'

const variants = {
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    icon: 'text-green-500',
    title: 'text-green-800 dark:text-green-400',
    message: 'text-green-700 dark:text-green-300',
    Icon: FiCheckCircle,
  },
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon: 'text-red-500',
    title: 'text-red-800 dark:text-red-400',
    message: 'text-red-700 dark:text-red-300',
    Icon: FiAlertCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    icon: 'text-yellow-500',
    title: 'text-yellow-800 dark:text-yellow-400',
    message: 'text-yellow-700 dark:text-yellow-300',
    Icon: FiAlertTriangle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-800 dark:text-blue-400',
    message: 'text-blue-700 dark:text-blue-300',
    Icon: FiInfo,
  },
}

const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
  showIcon = true,
}) => {
  const styles = variants[variant]
  const IconComponent = styles.Icon

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-xl border',
        styles.container,
        className
      )}
      role="alert"
    >
      {showIcon && (
        <IconComponent className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)} />
      )}
      <div className="flex-1">
        {title && (
          <h4 className={cn('font-semibold mb-1', styles.title)}>{title}</h4>
        )}
        <div className={cn('text-sm', styles.message)}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'p-1 rounded-lg hover:bg-black/5 transition-colors flex-shrink-0',
            styles.icon
          )}
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Alert