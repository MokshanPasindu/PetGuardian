// src/hooks/useConfirm.js
import { useState } from 'react'

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger',
  })
  const [loading, setLoading] = useState(false)

  const confirm = ({
    title = 'Confirm Action',
    message = 'Are you sure?',
    type = 'danger',
    onConfirm,
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: async () => {
          setLoading(true)
          try {
            if (onConfirm) {
              await onConfirm()
            }
            resolve(true)
          } catch (error) {
            resolve(false)
          } finally {
            setLoading(false)
            setConfirmState((prev) => ({ ...prev, isOpen: false }))
          }
        },
      })
    })
  }

  const closeConfirm = () => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }

  return {
    confirmState,
    confirm,
    closeConfirm,
    loading,
  }
}