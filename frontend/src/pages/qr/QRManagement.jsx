// src/pages/qr/QRManagement.jsx
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import {
  FiDownload,
  FiPrinter,
  FiShare2,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiCopy,
  FiExternalLink,
  FiInfo,
} from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import { petService } from '../../services/petService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const QRManagement = () => {
  const { pets, fetchPets, loading } = usePets()
  const [selectedPetId, setSelectedPetId] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)

  // ─── Fetch pets on mount ───────────────────────────────────────────────────
  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  // ─── Auto-select first pet ─────────────────────────────────────────────────
  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(String(pets[0].id))
    }
  }, [pets, selectedPetId])

  // ─── Derived values ────────────────────────────────────────────────────────
  const selectedPet = pets.find((p) => String(p.id) === String(selectedPetId))

  // The QR code encodes this public URL
  const publicProfileUrl = selectedPet
    ? `${window.location.origin}/pet/${selectedPet.qrCode}`
    : ''

  const petOptions = pets.map((pet) => ({
    value: String(pet.id),
    label: `${pet.type === 'DOG' ? '🐕' : pet.type === 'CAT' ? '🐈' : '🐾'} ${pet.name}`,
  }))

  // ─── Download QR as PNG ────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!selectedPet) return

    // Find the hidden canvas rendered by QRCodeCanvas
    const canvas = document.getElementById('qr-canvas-hidden')
    if (!canvas) {
      toast.error('QR code not ready, please try again')
      return
    }

    try {
      const link = document.createElement('a')
      link.download = `${selectedPet.name}-qr-code.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success(`QR code downloaded for ${selectedPet.name}!`)
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download QR code')
    }
  }

  // ─── Print ─────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!selectedPet) return

    const canvas = document.getElementById('qr-canvas-hidden')
    if (!canvas) {
      toast.error('QR code not ready')
      return
    }

    const imgData = canvas.toDataURL('image/png')
    const printWindow = window.open('', '_blank')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedPet.name} - Pet ID Card</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #f9fafb;
              padding: 20px;
            }
            .card {
              background: white;
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.1);
              max-width: 380px;
              width: 100%;
              text-align: center;
            }
            .brand {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              margin-bottom: 20px;
              color: #22c55e;
              font-weight: 700;
              font-size: 18px;
            }
            .qr-img {
              width: 220px;
              height: 220px;
              border: 4px solid #f3f4f6;
              border-radius: 12px;
              padding: 8px;
              background: white;
            }
            .pet-name {
              font-size: 24px;
              font-weight: 700;
              color: #111827;
              margin: 16px 0 4px;
            }
            .pet-info {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 20px;
            }
            .instruction {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              padding: 12px;
              color: #166534;
              font-size: 13px;
            }
            .footer {
              margin-top: 20px;
              color: #9ca3af;
              font-size: 12px;
            }
            @media print {
              body { background: white; }
              .card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">🐾 PetGuardian</div>
            <img src="${imgData}" class="qr-img" alt="QR Code" />
            <p class="pet-name">${selectedPet.name}</p>
            <p class="pet-info">
              ${selectedPet.breed || selectedPet.type} • 
              ${selectedPet.gender || ''} • 
              ${selectedPet.color || ''}
            </p>
            <div class="instruction">
              📱 Scan this QR code to view<br/>
              ${selectedPet.name}'s emergency information
            </div>
            <p class="footer">petguardian.com</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // ─── Copy public URL ───────────────────────────────────────────────────────
  const handleCopyLink = async () => {
    if (!publicProfileUrl) return
    try {
      await navigator.clipboard.writeText(publicProfileUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // ─── Share (Web Share API) ─────────────────────────────────────────────────
  const handleShare = async () => {
    if (!selectedPet) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${selectedPet.name}'s Pet Profile`,
          text: `View ${selectedPet.name}'s pet information on PetGuardian`,
          url: publicProfileUrl,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink()
        }
      }
    } else {
      // Fallback: copy link
      handleCopyLink()
    }
  }

  // ─── Regenerate QR Code ────────────────────────────────────────────────────
  const handleRegenerate = async () => {
    if (!selectedPet) return
    setRegenerating(true)
    try {
      const newQrCode = await petService.regenerateQRCode(selectedPet.id)
      toast.success('QR code regenerated! Old QR codes are now invalid.')
      // Refresh pets to get updated qrCode
      await fetchPets()
      setShowRegenerateConfirm(false)
    } catch (error) {
      toast.error(error.message || 'Failed to regenerate QR code')
    } finally {
      setRegenerating(false)
    }
  }

  // ─── Open public profile ───────────────────────────────────────────────────
  const handleViewPublic = () => {
    if (publicProfileUrl) {
      window.open(publicProfileUrl, '_blank')
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return <LoadingPage message="Loading QR management..." />
  }

  // ─── No pets ───────────────────────────────────────────────────────────────
  if (pets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <EmptyState
            icon={FiAlertTriangle}
            title="No Pets Found"
            description="Add a pet first to generate their QR ID card"
            action={() => (window.location.href = '/pets/add')}
            actionLabel="Add Your First Pet"
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
          QR Pet ID Cards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and download QR codes for your pets. Anyone who scans it
          will see emergency contact info — no login required.
        </p>
      </motion.div>

      {/* ── Pet Selector ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card>
          <Select
            label="Select Pet"
            options={petOptions}
            value={selectedPetId}
            onChange={(val) => setSelectedPetId(String(val))}
            placeholder="Choose a pet"
          />
        </Card>
      </motion.div>

      {selectedPet && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── QR Code Card ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  QR Code
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {selectedPet.qrCode?.slice(0, 12)}...
                </span>
              </div>

              {/* QR Display (SVG - visible) */}
              <div className="flex justify-center">
                <div className="p-5 bg-white rounded-2xl shadow-inner border border-gray-100">
                  <QRCodeSVG
                    value={publicProfileUrl}
                    size={220}
                    level="H"
                    includeMargin={false}
                    fgColor="#111827"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              {/* Hidden Canvas (for download/print) */}
              <div className="hidden">
                <QRCodeCanvas
                  id="qr-canvas-hidden"
                  value={publicProfileUrl}
                  size={400}
                  level="H"
                  includeMargin={true}
                  fgColor="#111827"
                  bgColor="#ffffff"
                />
              </div>

              {/* Pet name under QR */}
              <div className="text-center mt-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  {selectedPet.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedPet.breed || selectedPet.type}
                </p>
              </div>

              {/* Public URL */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Public Profile URL
                </p>
                <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {publicProfileUrl}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-5">
                <Button
                  variant="primary"
                  icon={FiDownload}
                  onClick={handleDownload}
                  className="w-full"
                >
                  Download PNG
                </Button>
                <Button
                  variant="secondary"
                  icon={FiPrinter}
                  onClick={handlePrint}
                  className="w-full"
                >
                  Print Card
                </Button>
                <Button
                  variant="secondary"
                  icon={copied ? FiCheckCircle : FiCopy}
                  onClick={handleCopyLink}
                  className="w-full"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  variant="secondary"
                  icon={FiShare2}
                  onClick={handleShare}
                  className="w-full"
                >
                  Share
                </Button>
              </div>

              {/* View public profile */}
              <Button
                variant="ghost"
                icon={FiExternalLink}
                onClick={handleViewPublic}
                className="w-full mt-2"
              >
                Preview Public Profile
              </Button>

              {/* Regenerate QR */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2 mb-3">
                  <FiInfo className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Regenerating creates a new QR code. Old printed/saved QR
                    codes will stop working.
                  </p>
                </div>
                <Button
                  variant="danger"
                  icon={FiRefreshCw}
                  onClick={() => setShowRegenerateConfirm(true)}
                  loading={regenerating}
                  className="w-full"
                  size="sm"
                >
                  Regenerate QR Code
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* ── ID Card Preview ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="h-full">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
                Digital ID Card Preview
              </h2>

              {/* ID Card */}
              <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg">
                {/* Brand header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐾</span>
                    <span className="font-bold text-lg">PetGuardian</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
                    PET ID
                  </span>
                </div>

                {/* Pet details row */}
                <div className="flex gap-4 mb-5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20 flex-shrink-0 border-2 border-white/40">
                    {selectedPet.image ? (
                      <img
                        src={selectedPet.image}
                        alt={selectedPet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {selectedPet.type === 'DOG' ? '🐕' : selectedPet.type === 'CAT' ? '🐈' : '🐾'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold truncate">{selectedPet.name}</h3>
                    <p className="text-white/80 text-sm mb-2 truncate">
                      {selectedPet.breed || 'Mixed Breed'}
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <div>
                        <span className="text-white/60">Type:</span>
                        <span className="ml-1 capitalize">
                          {selectedPet.type?.toLowerCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Gender:</span>
                        <span className="ml-1 capitalize">
                          {selectedPet.gender || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Color:</span>
                        <span className="ml-1">
                          {selectedPet.color || '—'}
                        </span>
                      </div>
                      {selectedPet.weight && (
                        <div>
                          <span className="text-white/60">Weight:</span>
                          <span className="ml-1">{selectedPet.weight} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Microchip */}
                {selectedPet.microchipId && (
                  <div className="bg-white/10 rounded-lg px-3 py-2 mb-4">
                    <span className="text-white/60 text-xs">Microchip: </span>
                    <span className="text-xs font-mono font-medium">
                      {selectedPet.microchipId}
                    </span>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-white/20 pt-4">
                  <p className="text-xs text-white/60 text-center">
                    Scan QR code for emergency contact info
                  </p>
                </div>
              </div>

              {/* What's included section */}
              <div className="mt-5">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">
                  ✅ What the QR code reveals when scanned:
                </h4>
                <ul className="space-y-2">
                  {[
                    'Pet name, photo, breed & basic info',
                    "Owner's name & emergency contact",
                    'Special medical notes or allergies',
                    'Microchip ID (if registered)',
                    'Option to report found pet',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    🔒 <strong>Privacy protected:</strong> Medical history,
                    vaccination records, and AI scan results are never exposed
                    through the QR code.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ── All Pets QR Overview ──────────────────────────────────────────── */}
          {pets.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                  All Your Pets
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pets.map((pet) => {
                    const petUrl = `${window.location.origin}/pet/${pet.qrCode}`
                    const isSelected = String(pet.id) === String(selectedPetId)
                    return (
                      <button
                        key={pet.id}
                        onClick={() => setSelectedPetId(String(pet.id))}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            {pet.image ? (
                              <img
                                src={pet.image}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                {pet.type === 'DOG' ? '🐕' : pet.type === 'CAT' ? '🐈' : '🐾'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {pet.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {pet.breed || pet.type}
                            </p>
                          </div>
                        </div>

                        {/* Mini QR */}
                        <div className="flex justify-center p-2 bg-white rounded-lg">
                          <QRCodeSVG
                            value={petUrl}
                            size={80}
                            level="M"
                            fgColor="#111827"
                            bgColor="#ffffff"
                          />
                        </div>

                        {isSelected && (
                          <p className="text-xs text-primary-600 dark:text-primary-400 text-center mt-2 font-medium">
                            ✓ Selected
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* ── Regenerate Confirm Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showRegenerateConfirm}
        onClose={() => setShowRegenerateConfirm(false)}
        onConfirm={handleRegenerate}
        title="Regenerate QR Code?"
        message={`This will create a new QR code for ${selectedPet?.name}. Any previously printed or shared QR codes will stop working. Are you sure?`}
        confirmText="Yes, Regenerate"
        variant="danger"
        loading={regenerating}
      />
    </div>
  )
}

export default QRManagement