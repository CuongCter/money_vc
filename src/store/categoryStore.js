import { create } from "zustand"

export const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  // Actions
  setCategories: (categories) => set({ categories }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Category actions
  addCategory: (category) =>
    set({
      categories: [...get().categories, category],
    }),

  updateCategory: (id, updatedCategory) =>
    set({
      categories: get().categories.map((category) =>
        category.id === id ? { ...category, ...updatedCategory } : category,
      ),
    }),

  deleteCategory: (id) =>
    set({
      categories: get().categories.filter((category) => category.id !== id),
    }),

  // Helper functions
  getCategoryById: (id) => {
    return get().categories.find((category) => category.id === id)
  },

  getCategoriesByType: (type) => {
    return get().categories.filter((category) => category.type === type)
  },
}))
