import { Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import MainLayout from "../components/layout/MainLayout"
import DashboardPage from "../pages/DashboardPage"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import NotFoundPage from "../pages/NotFoundPage"
import TransactionsPage from "../pages/TransactionsPage"
import AddTransactionPage from "../pages/AddTransactionPage"
import ReportsPage from "../pages/ReportsPage"
import SettingsPage from "../pages/SettingsPage"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { useLocation } from "react-router-dom"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading, isInitialized } = useAuthStore()
  const location = useLocation()

  // Show loading while auth is being determined
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
      </div>
    )
  }

  // If no user after initialization, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated, render children
  return children
}

// Public route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading, isInitialized } = useAuthStore()

  // Show loading while auth is being determined
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang kiểm tra trạng thái đăng nhập...</p>
        </div>
      </div>
    )
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />
  }

  // User is not logged in, show public page
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes - redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="transactions/add" element={<AddTransactionPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
