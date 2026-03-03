// src/components/common/Avatar.jsx
import { cn, getInitials, generateRandomColor } from '../../utils/helpers'

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-2xl',
}

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  className,
  status,
  ...props
}) => {
  const initials = name ? getInitials(name) : '?'

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className={cn(
            'rounded-full object-cover bg-gray-200',
            sizes[size],
            className
          )}
          {...props}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-primary-400 to-primary-600',
            sizes[size],
            className
          )}
          {...props}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
            size === 'xs' && 'w-1.5 h-1.5',
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-2.5 h-2.5',
            size === 'lg' && 'w-3 h-3',
            size === 'xl' && 'w-4 h-4',
            size === '2xl' && 'w-5 h-5',
            status === 'online' && 'bg-green-500',
            status === 'offline' && 'bg-gray-400',
            status === 'busy' && 'bg-red-500',
            status === 'away' && 'bg-yellow-500'
          )}
        />
      )}
    </div>
  )
}

export default Avatar