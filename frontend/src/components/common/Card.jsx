// src/components/common/Card.jsx
import { cn } from '../../utils/helpers'

const Card = ({
  children,
  className,
  hover = false,
  padding = 'default',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-soft dark:bg-gray-800 transition-all duration-200',
        paddingClasses[padding],
        hover && 'hover:shadow-medium hover:-translate-y-1 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const CardHeader = ({ children, className, ...props }) => (
  <div
    className={cn('flex items-center justify-between mb-4', className)}
    {...props}
  >
    {children}
  </div>
)

const CardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn('text-xl font-semibold text-gray-900 dark:text-white', className)}
    {...props}
  >
    {children}
  </h3>
)

const CardDescription = ({ children, className, ...props }) => (
  <p
    className={cn('text-gray-600 dark:text-gray-400', className)}
    {...props}
  >
    {children}
  </p>
)

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
)

const CardFooter = ({ children, className, ...props }) => (
  <div
    className={cn('flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700', className)}
    {...props}
  >
    {children}
  </div>
)

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card