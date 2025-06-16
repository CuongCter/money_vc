import { create } from "zustand"
import { budgetService } from "../api/budgetService"
import { useNotificationStore } from "./notificationStore"

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  loading: false,
  error: null,

  // Fetch all budgets
  fetchBudgets: async () => {
    set({ loading: true, error: null })
    try {
      const budgets = await budgetService.getBudgets()
      set({ budgets, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
      useNotificationStore.getState().addNotification({
        type: "error",
        message: "Không thể tải danh sách ngân sách",
      })
    }
  },

  // Create new budget
  createBudget: async (budgetData) => {
    set({ loading: true, error: null })
    try {
      const newBudget = await budgetService.createBudget(budgetData)
      set((state) => ({
        budgets: [...state.budgets, newBudget],
        loading: false,
      }))
      useNotificationStore.getState().addNotification({
        type: "success",
        message: "Tạo ngân sách thành công",
      })
      return newBudget
    } catch (error) {
      set({ error: error.message, loading: false })
      useNotificationStore.getState().addNotification({
        type: "error",
        message: "Không thể tạo ngân sách",
      })
      throw error
    }
  },

  // Update budget
  updateBudget: async (budgetId, budgetData) => {
    set({ loading: true, error: null })
    try {
      const updatedBudget = await budgetService.updateBudget(budgetId, budgetData)
      set((state) => ({
        budgets: state.budgets.map((budget) => (budget.id === budgetId ? updatedBudget : budget)),
        loading: false,
      }))
      useNotificationStore.getState().addNotification({
        type: "success",
        message: "Cập nhật ngân sách thành công",
      })
      return updatedBudget
    } catch (error) {
      set({ error: error.message, loading: false })
      useNotificationStore.getState().addNotification({
        type: "error",
        message: "Không thể cập nhật ngân sách",
      })
      throw error
    }
  },

  // Delete budget
  deleteBudget: async (budgetId) => {
    set({ loading: true, error: null })
    try {
      await budgetService.deleteBudget(budgetId)
      set((state) => ({
        budgets: state.budgets.filter((budget) => budget.id !== budgetId),
        loading: false,
      }))
      useNotificationStore.getState().addNotification({
        type: "success",
        message: "Xóa ngân sách thành công",
      })
    } catch (error) {
      set({ error: error.message, loading: false })
      useNotificationStore.getState().addNotification({
        type: "error",
        message: "Không thể xóa ngân sách",
      })
      throw error
    }
  },

  // Get budget by category and period
  getBudgetByCategory: (categoryId, period = "monthly") => {
    const { budgets } = get()
    return budgets.find((budget) => budget.categoryId === categoryId && budget.period === period && budget.isActive)
  },

  // Get current month budgets
  getCurrentMonthBudgets: () => {
    const { budgets } = get()
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    return budgets.filter((budget) => {
      const budgetDate = new Date(budget.startDate)
      return budgetDate.getMonth() === currentMonth && budgetDate.getFullYear() === currentYear && budget.isActive
    })
  },

  // Check budget alerts
  checkBudgetAlerts: (transactions) => {
    const { budgets } = get()
    const alerts = []

    budgets.forEach((budget) => {
      if (!budget.isActive) return

      const spent = transactions
        .filter((t) => t.categoryId === budget.categoryId && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      const percentage = (spent / budget.amount) * 100

      if (percentage >= 100) {
        alerts.push({
          type: "danger",
          budgetId: budget.id,
          categoryName: budget.categoryName,
          message: `Đã vượt ngân sách ${budget.categoryName}`,
          percentage: Math.round(percentage),
        })
      } else if (percentage >= 80) {
        alerts.push({
          type: "warning",
          budgetId: budget.id,
          categoryName: budget.categoryName,
          message: `Sắp hết ngân sách ${budget.categoryName}`,
          percentage: Math.round(percentage),
        })
      }
    })

    return alerts
  },
}))
