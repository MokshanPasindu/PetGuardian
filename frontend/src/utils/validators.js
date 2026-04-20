// src/utils/validators.js
export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required'
    }
    return null
  },

  email: (value) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  },

  minLength: (min) => (value) => {
    if (!value) return null
    if (value.length < min) {
      return `Must be at least ${min} characters`
    }
    return null
  },

  maxLength: (max) => (value) => {
    if (!value) return null
    if (value.length > max) {
      return `Must be no more than ${max} characters`
    }
    return null
  },

  password: (value) => {
    if (!value) return null
    if (value.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(value)) {
      return 'Password must contain at least one number'
    }
    return null
  },

  confirmPassword: (password) => (value) => {
    if (!value) return 'Please confirm your password'
    if (value !== password) {
      return 'Passwords do not match'
    }
    return null
  },

  phone: (value) => {
    if (!value) return null
    const phoneRegex = /^\+?[\d\s-]{10,}$/
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number'
    }
    return null
  },

  date: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date'
    }
    return null
  },

  pastDate: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (date > new Date()) {
      return 'Date cannot be in the future'
    }
    return null
  },

  futureDate: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (date < new Date()) {
      return 'Date cannot be in the past'
    }
    return null
  },

  fileSize: (maxSize) => (file) => {
    if (!file) return null
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`
    }
    return null
  },

  fileType: (allowedTypes) => (file) => {
    if (!file) return null
    if (!allowedTypes.includes(file.type)) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
    return null
  },
}

export const validate = (value, ...validators) => {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return null
}