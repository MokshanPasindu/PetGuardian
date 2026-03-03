// src/hooks/usePets.js
import { useContext } from 'react'
import { PetContext } from '../context/PetContext'

export const usePets = () => {
  const context = useContext(PetContext)
  if (!context) {
    throw new Error('usePets must be used within a PetProvider')
  }
  return context
}