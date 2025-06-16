"use client"

import { useState, useEffect } from "react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import FormField from "../ui/FormField"
import { useCategoryStore } from "../../store/categoryStore"
import { getCategories } from "../../api/categoryService"
import { useAuth } from "../../hooks/useAuth"
import { formatCurrency } from "../../utils/formatDate"
import {
  ShoppingBag,
  Gift,
  Film,
  Car,
  Home,
  PlusCircle,
  TrendingUp,
  Coffee,
  FileText,
  MoreHorizontal,
  Wallet,
  Activity,
  Heart,
  Gamepad2,
  Plane,
  GraduationCap,
  Stethoscope,
  Shirt,
  Fuel,
  Phone,
} from "lucide-react"

// Icon mapping
const iconMap = {
  "shopping-bag": ShoppingBag,
  gift: Gift,
  film: Film,
  car: Car,
  home: Home,
  "plus-circle": PlusCircle,
  "trending-up": TrendingUp,
  coffee: Coffee,
  "file-text": FileText,
  "more-horizontal": MoreHorizontal,
  wallet: Wallet,
  activity: Activity,
  heart: Heart,
  "gamepad-2": Gamepad2,
  plane: Plane,
  "graduation-cap": GraduationCap,
  stethoscope: Stethoscope,
  shirt: Shirt,
  fuel: Fuel,
  phone: Phone,
}

const BudgetForm = ({ budget, onSubmit, onCancel }) => {
  const { user } = useAuth()
  const { categories, setCategories } = useCategoryStore()
  const [formData, setFormData] = useState({
    categoryId: "",
    categoryName: "",
    amount: "",
    period: "monthly",
    startDate: "",
    endDate: "",
    description: "",
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.uid) return

      try {
        const { categories: categoriesData, error } = await getCategories(user.uid)
        if (!error && categoriesData) {
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }

    loadCategories()
  }, [user?.uid, setCategories])

  useEffect(() => {
    if (budget) {
      setFormData({
        categoryId: budget.categoryId || "",
        categoryName: budget.categoryName || "",
        amount: budget.amount?.toString() || "",
        period: budget.period || "monthly",
        startDate: budget.startDate ? new Date(budget.startDate).toISOString().split("T")[0] : "",
        endDate: budget.endDate ? new Date(budget.endDate).toISOString().split("T")[0] : "",
        description: budget.description || "",
      })
    } else {
      // Set default dates for new budget
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      setFormData((prev) => ({
        ...prev,
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: endOfMonth.toISOString().split("T")[0],
      }))
    }
  }, [budget])

  const handleCategoryChange = (categoryId) => {
    const selectedCategory = categories.find((cat) => cat.id === categoryId)
    setFormData((prev) => ({
      ...prev,
      categoryId,
      categoryName: selectedCategory?.name || "",
    }))
  }

  const handlePeriodChange = (period) => {
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()))
        endDate = new Date(now.setDate(startDate.getDate() + 6))
        break
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        return
    }

    setFormData((prev) => ({
      ...prev,
      period,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục"
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Vui lòng nhập số tiền hợp lệ"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn ngày bắt đầu"
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn ngày kết thúc"
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const budgetData = {
        ...formData,
        amount: Number.parseFloat(formData.amount),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      }

      await onSubmit(budgetData)
    } catch (error) {
      console.error("Error submitting budget:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection */}
      <FormField label="Danh mục" error={errors.categoryId}>
        <select
          value={formData.categoryId}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Selected category preview */}
        {formData.categoryId && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
            {(() => {
              const selectedCategory = categories.find((cat) => cat.id === formData.categoryId)
              const IconComponent = iconMap[selectedCategory?.icon] || MoreHorizontal
              return (
                <>
                  <IconComponent size={16} />
                  <span>Đã chọn: {selectedCategory?.name}</span>
                </>
              )
            })()}
          </div>
        )}
      </FormField>

      {/* Budget Amount */}
      <FormField label="Số tiền ngân sách" error={errors.amount}>
        <Input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="0"
          min="0"
          step="1000"
        />
        {formData.amount && (
          <p className="text-sm text-gray-500 mt-1">{formatCurrency(Number.parseFloat(formData.amount) || 0)}</p>
        )}
      </FormField>

      {/* Period */}
      <FormField label="Chu kỳ">
        <select
          value={formData.period}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="weekly">Hàng tuần</option>
          <option value="monthly">Hàng tháng</option>
          <option value="yearly">Hàng năm</option>
        </select>
      </FormField>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Ngày bắt đầu" error={errors.startDate}>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </FormField>

        <FormField label="Ngày kết thúc" error={errors.endDate}>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
          />
        </FormField>
      </div>

      {/* Description */}
      <FormField label="Ghi chú (tùy chọn)">
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Mô tả về ngân sách này..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </FormField>

      {/* Actions */}
      <div className="flex space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Hủy
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Đang lưu..." : budget ? "Cập nhật" : "Tạo ngân sách"}
        </Button>
      </div>
    </form>
  )
}

export default BudgetForm
