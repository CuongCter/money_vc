import { create } from "zustand"

export const useNotificationStore = create((set, get) => ({
  notifications: [],

  // Add a new notification
  addNotification: (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: "info", // info, success, warning, error
      title: "",
      message: "",
      duration: 5000, // Auto dismiss after 5 seconds
      ...notification,
    }

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }))

    // Auto dismiss after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id)
      }, newNotification.duration)
    }

    return id
  },

  // Remove a notification
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }))
  },

  // Clear all notifications
  clearNotifications: () => {
    set({ notifications: [] })
  },

  // Helper methods for different notification types
  showSuccess: (message, title = "Thành công") => {
    return get().addNotification({
      type: "success",
      title,
      message,
    })
  },

  showError: (message, title = "Lỗi") => {
    return get().addNotification({
      type: "error",
      title,
      message,
      duration: 7000, // Error messages stay longer
    })
  },

  showWarning: (message, title = "Cảnh báo") => {
    return get().addNotification({
      type: "warning",
      title,
      message,
    })
  },

  showInfo: (message, title = "Thông tin") => {
    return get().addNotification({
      type: "info",
      title,
      message,
    })
  },
}))
