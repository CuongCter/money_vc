"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "../store/authStore"
import { useCategoryStore } from "../store/categoryStore"
import { useLanguageStore } from "../store/languageStore"
import { getCategories } from "../api/categoryService"
import TransactionForm from "../components/transactions/TransactionForm"
import EmptyCategoryState from "../components/categories/EmptyCategoryState"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const AddTransactionPage = () => {
  const { user } = useAuthStore()
  const { categories, setCategories } = useCategoryStore()
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      try {
        const { categories: fetchedCategories, error } = await getCategories(user.uid)
        if (!error) {
          setCategories(fetchedCategories)
        }
      } catch (err) {
        console.error("Error loading categories:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [user, setCategories])

  if (!user || isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If no categories exist, show setup wizard
  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/transactions")}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thiết lập danh mục</h1>
              <p className="text-sm text-gray-600 mt-1">Tạo danh mục trước khi thêm giao dịch</p>
            </div>
          </div>
        </div>

        {/* Empty state with setup wizard */}
        <EmptyCategoryState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/transactions")}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("transactions.addTransaction")}</h1>
            <p className="text-sm text-gray-600 mt-1">Thêm giao dịch thu chi mới vào hệ thống</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <TransactionForm />
    </div>
  )
}

export default AddTransactionPage
