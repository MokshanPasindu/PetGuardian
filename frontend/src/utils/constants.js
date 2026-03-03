// src/utils/constants.js
export const PET_TYPES = [
  { value: 'dog', label: 'Dog', icon: '🐕' },
  { value: 'cat', label: 'Cat', icon: '🐈' },
  { value: 'bird', label: 'Bird', icon: '🐦' },
  { value: 'rabbit', label: 'Rabbit', icon: '🐰' },
  { value: 'hamster', label: 'Hamster', icon: '🐹' },
  { value: 'fish', label: 'Fish', icon: '🐠' },
  { value: 'reptile', label: 'Reptile', icon: '🦎' },
  { value: 'other', label: 'Other', icon: '🐾' },
]

export const SEVERITY_LEVELS = {
  MILD: {
    label: 'Mild',
    color: 'success',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-500',
    description: 'Monitor at home with basic care',
  },
  MODERATE: {
    label: 'Moderate',
    color: 'warning',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-500',
    description: 'Consider scheduling a vet appointment',
  },
  SEVERE: {
    label: 'Severe',
    color: 'danger',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-500',
    description: 'Immediate veterinary attention recommended',
  },
}

export const USER_ROLES = {
  OWNER: 'OWNER',
  VET: 'VET',
  ADMIN: 'ADMIN',
}

export const VACCINATION_STATUS = {
  COMPLETED: { label: 'Completed', color: 'success' },
  UPCOMING: { label: 'Upcoming', color: 'info' },
  OVERDUE: { label: 'Overdue', color: 'danger' },
}

export const APPOINTMENT_STATUS = {
  PENDING: { label: 'Pending', color: 'warning' },
  CONFIRMED: { label: 'Confirmed', color: 'success' },
  CANCELLED: { label: 'Cancelled', color: 'danger' },
  COMPLETED: { label: 'Completed', color: 'info' },
}

export const POST_CATEGORIES = [
  { value: 'general', label: 'General Discussion' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'nutrition', label: 'Nutrition & Diet' },
  { value: 'training', label: 'Training & Behavior' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'success-story', label: 'Success Stories' },
]