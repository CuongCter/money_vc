"use client"

import { useState } from "react"
import { useAuthStore } from "../../store/authStore"
import { useCategoryStore } from "../../store/categoryStore"
import { useNotificationStore } from "../../store/notificationStore"
import { addCategory } from "../../api/categoryService"
import Button from "../ui/Button"
import LoadingSpinner from "../ui/LoadingSpinner"
import { Plus, X } from "lucide-react"

const QUICK_ICONS = ["coffee", "car", "shopping-bag", "film", "wallet", "gift"]

const QuickCategoryCreator = ({ type = "expense", onSuccess }) => {
  const { user } = useAuthStore()
  const { addCategory: addToStore } = useCategoryStore()
  const { showSuccess, showError } = useNotificationStore()

  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    icon: "coffee",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      showError("Vui lòng nhập tên danh mục")
      return
    }

    setIsLoading(true)
    try {
      const categoryData = {
        ...formData,
        type,
        name: formData.name.trim(),
      }

      const { id, error } = await addCategory(categoryData, user.uid)

      if (error) {
        showError(`Lỗi tạo danh mục: ${error}`)
        return
      }

      // Add to local store
      addToStore({ id, ...categoryData, userId: user.uid, isDefault: false })
      showSuccess(`Đã tạo danh mục "${formData.name}" thành công!`)

      // Reset form
      setFormData({ name: "", icon: "coffee" })
      setIsOpen(false)

      if (onSuccess) onSuccess()
    } catch (err) {
      showError("Không thể tạo danh mục")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
        <button onClick={() => setIsOpen(true)} className="w-full text-gray-500 hover:text-blue-600 transition-colors">
          <Plus size={24} className="mx-auto mb-2" />
          <span className="text-sm font-medium">Tạo danh mục mới</span>
        </button>
      </div>
    )
  }

  return (
    <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-blue-900">Tạo danh mục {type === "expense" ? "chi tiêu" : "thu nhập"}</h4>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Tên danh mục..."
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        <div className="flex space-x-2">
          {QUICK_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, icon }))}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-xs ${
                formData.icon === icon
                  ? "bg-blue-200 border-2 border-blue-500"
                  : "bg-white border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {icon.slice(0, 2)}
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)} className="flex-1">
            Hủy
          </Button>
          <Button type="submit" size="sm" disabled={isLoading} className="flex-1">
            {isLoading ? <LoadingSpinner size="sm" /> : "Tạo"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default QuickCategoryCreator
