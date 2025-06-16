"use client"

import { useState } from "react"
import { useCategoryStore } from "../../store/categoryStore"
import { useLanguageStore } from "../../store/languageStore"
import CategoryCard from "./CategoryCard"
import QuickCategoryCreator from "./QuickCategoryCreator"
import Button from "../ui/Button"
import Modal from "../ui/Modal"
import CategoryForm from "./CategoryForm"
import { Plus, Grid, List } from "lucide-react"

const CategoryList = ({ type = "all" }) => {
  const { categories } = useCategoryStore()
  const { t } = useLanguageStore()
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState("grid") // "grid" or "list"

  // Filter categories by type if specified
  const filteredCategories = type === "all" ? categories : categories.filter((category) => category.type === type)

  const handleAddNew = () => {
    setShowModal(true)
  }

  const handleFormSuccess = () => {
    setShowModal(false)
    // Reload to get updated categories
    window.location.reload()
  }

  const getTitle = () => {
    switch (type) {
      case "expense":
        return t("categories.expenseCategories")
      case "income":
        return t("categories.incomeCategories")
      default:
        return t("categories.categories")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {getTitle()} ({filteredCategories.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý danh mục {type === "expense" ? "chi tiêu" : type === "income" ? "thu nhập" : "của bạn"}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white text-gray-500 hover:text-gray-700"
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list" ? "bg-blue-500 text-white" : "bg-white text-gray-500 hover:text-gray-700"
              }`}
            >
              <List size={16} />
            </button>
          </div>

          <Button onClick={handleAddNew} size="sm">
            <Plus size={16} className="mr-1" />
            {t("categories.addCategory")}
          </Button>
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {type === "expense"
              ? "Chưa có danh mục chi tiêu"
              : type === "income"
                ? "Chưa có danh mục thu nhập"
                : "Chưa có danh mục nào"}
          </h3>
          <p className="text-gray-500 mb-4">Tạo danh mục đầu tiên để bắt đầu phân loại giao dịch</p>
          <Button onClick={handleAddNew}>
            <Plus size={16} className="mr-2" />
            Tạo danh mục mới
          </Button>
        </div>
      ) : (
        <>
          {/* Categories Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
              {/* Quick Creator Card */}
              <QuickCategoryCreator
                type={type === "all" ? "expense" : type}
                onSuccess={() => window.location.reload()}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}

          {/* Statistics */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📊 Thống kê danh mục</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Tổng số:</span>
                <span className="ml-2 font-medium text-blue-900">{filteredCategories.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Mặc định:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {filteredCategories.filter((cat) => cat.isDefault).length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Tùy chỉnh:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {filteredCategories.filter((cat) => !cat.isDefault).length}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Có thể xóa:</span>
                <span className="ml-2 font-medium text-blue-900">
                  {filteredCategories.filter((cat) => !cat.isDefault).length}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Category Modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t("categories.addCategory")} size="lg">
          <CategoryForm onSuccess={handleFormSuccess} onCancel={() => setShowModal(false)} />
        </Modal>
      )}
    </div>
  )
}

export default CategoryList
