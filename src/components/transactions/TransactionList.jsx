"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTransactionStore } from "../../store/transactionStore"
import { useCategoryStore } from "../../store/categoryStore"
import { useNotificationStore } from "../../store/notificationStore"
import { useLanguageStore } from "../../store/languageStore"
import { deleteTransaction } from "../../api/transactionService"
import { ArrowUpRight, ArrowDownRight, Edit, Trash2 } from "lucide-react"
import Button from "../ui/Button"
import Badge from "../ui/Badge"
import { formatCurrency, safeFormatDate } from "../../utils/formatDate"

const TransactionList = ({ transactions = [], showActions = true }) => {
  const navigate = useNavigate()
  const { deleteTransaction: removeTransaction } = useTransactionStore()
  const { getCategoryById } = useCategoryStore()
  const { showSuccess, showError } = useNotificationStore()
  const { t } = useLanguageStore()
  const [isDeleting, setIsDeleting] = useState(false)

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

  if (transactions.length === 0) {
    return <div className="text-center py-8 text-gray-500">{t("transactions.noTransactions")}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("transactions.date")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("transactions.description")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("transactions.category")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("transactions.type")}
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t("transactions.amount")}
            </th>
            {showActions && (
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("transactions.actions")}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => {
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
                  <Badge
                    variant={transaction.type === "income" ? "success" : "danger"}
                    className="flex items-center w-fit"
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpRight size={12} className="mr-1" />
                    ) : (
                      <ArrowDownRight size={12} className="mr-1" />
                    )}
                    {transaction.type === "income" ? t("transactions.income") : t("transactions.expense")}
                  </Badge>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                      disabled={isDeleting}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(transaction.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionList
