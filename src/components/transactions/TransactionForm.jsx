"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useTransactionStore } from "../../store/transactionStore"
import { useCategoryStore } from "../../store/categoryStore"
import { addTransaction, updateTransaction } from "../../api/transactionService"
import Button from "../ui/Button"
import Input from "../ui/Input"
import { formatDate } from "../../utils/formatDate"

const TransactionForm = ({ transaction = null, onSuccess }) => {
  const { user } = useAuthStore()
  const { addTransaction: addToStore, updateTransaction: updateInStore } = useTransactionStore()
  const { categories } = useCategoryStore()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: formatDate(new Date(), "yyyy-MM-dd"),
    categoryId: "",
    type: "expense",
    note: "",
  })

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // If editing, populate form with transaction data
  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || "",
        amount: transaction.amount?.toString() || "",
        date: formatDate(transaction.date?.toDate() || new Date(), "yyyy-MM-dd"),
        categoryId: transaction.categoryId || "",
        type: transaction.type || "expense",
        note: transaction.note || "",
      })
    }
  }, [transaction])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả")
      return
    }

    if (!formData.amount || isNaN(formData.amount) || Number.parseFloat(formData.amount) <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ")
      return
    }

    if (!formData.categoryId) {
      setError("Vui lòng chọn danh mục")
      return
    }

    setIsLoading(true)

    try {
      const transactionData = {
        ...formData,
        amount: Number.parseFloat(formData.amount),
        date: new Date(formData.date),
      }

      if (transaction) {
        // Update existing transaction
        const { error } = await updateTransaction(transaction.id, transactionData)

        if (error) {
          setError(error)
          return
        }

        // Update in local store
        updateInStore(transaction.id, transactionData)
      } else {
        // Add new transaction
        const { id, error } = await addTransaction(transactionData, user.uid)

        if (error) {
          setError(error)
          return
        }

        // Add to local store
        addToStore({ id, ...transactionData })
      }

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess()
      } else {
        navigate("/transactions")
      }
    } catch (err) {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter categories by type
  const filteredCategories = categories.filter((category) => category.type === formData.type)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="Mô tả"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ví dụ: Mua thực phẩm"
            required
          />

          <Input
            label="Số tiền"
            id="amount"
            name="amount"
            type="number"
            step="1000"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
            required
          />

          <Input
            label="Ngày"
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <div className="space-y-1">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Danh mục
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Chọn danh mục
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

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
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
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
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Thu nhập</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Thêm ghi chú..."
              value={formData.note}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => navigate("/transactions")}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : transaction ? "Cập nhật" : "Lưu"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default TransactionForm
