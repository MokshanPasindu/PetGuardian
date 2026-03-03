// src/components/qr/QRGenerator.jsx
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { FiDownload, FiPrinter, FiRefreshCw } from 'react-icons/fi'
import Card from '../common/Card'
import Button from '../common/Button'
import Select from '../common/Select'

const QRGenerator = ({ pets, selectedPetId, onPetChange }) => {
  const [qrSize, setQrSize] = useState(200)

  const selectedPet = pets?.find((p) => p.id === selectedPetId)
  const qrValue = selectedPet
    ? `${window.location.origin}/pet/${selectedPet.qrCode || selectedPet.id}`
    : ''

  const petOptions = pets?.map((pet) => ({
    value: pet.id,
    label: pet.name,
    icon: pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐈' : '🐾',
  })) || []

  const handleDownload = () => {
    const svg = document.getElementById('pet-qr-code')
    if (!svg) return

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
    const svg = document.getElementById('pet-qr-code')
    if (!svg || !selectedPet) return

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Pet QR Code - ${selectedPet.name}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              font-family: system-ui, sans-serif;
              margin: 0;
            }
            h2 { margin-bottom: 20px; }
            .info { margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <h2>${selectedPet.name}'s Pet ID</h2>
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

  return (
    <Card>
      <div className="space-y-6">
        <Select
          label="Select Pet"
          options={petOptions}
          value={selectedPetId}
          onChange={onPetChange}
          placeholder="Choose a pet"
        />

        {selectedPet && qrValue && (
          <div className="flex flex-col items-center">
            <div className="p-6 bg-white rounded-2xl shadow-inner">
              <QRCodeSVG
                id="pet-qr-code"
                value={qrValue}
                size={qrSize}
                level="H"
                includeMargin
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
              <Button variant="primary" icon={FiDownload} onClick={handleDownload}>
                Download
              </Button>
              <Button variant="secondary" icon={FiPrinter} onClick={handlePrint}>
                Print
              </Button>
            </div>
          </div>
        )}

        {!selectedPet && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Select a pet to generate QR code
          </div>
        )}
      </div>
    </Card>
  )
}

export default QRGenerator