"use client"

import { useState } from "react"
import { Edit2, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import Card from "../ui/Card"
import { formatCurrency } from "../../utils/formatDate"

const BudgetCard = ({ budget, spent = 0, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false)

  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
  const remaining = budget.amount - spent

  const getStatusColor = () => {
    if (percentage >= 100) return "text-red-600 bg-red-50"
    if (percentage >= 80) return "text-orange-600 bg-orange-50"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50"
    return "text-green-600 bg-green-50"
  }

  const getProgressColor = () => {
    if (percentage >= 100) return "bg-red-500"
    if (percentage >= 80) return "bg-orange-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusIcon = () => {
    if (percentage >= 100) return <AlertTriangle size={16} />
    if (percentage >= 80) return <AlertTriangle size={16} />
    return <CheckCircle size={16} />
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <Card.Content className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">{budget.categoryName?.charAt(0) || "B"}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{budget.categoryName}</h3>
              <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <Edit2 size={16} />
            </button>

            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onEdit(budget)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit2 size={14} />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(budget.id)
                    setShowActions(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 size={14} />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {formatCurrency(spent)} / {formatCurrency(budget.amount)}
            </span>
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
            >
              {getStatusIcon()}
              <span>{Math.round(percentage)}%</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining Amount */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Còn lại:</span>
          <span className={`font-semibold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(Math.abs(remaining))}
            {remaining < 0 && " (vượt)"}
          </span>
        </div>

        {/* Period Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Từ: {new Date(budget.startDate).toLocaleDateString("vi-VN")}</span>
            <span>Đến: {new Date(budget.endDate).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}

export default BudgetCard
