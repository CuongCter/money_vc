"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/authStore"
import { useCategoryStore } from "../../store/categoryStore"
import { addCategory, updateCategory } from "../../api/categoryService"
import Button from "../ui/Button"
import Input from "../ui/Input"

const AVAILABLE_ICONS = [
  "coffee",
  "car",
  "file-text",
  "shopping-bag",
  "film",
  "activity",
  "book",
  "home",
  "gift",
  "dollar-sign",
  "credit-card",
  "briefcase",
  "smartphone",
  "heart",
  "globe",
  "map-pin",
  "users",
  "zap",
  "plus-circle",
]

const CategoryForm = ({ category = null, onSuccess, onCancel }) => {
  const { user } = useAuthStore()
  const { addCategory: addToStore, updateCategory: updateInStore } = useCategoryStore()

  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    icon: "coffee",
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // If editing, populate form with category data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        type: category.type || "expense",
        icon: category.icon || "coffee",
      })
    }
  }, [category])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleIconSelect = (icon) => {
    setFormData((prev) => ({ ...prev, icon }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên danh mục")
      return
    }

    setIsLoading(true)

    try {
      if (category) {
        // Update existing category
        const { error } = await updateCategory(category.id, formData, user.uid)

        if (error) {
          setError(error)
          return
        }

        // Update in local store
        updateInStore(category.id, formData)
      } else {
        // Add new category
        const { id, error } = await addCategory(formData, user.uid)

        if (error) {
          setError(error)
          return
        }

        // Add to local store
        addToStore({ id, ...formData, userId: user.uid, isDefault: false })
      }

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6">
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Tên danh mục"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ví dụ: Ăn uống"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Loại</label>
          <div className="flex space-x-4 mt-1">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === "expense"}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Chi tiêu</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === "income"}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Thu nhập</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Biểu tượng</label>
          <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
            {AVAILABLE_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`p-2 rounded-md flex items-center justify-center ${
                  formData.icon === icon
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => handleIconSelect(icon)}
              >
                <span className="lucide lucide-{icon}"></span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : category ? "Cập nhật" : "Thêm"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CategoryForm
