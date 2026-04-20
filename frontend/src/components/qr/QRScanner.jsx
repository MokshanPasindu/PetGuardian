// src/components/qr/QRScanner.jsx
import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { FiCamera, FiX } from 'react-icons/fi'
import Card from '../common/Card'
import Button from '../common/Button'

const QRScanner = ({ onScanSuccess, onScanError, onClose }) => {
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  const startScanning = () => {
    setIsScanning(true)
    
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    })

    scanner.render(
      (decodedText) => {
        scanner.clear()
        setIsScanning(false)
        onScanSuccess?.(decodedText)
      },
      (error) => {
        // Ignore errors during scanning
      }
    )

    scannerRef.current = scanner
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
    }
    setIsScanning(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Scan QR Code
        </h3>
        {onClose && (
          <Button variant="ghost" size="sm" icon={FiX} onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {!isScanning ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <FiCamera className="w-10 h-10 text-primary-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Scan a pet's QR code to view their profile
          </p>
          <Button icon={FiCamera} onClick={startScanning}>
            Start Scanner
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div id="qr-reader" className="rounded-xl overflow-hidden" />
          <Button variant="secondary" className="w-full" onClick={stopScanning}>
            Cancel
          </Button>
        </div>
      )}
    </Card>
  )
}

export default QRScanner