"use client"

import { NavLink } from "react-router-dom"
import { Home, CreditCard, BarChart2, Settings, X } from "lucide-react"
import { useLanguageStore } from "../../store/languageStore"

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useLanguageStore()

  const navItems = [
    { name: t("navigation.dashboard"), path: "/", icon: Home },
    { name: t("navigation.transactions"), path: "/transactions", icon: CreditCard },
    { name: t("navigation.reports"), path: "/reports", icon: BarChart2 },
    { name: t("navigation.settings"), path: "/settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary-600">{t("app.name")}</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : "sidebar-nav-item-inactive"}`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
