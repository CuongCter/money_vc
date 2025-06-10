"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTransactionStore } from "../../store/transactionStore"
import { useCategoryStore } from "../../store/categoryStore"
import { deleteTransaction } from "../../api/transactionService"
import { ArrowUpRight, ArrowDownRight, Edit, Trash2 } from "lucide-react"
import Button from "../ui/Button"
import Badge from "../ui/Badge"
import { formatCurrency } from "../../utils/formatDate"

const TransactionList = ({ transactions = [], showActions = true }) => {
  const navigate = useNavigate()
  const { deleteTransaction: removeTransaction } = useTransactionStore()
  const { getCategoryById } = useCategoryStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) {
      setIsDeleting(true)
      const { error } = await deleteTransaction(id)

      if (!error) {
        removeTransaction(id)
      }
      setIsDeleting(false)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">Không có giao dịch nào. Hãy thêm giao dịch đầu tiên của bạn!</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mô tả
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Danh mục
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số tiền
            </th>
            {showActions && (
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Thao tác
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
                  {transaction.date instanceof Date
                    ? transaction.date.toLocaleDateString()
                    : new Date(transaction.date.seconds * 1000).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category?.name || "Không xác định"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={transaction.type === "income" ? "success" : "danger"} className="flex items-center">
                    {transaction.type === "income" ? (
                      <ArrowUpRight size={12} className="mr-1" />
                    ) : (
                      <ArrowDownRight size={12} className="mr-1" />
                    )}
                    {transaction.type === "income" ? "Thu nhập" : "Chi tiêu"}
                  </Badge>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    transaction.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
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
