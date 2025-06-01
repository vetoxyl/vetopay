import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(`${API_URL}/api/auth/login`, {
            email,
            password
          });

          const { token, user } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Login failed',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      // Register
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(`${API_URL}/api/auth/register`, userData);

          const { token, user } = response.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });

          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Registration failed',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
        delete axios.defaults.headers.common['Authorization'];
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.get(`${API_URL}/api/auth/me`);
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false
          });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Failed to get user data',
            isLoading: false,
            isAuthenticated: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      // Update user profile
      updateProfile: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.patch(`${API_URL}/api/users/profile`, userData);
          set({
            user: response.data.user,
            isLoading: false
          });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Failed to update profile',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      // Change password
      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true, error: null });
          await axios.post(`${API_URL}/api/users/change-password`, passwordData);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Failed to change password',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      // Forgot password
      forgotPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });
          await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Failed to process request',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      },

      // Reset password
      resetPassword: async (token, password) => {
        try {
          set({ isLoading: true, error: null });
          await axios.post(`${API_URL}/api/auth/reset-password`, {
            token,
            password
          });
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          set({
            error: error.response?.data?.error || 'Failed to reset password',
            isLoading: false
          });
          return { success: false, error: error.response?.data?.error };
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 