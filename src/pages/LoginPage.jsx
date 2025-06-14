"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useNotificationStore } from "../store/notificationStore"
import { useLanguageStore } from "../store/languageStore"
import { login } from "../api/authService"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import GoogleSignInButton from "../components/ui/GoogleSignInButton"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { setUser, user, isInitialized } = useAuthStore()
  const { showSuccess, showError } = useNotificationStore()
  const { t } = useLanguageStore()

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/"

  // Redirect if already logged in
  useEffect(() => {
    if (isInitialized && user) {
      navigate(from, { replace: true })
    }
  }, [user, isInitialized, navigate, from])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { user, error } = await login(email, password)

      if (error) {
        setError(error)
        showError(error)
        return
      }

      if (user) {
        setUser(user)
        showSuccess(t("success.loginSuccess"), `${t("success.welcome")} ${user.displayName || user.email}!`)
        navigate(from, { replace: true })
      }
    } catch (err) {
      const errorMsg = t("errors.unexpectedError")
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = (user, isNewUser) => {
    setError("") // Clear any existing errors
    setUser(user)
    showSuccess(
      isNewUser ? t("success.registerSuccess") : t("success.loginSuccess"),
      `${t("success.welcome")} ${user.displayName || user.email}!`,
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t("auth.loginToAccount")}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("auth.dontHaveAccount")}{" "}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              {t("auth.createAccount")}
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

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
              <span className="px-2 bg-gray-50 text-gray-500">{t("auth.loginWithEmail")}</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                label={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email")}
              />

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                label={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {t("auth.rememberMe")}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  {t("auth.forgotPassword")}
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? t("auth.loggingIn") : t("auth.login")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
