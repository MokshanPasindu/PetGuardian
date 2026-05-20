// src/components/notification/SevereAlertToast.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiX, FiMapPin } from 'react-icons/fi'
import { useNotifications } from '../../context/NotificationContext'

const SevereAlertToast = () => {
  const navigate  = useNavigate()
  const { notifications, markAsRead } = useNotifications()
  const [active, setActive]           = useState(null)
  const [seen, setSeen]               = useState(new Set())

  // ── Watch for new AI_SCAN_SEVERE notifications ─────────────
  useEffect(() => {
    const severe = notifications.find(
      n => n.type === 'AI_SCAN_SEVERE' &&
           !n.read &&
           !seen.has(n.id)
    )

    if (severe && (!active || active.id !== severe.id)) {
      setActive(severe)
    }
  }, [notifications, seen, active])

  // ── Auto-dismiss after 12 seconds ─────────────────────────
  useEffect(() => {
    if (!active) return
    const t = setTimeout(dismiss, 12000)
    return () => clearTimeout(t)
  }, [active])

  const dismiss = () => {
    if (active) {
      setSeen(prev => new Set([...prev, active.id]))
      setActive(null)
    }
  }

  const handleFindVet = async () => {
    if (active) {
      try { await markAsRead(active.id) } catch (_) {}
    }
    dismiss()
    navigate('/vet-connect/find')
  }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,    scale: 1   }}
          exit={{    opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2
                     z-[100] w-full max-w-md px-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-red-600 text-white rounded-2xl
                          shadow-2xl overflow-hidden
                          border-2 border-red-400">

            {/* Progress bar */}
            <motion.div
              className="h-1.5 bg-red-400"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 12, ease: 'linear' }}
            />

            <div className="p-5">
              {/* Header row */}
              <div className="flex items-start
                              justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500
                                  rounded-xl flex items-center
                                  justify-center animate-pulse
                                  flex-shrink-0">
                    <FiAlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">
                      🚨 Severe Condition Detected
                    </h3>
                    <p className="text-red-200 text-xs">
                      Immediate action required
                    </p>
                  </div>
                </div>

                <button
                  onClick={dismiss}
                  className="p-1.5 hover:bg-red-500 rounded-lg
                             transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Message */}
              <p className="text-red-100 text-sm mb-4
                            leading-relaxed">
                {active.message}
              </p>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleFindVet}
                  className="flex-1 flex items-center
                             justify-center gap-2 bg-white
                             text-red-600 font-bold py-2.5 px-4
                             rounded-xl hover:bg-red-50
                             transition-colors text-sm"
                >
                  <FiMapPin className="w-4 h-4" />
                  Find Nearest Vet
                </button>

                <button
                  onClick={dismiss}
                  className="px-4 py-2.5 bg-red-500
                             hover:bg-red-400 rounded-xl
                             text-sm font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SevereAlertToast