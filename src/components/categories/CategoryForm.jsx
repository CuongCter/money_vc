"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/authStore"
import { useCategoryStore } from "../../store/categoryStore"
import { useNotificationStore } from "../../store/notificationStore"
import { addCategory, updateCategory } from "../../api/categoryService"
import Button from "../ui/Button"
import LoadingSpinner from "../ui/LoadingSpinner"
import { Tag, Palette } from "lucide-react"

const AVAILABLE_ICONS = [
  { key: "coffee", emoji: "☕", name: "Cà phê" },
  { key: "car", emoji: "🚗", name: "Xe cộ" },
  { key: "shopping-bag", emoji: "🛍️", name: "Mua sắm" },
  { key: "film", emoji: "🎬", name: "Giải trí" },
  { key: "wallet", emoji: "💼", name: "Ví tiền" },
  { key: "gift", emoji: "🎁", name: "Quà tặng" },
  { key: "file-text", emoji: "📄", name: "Hóa đơn" },
  { key: "activity", emoji: "🏥", name: "Y tế" },
  { key: "book", emoji: "📚", name: "Giáo dục" },
  { key: "trending-up", emoji: "📈", name: "Đầu tư" },
  { key: "home", emoji: "🏠", name: "Nhà cửa" },
  { key: "heart", emoji: "❤️", name: "Sức khỏe" },
  { key: "smartphone", emoji: "📱", name: "Điện thoại" },
  { key: "briefcase", emoji: "💼", name: "Công việc" },
  { key: "credit-card", emoji: "💳", name: "Thẻ tín dụng" },
  { key: "dollar-sign", emoji: "💰", name: "Tiền mặt" },
  { key: "globe", emoji: "🌍", name: "Du lịch" },
  { key: "map-pin", emoji: "📍", name: "Địa điểm" },
  { key: "users", emoji: "👥", name: "Gia đình" },
  { key: "zap", emoji: "⚡", name: "Điện nước" },
  { key: "plus-circle", emoji: "➕", name: "Khác" },
]

const CategoryForm = ({ category = null, onSuccess, onCancel }) => {
  const { user } = useAuthStore()
  const { addCategory: addToStore, updateCategory: updateInStore } = useCategoryStore()
  const { showError, showSuccess } = useNotificationStore()

  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    icon: null, // Bắt đầu với null thay vì "coffee"
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // If editing, populate form with category data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        type: category.type || "expense",
        icon: category.icon || null, // Có thể là null
      })
    }
  }, [category])

  const validateForm = () => {
    const newErrors = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục là bắt buộc"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên danh mục phải có ít nhất 2 ký tự"
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Tên danh mục không được quá 50 ký tự"
    }

    // Validate type
    if (!["income", "expense"].includes(formData.type)) {
      newErrors.type = "Vui lòng chọn loại danh mục"
    }

    // Icon is optional - no validation needed

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleIconSelect = (iconKey) => {
    setFormData((prev) => ({
      ...prev,
      icon: prev.icon === iconKey ? null : iconKey, // Toggle: nếu đã chọn thì bỏ chọn
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showError("Vui lòng kiểm tra lại thông tin")
      return
    }

    // Check if user can edit this category
    if (category && category.isDefault) {
      showError("Không thể chỉnh sửa danh mục mặc định")
      return
    }

    setIsLoading(true)

    try {
      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        // Icon will be included even if it's the default one
      }

      if (category) {
        // Update existing category
        const { error } = await updateCategory(category.id, categoryData, user.uid)

        if (error) {
          showError(`Lỗi cập nhật danh mục: ${error}`)
          return
        }

        // Update in local store
        updateInStore(category.id, { ...categoryData, id: category.id })
        showSuccess("Đã cập nhật danh mục thành công!")
      } else {
        // Add new category
        const { id, error } = await addCategory(categoryData, user.uid)

        if (error) {
          showError(`Lỗi tạo danh mục: ${error}`)
          return
        }

        // Add to local store
        addToStore({ id, ...categoryData, userId: user.uid, isDefault: false })
        showSuccess("Đã tạo danh mục thành công!")
      }

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Category form error:", err)
      showError("Đã xảy ra lỗi không mong muốn")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  // Error boundary fallback
  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">Lỗi: Không tìm thấy thông tin người dùng</p>
        <Button onClick={handleCancel} variant="outline" className="mt-2">
          Đóng
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            <Tag size={16} className="inline mr-1" />
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="VD: Ăn uống, Lương, Đầu tư..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            disabled={category?.isDefault}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          {category?.isDefault && <p className="text-sm text-amber-600">Không thể chỉnh sửa tên danh mục mặc định</p>}
        </div>

        {/* Category Type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Loại danh mục <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === "expense"}
                onChange={handleChange}
                disabled={category?.isDefault}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Chi tiêu
              </span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === "income"}
                onChange={handleChange}
                disabled={category?.isDefault}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Thu nhập
              </span>
            </label>
          </div>
          {category?.isDefault && <p className="text-sm text-amber-600">Không thể thay đổi loại danh mục mặc định</p>}
        </div>

        {/* Icon Selection - Now Optional */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Palette size={16} className="inline mr-1" />
            Biểu tượng <span className="text-gray-400 text-xs">(tùy chọn)</span>
          </label>
          <div className="grid grid-cols-6 gap-2 md:grid-cols-8 lg:grid-cols-10">
            {AVAILABLE_ICONS.map((icon) => (
              <button
                key={icon.key}
                type="button"
                title={icon.name}
                className={`p-3 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-105 ${
                  formData.icon === icon.key
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handleIconSelect(icon.key)}
              >
                <span className="text-xl">{icon.emoji}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Chọn biểu tượng để dễ nhận diện danh mục. Click lại để bỏ chọn (không bắt buộc)
          </p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Xem trước:</h4>
          <div
            className={`inline-flex items-center px-3 py-2 rounded-lg border ${
              formData.type === "income"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {formData.icon && (
              <span className="text-lg mr-2">{AVAILABLE_ICONS.find((icon) => icon.key === formData.icon)?.emoji}</span>
            )}
            <span className="font-medium">{formData.name || "Tên danh mục"}</span>
            <span
              className={`ml-2 text-xs px-2 py-1 rounded-full ${
                formData.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {formData.type === "income" ? "Thu nhập" : "Chi tiêu"}
            </span>
          </div>
          {!formData.icon && <p className="text-xs text-gray-500 mt-2">Không có biểu tượng được chọn</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} className="min-w-[100px]">
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {category ? "Đang cập nhật..." : "Đang tạo..."}
              </div>
            ) : category ? (
              "Cập nhật"
            ) : (
              "Tạo mới"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CategoryForm
