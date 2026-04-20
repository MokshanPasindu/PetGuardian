// src/components/common/Textarea.jsx
import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'
import { FiAlertCircle } from 'react-icons/fi'

const Textarea = forwardRef(
  (
    {
      label,
      error,
      className,
      containerClassName,
      helperText,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-1', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'input-field resize-none',
            error && 'border-danger-500 focus:ring-danger-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="flex items-center gap-1 text-sm text-danger-500">
            <FiAlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea