import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Get notifications
  getNotifications: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/notifications`, {
        params: { page, limit }
      });
      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get notifications',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      set({ isLoading: true, error: null });
      await axios.patch(`${API_URL}/api/notifications/${notificationId}/read`);

      // Update notifications and unread count
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to mark notification as read',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      set({ isLoading: true, error: null });
      await axios.patch(`${API_URL}/api/notifications/read-all`);

      // Update notifications and unread count
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true
        })),
        unreadCount: 0,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to mark all notifications as read',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      set({ isLoading: true, error: null });
      await axios.delete(`${API_URL}/api/notifications/${notificationId}`);

      // Update notifications and unread count
      set((state) => {
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );
        return {
          notifications: state.notifications.filter(
            (n) => n.id !== notificationId
          ),
          unreadCount: notification?.read
            ? state.unreadCount
            : Math.max(0, state.unreadCount - 1),
          isLoading: false
        };
      });

      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to delete notification',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/api/notifications/unread-count`);
      set({
        unreadCount: response.data.count,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Failed to get unread count',
        isLoading: false
      });
      return { success: false, error: error.response?.data?.error };
    }
  },

  // Clear error
  clearError: () => set({ error: null })
})); 