import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useWalletStore = create((set, get) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,

  // Get wallet balance
  getBalance: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/wallet/balance`);
      set({
        balance: response.data.balance,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get balance',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Get transaction history
  getTransactions: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/wallet/transactions`, {
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

  // Transfer funds
  transferFunds: async (recipientId, amount, description) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/api/wallet/transfer`, {
        recipientId,
        amount,
        description
      });

      // Update balance and transactions
      set((state) => ({
        balance: state.balance - amount,
        transactions: [response.data.transaction, ...state.transactions],
        isLoading: false
      }));

      return { success: true, transaction: response.data.transaction };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Transfer failed',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Fund wallet
  fundWallet: async (amount) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/api/wallet/fund`, {
        amount
      });

      // Update balance and transactions
      set((state) => ({
        balance: state.balance + amount,
        transactions: [response.data.transaction, ...state.transactions],
        isLoading: false
      }));

      return { success: true, transaction: response.data.transaction };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to fund wallet',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Withdraw funds
  withdrawFunds: async (amount) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.post(`${API_URL}/api/wallet/withdraw`, {
        amount
      });

      // Update balance and transactions
      set((state) => ({
        balance: state.balance - amount,
        transactions: [response.data.transaction, ...state.transactions],
        isLoading: false
      }));

      return { success: true, transaction: response.data.transaction };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Withdrawal failed',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Clear error
  clearError: () => set({ error: null })
})); 