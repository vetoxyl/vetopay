import { create } from 'zustand'
import api from '../config/api'
import toast from 'react-hot-toast'

export const useWalletStore = create((set, get) => ({
  wallet: null,
  transactions: [],
  transactionStats: null,
  loading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Get wallet info
  getWallet: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/wallets/me')
      set({ wallet: response.data, loading: false })
      return response.data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  // Get transactions
  getTransactions: async (params = {}) => {
    set({ loading: true })
    try {
      const response = await api.get('/transactions', { params })
      set({
        transactions: response.data.transactions,
        pagination: response.data.pagination,
        loading: false,
      })
      return response.data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Send money
  sendMoney: async (data) => {
    set({ loading: true })
    try {
      const response = await api.post('/transactions', data)
      
      // Update wallet balance
      const wallet = get().wallet
      if (wallet) {
        set({
          wallet: {
            ...wallet,
            balance: (parseFloat(wallet.balance) - parseFloat(data.amount)).toString()
          }
        })
      }
      
      toast.success('Transaction successful!')
      set({ loading: false })
      return { success: true, data: response.data }
    } catch (error) {
      set({ loading: false })
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Transaction failed',
      }
    }
  },

  // Get transaction stats
  getTransactionStats: async (period = 'month') => {
    try {
      const response = await api.get('/transactions/stats', { params: { period } })
      set({ transactionStats: response.data })
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Clear state
  clearState: () => {
    set({
      wallet: null,
      transactions: [],
      transactionStats: null,
      loading: false,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
    })
  },
})) 