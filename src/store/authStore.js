import { create } from "zustand"
import { createDefaultCategories } from "../api/categoryService"

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => {
    if (user && !user.isNewUser) {
      set({ user })
    } else if (user && user.isNewUser) {
      // Create default categories for new users
      createDefaultCategories(user.uid)
      set({ user })
    } else {
      set({ user: null })
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  logout: () => set({ user: null, error: null }),
}))
