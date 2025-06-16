"use client"

import { useState, useEffect } from "react"
import { useCategoryStore } from "../store/categoryStore"
import { useAuthStore } from "../store/authStore"
import { useLanguageStore } from "../store/languageStore"
import { getCategories } from "../api/categoryService"
import EmptyCategoryState from "../components/categories/EmptyCategoryState"
import QuickCategoryCreator from "../components/categories/QuickCategoryCreator"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { Globe } from "lucide-react"

const SettingsPage = () => {
  const { user } = useAuthStore()
  const { categories, setCategories } = useCategoryStore()
  const { t, language, setLanguage } = useLanguageStore()
  const [activeTab, setActiveTab] = useState("categories")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      try {
        const { categories: fetchedCategories, error } = await getCategories(user.uid)
        if (!error) {
          setCategories(fetchedCategories)
        }
      } catch (err) {
        console.error("Error loading categories:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [user, setCategories])

  const tabs = [
    { id: "categories", name: t("settings.categories") },
    { id: "profile", name: t("settings.profile") },
    { id: "preferences", name: t("settings.preferences") },
  ]

  const expenseCategories = categories.filter((cat) => cat.type === "expense")
  const incomeCategories = categories.filter((cat) => cat.type === "income")

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

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
            {categories.length === 0 ? (
              <EmptyCategoryState />
            ) : (
              <>
                {/* Expense Categories */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-red-700">
                      {t("categories.expenseCategories")} ({expenseCategories.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {expenseCategories.map((category) => (
                      <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-red-600 text-xs">{category.icon?.slice(0, 2) || "📝"}</span>
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          {category.isDefault && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {t("categories.default")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <QuickCategoryCreator type="expense" onSuccess={() => window.location.reload()} />
                  </div>
                </div>

                {/* Income Categories */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-green-700">
                      {t("categories.incomeCategories")} ({incomeCategories.length})
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {incomeCategories.map((category) => (
                      <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-green-600 text-xs">{category.icon?.slice(0, 2) || "💰"}</span>
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          {category.isDefault && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {t("categories.default")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <QuickCategoryCreator type="income" onSuccess={() => window.location.reload()} />
                  </div>
                </div>
              </>
            )}
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
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
