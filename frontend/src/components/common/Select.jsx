// src/components/common/Select.jsx
import { forwardRef, Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { FiCheck, FiChevronDown, FiAlertCircle } from 'react-icons/fi'
import { cn } from '../../utils/helpers'

const Select = forwardRef(
  (
    {
      label,
      options,
      value,
      onChange,
      error,
      placeholder = 'Select an option',
      required,
      disabled,
      className,
    },
    ref
  ) => {
    const selectedOption = options.find((opt) => opt.value === value)

    return (
      <div className={cn('space-y-1', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <Listbox value={value} onChange={onChange} disabled={disabled}>
          <div className="relative">
            <Listbox.Button
              ref={ref}
              className={cn(
                'input-field text-left flex items-center justify-between',
                error && 'border-danger-500 focus:ring-danger-500',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span className={cn(!selectedOption && 'text-gray-400')}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <FiChevronDown className="w-5 h-5 text-gray-400" />
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-h-60 overflow-auto border border-gray-100 dark:border-gray-700 focus:outline-none">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    className={({ active }) =>
                      cn(
                        'px-4 py-3 cursor-pointer flex items-center justify-between',
                        active && 'bg-primary-50 dark:bg-primary-900/20'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={cn(
                            'flex items-center gap-2',
                            selected && 'font-medium text-primary-600 dark:text-primary-400'
                          )}
                        >
                          {option.icon && <span>{option.icon}</span>}
                          {option.label}
                        </span>
                        {selected && (
                          <FiCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
        {error && (
          <p className="flex items-center gap-1 text-sm text-danger-500">
            <FiAlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select