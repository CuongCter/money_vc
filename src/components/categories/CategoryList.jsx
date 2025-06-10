"use client"

import { useState } from "react"
import { useCategoryStore } from "../../store/categoryStore"
import { deleteCategory } from "../../api/categoryService"
import Button from "../ui/Button"
import Modal from "../ui/Modal"
import CategoryForm from "./CategoryForm"
import { Edit, Trash2, Plus } from "lucide-react"

const CategoryList = ({ type = "all" }) => {
  const { categories, deleteCategory: removeCategory } = useCategoryStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)

  // Filter categories by type if specified
  const filteredCategories = type === "all" ? categories : categories.filter((category) => category.type === type)

  const handleEdit = (category) => {
    setCurrentCategory(category)
    setShowModal(true)
  }

  const handleDelete = async (category) => {
    if (category.isDefault) {
      alert("Không thể xóa danh mục mặc định")
      return
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      setIsDeleting(true)
      const { error } = await deleteCategory(category.id, category)

      if (!error) {
        removeCategory(category.id)
      } else {
        alert(`Lỗi: ${error}`)
      }
      setIsDeleting(false)
    }
  }

  const handleAddNew = () => {
    setCurrentCategory(null)
    setShowModal(true)
  }

  const handleFormSuccess = () => {
    setShowModal(false)
    setCurrentCategory(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">
          Danh mục {type === "expense" ? "Chi tiêu" : type === "income" ? "Thu nhập" : ""}
        </h2>
        <Button onClick={handleAddNew} size="sm">
          <Plus size={16} className="mr-1" /> Thêm mới
        </Button>
      </div>

      {filteredCategories.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Không có danh mục nào.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <li key={category.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="lucide lucide-{category.icon} mr-3 text-gray-500"></span>
                  <span className="font-medium">{category.name}</span>
                  {category.isDefault && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">Mặc định</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-900"
                    onClick={() => handleEdit(category)}
                    disabled={isDeleting}
                  >
                    <Edit size={16} />
                  </Button>
                  {!category.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(category)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={currentCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      >
        <CategoryForm category={currentCategory} onSuccess={handleFormSuccess} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  )
}

export default CategoryList
