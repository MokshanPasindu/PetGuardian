import api from './api'

export const vetService = {

  // ═══════════════════════════════════════════════════════════
  // VET CLINICS
  // ═══════════════════════════════════════════════════════════

  getAllVets: async () => {
    const r = await api.get('/vets')
    return r.data
  },

  getNearbyVets: async (latitude, longitude, radius = 10) => {
    try {
      const r = await api.get('/vets/nearby', {
        params: { lat: latitude, lng: longitude, radius },
      })
      return r.data
    } catch { return [] }
  },

  getVetById: async (id) => {
    const r = await api.get(`/vets/${id}`)
    return r.data
  },

  getEmergencyVets: async () => {
    try {
      const r = await api.get('/vets/emergency')
      return r.data
    } catch { return [] }
  },

  searchVets: async (query) => {
    try {
      const r = await api.get('/vets/search', { params: { query } })
      return r.data
    } catch { return [] }
  },

  // ═══════════════════════════════════════════════════════════
  // OWNER APPOINTMENTS
  // ═══════════════════════════════════════════════════════════

  getAppointments: async () => {
    const r = await api.get('/appointments')
    return r.data
  },

  getPendingAppointments: async () => {
    try {
      const r = await api.get('/appointments/pending')
      return r.data
    } catch { return [] }
  },

  getAppointmentById: async (id) => {
    const r = await api.get(`/appointments/${id}`)
    return r.data
  },

  createAppointment: async (data) => {
    const r = await api.post('/appointments', data)
    return r.data
  },

  updateAppointmentStatus: async (id, status) => {
    const r = await api.patch(`/appointments/${id}/status`, null, {
      params: { status },
    })
    return r.data
  },

  cancelAppointment: async (id) => {
    const r = await api.delete(`/appointments/${id}`)
    return r.data
  },

  // ═══════════════════════════════════════════════════════════
  // VET APPOINTMENTS
  // ═══════════════════════════════════════════════════════════

  // GET /appointments/vet/dashboard
  getVetDashboard: async () => {
    const r = await api.get('/appointments/vet/dashboard')
    return r.data
  },

  // GET /appointments/vet/all
  getVetAllAppointments: async () => {
    const r = await api.get('/appointments/vet/all')
    return r.data
  },

  // GET /appointments/vet/today
  getVetTodayAppointments: async () => {
    const r = await api.get('/appointments/vet/today')
    return r.data
  },

  // GET /appointments/vet/pending
  getVetPendingAppointments: async () => {
    const r = await api.get('/appointments/vet/pending')
    return r.data
  },

  // GET /appointments/vet/date?date=2024-01-15
  getVetAppointmentsByDate: async (date) => {
    const r = await api.get('/appointments/vet/date', {
      params: { date },
    })
    return r.data
  },

  // PATCH /appointments/vet/{id}/confirm
  confirmAppointment: async (id) => {
    const r = await api.patch(`/appointments/vet/${id}/confirm`)
    return r.data
  },

  // PATCH /appointments/vet/{id}/complete
  completeAppointment: async (id) => {
    const r = await api.patch(`/appointments/vet/${id}/complete`)
    return r.data
  },

  // PATCH /appointments/vet/{id}/cancel
  vetCancelAppointment: async (id) => {
    const r = await api.patch(`/appointments/vet/${id}/cancel`)
    return r.data
  },

  // PATCH /appointments/vet/{id}/notes
  addVetNotes: async (id, notes) => {
    const r = await api.patch(`/appointments/vet/${id}/notes`, null, {
      params: { notes },
    })
    return r.data
  },
}

export default vetService