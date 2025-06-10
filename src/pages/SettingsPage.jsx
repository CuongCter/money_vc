"use client"

import { useState } from "react"
import CategoryList from "../components/categories/CategoryList"

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("categories")

  const tabs = [
    { id: "categories", name: "Danh mục" },
    { id: "profile", name: "Hồ sơ" },
    { id: "preferences", name: "Tùy chọn" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "categories" && (
          <div className="space-y-8">
            <CategoryList type="expense" />
            <CategoryList type="income" />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Tính năng quản lý hồ sơ sẽ được cập nhật sớm...</p>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Tính năng tùy chọn sẽ được cập nhật sớm...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
