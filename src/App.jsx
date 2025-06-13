"use client"

import { BrowserRouter as Router } from "react-router-dom"

import { useAuthStore } from "./store/authStore"
import { useEffect, useState } from "react"
import { onAuthStateChanged, auth } from "./api/authService"
import NotificationContainer from "./components/ui/Notification"
import LoadingSpinner from "./components/ui/LoadingSpinner"
import { useNotificationStore } from "./store/notificationStore"
import AppRoutes from "./routes"

// Debug component to show auth state
const AuthDebugger = () => {
  const { user, loading, isInitialized } = useAuthStore()

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded text-xs z-50">
      <div>Loading: {loading ? "true" : "false"}</div>
      <div>Initialized: {isInitialized ? "true" : "false"}</div>
      <div>User: {user ? user.email : "null"}</div>
      <div>UID: {user?.uid || "null"}</div>
      <div>Firebase User: {auth.currentUser ? auth.currentUser.email : "null"}</div>
    </div>
  )
}

function App() {
  const { setUser, setLoading, setInitialized, isInitialized } = useAuthStore()
  const { showError } = useNotificationStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Debug auth state
  useEffect(() => {
    console.log("🔍 Auth Debug:", {
      isInitialized,
      isCheckingAuth,
      currentUser: auth.currentUser?.email,
      timestamp: new Date().toISOString(),
    })
  }, [isInitialized, isCheckingAuth])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...")

        // Check if we already have a user in Firebase auth
        if (auth.currentUser && mounted) {
          console.log("✅ Current user found:", auth.currentUser.email)
          setUser(auth.currentUser)
          setInitialized(true)
          setIsCheckingAuth(false)
          return
        }

        // Then set up the auth state listener
        const unsubscribe = onAuthStateChanged((user) => {
          if (mounted) {
            console.log("🔄 Auth state changed:", user?.email || "No user")
            setUser(user)
            setInitialized(true)
            setIsCheckingAuth(false)
          }
        })

        // Set a timeout to prevent hanging if auth doesn't respond
        setTimeout(() => {
          if (mounted && isCheckingAuth) {
            console.log("⏱️ Auth initialization timeout - forcing completion")
            setInitialized(true)
            setIsCheckingAuth(false)
          }
        }, 3000)

        return unsubscribe
      } catch (error) {
        console.error("❌ Auth initialization error:", error)
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
      {process.env.NODE_ENV !== "production" && <AuthDebugger />}
    </Router>
  )
}

export default App
