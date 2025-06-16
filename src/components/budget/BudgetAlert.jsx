"use client"

import { AlertTriangle, X } from "lucide-react"

const BudgetAlert = ({ alert, onDismiss }) => {
  const getAlertStyles = () => {
    switch (alert.type) {
      case "danger":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-orange-50 border-orange-200 text-orange-800"
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  const getIconColor = () => {
    switch (alert.type) {
      case "danger":
        return "text-red-500"
      case "warning":
        return "text-orange-500"
      default:
        return "text-blue-500"
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getAlertStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle size={20} className={getIconColor()} />
          <div>
            <h4 className="font-medium">{alert.message}</h4>
            <p className="text-sm mt-1 opacity-90">Đã sử dụng {alert.percentage}% ngân sách</p>
          </div>
        </div>

        {onDismiss && (
          <button onClick={() => onDismiss(alert.budgetId)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default BudgetAlert
