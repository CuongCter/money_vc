import { create } from "zustand"
import { persist } from "zustand/middleware"
import { createDefaultCategories } from "../api/categoryService"

export const useAuthStore = create(
  persist(
    (set, get) => ({
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

          set({ user, error: null, loading: false })
        } else {
          set({ user: null, loading: false })
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      logout: () => set({ user: null, error: null, loading: false }),

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
    }),
    {
      name: "auth-storage", // unique name for localStorage key
      partialize: (state) => ({ user: state.user }), // only persist user data
    },
  ),
)
