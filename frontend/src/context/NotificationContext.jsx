// src/context/NotificationContext.jsx
import { createContext, useState, useCallback } from 'react'

export const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Welcome to PetGuardian!',
      message: 'Start by adding your first pet profile.',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ])

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    }, ...prev])
  }, [])

  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}