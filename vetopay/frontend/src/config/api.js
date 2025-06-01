import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          useAuthStore.getState().setTokens(accessToken, newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const message = error.response?.data?.error?.message || error.message || 'Something went wrong'
    
    // Don't show toast for validation errors (they'll be shown in forms)
    if (error.response?.status !== 400) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api 