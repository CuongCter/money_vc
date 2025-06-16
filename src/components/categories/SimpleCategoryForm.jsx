"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/authStore"
import { useCategoryStore } from "../../store/categoryStore"
import { useNotificationStore } from "../../store/notificationStore"
import { updateCategory } from "../../api/categoryService"
import Button from "../ui/Button"
import LoadingSpinner from "../ui/LoadingSpinner"

const ICONS = [
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
]

const SimpleCategoryForm = ({ category, onSuccess, onCancel }) => {
  console.log("SimpleCategoryForm render - category:", category)

  const { user } = useAuthStore()
  const { updateCategory: updateInStore } = useCategoryStore()
  const { showError, showSuccess } = useNotificationStore()

  const [name, setName] = useState("")
  const [icon, setIcon] = useState("coffee")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log("SimpleCategoryForm useEffect - category:", category)
    if (category) {
      setName(category.name || "")
      setIcon(category.icon || "coffee")
    }
  }, [category])

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Form submit - name:", name, "icon:", icon)

    if (!name.trim()) {
      showError("Vui lòng nhập tên danh mục")
      return
    }

    if (category?.isDefault) {
      showError("Không thể sửa danh mục mặc định")
      return
    }

    setIsLoading(true)

    try {
      const categoryData = {
        name: name.trim(),
        icon: icon,
        type: category.type,
      }

      console.log("Updating category with data:", categoryData)
      const { error } = await updateCategory(category.id, categoryData, user.uid)

      if (error) {
        console.error("Update error:", error)
        showError(`Lỗi: ${error}`)
        return
      }

      console.log("Update successful")
      updateInStore(category.id, { ...categoryData, id: category.id })
      showSuccess("Cập nhật thành công!")

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Update exception:", err)
      showError("Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  if (!category || !user) {
    console.log("No category or user, showing error")
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p style={{ color: "#dc2626" }}>Lỗi: Không tìm thấy thông tin</p>
        <Button onClick={onCancel} style={{ marginTop: "10px" }}>
          Đóng
        </Button>
      </div>
    )
  }

  console.log("Rendering form with name:", name, "icon:", icon)

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Name Input */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Tên danh mục *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              console.log("Name changed:", e.target.value)
              setName(e.target.value)
            }}
            placeholder="Nhập tên danh mục..."
            disabled={category?.isDefault}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          {category?.isDefault && (
            <p style={{ fontSize: "12px", color: "#f59e0b", marginTop: "4px" }}>Không thể sửa tên danh mục mặc định</p>
          )}
        </div>

        {/* Icon Selection */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Biểu tượng *
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
            }}
          >
            {ICONS.map((iconItem) => (
              <button
                key={iconItem.key}
                type="button"
                onClick={() => {
                  console.log("Icon selected:", iconItem.key)
                  setIcon(iconItem.key)
                }}
                style={{
                  padding: "12px",
                  border: icon === iconItem.key ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: icon === iconItem.key ? "#eff6ff" : "white",
                  cursor: "pointer",
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {iconItem.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
          }}
        >
          <p style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px" }}>Xem trước:</p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "8px 12px",
              backgroundColor: category.type === "income" ? "#dcfce7" : "#fee2e2",
              border: `1px solid ${category.type === "income" ? "#bbf7d0" : "#fecaca"}`,
              borderRadius: "6px",
              color: category.type === "income" ? "#166534" : "#991b1b",
            }}
          >
            <span style={{ fontSize: "18px", marginRight: "8px" }}>
              {ICONS.find((i) => i.key === icon)?.emoji || "📝"}
            </span>
            <span style={{ fontWeight: "500" }}>{name || "Tên danh mục"}</span>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            paddingTop: "16px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              console.log("Cancel clicked")
              onCancel()
            }}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading} style={{ minWidth: "100px" }}>
            {isLoading ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <LoadingSpinner size="sm" style={{ marginRight: "8px" }} />
                Đang lưu...
              </div>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SimpleCategoryForm
