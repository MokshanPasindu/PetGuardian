// src/context/HealthContext.jsx
import { createContext, useState, useCallback, useContext } from 'react'
import { healthService } from '../services/healthService'
import toast from 'react-hot-toast'

export const HealthContext = createContext(null)

export const HealthProvider = ({ children }) => {
  const [medicalRecords, setMedicalRecords] = useState([])
  const [vaccinations, setVaccinations] = useState([])
  const [healthSummary, setHealthSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [vaccinationsLoading, setVaccinationsLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // ==================== HEALTH SUMMARY ====================

  const fetchHealthSummary = useCallback(async (petId) => {
    try {
      setSummaryLoading(true)
      const data = await healthService.getHealthSummary(petId)
      setHealthSummary(data)
      return data
    } catch (error) {
      console.error('Fetch health summary error:', error)
      // Don't toast - summary might not exist yet
      return null
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  // ==================== MEDICAL RECORDS ====================

  const fetchMedicalRecords = useCallback(async (petId, type = null) => {
    try {
      setRecordsLoading(true)
      const data = type
        ? await healthService.getMedicalRecordsByType(petId, type)
        : await healthService.getMedicalRecords(petId)
      setMedicalRecords(data)
      return data
    } catch (error) {
      console.error('Fetch medical records error:', error)
      toast.error('Failed to fetch medical records')
      return []
    } finally {
      setRecordsLoading(false)
    }
  }, [])

  const createMedicalRecord = async (petId, recordData) => {
    try {
      setLoading(true)
      const newRecord = await healthService.createMedicalRecord(
        petId,
        recordData
      )
      setMedicalRecords((prev) => [newRecord, ...prev])
      toast.success('Medical record added successfully!')
      return newRecord
    } catch (error) {
      toast.error('Failed to add medical record')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateMedicalRecord = async (petId, recordId, recordData) => {
    try {
      setLoading(true)
      const updatedRecord = await healthService.updateMedicalRecord(
        petId,
        recordId,
        recordData
      )
      setMedicalRecords((prev) =>
        prev.map((r) => (r.id === recordId ? updatedRecord : r))
      )
      toast.success('Medical record updated successfully!')
      return updatedRecord
    } catch (error) {
      toast.error('Failed to update medical record')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteMedicalRecord = async (petId, recordId) => {
    try {
      setLoading(true)
      await healthService.deleteMedicalRecord(petId, recordId)
      setMedicalRecords((prev) => prev.filter((r) => r.id !== recordId))
      toast.success('Medical record deleted')
    } catch (error) {
      toast.error('Failed to delete medical record')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ==================== VACCINATIONS ====================

  const fetchVaccinations = useCallback(async (petId) => {
    try {
      setVaccinationsLoading(true)
      const data = await healthService.getVaccinations(petId)
      setVaccinations(data)
      return data
    } catch (error) {
      console.error('Fetch vaccinations error:', error)
      toast.error('Failed to fetch vaccinations')
      return []
    } finally {
      setVaccinationsLoading(false)
    }
  }, [])

  const createVaccination = async (petId, vaccinationData) => {
    try {
      setLoading(true)
      const newVaccination = await healthService.createVaccination(
        petId,
        vaccinationData
      )
      setVaccinations((prev) => [...prev, newVaccination])
      toast.success('Vaccination record added successfully!')
      return newVaccination
    } catch (error) {
      toast.error('Failed to add vaccination record')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateVaccination = async (petId, vaccinationId, vaccinationData) => {
    try {
      setLoading(true)
      const updatedVaccination = await healthService.updateVaccination(
        petId,
        vaccinationId,
        vaccinationData
      )
      setVaccinations((prev) =>
        prev.map((v) => (v.id === vaccinationId ? updatedVaccination : v))
      )
      toast.success('Vaccination record updated successfully!')
      return updatedVaccination
    } catch (error) {
      toast.error('Failed to update vaccination record')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteVaccination = async (petId, vaccinationId) => {
    try {
      setLoading(true)
      await healthService.deleteVaccination(petId, vaccinationId)
      setVaccinations((prev) => prev.filter((v) => v.id !== vaccinationId))
      toast.success('Vaccination record deleted')
    } catch (error) {
      toast.error('Failed to delete vaccination record')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // ==================== CLEAR STATE ====================

  const clearHealthData = useCallback(() => {
    setMedicalRecords([])
    setVaccinations([])
    setHealthSummary(null)
  }, [])

  const value = {
    // State
    medicalRecords,
    vaccinations,
    healthSummary,
    loading,
    recordsLoading,
    vaccinationsLoading,
    summaryLoading,

    // Health Summary
    fetchHealthSummary,

    // Medical Records
    fetchMedicalRecords,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,

    // Vaccinations
    fetchVaccinations,
    createVaccination,
    updateVaccination,
    deleteVaccination,

    // Utils
    clearHealthData,
  }

  return (
    <HealthContext.Provider value={value}>{children}</HealthContext.Provider>
  )
}

export const useHealth = () => {
  const context = useContext(HealthContext)
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider')
  }
  return context
}