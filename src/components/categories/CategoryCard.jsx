"use client"

import { useState, useRef, useEffect } from "react"
import { useCategoryStore } from "../../store/categoryStore"
import { useNotificationStore } from "../../store/notificationStore"
import { deleteCategory } from "../../api/categoryService"
import { Edit, Trash2, MoreVertical } from "lucide-react"
import Button from "../ui/Button"
import Modal from "../ui/Modal"
import CategoryForm from "./CategoryForm"

const ICON_EMOJI_MAP = {
  coffee: "☕",
  car: "🚗",
  "shopping-bag": "🛍️",
  film: "🎬",
  wallet: "💼",
  gift: "🎁",
  "file-text": "📄",
  activity: "🏥",
  book: "📚",
  "trending-up": "📈",
  "plus-circle": "➕",
  "more-horizontal": "➕",
  home: "🏠",
  heart: "❤️",
  smartphone: "📱",
  briefcase: "💼",
  "credit-card": "💳",
  "dollar-sign": "💰",
  globe: "🌍",
  "map-pin": "📍",
  users: "👥",
  zap: "⚡",
}

const CategoryCard = ({ category, showActions = true }) => {
  const { deleteCategory: removeCategory } = useCategoryStore()
  const { showSuccess, showError } = useNotificationStore()

  const [showDropdown, setShowDropdown] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  const handleEdit = () => {
    setShowDropdown(false)
    setShowEditModal(true)
  }

  const handleDelete = () => {
    setShowDropdown(false)
    if (category.isDefault) {
      showError("Không thể xóa danh mục mặc định")
      return
    }
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await deleteCategory(category.id, category)

      if (error) {
        showError(`Lỗi xóa danh mục: ${error}`)
      } else {
        removeCategory(category.id)
        showSuccess("Đã xóa danh mục thành công!")
        setShowDeleteModal(false)
      }
    } catch (err) {
      showError("Không thể xóa danh mục")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    showSuccess("Đã cập nhật danh mục thành công!")
    // Reload to get fresh data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleEditCancel = () => {
    setShowEditModal(false)
  }

  const getIconEmoji = (iconName) => {
    return ICON_EMOJI_MAP[iconName] || "📝"
  }

  const getTypeColor = (type) => {
    return type === "income" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  }

  const getTextColor = (type) => {
    return type === "income" ? "text-green-800" : "text-red-800"
  }

  if (!category) {
    return null
  }

  return (
    <>
      <div
        className={`relative bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${getTypeColor(category.type)}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                category.type === "income" ? "bg-green-200" : "bg-red-200"
              }`}
            >
              <span className="text-lg">{getIconEmoji(category.icon)}</span>
            </div>
            <div className="flex-1">
              <h3 className={`font-medium ${getTextColor(category.type)}`}>{category.name}</h3>
              <div className="flex items-center mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    category.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {category.type === "income" ? "Thu nhập" : "Chi tiêu"}
                </span>
                {category.isDefault && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Mặc định</span>
                )}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
              >
                <MoreVertical size={16} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Edit size={14} className="mr-2" />
                    Sửa
                  </button>
                  {!category.isDefault && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Xóa
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={handleEditCancel} title="Sửa danh mục" size="lg">
        <CategoryForm category={category} onSuccess={handleEditSuccess} onCancel={handleEditCancel} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Xác nhận xóa danh mục" size="sm">
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-red-900">Xóa danh mục "{category.name}"?</h4>
              <p className="text-sm text-red-700 mt-1">
                Hành động này không thể hoàn tác. Các giao dịch sử dụng danh mục này sẽ hiển thị "Không có danh mục".
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isDeleting}>
              Hủy
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Đang xóa..." : "Xóa danh mục"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default CategoryCard
