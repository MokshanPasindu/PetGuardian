import {
  createContext, useState, useCallback,
  useEffect, useContext, useRef,
} from 'react'
import { notificationService } from '../services/notificationService'
import { useAuth } from '../hooks/useAuth'

export const NotificationContext = createContext(null)

// ── Icon + color per type ─────────────────────────────────
export const NOTIFICATION_CONFIG = {
  VACCINATION_DUE:        { icon: '💉', color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  VACCINATION_OVERDUE:    { icon: '⚠️', color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  APPOINTMENT_BOOKED:     { icon: '📅', color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
  APPOINTMENT_CONFIRMED:  { icon: '✅', color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
  APPOINTMENT_CANCELLED:  { icon: '❌', color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  APPOINTMENT_REMINDER:   { icon: '🔔', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  AI_SCAN_COMPLETE:       { icon: '🔬', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  AI_SCAN_SEVERE:         { icon: '🚨', color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  COMMUNITY_REPLY:        { icon: '💬', color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  COMMUNITY_LIKE:         { icon: '❤️', color: 'text-pink-500',   bg: 'bg-pink-50 dark:bg-pink-900/20' },
  SYSTEM:                 { icon: 'ℹ️', color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-gray-800' },
  WELCOME:                { icon: '🐾', color: 'text-primary-500',bg: 'bg-primary-50 dark:bg-primary-900/20' },
}

export const getNotificationConfig = (type) =>
  NOTIFICATION_CONFIG[type] ?? NOTIFICATION_CONFIG.SYSTEM

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)
  const [loading, setLoading]             = useState(false)
  const pollRef                           = useRef(null)

  // ── Fetch all notifications ────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      setLoading(true)
      const data = await notificationService.getAll()
      const list = Array.isArray(data) ? data : []
      setNotifications(list)
      setUnreadCount(list.filter(n => !n.read).length)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // ── Poll for new notifications every 30 seconds ───────────
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    fetchNotifications()

    // Poll every 30 seconds
    pollRef.current = setInterval(fetchNotifications, 30000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isAuthenticated, fetchNotifications])

  // ── Mark single as read ────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }, [])

  // ── Mark all as read ───────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }, [])

  // ── Delete single ─────────────────────────────────────────
  const removeNotification = useCallback(async (id) => {
    try {
      await notificationService.delete(id)
      setNotifications(prev => {
        const target = prev.find(n => n.id === id)
        if (target && !target.read) {
          setUnreadCount(c => Math.max(0, c - 1))
        }
        return prev.filter(n => n.id !== id)
      })
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }, [])

  // ── Clear all read ─────────────────────────────────────────
  const clearRead = useCallback(async () => {
    try {
      await notificationService.clearRead()
      setNotifications(prev => prev.filter(n => !n.read))
    } catch (err) {
      console.error('Failed to clear read:', err)
    }
  }, [])

  // ── Add local notification (optimistic) ───────────────────
  const addLocalNotification = useCallback((notification) => {
    const n = {
      id:        Date.now(),
      read:      false,
      createdAt: new Date().toISOString(),
      type:      'SYSTEM',
      ...notification,
    }
    setNotifications(prev => [n, ...prev])
    setUnreadCount(prev => prev + 1)
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearRead,
      addLocalNotification,
      getNotificationConfig,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error(
    'useNotifications must be used within NotificationProvider'
  )
  return ctx
}