// src/components/common/Button.jsx
import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'
import LoadingSpinner from './LoadingSpinner'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  outline: 'inline-flex items-center justify-center px-6 py-3 border-2 border-primary-500 text-primary-600 font-medium rounded-xl hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 active:scale-[0.98] dark:text-primary-400 dark:hover:bg-primary-900/20',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
}

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon: Icon,
      iconPosition = 'left',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          variants[variant],
          sizes[size],
          'relative',
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </span>
        )}
        <span className={cn('flex items-center gap-2', loading && 'invisible')}>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button