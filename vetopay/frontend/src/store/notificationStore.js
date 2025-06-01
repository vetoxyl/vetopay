import { create } from 'zustand'
import api from '../config/api'
import toast from 'react-hot-toast'

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  // Get notifications
  getNotifications: async (params = {}) => {
    set({ loading: true })
    try {
      const response = await api.get('/notifications', { params })
      set({
        notifications: response.data.notifications,
        pagination: response.data.pagination,
        loading: false,
      })
      return response.data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count')
      set({ unreadCount: response.data.count })
      return response.data.count
    } catch (error) {
      throw error
    }
  },

  // Mark as read
  markAsRead: async (id) => {
    try {
      const response = await api.post(`/notifications/${id}/read`)
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, status: 'READ', readAt: new Date() } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/mark-all-read')
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          status: 'READ',
          readAt: new Date(),
        })),
        unreadCount: 0,
      }))
      
      toast.success('All notifications marked as read')
      return response
    } catch (error) {
      throw error
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      
      // Update local state
      set((state) => ({
        notifications: state.notifications.filter((notif) => notif.id !== id),
        unreadCount: state.notifications.find((n) => n.id === id)?.status === 'UNREAD'
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }))
      
      toast.success('Notification deleted')
    } catch (error) {
      throw error
    }
  },

  // Clear state
  clearState: () => {
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    })
  },
})) 