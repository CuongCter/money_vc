"use client"

import { BrowserRouter as Router } from "react-router-dom"
import AppRoutes from "./routes"
import { useAuthStore } from "./store/authStore"
import { useEffect, useState } from "react"
import { onAuthStateChanged, auth } from "./api/authService"
import NotificationContainer from "./components/ui/Notification"
import LoadingSpinner from "./components/ui/LoadingSpinner"
import { useNotificationStore } from "./store/notificationStore"

function App() {
  const { setUser, setLoading, setInitialized } = useAuthStore()
  const { showError } = useNotificationStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Check if we already have a user in Firebase auth
        if (auth.currentUser && mounted) {
          setUser(auth.currentUser)
          setInitialized(true)
          setIsCheckingAuth(false)
          return
        }

        // Then set up the auth state listener
        const unsubscribe = onAuthStateChanged((user) => {
          if (mounted) {
            setUser(user)
            setInitialized(true)
            setIsCheckingAuth(false)
          }
        })

        // Set a timeout to prevent hanging if auth doesn't respond
        setTimeout(() => {
          if (mounted && isCheckingAuth) {
            setInitialized(true)
            setIsCheckingAuth(false)
          }
        }, 3000)

        return unsubscribe
      } catch (error) {
        if (mounted) {
          showError("Lỗi khởi tạo xác thực: " + error.message)
          setLoading(false)
          setInitialized(true)
          setIsCheckingAuth(false)
        }
      }
    }

    const cleanup = initializeAuth()

    return () => {
      mounted = false
      if (cleanup && typeof cleanup.then === "function") {
        cleanup.then((unsubscribe) => {
          if (unsubscribe && typeof unsubscribe === "function") {
            unsubscribe()
          }
        })
      } else if (cleanup && typeof cleanup === "function") {
        cleanup()
      }
    }
  }, [setUser, setLoading, setInitialized, showError, isCheckingAuth])

  // Show loading screen while checking auth state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang khởi tạo ứng dụng...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <AppRoutes />
      <NotificationContainer />
    </Router>
  )
}

export default App
