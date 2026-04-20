// src/components/vet/VetMap.jsx
import { useEffect, useRef } from 'react'
import Card from '../common/Card'
import { FiMapPin } from 'react-icons/fi'

const VetMap = ({ vets, userLocation, selectedVet, onVetSelect }) => {
  const mapRef = useRef(null)

  // Note: This is a placeholder. In production, integrate with Leaflet or Google Maps
  useEffect(() => {
    // Map initialization logic would go here
  }, [vets, userLocation])

  return (
    <Card className="h-[500px] relative overflow-hidden">
      {/* Placeholder for map */}
      <div
        ref={mapRef}
        className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <FiMapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Map View</p>
          <p className="text-sm">
            Integrate with Leaflet or Google Maps API
          </p>
          {userLocation && (
            <p className="text-xs mt-2">
              Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          )}
          <p className="text-xs mt-1">
            {vets?.length || 0} veterinary clinics nearby
          </p>
        </div>
      </div>

      {/* Vet markers legend */}
      {vets && vets.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 max-h-40 overflow-y-auto">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Nearby Clinics
          </p>
          <div className="space-y-2">
            {vets.slice(0, 5).map((vet) => (
              <button
                key={vet.id}
                onClick={() => onVetSelect?.(vet)}
                className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                  selectedVet?.id === vet.id
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {vet.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {vet.distance ? `${(vet.distance / 1000).toFixed(1)} km` : 'Distance unknown'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default VetMap