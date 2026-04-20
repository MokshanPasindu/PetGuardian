// src/pages/qr/PublicPetProfile.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiPhone, FiMail, FiMapPin, FiAlertTriangle, FiCheck } from 'react-icons/fi'
import { petService } from '../../services/petService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Alert from '../../components/common/Alert'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { calculateAge } from '../../utils/helpers'

const PublicPetProfile = () => {
  const { qrCode } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reported, setReported] = useState(false)

  useEffect(() => {
    const fetchPet = async () => {
      try {
        // Mock data for demo
        setPet({
          id: qrCode,
          name: 'Max',
          type: 'dog',
          breed: 'Golden Retriever',
          gender: 'male',
          birthDate: '2020-05-15',
          color: 'Golden',
          image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
          microchipId: 'ABC123456789',
          medicalNotes: 'Allergic to chicken',
          owner: {
            name: 'John Smith',
            phone: '+1 (555) 123-4567',
            email: 'john@example.com',
            address: 'Downtown Area',
          },
        })
      } catch (error) {
        console.error('Failed to fetch pet:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [qrCode])

  const handleReportFound = () => {
    setReported(true)
    // In real implementation, this would send a notification to the owner
  }

  if (loading) {
    return <LoadingPage message="Loading pet information..." />
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <FiAlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Pet Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This QR code is not associated with any pet profile.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">🐾</span>
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">
              PetGuardian
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Pet Identification Profile
          </p>
        </motion.div>

        {/* Pet Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="text-center">
              <img
                src={pet.image}
                alt={pet.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary-500 shadow-lg"
              />
              <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-4">
                {pet.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {pet.breed} • {pet.type}
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge variant="info">{calculateAge(pet.birthDate)} old</Badge>
                <Badge variant="success" className="capitalize">{pet.gender}</Badge>
                <Badge variant="primary">{pet.color}</Badge>
              </div>
            </div>

            {pet.microchipId && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">Microchip ID</p>
                <p className="font-mono font-medium text-gray-900 dark:text-white">
                  {pet.microchipId}
                </p>
              </div>
            )}

            {pet.medicalNotes && (
              <Alert variant="warning" className="mt-4" title="Medical Information">
                {pet.medicalNotes}
              </Alert>
            )}
          </Card>
        </motion.div>

        {/* Owner Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <Card.Header>
              <Card.Title>Owner Contact</Card.Title>
            </Card.Header>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiPhone className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <a
                    href={`tel:${pet.owner.phone}`}
                    className="font-medium text-primary-600 dark:text-primary-400"
                  >
                    {pet.owner.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <a
                    href={`mailto:${pet.owner.email}`}
                    className="font-medium text-primary-600 dark:text-primary-400"
                  >
                    {pet.owner.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiMapPin className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Area</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {pet.owner.address}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Found Pet Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {!reported ? (
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Found this pet?</h3>
                <p className="text-white/80 mb-4">
                  Click below to notify the owner immediately
                </p>
                <Button
                  className="bg-white text-green-600 hover:bg-green-50"
                  onClick={handleReportFound}
                >
                  I Found This Pet
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="text-center text-green-700 dark:text-green-400">
                <FiCheck className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-xl font-semibold mb-2">Owner Notified!</h3>
                <p>
                  The owner has been notified that you found {pet.name}. 
                  They will contact you soon.
                </p>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by PetGuardian</p>
          <p>AI-Powered Pet Health & Safety System</p>
        </div>
      </div>
    </div>
  )
}

export default PublicPetProfile