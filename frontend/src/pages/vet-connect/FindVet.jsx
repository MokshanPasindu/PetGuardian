// src/pages/vet-connect/FindVet.jsx
import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMapPin,
  FiSearch,
  FiList,
  FiMap,
  FiNavigation,
  FiAlertTriangle,
  FiRefreshCw,
  FiX,
  FiFilter,
} from 'react-icons/fi'
import { useGeolocation } from '../../hooks/useGeolocation'
import { vetService } from '../../services/vetService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import VetCard from '../../components/vet/VetCard'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'

// ✅ Lazy load map so it never crashes the page
const VetMap = lazy(() => import('../../components/vet/VetMap'))

const RADIUS_OPTIONS = [
  { value: '5', label: '5 km' },
  { value: '10', label: '10 km' },
  { value: '20', label: '20 km' },
  { value: '50', label: '50 km' },
]

const SORT_OPTIONS = [
  { value: 'distance', label: 'Sort: Distance' },
  { value: 'rating', label: 'Sort: Rating' },
  { value: 'name', label: 'Sort: Name' },
]

const FindVet = () => {
  const {
    location,
    loading: locationLoading,
    error: locationError,
    refresh: refreshLocation,
  } = useGeolocation()

  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVet, setSelectedVet] = useState(null)
  const [sortBy, setSortBy] = useState('distance')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    emergency: false,
    openNow: false,
    radius: '10',
  })

  // ── Fetch vets ─────────────────────────────────────────────────
  // ✅ KEY FIX: fetch vets independently of location
  // location is OPTIONAL - we fall back to all vets if no GPS
  const fetchVets = useCallback(async (userLocation = null) => {
    setLoading(true)
    try {
      let data = []

      if (userLocation) {
        // Try nearby search with GPS coords
        try {
          data = await vetService.getNearbyVets(
            userLocation.lat,
            userLocation.lng,
            Number(filters.radius)
          )
        } catch {
          data = []
        }
      }

      // ✅ Always fall back to all vets if nearby fails or no location
      if (!data || data.length === 0) {
        data = await vetService.getAllVets()
      }

      setVets(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fetch vets failed:', error)
      setVets([])
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }, [filters.radius])

  // ✅ KEY FIX: Fetch immediately on mount, don't wait for location
  useEffect(() => {
    if (!hasFetched) {
      fetchVets(null) // Fetch all vets immediately
    }
  }, []) // eslint-disable-line

  // ✅ When location resolves, refetch with coords for better results
  useEffect(() => {
    if (location && hasFetched) {
      fetchVets(location)
    }
  }, [location]) // eslint-disable-line

  // ── Directions ─────────────────────────────────────────────────
  const handleGetDirections = (vet) => {
    const dest =
      vet.latitude && vet.longitude
        ? `${vet.latitude},${vet.longitude}`
        : encodeURIComponent(vet.address || '')
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
      '_blank'
    )
  }

  // ── Filter + Sort ───────────────────────────────────────────────
  const filtered = vets
    .filter((v) => {
      if (filters.emergency && !v.isEmergency) return false
      if (filters.openNow && !v.isOpen) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          v.name?.toLowerCase().includes(q) ||
          v.specialization?.toLowerCase().includes(q) ||
          v.address?.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'distance') {
        if (a.distance == null) return 1
        if (b.distance == null) return -1
        return a.distance - b.distance
      }
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'name') return a.name?.localeCompare(b.name)
      return 0
    })

  const emergencyCount = vets.filter((v) => v.isEmergency).length
  const openCount = vets.filter((v) => v.isOpen).length
  const hasActiveFilters =
    filters.emergency || filters.openNow || !!searchQuery

  // ✅ Show loading ONLY for the data fetch, NOT waiting for GPS
  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <FiMapPin className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Vet Connect
              </h1>
              <p className="text-white/80 text-sm mt-0.5">
                {loading
                  ? 'Searching for clinics...'
                  : `${vets.length} clinic${vets.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-start md:items-end">
            {/* Location status pill */}
            {locationLoading ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl text-xs">
                <div className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                <span className="text-white/80">Getting your location...</span>
              </div>
            ) : locationError ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-xl text-xs">
                <FiAlertTriangle className="w-3 h-3 text-yellow-300 flex-shrink-0" />
                <span className="text-yellow-100">
                  Showing all clinics
                </span>
                <button
                  onClick={refreshLocation}
                  className="p-0.5 hover:bg-white/10 rounded"
                  title="Retry location"
                >
                  <FiRefreshCw className="w-3 h-3" />
                </button>
              </div>
            ) : location ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-xl text-xs">
                <FiNavigation className="w-3 h-3 text-green-300" />
                <span className="text-green-100">
                  Sorted by distance from you
                </span>
              </div>
            ) : null}

            {/* Stats pills */}
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-lg text-xs">
                <span className="font-semibold">{emergencyCount}</span>
                <span className="text-white/70 ml-1">Emergency</span>
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-lg text-xs">
                <span className="font-semibold">{openCount}</span>
                <span className="text-white/70 ml-1">Open Now</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Search + Controls ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clinics, specializations, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <Button
          variant={showFilters ? 'primary' : 'secondary'}
          icon={FiFilter}
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 bg-red-400 rounded-full inline-block" />
          )}
        </Button>

        {/* View toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setViewMode('list')}
            title="List View"
            className={`px-4 py-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <FiList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            title="Map View"
            className={`px-4 py-2 transition-colors ${
              viewMode === 'map'
                ? 'bg-primary-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <FiMap className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Filter Panel ────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Availability
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          emergency: !f.emergency,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                        filters.emergency
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      🚨 24/7 Emergency
                    </button>
                    <button
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          openNow: !f.openNow,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                        filters.openNow
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      ✅ Open Now
                    </button>
                  </div>
                </div>

                <div className="w-32">
                  <Select
                    label="Radius"
                    options={RADIUS_OPTIONS}
                    value={filters.radius}
                    onChange={(v) =>
                      setFilters((f) => ({ ...f, radius: v }))
                    }
                  />
                </div>

                <div className="w-44">
                  <Select
                    label="Sort By"
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={setSortBy}
                  />
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFilters({
                        emergency: false,
                        openNow: false,
                        radius: '10',
                      })
                      setSearchQuery('')
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Results Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">

        {/* ✅ CHANGED: <p> → <div> to fix DOM nesting warning */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span>Searching clinics...</span>
            </span>
          ) : (
            <>
              <span className="font-semibold text-gray-900 dark:text-white">
                {filtered.length}
              </span>{' '}
              clinic{filtered.length !== 1 ? 's' : ''}
              {location && (
                <span className="text-gray-400 ml-1">
                  sorted by distance
                </span>
              )}
              {searchQuery && (
                <span className="ml-1">
                  for{' '}
                  <span className="font-medium text-primary-600
                                   dark:text-primary-400">
                    "{searchQuery}"
                  </span>
                </span>
              )}
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={FiRefreshCw}
          onClick={() => fetchVets(location)}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {loading && vets.length === 0 ? (
        /* Initial loading state */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-72 animate-pulse"
            />
          ))}
        </div>
      ) : viewMode === 'map' ? (
        /* Map View */
        <Suspense
          fallback={
            <div className="h-[500px] rounded-2xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-gray-500 text-sm">Loading map...</p>
            </div>
          }
        >
          <VetMap
            vets={filtered}
            userLocation={location}
            selectedVet={selectedVet}
            onVetSelect={setSelectedVet}
            onGetDirections={handleGetDirections}
          />
        </Suspense>
      ) : filtered.length > 0 ? (
        /* List View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((vet, index) => (
            <motion.div
              key={vet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              <VetCard
                vet={vet}
                onGetDirections={handleGetDirections}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Empty State */
        <Card>
          <EmptyState
            icon={FiMapPin}
            title="No clinics found"
            description={
              hasActiveFilters
                ? 'No clinics match your current filters. Try clearing them.'
                : 'No veterinary clinics found. Make sure your backend has clinic data.'
            }
            action={
              hasActiveFilters
                ? () => {
                    setSearchQuery('')
                    setFilters({
                      emergency: false,
                      openNow: false,
                      radius: '10',
                    })
                  }
                : () => fetchVets(location)
            }
            actionLabel={hasActiveFilters ? 'Clear Filters' : 'Retry'}
          />
        </Card>
      )}
    </div>
  )
}

export default FindVet