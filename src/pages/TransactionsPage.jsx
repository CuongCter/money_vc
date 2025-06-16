"use client"

import { useEffect, useState } from "react"
import { useTransactionStore } from "../store/transactionStore"
import { useCategoryStore } from "../store/categoryStore"
import { useAuthStore } from "../store/authStore"
import { useLanguageStore } from "../store/languageStore"
import { useNotificationStore } from "../store/notificationStore"
import { getTransactions, deleteTransaction } from "../api/transactionService"
import { getCategories } from "../api/categoryService"
import { Plus, Filter, ArrowUpRight, ArrowDownRight, Edit, Trash2 } from "lucide-react"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { useNavigate } from "react-router-dom"
import { formatCurrency, safeFormatDate } from "../utils/formatDate"

const TransactionsPage = () => {
  const { user } = useAuthStore()
  const { t } = useLanguageStore()
  const { showSuccess, showError } = useNotificationStore()
  const {
    transactions,
    setTransactions,
    setLoading,
    isLoading,
    filters,
    setFilters,
    resetFilters,
    getFilteredTransactions,
    deleteTransaction: removeTransaction,
  } = useTransactionStore()
  const { categories, setCategories, getCategoryById } = useCategoryStore()
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)

      try {
        // Load categories first
        const { categories: fetchedCategories, error: categoriesError } = await getCategories(user.uid)
        if (!categoriesError) {
          setCategories(fetchedCategories)
        }

        // Load transactions
        const { transactions: fetchedTransactions, error: transactionsError } = await getTransactions(user.uid)
        if (!transactionsError) {
          setTransactions(fetchedTransactions)
        } else {
          showError(`Lỗi tải giao dịch: ${transactionsError}`)
        }
      } catch (error) {
        showError("Không thể tải dữ liệu")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, setLoading, setTransactions, setCategories, showError])

  const handleDelete = async (id) => {
    if (window.confirm(t("transactions.confirmDelete"))) {
      setIsDeleting(true)
      const { error } = await deleteTransaction(id)

      if (!error) {
        removeTransaction(id)
        showSuccess(t("success.transactionDeleted"))
      } else {
        showError(t("errors.unexpectedError"))
      }
      setIsDeleting(false)
    }
  }

  const filteredTransactions = getFilteredTransactions()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("transactions.transactions")}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} className="mr-2" />
            {t("common.filter")}
          </Button>
          <Button onClick={() => navigate("/transactions/add")}>
            <Plus size={16} className="mr-2" />
            {t("transactions.addTransaction")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("transactions.startDate")}</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.startDate || ""}
                onChange={(e) => setFilters({ startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("transactions.endDate")}</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.endDate || ""}
                onChange={(e) => setFilters({ endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("transactions.category")}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.categoryId || ""}
                onChange={(e) => setFilters({ categoryId: e.target.value })}
              >
                <option value="">{t("transactions.allCategories")}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("transactions.type")}</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={filters.type || ""}
                onChange={(e) => setFilters({ type: e.target.value })}
              >
                <option value="">{t("transactions.allTypes")}</option>
                <option value="income">{t("transactions.income")}</option>
                <option value="expense">{t("transactions.expense")}</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" className="mr-2" onClick={resetFilters}>
              {t("common.reset")}
            </Button>
            <Button size="sm" onClick={() => setShowFilters(false)}>
              {t("common.apply")}
            </Button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("transactions.date")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("transactions.description")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("transactions.category")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("transactions.type")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("transactions.amount")}
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {t("transactions.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <LoadingSpinner size="sm" />
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const category = getCategoryById(transaction.categoryId)

                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {safeFormatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.description || "Không có mô tả"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {category?.icon && (
                            <span className="mr-2 text-xs">
                              {category.icon === "coffee" && "☕"}
                              {category.icon === "car" && "🚗"}
                              {category.icon === "shopping-bag" && "🛍️"}
                              {category.icon === "film" && "🎬"}
                              {category.icon === "wallet" && "💼"}
                              {category.icon === "gift" && "🎁"}
                              {category.icon === "file-text" && "📄"}
                              {category.icon === "activity" && "🏥"}
                              {category.icon === "book" && "📚"}
                              {category.icon === "trending-up" && "📈"}
                              {category.icon === "plus-circle" && "➕"}
                              {category.icon === "more-horizontal" && "➕"}
                              {![
                                "coffee",
                                "car",
                                "shopping-bag",
                                "film",
                                "wallet",
                                "gift",
                                "file-text",
                                "activity",
                                "book",
                                "trending-up",
                                "plus-circle",
                                "more-horizontal",
                              ].includes(category.icon) && "📝"}
                            </span>
                          )}
                          {category?.name || "Không có danh mục"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight size={12} className="mr-1" />
                          ) : (
                            <ArrowDownRight size={12} className="mr-1" />
                          )}
                          {transaction.type === "income" ? t("transactions.income") : t("transactions.expense")}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                          disabled={isDeleting}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDelete(transaction.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {t("transactions.noTransactions")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TransactionsPage
