// src/hooks/useGeolocation.js
import { useState, useEffect, useCallback } from 'react'

export const useGeolocation = () => {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const getLocation = useCallback(() => {
    setLoading(true)
    setError(null)

    // ✅ If browser doesn't support geolocation, stop immediately
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }

    // ✅ Set a hard timeout - if GPS takes more than 5s, give up
    const timeoutId = setTimeout(() => {
      setError('Location request timed out')
      setLoading(false)
    }, 5000)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
        setError(null)
        setLoading(false)
      },
      (err) => {
        clearTimeout(timeoutId)
        setError(err.message || 'Location access denied')
        setLoading(false)
      },
      {
        enableHighAccuracy: false, // ✅ false = faster response
        timeout: 5000,
        maximumAge: 60000,        // ✅ Accept cached location up to 1 min
      }
    )
  }, [])

  useEffect(() => {
    getLocation()
  }, [getLocation])

  return {
    location,
    error,
    loading,
    refresh: getLocation,
  }
}