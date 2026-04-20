// src/pages/ai-scan/ScanHistory.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCamera, FiCalendar, FiEye, FiFilter } from 'react-icons/fi'
import { aiService } from '../../services/aiService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

const ScanHistory = () => {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchScans = async () => {
      try {
        // Mock data for demo
        setScans([
          {
            id: 1,
            petName: 'Max',
            petImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop',
            scanImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
            prediction: 'Bacterial Dermatitis',
            severity: 'MODERATE',
            confidence: 0.87,
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            petName: 'Bella',
            petImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop',
            scanImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop',
            prediction: 'No Issues Detected',
            severity: 'MILD',
            confidence: 0.95,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 3,
            petName: 'Max',
            petImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&h=100&fit=crop',
            scanImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
            prediction: 'Suspected Fungal Infection',
            severity: 'SEVERE',
            confidence: 0.92,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ])
      } catch (error) {
        console.error('Failed to fetch scans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScans()
  }, [])

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'MILD':
        return <Badge variant="success">Mild</Badge>
      case 'MODERATE':
        return <Badge variant="warning">Moderate</Badge>
      case 'SEVERE':
        return <Badge variant="danger">Severe</Badge>
      default:
        return <Badge variant="default">{severity}</Badge>
    }
  }

  const filteredScans = filter === 'all' 
    ? scans 
    : scans.filter((scan) => scan.severity === filter)

  if (loading) {
    return <LoadingPage message="Loading scan history..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Scan History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all your previous AI skin analysis results
          </p>
        </div>
        <Link to="/scan">
          <Button icon={FiCamera}>New Scan</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'MILD', 'MODERATE', 'SEVERE'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      {/* Scan List */}
      {filteredScans.length > 0 ? (
        <div className="grid gap-4">
          {filteredScans.map((scan, index) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="cursor-pointer">
                <div className="flex items-center gap-4">
                  <img
                    src={scan.scanImage}
                    alt="Scan"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {scan.prediction}
                      </h3>
                      {getSeverityBadge(scan.severity)}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                      Pet: {scan.petName} • Confidence: {(scan.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-gray-400 text-sm flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {formatDate(scan.createdAt)}
                    </p>
                  </div>
                  <Button variant="ghost" icon={FiEye}>
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiCamera}
            title="No scans found"
            description="Start by analyzing your pet's skin condition with our AI scanner"
            action={() => (window.location.href = '/scan')}
            actionLabel="Start First Scan"
          />
        </Card>
      )}
    </div>
  )
}

export default ScanHistory