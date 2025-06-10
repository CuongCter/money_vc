"use client"

import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { logout } from "../../api/authService"
import { Menu, Bell, User, LogOut, Search } from "lucide-react"

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { user, logout: logoutStore } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    logoutStore()
    navigate("/login")
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search transactions..."
              type="search"
            />
          </div>
        </div>

        <div className="flex items-center">
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none">
            <Bell size={20} />
          </button>

          <div className="ml-3 relative">
            <div className="flex items-center">
              <button className="flex items-center gap-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="hidden md:block text-sm font-medium text-gray-700">{user?.email || "User"}</span>
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                  <User size={16} />
                </div>
              </button>
            </div>

            <div className="hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
