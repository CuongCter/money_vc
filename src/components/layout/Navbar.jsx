"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { logout } from "../../api/authService"
import { Menu, Bell, User, LogOut, Search } from "lucide-react"

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { user, logout: logoutStore } = useAuthStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    try {
      await logout()
      logoutStore()
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Close dropdown when pressing Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>

          <div className="ml-4 md:ml-6">
            <h1 className="text-lg font-semibold text-gray-900">My Expense App</h1>
          </div>
        </div>

        <div className="hidden md:block flex-1 px-4 mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Tìm kiếm giao dịch..."
              type="search"
            />
          </div>
        </div>

        <div className="flex items-center">
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          <div className="ml-3 relative" ref={dropdownRef}>
            <div className="flex items-center">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-1"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.displayName || user?.email || "User"}
                </span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  {user?.displayName ? (
                    <span className="text-sm font-medium">{user.displayName.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User size={16} />
                  )}
                </div>
              </button>
            </div>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                  <div className="font-medium text-gray-900">{user?.displayName || "User"}</div>
                  <div className="text-xs">{user?.email}</div>
                </div>

                <button
                  onClick={() => {
                    setShowDropdown(false)
                    navigate("/settings")
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <User size={16} />
                  Cài đặt tài khoản
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
