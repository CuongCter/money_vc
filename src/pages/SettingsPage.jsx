"use client"

import { useState } from "react"
import CategoryList from "../components/categories/CategoryList"
import { useLanguageStore } from "../store/languageStore"
import { Globe } from "lucide-react"

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguageStore()
  const [activeTab, setActiveTab] = useState("categories")

  const tabs = [
    { id: "categories", name: t("settings.categories") },
    { id: "profile", name: t("settings.profile") },
    { id: "preferences", name: t("settings.preferences") },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t("settings.settings")}</h1>

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
            <p className="text-gray-500">{t("settings.comingSoon")}</p>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium mb-4">{t("settings.preferences")}</h2>

            {/* Language Settings */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3 flex items-center">
                <Globe size={18} className="mr-2" />
                {t("settings.language")}
              </h3>

              <div className="flex space-x-4">
                <button
                  onClick={() => setLanguage("vi")}
                  className={`px-4 py-2 rounded-md ${
                    language === "vi"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {t("settings.vietnamese")}
                </button>

                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded-md ${
                    language === "en"
                      ? "bg-blue-100 text-blue-700 border border-blue-300"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {t("settings.english")}
                </button>
              </div>
            </div>

            {/* Other preferences can be added here */}
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
