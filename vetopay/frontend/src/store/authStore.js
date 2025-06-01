import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../config/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,

      // Set tokens
      setTokens: (token, refreshToken) => {
        set({ token, refreshToken })
      },

      // Set user
      setUser: (user) => {
        set({ user, isAuthenticated: true })
      },

      // Login
      login: async (credentials) => {
        set({ loading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          const { user, accessToken, refreshToken } = response.data
          
          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
          })

          toast.success('Login successful!')
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return {
            success: false,
            error: error.response?.data?.error?.message || 'Login failed',
          }
        }
      },

      // Register
      register: async (userData) => {
        set({ loading: true })
        try {
          const response = await api.post('/auth/register', userData)
          const { user, accessToken, refreshToken } = response.data
          
          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
          })

          toast.success('Registration successful!')
          return { success: true }
        } catch (error) {
          set({ loading: false })
          return {
            success: false,
            error: error.response?.data?.error?.message || 'Registration failed',
          }
        }
      },

      // Logout
      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          // Ignore logout errors
        }
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        
        toast.success('Logged out successfully')
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          const response = await api.get('/users/profile')
          set({ user: response.data })
          return response.data
        } catch (error) {
          if (error.response?.status === 401) {
            get().logout()
          }
          throw error
        }
      },

      // Update profile
      updateProfile: async (data) => {
        try {
          const response = await api.put('/users/profile', data)
          set({ user: response.data })
          toast.success('Profile updated successfully')
          return { success: true }
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error?.message || 'Failed to update profile',
          }
        }
      },

      // Change password
      changePassword: async (data) => {
        try {
          await api.post('/users/change-password', data)
          toast.success('Password changed successfully')
          return { success: true }
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error?.message || 'Failed to change password',
          }
        }
      },

      // Forgot password
      forgotPassword: async (email) => {
        try {
          await api.post('/auth/forgot-password', { email })
          toast.success('Password reset link sent to your email')
          return { success: true }
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error?.message || 'Failed to send reset link',
          }
        }
      },

      // Reset password
      resetPassword: async (data) => {
        try {
          await api.post('/auth/reset-password', data)
          toast.success('Password reset successful')
          return { success: true }
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.error?.message || 'Failed to reset password',
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
) 