// src/components/common/Input.jsx
import { forwardRef, useState } from 'react'
import { cn } from '../../utils/helpers'
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'

const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      icon: Icon,
      className,
      containerClassName,
      helperText,
      required,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'

    return (
      <div className={cn('space-y-1', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={cn(
              'input-field',
              Icon && 'pl-10',
              isPassword && 'pr-10',
              error && 'border-danger-500 focus:ring-danger-500',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
        </div>
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

Input.displayName = 'Input'

export default Input