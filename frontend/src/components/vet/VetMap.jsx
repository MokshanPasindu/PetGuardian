// src/components/vet/VetMap.jsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'  // ✅ TOP
import {
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiStar,
  FiX,
} from 'react-icons/fi'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatDistance } from '../../utils/formatters'

const VetMap = ({
  vets = [],
  userLocation,
  selectedVet,
  onVetSelect,
  onGetDirections,
}) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const [leafletReady, setLeafletReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [activeVet, setActiveVet] = useState(null)
  const leafletRef = useRef(null)

  // ── Step 1: Inject Leaflet CSS once ──────────────────────────────
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href =
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity =
        'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
    }
  }, [])

  // ── Step 2: Load Leaflet JS dynamically ──────────────────────────
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const L = (await import('leaflet')).default

        // Fix broken default icon paths in bundlers
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl:
            'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        leafletRef.current = L
        if (!cancelled) setLeafletReady(true)
      } catch (err) {
        console.error('Leaflet load failed:', err)
        if (!cancelled) setMapError(true)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // ── Step 3: Initialize map once Leaflet is ready ─────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return

    const L = leafletRef.current

    try {
      const center = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [3.139, 101.6869] // Kuala Lumpur fallback

      const map = L.map(mapRef.current, {
        center,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
    } catch (err) {
      console.error('Map init error:', err)
      setMapError(true)
    }
  }, [leafletReady, userLocation])

  // ── Step 4: Add/update user location marker ───────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current || !userLocation)
      return

    const L = leafletRef.current

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    const icon = L.divIcon({
      html: `<div style="
        width:16px;height:16px;
        background:#3b82f6;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(59,130,246,0.3);
      "></div>`,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    userMarkerRef.current = L.marker(
      [userLocation.lat, userLocation.lng],
      { icon, zIndexOffset: 1000 }
    )
      .addTo(mapInstanceRef.current)
      .bindPopup('<b>📍 Your Location</b>')
  }, [userLocation, leafletReady])

  // ── Step 5: Add/update vet markers ───────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return

    const L = leafletRef.current

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (!vets.length) return

    vets.forEach((vet) => {
      if (!vet.latitude || !vet.longitude) return

      const icon = L.divIcon({
        html: `<div style="
          width:36px;height:36px;
          background:${vet.isEmergency ? '#ef4444' : '#22c55e'};
          border:3px solid white;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          font-size:16px;
          cursor:pointer;
        ">${vet.isEmergency ? '🚨' : '🏥'}</div>`,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([vet.latitude, vet.longitude], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div style="min-width:180px;font-family:sans-serif;">
            <h3 style="font-weight:600;margin:0 0 4px;font-size:14px;">
              ${vet.name}
            </h3>
            <p style="color:#6b7280;font-size:12px;margin:0 0 4px;">
              ${vet.specialization || ''}
            </p>
            <p style="font-size:12px;margin:0 0 8px;">📍 ${vet.address}</p>
            ${
              vet.distance
                ? `<p style="font-size:12px;color:#3b82f6;margin:0 0 8px;">
                    📏 ${(vet.distance / 1000).toFixed(1)} km away
                  </p>`
                : ''
            }
            <a href="/vets/${vet.id}"
              style="display:inline-block;padding:4px 12px;
                background:#22c55e;color:white;border-radius:8px;
                text-decoration:none;font-size:12px;font-weight:500;">
              View Details
            </a>
          </div>`,
          { maxWidth: 250 }
        )

      marker.on('click', () => {
        setActiveVet(vet)
        onVetSelect?.(vet)
      })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all vets + user
    try {
      const allMarkers = [...markersRef.current]
      if (userMarkerRef.current) allMarkers.push(userMarkerRef.current)
      if (allMarkers.length > 0) {
        const group = L.featureGroup(allMarkers)
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15))
      }
    } catch (e) {
      // ignore bounds errors
    }
  }, [vets, leafletReady])

  // ── Step 6: Pan to selected vet ───────────────────────────────────
  useEffect(() => {
    if (!selectedVet || !mapInstanceRef.current) return
    setActiveVet(selectedVet)
    if (selectedVet.latitude && selectedVet.longitude) {
      mapInstanceRef.current.setView(
        [selectedVet.latitude, selectedVet.longitude],
        15,
        { animate: true }
      )
    }
  }, [selectedVet])

  // ── Cleanup on unmount ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // ── Error state ───────────────────────────────────────────────────
  if (mapError) {
    return (
      <div className="h-[500px] rounded-2xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-3">
        <FiMapPin className="w-12 h-12 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Map could not be loaded
        </p>
        <p className="text-sm text-gray-500">
          Check your internet connection
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ── Map ───────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden shadow-soft border border-gray-200 dark:border-gray-700">
        {/* Loading overlay */}
        {!leafletReady && (
          <div className="absolute inset-0 z-10 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading map...
            </p>
          </div>
        )}

        {/* Map container - must have explicit height */}
        <div ref={mapRef} style={{ height: '500px', width: '100%' }} />

        {/* Legend overlay */}
        <div className="absolute top-4 right-4 z-[999] bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 text-xs">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Legend
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span>🏥</span> General Clinic
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span>🚨</span> Emergency
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow" />
              You
            </div>
          </div>
        </div>
      </div>

      {/* ── Selected Vet Info Card ────────────────────────────────── */}
      <AnimatePresence>
        {activeVet && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start gap-4">
                <img
                  src={
                    activeVet.image ||
                    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=80&h=80&fit=crop'
                  }
                  alt={activeVet.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {activeVet.name}
                    </h3>
                    {activeVet.isEmergency && (
                      <Badge variant="danger" size="sm">24/7</Badge>
                    )}
                    {activeVet.isOpen && (
                      <Badge variant="success" size="sm">Open</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {activeVet.rating && (
                      <span className="flex items-center gap-1">
                        <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                        {activeVet.rating}
                      </span>
                    )}
                    {activeVet.distance && (
                      <span className="flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        {formatDistance(activeVet.distance)}
                      </span>
                    )}
                    {activeVet.phone && (
                      <span className="flex items-center gap-1">
                        <FiPhone className="w-3 h-3" />
                        {activeVet.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setActiveVet(null)}
                    className="self-end p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  <Link to={`/vets/${activeVet.id}`}>
                    <Button size="sm">View</Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={FiNavigation}
                    onClick={() => onGetDirections?.(activeVet)}
                  >
                    Dir
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Clinic List Below Map ─────────────────────────────────── */}
      {vets.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-2">
          {vets.slice(0, 6).map((vet) => (
            <button
              key={vet.id}
              onClick={() => {
                setActiveVet(vet)
                onVetSelect?.(vet)
                if (
                  mapInstanceRef.current &&
                  vet.latitude &&
                  vet.longitude
                ) {
                  mapInstanceRef.current.setView(
                    [vet.latitude, vet.longitude],
                    15,
                    { animate: true }
                  )
                }
              }}
              className={`text-left p-3 rounded-xl border transition-all ${
                activeVet?.id === vet.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg flex-shrink-0">
                    {vet.isEmergency ? '🚨' : '🏥'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {vet.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {vet.address}
                    </p>
                  </div>
                </div>
                {vet.distance && (
                  <span className="text-xs text-primary-600 dark:text-primary-400 flex-shrink-0">
                    {formatDistance(vet.distance)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default VetMap