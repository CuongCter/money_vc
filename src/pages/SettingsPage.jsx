"use client"

import { useState, useEffect } from "react"
import { useCategoryStore } from "../store/categoryStore"
import { useAuthStore } from "../store/authStore"
import { useLanguageStore } from "../store/languageStore"
import { useNotificationStore } from "../store/notificationStore"
import { getCategories } from "../api/categoryService"
import CategoryList from "../components/categories/CategoryList"
import EmptyCategoryState from "../components/categories/EmptyCategoryState"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { Globe, Tag, User, SettingsIcon } from "lucide-react"

const SettingsPage = () => {
  const { user } = useAuthStore()
  const { categories, setCategories } = useCategoryStore()
  const { t, language, setLanguage } = useLanguageStore()
  const { showError } = useNotificationStore()
  const [activeTab, setActiveTab] = useState("categories")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.uid) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const { categories: fetchedCategories, error } = await getCategories(user.uid)
        if (!error) {
          setCategories(fetchedCategories)
        } else {
          showError(`Lỗi tải danh mục: ${error}`)
        }
      } catch (err) {
        console.error("Error loading categories:", err)
        showError("Không thể tải danh mục")
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [user, setCategories, showError])

  const tabs = [
    {
      id: "categories",
      name: t("settings.categories"),
      icon: Tag,
      description: "Quản lý danh mục thu chi",
    },
    {
      id: "profile",
      name: t("settings.profile"),
      icon: User,
      description: "Thông tin tài khoản",
    },
    {
      id: "preferences",
      name: t("settings.preferences"),
      icon: SettingsIcon,
      description: "Tùy chọn ứng dụng",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Đang tải cài đặt...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("settings.settings")}</h1>
        <p className="text-gray-600 mt-1">Quản lý tài khoản và tùy chỉnh ứng dụng</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <IconComponent size={18} className="mr-2" />
                <div className="text-left">
                  <div>{tab.name}</div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-500">{tab.description}</div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "categories" && (
          <div className="space-y-8">
            {categories.length === 0 ? <EmptyCategoryState /> : <CategoryList type="all" />}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-6 flex items-center">
              <User size={20} className="mr-2" />
              {t("settings.profile")}
            </h2>

            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {user?.displayName || "Chưa có tên"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">📊 Thống kê tài khoản</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Danh mục:</span>
                    <span className="ml-2 font-medium text-blue-900">{categories.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Ngôn ngữ:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {language === "vi" ? "Tiếng Việt" : "English"}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Loại tài khoản:</span>
                    <span className="ml-2 font-medium text-blue-900">
                      {user?.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center text-gray-500">
                <p>{t("settings.comingSoon")}</p>
                <p className="text-sm mt-1">Chức năng chỉnh sửa hồ sơ sẽ được cập nhật sớm</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-6 flex items-center">
              <SettingsIcon size={20} className="mr-2" />
              {t("settings.preferences")}
            </h2>

            {/* Language Settings */}
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium mb-4 flex items-center">
                  <Globe size={18} className="mr-2" />
                  {t("settings.language")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setLanguage("vi")}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      language === "vi"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🇻🇳</span>
                      <div>
                        <div className="font-medium">Tiếng Việt</div>
                        <div className="text-sm text-gray-500">Vietnamese</div>
                      </div>
                      {language === "vi" && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setLanguage("en")}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      language === "en"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🇺🇸</span>
                      <div>
                        <div className="font-medium">English</div>
                        <div className="text-sm text-gray-500">Tiếng Anh</div>
                      </div>
                      {language === "en" && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Other Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium mb-4">Cài đặt khác</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Chế độ tối</div>
                      <div className="text-sm text-gray-500">Giao diện tối cho mắt</div>
                    </div>
                    <div className="text-gray-400">{t("settings.comingSoon")}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Thông báo</div>
                      <div className="text-sm text-gray-500">Nhận thông báo về giao dịch</div>
                    </div>
                    <div className="text-gray-400">{t("settings.comingSoon")}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Xuất dữ liệu</div>
                      <div className="text-sm text-gray-500">Tải xuống dữ liệu cá nhân</div>
                    </div>
                    <div className="text-gray-400">{t("settings.comingSoon")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
