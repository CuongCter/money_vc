import { create } from "zustand"
import { createDefaultCategories } from "../api/categoryService"

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  setUser: async (user) => {
    if (user) {
      // Check if this is a new user and create default categories
      const currentUser = get().user
      const isNewUser = !currentUser && user.metadata?.creationTime === user.metadata?.lastSignInTime

      if (isNewUser) {
        try {
          await createDefaultCategories(user.uid)
        } catch (error) {
          console.error("Error creating default categories:", error)
        }
      }

      set({ user, error: null })
    } else {
      set({ user: null })
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  logout: () => set({ user: null, error: null }),

  // Helper methods
  isAuthenticated: () => !!get().user,
  getUserId: () => get().user?.uid,
  getUserEmail: () => get().user?.email,
  getUserDisplayName: () => get().user?.displayName,
  getUserPhotoURL: () => get().user?.photoURL,

  // Check if user signed in with Google
  isGoogleUser: () => {
    const user = get().user
    return user?.providerData?.some((provider) => provider.providerId === "google.com") || false
  },
}))
