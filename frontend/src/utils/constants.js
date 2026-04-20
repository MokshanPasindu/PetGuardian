// src/utils/constants.js
export const PET_TYPES = [
  { value: 'DOG', label: 'Dog', icon: '🐕' },
  { value: 'CAT', label: 'Cat', icon: '🐈' },
  { value: 'BIRD', label: 'Bird', icon: '🐦' },
  { value: 'RABBIT', label: 'Rabbit', icon: '🐰' },
  { value: 'HAMSTER', label: 'Hamster', icon: '🐹' },
  { value: 'FISH', label: 'Fish', icon: '🐠' },
  { value: 'REPTILE', label: 'Reptile', icon: '🦎' },
  { value: 'OTHER', label: 'Other', icon: '🐾' },
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

// ✅ FIXED: Match backend enum exactly
export const POST_CATEGORIES = [
  { value: 'GENERAL', label: '💬 General', icon: '💬' },
  { value: 'HEALTH', label: '🏥 Health', icon: '🏥' },
  { value: 'NUTRITION', label: '🍖 Nutrition', icon: '🍖' },
  { value: 'TRAINING', label: '🎓 Training', icon: '🎓' },
  { value: 'EMERGENCY', label: '🚨 Emergency', icon: '🚨' },
  { value: 'SUCCESS_STORY', label: '🌟 Success Story', icon: '🌟' },
]