"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useNotificationStore } from "../store/notificationStore"
import { register } from "../api/authService"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import GoogleSignInButton from "../components/ui/GoogleSignInButton"

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, user, isInitialized } = useAuthStore()
  const { showSuccess, showError } = useNotificationStore()

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/"

  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && user) {
      navigate(from, { replace: true })
    }
  }, [user, isInitialized, navigate, from])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = "Mật khẩu xác nhận không khớp"
      setError(errorMsg)
      showError(errorMsg)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      const errorMsg = "Mật khẩu phải có ít nhất 6 ký tự"
      setError(errorMsg)
      showError(errorMsg)
      return
    }

    // Validate display name
    if (!formData.displayName.trim()) {
      const errorMsg = "Vui lòng nhập tên hiển thị"
      setError(errorMsg)
      showError(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const { user, error } = await register(formData.email, formData.password, formData.displayName)

      if (error) {
        setError(error)
        showError(error)
        return
      }

      setUser(user)
      showSuccess("Tài khoản đã được tạo thành công!", `Chào mừng ${user.displayName}!`)
      navigate(from, { replace: true })
    } catch (err) {
      const errorMsg = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = (user, isNewUser) => {
    setUser(user)
    showSuccess(
      isNewUser ? "Tài khoản đã được tạo thành công!" : "Đăng nhập thành công!",
      `Chào mừng ${user.displayName || user.email}!`,
    )
    navigate(from, { replace: true })
  }

  const handleGoogleError = (error) => {
    setError(error)
    showError(error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Tạo tài khoản mới</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hoặc{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              đăng nhập vào tài khoản có sẵn
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

          {/* Google Sign In Button */}
          <div>
            <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} variant="outline" />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Hoặc đăng ký bằng email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                label="Tên hiển thị"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
              />

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                label="Địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
              />

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                label="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              />

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                label="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                Tôi đồng ý với{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            <div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
