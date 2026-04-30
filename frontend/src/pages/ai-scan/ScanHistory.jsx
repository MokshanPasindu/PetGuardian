import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiCamera, FiCalendar, FiEye, FiTrash2 } from 'react-icons/fi'
import { aiService } from '../../services/aiService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'

// ── Severity badge helper ──────────────────────────────────
const SeverityBadge = ({ severity }) => {
  const map = {
    SEVERE:   'danger',
    MODERATE: 'warning',
    MILD:     'success',
  }
  return (
    <Badge variant={map[severity?.toUpperCase()] ?? 'default'}>
      {severity?.charAt(0) + severity?.slice(1).toLowerCase()}
    </Badge>
  )
}

const ScanHistory = () => {
  const [scans, setScans]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')
  const [selected, setSelected] = useState(null) // expanded scan detail

  // ── Fetch real data ────────────────────────────────────────
  const fetchScans = useCallback(async () => {
    try {
      setLoading(true)
      const data  = await aiService.getAllUserScans()
      // Handle both wrapped {data: [...]} and raw [...]
      const scans = Array.isArray(data) ? data : (data?.data ?? [])
      setScans(scans)
    } catch (err) {
      toast.error('Failed to load scan history')
      setScans([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScans()
  }, [fetchScans])

  // ── Filter ────────────────────────────────────────────────
  const filtered = filter === 'ALL'
    ? scans
    : scans.filter((s) => s.severity?.toUpperCase() === filter)

  if (loading) return <LoadingPage message="Loading scan history…" />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            Scan History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {scans.length} total scan{scans.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/scan">
          <Button icon={FiCamera}>New Scan</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'MILD', 'MODERATE', 'SEVERE'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {f !== 'ALL' && (
              <span className="ml-1 text-xs opacity-70">
                ({scans.filter((s) =>
                  s.severity?.toUpperCase() === f).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Scan list */}
      {filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((scan, index) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex items-center gap-4">
                  {/* Scan image or placeholder */}
                  {scan.imageUrl ? (
                    <img
                      src={scan.imageUrl}
                      alt="Scan"
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100
                                    dark:bg-gray-700 flex items-center
                                    justify-center flex-shrink-0">
                      <FiCamera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {scan.prediction ?? scan.predictedClass ?? 'Unknown'}
                      </h3>
                      <SeverityBadge severity={scan.severity} />
                      {scan.savedToMedicalHistory && (
                        <Badge variant="info">Saved to Records</Badge>
                      )}
                      {(scan.vetConnectTrigger || scan.vetConnectTriggered) && (
                        <Badge variant="danger">Vet Required</Badge>
                      )}
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                      {scan.petName && `Pet: ${scan.petName} • `}
                      Confidence: {((scan.confidence ?? 0) * 100).toFixed(0)}%
                    </p>

                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {formatDate(scan.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={FiEye}
                      onClick={() =>
                        setSelected(selected?.id === scan.id ? null : scan)
                      }
                    >
                      {selected?.id === scan.id ? 'Close' : 'View'}
                    </Button>
                  </div>
                </div>

                {/* Expanded detail */}
                {selected?.id === scan.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                  >
                    {/* Guidance */}
                    {scan.guidance && (
                      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-700
                                      dark:text-blue-300 mb-1">
                          AI Guidance
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {scan.guidance}
                        </p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {(scan.recommendations ?? scan.homeCareSteps ?? []).length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700
                                      dark:text-gray-300 mb-2">
                          Recommendations
                        </p>
                        <ul className="space-y-1">
                          {(scan.recommendations ?? scan.homeCareSteps ?? [])
                            .map((r, i) => (
                              <li key={i} className="text-sm text-gray-600
                                                     dark:text-gray-400 flex
                                                     items-start gap-2">
                                <span className="text-primary-500 font-bold">
                                  {i + 1}.
                                </span>
                                {r}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                      {(scan.severity === 'SEVERE' ||
                        scan.vetConnectTrigger) && (
                        <Link to="/vets">
                          <Button variant="danger" size="sm">
                            Find Vets
                          </Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={FiCamera}
            title={
              filter === 'ALL'
                ? 'No scans yet'
                : `No ${filter.toLowerCase()} severity scans`
            }
            description={
              filter === 'ALL'
                ? 'Start by analyzing your pet\'s skin with our AI scanner'
                : 'Try a different filter'
            }
            action={
              filter === 'ALL'
                ? () => (window.location.href = '/scan')
                : undefined
            }
            actionLabel="Start First Scan"
          />
        </Card>
      )}
    </div>
  )
}

export default ScanHistory