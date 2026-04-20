// src/pages/vet-connect/VetProfile.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { vetService } from '../../services/vetService'
import Button from '../../components/common/Button'
import VetDetails from '../../components/vet/VetDetails'
import { LoadingPage } from '../../components/common/LoadingSpinner'

const VetProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vet, setVet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVet = async () => {
      try {
        // Mock data
        setVet({
          id,
          name: 'City Animal Hospital',
          specialization: 'General Practice, Surgery, Dermatology',
          address: '123 Main Street, Downtown',
          phone: '+1 (555) 123-4567',
          email: 'info@cityanimal.com',
          hours: '8:00 AM - 8:00 PM',
          rating: 4.8,
          reviewCount: 234,
          isOpen: true,
          emergency: true,
          image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=400&fit=crop',
          services: [
            'General Checkups',
            'Vaccinations',
            'Surgery',
            'Dental Care',
            'Emergency Care',
            'Dermatology',
            'X-Ray & Diagnostics',
          ],
          lat: 40.7128,
          lng: -74.0060,
        })
      } catch (error) {
        console.error('Failed to fetch vet:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVet()
  }, [id])

  const handleGetDirections = () => {
    if (vet) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${vet.lat},${vet.lng}`,
        '_blank'
      )
    }
  }

  const handleBookAppointment = () => {
    navigate(`/appointments?vetId=${id}`)
  }

  if (loading) {
    return <LoadingPage message="Loading clinic details..." />
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" icon={FiArrowLeft} onClick={() => navigate(-1)}>
        Back to Search
      </Button>

      <VetDetails
        vet={vet}
        onBookAppointment={handleBookAppointment}
        onGetDirections={handleGetDirections}
      />
    </div>
  )
}

export default VetProfile