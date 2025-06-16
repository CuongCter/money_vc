"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/authStore"
import { useCategoryStore } from "../../store/categoryStore"
import { useNotificationStore } from "../../store/notificationStore"
import { useLanguageStore } from "../../store/languageStore"
import { addCategory, updateCategory } from "../../api/categoryService"
import Button from "../ui/Button"
import LoadingSpinner from "../ui/LoadingSpinner"
import { Tag, Palette } from "lucide-react"

const AVAILABLE_ICONS = [
  { key: "coffee", emoji: "☕" },
  { key: "car", emoji: "🚗" },
  { key: "shopping-bag", emoji: "🛍️" },
  { key: "film", emoji: "🎬" },
  { key: "wallet", emoji: "💼" },
  { key: "gift", emoji: "🎁" },
  { key: "file-text", emoji: "📄" },
  { key: "activity", emoji: "🏥" },
  { key: "book", emoji: "📚" },
  { key: "trending-up", emoji: "📈" },
  { key: "home", emoji: "🏠" },
  { key: "heart", emoji: "❤️" },
  { key: "smartphone", emoji: "📱" },
  { key: "briefcase", emoji: "💼" },
  { key: "credit-card", emoji: "💳" },
  { key: "dollar-sign", emoji: "💰" },
  { key: "globe", emoji: "🌍" },
  { key: "map-pin", emoji: "📍" },
  { key: "users", emoji: "👥" },
  { key: "zap", emoji: "⚡" },
  { key: "plus-circle", emoji: "➕" },
]

const CategoryForm = ({ category = null, onSuccess, onCancel }) => {
  const { user } = useAuthStore()
  const { addCategory: addToStore, updateCategory: updateInStore } = useCategoryStore()
  const { showError, showSuccess } = useNotificationStore()
  const { t } = useLanguageStore()

  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    icon: null,
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // If editing, populate form with category data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        type: category.type || "expense",
        icon: category.icon || null,
      })
    }
  }, [category])

  const validateForm = () => {
    const newErrors = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = t("errors.nameRequired")
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("errors.nameTooShort")
    } else if (formData.name.trim().length > 50) {
      newErrors.name = t("errors.nameTooLong")
    }

    // Validate type
    if (!["income", "expense"].includes(formData.type)) {
      newErrors.type = t("errors.typeRequired")
    }

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
      icon: prev.icon === iconKey ? null : iconKey,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showError(t("errors.unexpectedError"))
      return
    }

    // Check if user can edit this category
    if (category && category.isDefault) {
      showError(t("categories.cannotEditDefault"))
      return
    }

    setIsLoading(true)

    try {
      const categoryData = {
        ...formData,
        name: formData.name.trim(),
      }

      if (category) {
        // Update existing category
        const { error } = await updateCategory(category.id, categoryData, user.uid)

        if (error) {
          showError(`${t("common.error")}: ${error}`)
          return
        }

        // Update in local store
        updateInStore(category.id, { ...categoryData, id: category.id })
        showSuccess(t("success.categoryUpdated"))
      } else {
        // Add new category
        const { id, error } = await addCategory(categoryData, user.uid)

        if (error) {
          showError(`${t("common.error")}: ${error}`)
          return
        }

        // Add to local store
        addToStore({ id, ...categoryData, userId: user.uid, isDefault: false })
        showSuccess(t("success.categoryAdded"))
      }

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Category form error:", err)
      showError(t("errors.unexpectedError"))
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
        <p className="text-red-600">{t("errors.unexpectedError")}</p>
        <Button onClick={handleCancel} variant="outline" className="mt-2">
          {t("common.close")}
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
            {t("categories.name")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("categories.enterCategoryName")}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            disabled={category?.isDefault}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          {category?.isDefault && <p className="text-sm text-amber-600">{t("categories.cannotEditDefault")}</p>}
        </div>

        {/* Category Type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {t("categories.categoryType")} <span className="text-red-500">*</span>
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
                {t("transactions.expense")}
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
                {t("transactions.income")}
              </span>
            </label>
          </div>
          {category?.isDefault && <p className="text-sm text-amber-600">{t("categories.cannotEditDefault")}</p>}
        </div>

        {/* Icon Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Palette size={16} className="inline mr-1" />
            {t("categories.icon")} <span className="text-gray-400 text-xs">({t("common.optional")})</span>
          </label>
          <div className="grid grid-cols-6 gap-2 md:grid-cols-8 lg:grid-cols-10">
            {AVAILABLE_ICONS.map((icon) => (
              <button
                key={icon.key}
                type="button"
                title={t(`icons.${icon.key}`)}
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
          <p className="text-xs text-gray-500">{t("categories.iconOptional")}</p>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">{t("categories.preview")}</h4>
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
            <span className="font-medium">{formData.name || t("categories.name")}</span>
            <span
              className={`ml-2 text-xs px-2 py-1 rounded-full ${
                formData.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {formData.type === "income" ? t("transactions.income") : t("transactions.expense")}
            </span>
          </div>
          {!formData.icon && <p className="text-xs text-gray-500 mt-2">{t("categories.noIconSelected")}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} className="min-w-[100px]">
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {category ? t("form.saving") : t("form.processing")}
              </div>
            ) : category ? (
              t("common.update")
            ) : (
              t("common.create")
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CategoryForm
