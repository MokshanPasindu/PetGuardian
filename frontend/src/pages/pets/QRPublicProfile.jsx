// src/pages/pets/QRPublicProfile.jsx
import { useParams } from 'react-router-dom'
import Card from '../../components/common/Card'
import { FiPhone, FiMail, FiAlertTriangle } from 'react-icons/fi'

export default function QRPublicProfile() {
  const { qrId } = useParams()

  // Mock public profile data
  const publicProfile = {
    petName: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    color: 'Golden',
    ownerName: 'John Owner',
    phone: '+1 (555) 123-4567',
    email: 'john@example.com',
    emergencyNote: 'Friendly dog. No known allergies.',
    microchipId: 'MC-001-2020',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50
                    dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center
                          text-4xl mx-auto mb-4 shadow-lg">
            🐕
          </div>
          <h1 className="text-2xl font-bold mb-1">{publicProfile.petName}</h1>
          <p className="text-gray-500 mb-6">{publicProfile.breed} • {publicProfile.species}</p>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium mb-1">
              <FiAlertTriangle className="w-4 h-4" />
              If you found this pet:
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              {publicProfile.emergencyNote}
            </p>
          </div>

          <div className="space-y-3 text-left">
            <h3 className="font-semibold text-sm text-gray-500 uppercase">Contact Owner</h3>
            <a href={`tel:${publicProfile.phone}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20
                         text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
              <FiPhone className="w-5 h-5" />
              <span className="font-medium">{publicProfile.phone}</span>
            </a>
            <a href={`mailto:${publicProfile.email}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20
                         text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-colors">
              <FiMail className="w-5 h-5" />
              <span className="font-medium">{publicProfile.email}</span>
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-400">
              Powered by PetGuardian 🐾 • ID: {qrId}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}