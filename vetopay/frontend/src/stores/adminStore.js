import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAdminStore = create((set, get) => ({
  users: [],
  transactions: [],
  auditLogs: [],
  statistics: null,
  isLoading: false,
  error: null,

  // Get all users
  getUsers: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        params: { page, limit }
      });
      set({
        users: response.data.users,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get users',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Get user details
  getUserDetails: async (userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/admin/users/${userId}`);
      return { success: true, user: response.data.user };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get user details',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.patch(`${API_URL}/api/admin/users/${userId}/status`, {
        status
      });

      // Update users list
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, status } : user
        ),
        isLoading: false
      }));

      return { success: true, user: response.data.user };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to update user status',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Get all transactions
  getTransactions: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/admin/transactions`, {
        params: { page, limit }
      });
      set({
        transactions: response.data.transactions,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get transactions',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Get transaction details
  getTransactionDetails: async (transactionId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(
        `${API_URL}/api/admin/transactions/${transactionId}`
      );
      return { success: true, transaction: response.data.transaction };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get transaction details',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Get audit logs
  getAuditLogs: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/admin/audit-logs`, {
        params: { page, limit }
      });
      set({
        auditLogs: response.data.logs,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get audit logs',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Get system statistics
  getStatistics: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/admin/statistics`);
      set({
        statistics: response.data.statistics,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get statistics',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Clear error
  clearError: () => set({ error: null })
})); 