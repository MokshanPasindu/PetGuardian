// src/pages/qr/PublicPetProfile.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiAlertTriangle,
  FiCheckCircle,
  FiHeart,
  FiInfo,
} from 'react-icons/fi'
import { petService } from '../../services/petService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const PublicPetProfile = () => {
  const { qrCode } = useParams()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reported, setReported] = useState(false)
  const [reporting, setReporting] = useState(false)

  // ─── Fetch public pet profile ──────────────────────────────────────────────
  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true)
        setError(null)
        // Calls GET /qr/pet/{qrCode} → returns PublicPetProfileDTO
        const data = await petService.getPetByQRCode(qrCode)
        setPet(data)
      } catch (err) {
        console.error('Failed to fetch pet:', err)
        setError(err.message || 'Pet not found')
      } finally {
        setLoading(false)
      }
    }

    if (qrCode) fetchPet()
  }, [qrCode])

  // ─── Report found pet ──────────────────────────────────────────────────────
  const handleReportFound = async () => {
    setReporting(true)
    try {
      // Simulate notification (extend with real API later)
      await new Promise((res) => setTimeout(res, 1000))
      setReported(true)
      toast.success(`Owner notified! They will contact you soon.`)
    } catch {
      toast.error('Failed to notify owner. Please call directly.')
    } finally {
      setReporting(false)
    }
  }

  // ─── Pet type emoji ────────────────────────────────────────────────────────
  const getPetEmoji = (type) => {
    const map = { dog: '🐕', cat: '🐈', bird: '🦜', rabbit: '🐇' }
    return map[type?.toLowerCase()] || '🐾'
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingPage message="Loading pet information..." />
  }

  // ─── Error / Not Found ─────────────────────────────────────────────────────
  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Pet Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This QR code is not linked to any registered pet. It may have
              been regenerated or the pet profile was removed.
            </p>
            <Link to="/">
              <Button variant="primary">Go to PetGuardian</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-50 dark:from-gray-900 dark:to-gray-900 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* ── Brand Header ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl">🐾</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              PetGuardian
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pet Identification Profile
          </p>
        </motion.div>

        {/* ── Pet Identity Card ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <div className="text-center">
              {/* Pet Photo */}
              <div className="relative inline-block mb-4">
                {pet.image ? (
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 shadow-lg mx-auto"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-primary-500 shadow-lg mx-auto">
                    <span className="text-5xl">{getPetEmoji(pet.type)}</span>
                  </div>
                )}
              </div>

              {/* Pet Name */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {pet.name}
              </h1>
              {pet.breed && (
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {pet.breed}
                </p>
              )}

              {/* Info badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
                {pet.age && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                    {pet.age} old
                  </span>
                )}
                {pet.gender && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium capitalize">
                    {pet.gender}
                  </span>
                )}
                {pet.color && (
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-medium">
                    {pet.color}
                  </span>
                )}
                {pet.type && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium capitalize">
                    {getPetEmoji(pet.type)} {pet.type}
                  </span>
                )}
              </div>

              {/* Microchip */}
              {pet.microchipId && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                    Microchip ID
                  </p>
                  <p className="font-mono font-semibold text-gray-900 dark:text-white text-sm">
                    {pet.microchipId}
                  </p>
                </div>
              )}
            </div>

            {/* Medical Notes */}
            {pet.medicalNotes && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <div className="flex items-start gap-2">
                  <FiAlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      Medical Notes
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {pet.medicalNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* ── Owner Contact ─────────────────────────────────────────────────── */}
        {pet.owner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                Owner Contact
              </h2>

              <div className="space-y-3">

                {/* Owner name */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <FiHeart className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Owner</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {pet.owner.name}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {pet.owner.phone && (
                  <a
                    href={`tel:${pet.owner.phone}`}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <FiPhone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-semibold text-green-700 dark:text-green-400 group-hover:underline">
                        {pet.owner.phone}
                      </p>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Call
                    </span>
                  </a>
                )}

                {/* Email */}
                {pet.owner.email && (
                  <a
                    href={`mailto:${pet.owner.email}`}
                    className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <FiMail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-semibold text-blue-700 dark:text-blue-400 group-hover:underline truncate">
                        {pet.owner.email}
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Email
                    </span>
                  </a>
                )}

                {/* Area */}
                {pet.owner.area && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FiMapPin className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">General Area</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {pet.owner.area}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Found Pet Action ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!reported ? (
            <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0">
              <div className="text-center text-white">
                <div className="text-4xl mb-3">🏠</div>
                <h3 className="text-xl font-bold mb-2">
                  Found {pet.name}?
                </h3>
                <p className="text-white/80 text-sm mb-5">
                  Click below to send an instant alert to the owner. They'll
                  be notified right away!
                </p>
                <Button
                  onClick={handleReportFound}
                  loading={reporting}
                  className="bg-white text-green-600 hover:bg-green-50 font-semibold w-full"
                >
                  🐾 I Found {pet.name}!
                </Button>
              </div>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <FiCheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                    Owner Notified! ✅
                  </h3>
                  <p className="text-green-700 dark:text-green-400 text-sm mb-4">
                    The owner has been alerted that you found{' '}
                    <strong>{pet.name}</strong>. They will contact you soon.
                    Thank you for helping! 💚
                  </p>
                  {pet.owner?.phone && (
                    <a href={`tel:${pet.owner.phone}`}>
                      <Button variant="primary" icon={FiPhone} size="sm">
                        Call Owner Now
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* ── Privacy Note ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-2">
            <FiInfo className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              🔒 <strong>Privacy:</strong> Only emergency contact information is
              shown here. Full medical history, vaccination records, and AI scan
              results are private and require login to access.
            </p>
          </div>
        </motion.div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          <p className="font-medium">Powered by PetGuardian</p>
          <p>AI-Powered Pet Health & Safety System</p>
        </div>
      </div>
    </div>
  )
}

export default PublicPetProfile