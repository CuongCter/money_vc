"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useCategoryStore } from "../store/categoryStore"
import { useLanguageStore } from "../store/languageStore"
import { useNotificationStore } from "../store/notificationStore"
import { getTransaction } from "../api/transactionService"
import { getCategories } from "../api/categoryService"
import TransactionForm from "../components/transactions/TransactionForm"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { ArrowLeft } from "lucide-react"

const EditTransactionPage = () => {
  const { id } = useParams()
  const { user } = useAuthStore()
  const { categories, setCategories } = useCategoryStore()
  const { t } = useLanguageStore()
  const { showError } = useNotificationStore()
  const navigate = useNavigate()

  const [transaction, setTransaction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid || !id) {
        navigate("/transactions")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Load categories first
        const { categories: fetchedCategories, error: categoriesError } = await getCategories(user.uid)
        if (categoriesError) {
          setError(`Lỗi tải danh mục: ${categoriesError}`)
        } else {
          setCategories(fetchedCategories)
        }

        // Load transaction
        const { transaction: fetchedTransaction, error: transactionError } = await getTransaction(id)
        if (transactionError) {
          setError(`Lỗi tải giao dịch: ${transactionError}`)
          showError(`Không thể tải giao dịch: ${transactionError}`)
        } else if (!fetchedTransaction) {
          setError("Không tìm thấy giao dịch")
          showError("Không tìm thấy giao dịch")
        } else if (fetchedTransaction.userId !== user.uid) {
          setError("Bạn không có quyền chỉnh sửa giao dịch này")
          showError("Bạn không có quyền chỉnh sửa giao dịch này")
        } else {
          setTransaction(fetchedTransaction)
        }
      } catch (err) {
        console.error("Error loading transaction:", err)
        setError("Không thể tải dữ liệu")
        showError("Không thể tải dữ liệu")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, user, setCategories, navigate, showError])

  const handleSuccess = () => {
    navigate("/transactions")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Đang tải giao dịch...</span>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/transactions")}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Lỗi</h1>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Không thể tải giao dịch</p>
          <p>{error}</p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate("/transactions")}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900">{t("transactions.editTransaction")}</h1>
            <p className="text-sm text-gray-600 mt-1">Chỉnh sửa giao dịch: {transaction.description}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <TransactionForm transaction={transaction} onSuccess={handleSuccess} />
    </div>
  )
}

export default EditTransactionPage
