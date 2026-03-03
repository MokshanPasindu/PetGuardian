// src/pages/qr/QRManagement.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { FiDownload, FiPrinter, FiShare2, FiRefreshCw } from 'react-icons/fi'
import { usePets } from '../../hooks/usePets'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Badge from '../../components/common/Badge'
import { LoadingPage } from '../../components/common/LoadingSpinner'

const QRManagement = () => {
  const { pets, fetchPets, loading } = usePets()
  const [selectedPetId, setSelectedPetId] = useState('')
  const [qrSize, setQrSize] = useState(200)

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id)
    }
  }, [pets, selectedPetId])

  const selectedPet = pets.find((p) => p.id === selectedPetId)
  const qrValue = selectedPet 
    ? `${window.location.origin}/pet/${selectedPet.qrCode || selectedPet.id}`
    : ''

  const petOptions = pets.map((pet) => ({
    value: pet.id,
    label: pet.name,
    icon: pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐾',
  }))

  const handleDownload = () => {
    const svg = document.getElementById('pet-qr-code')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = qrSize
      canvas.height = qrSize
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.download = `${selectedPet?.name || 'pet'}-qr-code.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const svg = document.getElementById('pet-qr-code')
    printWindow.document.write(`
      <html>
        <head>
          <title>Pet QR Code - ${selectedPet?.name}</title>
          <style>
            body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; }
            h2 { margin-bottom: 20px; }
            .info { margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <h2>${selectedPet?.name}'s Pet ID</h2>
          ${svg.outerHTML}
          <div class="info">
            <p>Scan this QR code to view pet information</p>
            <p style="color: #666; font-size: 14px;">PetGuardian</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) {
    return <LoadingPage message="Loading QR management..." />
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">
          QR Pet ID Cards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate and manage QR codes for your pets. These can be scanned to show emergency contact info.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Code Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <Card.Header>
              <Card.Title>QR Code Preview</Card.Title>
            </Card.Header>

            <div className="space-y-6">
              <Select
                label="Select Pet"
                options={petOptions}
                value={selectedPetId}
                onChange={setSelectedPetId}
                placeholder="Choose a pet"
              />

              {selectedPet && (
                <div className="flex flex-col items-center">
                  <div className="p-6 bg-white rounded-2xl shadow-inner">
                    <QRCodeSVG
                      id="pet-qr-code"
                      value={qrValue}
                      size={qrSize}
                      level="H"
                      includeMargin
                      imageSettings={{
                        src: '/logo.png',
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedPet.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedPet.breed} • {selectedPet.type}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="primary"
                      icon={FiDownload}
                      onClick={handleDownload}
                    >
                      Download
                    </Button>
                    <Button
                      variant="secondary"
                      icon={FiPrinter}
                      onClick={handlePrint}
                    >
                      Print
                    </Button>
                    <Button variant="secondary" icon={FiShare2}>
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Pet ID Card Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <Card.Header>
              <Card.Title>ID Card Preview</Card.Title>
            </Card.Header>

            {selectedPet && (
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐾</span>
                    <span className="font-display font-bold">PetGuardian</span>
                  </div>
                  <Badge className="bg-white/20 text-white">Pet ID</Badge>
                </div>

                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/20">
                    <img
                      src={selectedPet.image || `https://ui-avatars.com/api/?name=${selectedPet.name}&size=96&background=fff&color=22c55e`}
                      alt={selectedPet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">{selectedPet.name}</h3>
                    <p className="text-white/80 mb-3">{selectedPet.breed}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-white/60">Type:</span>
                        <span className="ml-1 capitalize">{selectedPet.type}</span>
                      </div>
                      <div>
                        <span className="text-white/60">Gender:</span>
                        <span className="ml-1 capitalize">{selectedPet.gender}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/20">
                  <p className="text-sm text-white/80 text-center">
                    Scan QR code or visit petguardian.com/pet/{selectedPet.id}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                What's included when scanned:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  Pet name, photo, and basic info
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  Owner's emergency contact information
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  Special medical conditions or allergies
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  Link to notify owner if pet is found
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default QRManagement