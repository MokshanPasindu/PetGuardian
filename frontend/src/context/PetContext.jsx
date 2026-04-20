// src/context/PetContext.jsx
import { createContext, useState, useCallback, useContext } from 'react'
import { petService } from '../services/petService'
import toast from 'react-hot-toast'

export const PetContext = createContext(null)

export const PetProvider = ({ children }) => {
  const [pets, setPets] = useState([])
  const [selectedPet, setSelectedPet] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true)
      const data = await petService.getAllPets()
      setPets(data)
      return data
    } catch (error) {
      toast.error('Failed to fetch pets')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const getPetById = useCallback(async (id) => {
    try {
      setLoading(true)
      const data = await petService.getPetById(id)
      setSelectedPet(data)
      return data
    } catch (error) {
      toast.error('Failed to fetch pet details')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const addPet = async (petData) => {
    try {
      setLoading(true)
      const newPet = await petService.createPet(petData)
      setPets((prev) => [...prev, newPet])
      toast.success('Pet added successfully!')
      return newPet
    } catch (error) {
      toast.error('Failed to add pet')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updatePet = async (id, petData) => {
    try {
      setLoading(true)
      const updatedPet = await petService.updatePet(id, petData)
      setPets((prev) => prev.map((pet) => (pet.id === id ? updatedPet : pet)))
      if (selectedPet?.id === id) {
        setSelectedPet(updatedPet)
      }
      toast.success('Pet updated successfully!')
      return updatedPet
    } catch (error) {
      toast.error('Failed to update pet')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deletePet = async (id) => {
    try {
      setLoading(true)
      await petService.deletePet(id)
      setPets((prev) => prev.filter((pet) => pet.id !== id))
      if (selectedPet?.id === id) {
        setSelectedPet(null)
      }
      toast.success('Pet removed successfully')
    } catch (error) {
      toast.error('Failed to remove pet')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    pets,
    selectedPet,
    loading,
    fetchPets,
    getPetById,
    addPet,
    updatePet,
    deletePet,
    setSelectedPet,
  }

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>
}

export const usePets = () => {
  const context = useContext(PetContext)
  if (!context) {
    throw new Error('usePets must be used within a PetProvider')
  }
  return context
}