"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { useTransactionStore } from "../../store/transactionStore"
import { useCategoryStore } from "../../store/categoryStore"
import { useNotificationStore } from "../../store/notificationStore"
import { useLanguageStore } from "../../store/languageStore"
import { addTransaction, updateTransaction } from "../../api/transactionService"
import { getCategories } from "../../api/categoryService"
import Button from "../ui/Button"
import LoadingSpinner from "../ui/LoadingSpinner"
import { formatDate } from "../../utils/formatDate"
import { Calculator, Calendar, FileText, Tag, DollarSign, Plus, Edit } from "lucide-react"

const TransactionForm = ({ transaction = null, onSuccess }) => {
  const { user } = useAuthStore()
  const { addTransaction: addToStore, updateTransaction: updateInStore } = useTransactionStore()
  const { categories, setCategories } = useCategoryStore()
  const { showSuccess, showError } = useNotificationStore()
  const { t } = useLanguageStore()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: formatDate(new Date(), "yyyy-MM-dd"),
    categoryId: "",
    type: "expense",
    note: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  // Load categories when component mounts or type changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!user?.uid) return

      setIsLoadingCategories(true)
      try {
        const { categories: fetchedCategories, error } = await getCategories(user.uid)
        if (!error) {
          setCategories(fetchedCategories)
        } else {
          showError(`${t("common.error")}: ${error}`)
        }
      } catch (err) {
        showError(t("errors.loadingError"))
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [user, setCategories, showError, t])

  // If editing, populate form with transaction data
  useEffect(() => {
    if (transaction) {
      // Handle different date formats
      let dateValue = formatDate(new Date(), "yyyy-MM-dd")

      if (transaction.date) {
        if (transaction.date.toDate && typeof transaction.date.toDate === "function") {
          // Firestore Timestamp
          dateValue = formatDate(transaction.date.toDate(), "yyyy-MM-dd")
        } else if (transaction.date instanceof Date) {
          dateValue = formatDate(transaction.date, "yyyy-MM-dd")
        } else if (transaction.date.seconds) {
          // Firestore Timestamp object
          dateValue = formatDate(new Date(transaction.date.seconds * 1000), "yyyy-MM-dd")
        } else {
          dateValue = formatDate(new Date(transaction.date), "yyyy-MM-dd")
        }
      }

      setFormData({
        description: transaction.description || "",
        amount: transaction.amount?.toString() || "",
        date: dateValue,
        categoryId: transaction.categoryId || "",
        type: transaction.type || "expense",
        note: transaction.note || "",
      })
    }
  }, [transaction])

  // Reset categoryId when type changes
  useEffect(() => {
    if (!transaction) {
      setFormData((prev) => ({ ...prev, categoryId: "" }))
      setErrors((prev) => ({ ...prev, categoryId: "" }))
    }
  }, [formData.type, transaction])

  const validateForm = () => {
    const newErrors = {}

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = t("errors.descriptionRequired")
    } else if (formData.description.trim().length < 2) {
      newErrors.description = t("errors.descriptionTooShort")
    }

    // Validate amount
    if (!formData.amount) {
      newErrors.amount = t("errors.invalidAmount")
    } else {
      const amount = Number.parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = t("errors.amountMustBePositive")
      } else if (amount > 999999999) {
        newErrors.amount = t("errors.amountTooLarge")
      }
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = t("errors.dateRequired")
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(today.getFullYear() - 1)

      if (selectedDate > today) {
        newErrors.date = t("errors.dateFuture")
      } else if (selectedDate < oneYearAgo) {
        newErrors.date = t("errors.dateTooOld")
      }
    }

    // Validate category
    if (!formData.categoryId) {
      newErrors.categoryId = t("errors.categoryRequired")
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

  const handleAmountChange = (e) => {
    const value = e.target.value
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, amount: value }))
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: "" }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showError(t("errors.unexpectedError"))
      return
    }

    setIsLoading(true)

    try {
      const transactionData = {
        ...formData,
        amount: Number.parseFloat(formData.amount),
        date: new Date(formData.date),
        description: formData.description.trim(),
        note: formData.note.trim(),
      }

      if (transaction) {
        // Update existing transaction
        const { error } = await updateTransaction(transaction.id, transactionData)

        if (error) {
          showError(`${t("common.error")}: ${error}`)
          return
        }

        // Update in local store
        updateInStore(transaction.id, { ...transactionData, id: transaction.id })
        showSuccess(t("success.transactionUpdated"))
      } else {
        // Add new transaction
        const { id, error } = await addTransaction(transactionData, user.uid)

        if (error) {
          showError(`${t("common.error")}: ${error}`)
          return
        }

        // Add to local store
        addToStore({ id, ...transactionData })
        showSuccess(t("success.transactionAdded"))
      }

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess()
      } else {
        navigate("/transactions")
      }
    } catch (err) {
      console.error("Transaction form error:", err)
      showError(t("errors.unexpectedError"))
    } finally {
      setIsLoading(false)
    }
  }

  // Filter categories by type
  const filteredCategories = categories.filter((category) => category.type === formData.type)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          {transaction ? (
            <Edit size={20} className="mr-2 text-blue-600" />
          ) : (
            <Plus size={20} className="mr-2 text-blue-600" />
          )}
          {transaction ? t("transactions.editTransaction") : t("transactions.addTransaction")}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {transaction ? t("transactions.transactionInfo") : t("transactions.enterDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {t("transactions.type")} <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === "expense"}
                onChange={handleChange}
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
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {t("transactions.income")}
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              <FileText size={16} className="inline mr-1" />
              {t("transactions.description")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("transactions.enterDescription")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              <DollarSign size={16} className="inline mr-1" />
              {t("transactions.amount")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder={t("transactions.enterAmount")}
                className={`w-full pl-8 pr-12 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                }`}
              />
              <Calculator size={16} className="absolute left-2.5 top-3 text-gray-400" />
              <span className="absolute right-3 top-3 text-sm text-gray-500">VNĐ</span>
            </div>
            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              <Calendar size={16} className="inline mr-1" />
              {t("transactions.date")} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={formatDate(new Date(), "yyyy-MM-dd")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.date ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              <Tag size={16} className="inline mr-1" />
              {t("transactions.category")} <span className="text-red-500">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              disabled={isLoadingCategories}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.categoryId ? "border-red-500" : "border-gray-300"
              } ${isLoadingCategories ? "bg-gray-100" : ""}`}
            >
              <option value="" disabled>
                {isLoadingCategories ? t("common.loading") : t("transactions.selectCategory")}
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId}</p>}
            {filteredCategories.length === 0 && !isLoadingCategories && (
              <p className="text-sm text-amber-600">
                {t("categories.noCategories")}
                <button
                  type="button"
                  onClick={() => navigate("/settings")}
                  className="ml-1 text-blue-600 hover:underline"
                >
                  {t("categories.addCategory")}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1">
          <label htmlFor="note" className="block text-sm font-medium text-gray-700">
            {t("transactions.note")} ({t("common.optional")})
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            value={formData.note}
            onChange={handleChange}
            placeholder={t("transactions.addNote")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={() => navigate("/transactions")} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading || isLoadingCategories} className="min-w-[100px]">
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {transaction ? t("transactions.updating") : t("transactions.adding")}
              </div>
            ) : transaction ? (
              t("common.update")
            ) : (
              t("common.add")
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default TransactionForm
