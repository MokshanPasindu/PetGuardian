// src/pages/vet-connect/FindVet.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiSearch, FiFilter, FiList, FiMap, FiNavigation } from 'react-icons/fi'
import { useGeolocation } from '../../hooks/useGeolocation'
import { vetService } from '../../services/vetService'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import VetCard from '../../components/vet/VetCard'
import { LoadingPage } from '../../components/common/LoadingSpinner'
import Alert from '../../components/common/Alert'

const FindVet = () => {
  const { location, loading: locationLoading, error: locationError } = useGeolocation()
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    emergency: false,
    openNow: false,
    radius: 10,
  })

  useEffect(() => {
    const fetchVets = async () => {
      try {
        // Mock data for demo
        setVets([
          {
            id: 1,
            name: 'City Animal Hospital',
            specialization: 'General Practice, Surgery',
            address: '123 Main Street, Downtown',
            phone: '+1 (555) 123-4567',
            hours: '8:00 AM - 8:00 PM',
            rating: 4.8,
            reviewCount: 234,
            isOpen: true,
            emergency: true,
            distance: 1200,
            lat: 40.7128,
            lng: -74.0060,
            image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=200&fit=crop',
          },
          {
            id: 2,
            name: 'Pet Care Plus',
            specialization: 'Dermatology, Internal Medicine',
            address: '456 Oak Avenue, Midtown',
            phone: '+1 (555) 234-5678',
            hours: '9:00 AM - 6:00 PM',
            rating: 4.6,
            reviewCount: 187,
            isOpen: true,
            emergency: false,
            distance: 2500,
            lat: 40.7580,
            lng: -73.9855,
            image: 'https://images.unsplash.com/photo-1628009368231-7bb7cf24da27?w=400&h=200&fit=crop',
          },
          {
            id: 3,
            name: 'Emergency Vet Clinic',
            specialization: 'Emergency Care, Critical Care',
            address: '789 Emergency Lane, Uptown',
            phone: '+1 (555) 345-6789',
            hours: '24/7',
            rating: 4.9,
            reviewCount: 412,
            isOpen: true,
            emergency: true,
            distance: 3800,
            lat: 40.7831,
            lng: -73.9712,
            image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=400&h=200&fit=crop',
          },
        ])
      } catch (error) {
        console.error('Failed to fetch vets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVets()
  }, [location])

  const handleGetDirections = (vet) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${vet.lat},${vet.lng}`
    window.open(url, '_blank')
  }

  const filteredVets = vets.filter((vet) => {
    if (filters.emergency && !vet.emergency) return false
    if (filters.openNow && !vet.isOpen) return false
    if (searchQuery && !vet.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading) {
    return <LoadingPage message="Finding nearby veterinary clinics..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-primary-500 rounded-2xl p-6 md:p-8 text-white"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Vet Connect</h1>
            <p className="text-white/80">Find nearby veterinary clinics</p>
          </div>
        </div>

        {locationError ? (
          <Alert variant="warning" className="bg-white/10 border-white/20">
            Location access denied. Showing all available clinics.
          </Alert>
        ) : location ? (
          <p className="text-white/80 flex items-center gap-2">
            <FiNavigation className="w-4 h-4" />
            Showing clinics near your location
          </p>
        ) : null}
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search veterinary clinics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filters.emergency ? 'danger' : 'secondary'}
            onClick={() => setFilters({ ...filters, emergency: !filters.emergency })}
          >
            24/7 Emergency
          </Button>
          <Button
            variant={filters.openNow ? 'primary' : 'secondary'}
            onClick={() => setFilters({ ...filters, openNow: !filters.openNow })}
          >
            Open Now
          </Button>
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              className={`p-3 ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => setViewMode('list')}
            >
              <FiList className="w-5 h-5" />
            </button>
            <button
              className={`p-3 ${viewMode === 'map' ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              onClick={() => setViewMode('map')}
            >
              <FiMap className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          {filteredVets.length} clinics found
        </p>
        <select className="input-field w-auto">
          <option>Sort by: Distance</option>
          <option>Sort by: Rating</option>
          <option>Sort by: Name</option>
        </select>
      </div>

      {viewMode === 'list' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVets.map((vet, index) => (
            <motion.div
              key={vet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <VetCard vet={vet} onGetDirections={handleGetDirections} />
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="h-[500px] flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <FiMap className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Map view coming soon</p>
            <p className="text-sm">Integration with Leaflet/Google Maps</p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default FindVet