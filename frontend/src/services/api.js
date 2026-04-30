// src/services/api.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const AI_BASE_URL  = import.meta.env.VITE_AI_URL  || 'http://localhost:5000/ai'

// ─── Main API instance ─────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,
})

// ─── AI API instance ───────────────────────────────────────────────────────
export const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 30000,
  withCredentials: true,
})

// ─── Token refresh state ───────────────────────────────────────────────────
let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

// ─── Request interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`

    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor (with token refresh) ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // ── 401 → try refresh token ────────────────────────────────────────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      const refreshToken = localStorage.getItem('refreshToken')

      // No refresh token → force logout
      if (!refreshToken) {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      // Already refreshing → queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(api(originalRequest))
            },
            reject,
          })
        })
      }

      // Start refresh
      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          refreshToken,
          { headers: { 'Content-Type': 'text/plain' } }
        )

        const newToken = response.data.token
        localStorage.setItem('token', newToken)
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization     = `Bearer ${newToken}`

        processQueue(null, newToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // ── Other errors ────────────────────────────────────────────────────────
    if (error.response?.status === 403) console.error('🚫 Access Forbidden')
    if (error.response?.status >= 500) console.error('🔥 Server Error')

    return Promise.reject(error)
  }
)

// ─── AI API interceptors ───────────────────────────────────────────────────
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

aiApi.interceptors.response.use(
  (response) => response,
  (error) => { console.error('AI API Error:', error); return Promise.reject(error) }
)

export default api