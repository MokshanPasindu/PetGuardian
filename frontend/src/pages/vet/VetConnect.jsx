// src/pages/vet/VetConnect.jsx
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import Card from '../../components/common/Card'
import VetCard from '../../components/vet/VetCard'
import VetMap from '../../components/vet/VetMap'
import SearchBar from '../../components/common/SearchBar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Badge from '../../components/common/Badge'
import { useGeolocation } from '../../hooks/useGeolocation'
import { FiMapPin, FiList, FiMap, FiFilter } from 'react-icons/fi'

const mockClinics = [
  { id: 1, name: 'PetCare Veterinary Clinic', specialization: 'General & Emergency',
    address: '123 Main St, Downtown', phone: '(555) 123-4567', hours: '24/7 Emergency',
    lat: 40.7128, lng: -74.0060, distance: 1200, rating: 4.8, isOpen: true },
  { id: 2, name: 'Animal Wellness Center', specialization: 'Dermatology & Internal Medicine',
    address: '456 Oak Ave, Midtown', phone: '(555) 234-5678', hours: '8:00 AM - 8:00 PM',
    lat: 40.7180, lng: -74.0020, distance: 2500, rating: 4.6, isOpen: true },
  { id: 3, name: 'City Pet Hospital', specialization: 'Surgery & Critical Care',
    address: '789 Elm St, Uptown', phone: '(555) 345-6789', hours: '9:00 AM - 6:00 PM',
    lat: 40.7230, lng: -74.0100, distance: 3800, rating: 4.9, isOpen: false },
  { id: 4, name: 'Happy Paws Clinic', specialization: 'General Practice',
    address: '321 Pine Rd, Westside', phone: '(555) 456-7890', hours: '8:00 AM - 10:00 PM',
    lat: 40.7080, lng: -74.0150, distance: 4200, rating: 4.5, isOpen: true },
]

export default function VetConnect() {
  const location = useLocation()
  const isEmergency = location.state?.emergency
  const { location: userLocation, loading: geoLoading } = useGeolocation()
  const [clinics] = useState(mockClinics)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [viewMode, setViewMode] = useState('split')
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.specialization.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display flex items-center gap-3">
              <FiMapPin className="text-emerald-500" />
              Vet Connect
              {isEmergency && <Badge color="red">EMERGENCY</Badge>}
            </h1>
            <p className="text-gray-500 mt-1">Find nearby veterinary clinics</p>
          </div>
          <div className="flex gap-2">
            {['split', 'list', 'map'].map(mode => (
              <button key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2.5 rounded-xl transition-colors
                           ${viewMode === mode
                             ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                             : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}>
                {mode === 'list' ? <FiList className="w-5 h-5" /> :
                 mode === 'map' ? <FiMap className="w-5 h-5" /> :
                 <span className="text-xs font-bold">⫿</span>}
              </button>
            ))}
          </div>
        </div>

        {isEmergency && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                          rounded-xl p-4 animate-pulse">
            <p className="text-red-700 dark:text-red-400 font-semibold">
              🚨 Emergency Mode: Showing nearest veterinary clinics with emergency services.
            </p>
          </div>
        )}

        <SearchBar
          placeholder="Search clinics by name or specialization..."
          onSearch={setSearch}
        />

        {geoLoading ? (
          <LoadingSpinner text="Getting your location..." />
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'split' ? 'lg:grid-cols-2' :
            viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1'
          }`}>
            {/* Map */}
            {(viewMode === 'split' || viewMode === 'map') && (
              <div className={viewMode === 'map' ? '' : 'order-2 lg:order-1'}>
                <VetMap
                  center={userLocation ? [userLocation.lat, userLocation.lng] : null}
                  clinics={filtered}
                  selectedClinic={selectedClinic}
                  onClinicSelect={setSelectedClinic}
                />
              </div>
            )}

            {/* List */}
            {(viewMode === 'split' || viewMode === 'list') && (
              <div className={`space-y-4 ${viewMode === 'split' ? 'order-1 lg:order-2 max-h-[600px] overflow-y-auto pr-2' : ''}`}>
                {filtered.length === 0 ? (
                  <Card className="text-center py-8">
                    <p className="text-gray-500">No clinics found</p>
                  </Card>
                ) : (
                  filtered.map(clinic => (
                    <VetCard
                      key={clinic.id}
                      clinic={clinic}
                      onSelect={setSelectedClinic}
                      onGetDirections={(c) => {
                        window.open(`https://maps.google.com/?q=${c.lat},${c.lng}`, '_blank')
                      }}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}