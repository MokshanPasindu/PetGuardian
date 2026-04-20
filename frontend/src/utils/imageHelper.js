// src/utils/imageHelper.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // If it starts with /uploads, it's already the correct path
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`
  }
  
  // Otherwise, prepend /uploads/
  return `${API_BASE_URL}/uploads/${imagePath}`
}

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images')
  }

  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 5MB')
  }

  return true
}

export const getDefaultPetImage = (petType) => {
  const defaults = {
    DOG: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    CAT: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    BIRD: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
    RABBIT: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop',
    HAMSTER: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=300&fit=crop',
    FISH: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop',
    REPTILE: 'https://images.unsplash.com/photo-1531305275060-00d0c6da2ae0?w=400&h=300&fit=crop',
    OTHER: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop',
  }
  
  return defaults[petType] || defaults.OTHER
}