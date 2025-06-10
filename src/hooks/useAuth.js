"use client"

import { useEffect } from "react"
import { useAuthStore } from "../store/authStore"
import { onAuthStateChanged } from "../api/authService"

export const useAuth = () => {
  const { user, loading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  return { user, loading }
}
