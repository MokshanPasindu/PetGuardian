// src/components/common/LoadingSpinner.jsx (continued)
import { cn } from '../../utils/helpers'

const LoadingSpinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200 border-t-primary-500',
        sizes[size],
        className
      )}
    />
  )
}

export const LoadingPage = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
    <LoadingSpinner size="xl" />
    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">{message}</p>
  </div>
)

export const LoadingOverlay = ({ message = 'Processing...' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl flex flex-col items-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium">{message}</p>
    </div>
  </div>
)

export default LoadingSpinner