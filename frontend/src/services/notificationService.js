import api from './api'

export const notificationService = {

  // GET /notifications
  getAll: async () => {
    const r = await api.get('/notifications')
    return r.data
  },

  // GET /notifications/unread
  getUnread: async () => {
    const r = await api.get('/notifications/unread')
    return r.data
  },

  // GET /notifications/count
  getUnreadCount: async () => {
    const r = await api.get('/notifications/count')
    return r.data.count ?? 0
  },

  // PATCH /notifications/{id}/read
  markAsRead: async (id) => {
    await api.patch(`/notifications/${id}/read`)
  },

  // PATCH /notifications/read-all
  markAllAsRead: async () => {
    await api.patch('/notifications/read-all')
  },

  // DELETE /notifications/{id}
  delete: async (id) => {
    await api.delete(`/notifications/${id}`)
  },

  // DELETE /notifications/clear-read
  clearRead: async () => {
    await api.delete('/notifications/clear-read')
  },
}

export default notificationService