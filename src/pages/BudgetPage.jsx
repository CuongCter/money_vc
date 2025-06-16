"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp } from "lucide-react"
import { useBudgetStore } from "../store/budgetStore"
import { useTransactionStore } from "../store/transactionStore"
import BudgetCard from "../components/budget/BudgetCard"
import BudgetForm from "../components/budget/BudgetForm"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Modal from "../components/ui/Modal"
import { formatCurrency } from "../utils/formatDate"

const BudgetPage = () => {
  const { budgets, loading, fetchBudgets, createBudget, updateBudget, deleteBudget } = useBudgetStore()

  const { transactions, fetchTransactions } = useTransactionStore()

  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  useEffect(() => {
    fetchBudgets()
    if (fetchTransactions) {
      fetchTransactions()
    }
  }, [fetchBudgets, fetchTransactions])

  const handleCreateBudget = async (budgetData) => {
    try {
      await createBudget(budgetData)
      setShowForm(false)
    } catch (error) {
      console.error("Error creating budget:", error)
    }
  }

  const handleUpdateBudget = async (budgetData) => {
    try {
      await updateBudget(editingBudget.id, budgetData)
      setEditingBudget(null)
      setShowForm(false)
    } catch (error) {
      console.error("Error updating budget:", error)
    }
  }

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ngân sách này?")) {
      try {
        await deleteBudget(budgetId)
      } catch (error) {
        console.error("Error deleting budget:", error)
      }
    }
  }

  const handleEditBudget = (budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  const getSpentAmount = (categoryId) => {
    if (!transactions || transactions.length === 0) return 0

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date)
        return (
          t.categoryId === categoryId &&
          t.type === "expense" &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        )
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // Get current month budgets
  const getCurrentMonthBudgets = () => {
    const currentDate = new Date()
    return budgets.filter((budget) => {
      if (!budget.startDate || !budget.endDate) return false
      const startDate = new Date(budget.startDate)
      const endDate = new Date(budget.endDate)
      return currentDate >= startDate && currentDate <= endDate && budget.isActive
    })
  }

  const currentMonthBudgets = getCurrentMonthBudgets()
  const totalBudget = currentMonthBudgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = currentMonthBudgets.reduce((sum, budget) => sum + getSpentAmount(budget.categoryId), 0)
  const totalRemaining = totalBudget - totalSpent

  if (loading && budgets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Ngân sách</h1>
          <p className="text-gray-600 mt-1">Theo dõi và kiểm soát chi tiêu của bạn</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
          <Plus size={20} />
          <span>Tạo ngân sách</span>
        </Button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng ngân sách</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã chi tiêu</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalSpent)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Còn lại</p>
                <p className={`text-2xl font-bold ${totalRemaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(Math.abs(totalRemaining))}
                  {totalRemaining < 0 && " (vượt)"}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  totalRemaining >= 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <TrendingUp className={`w-6 h-6 ${totalRemaining >= 0 ? "text-green-600" : "text-red-600"}`} />
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Budget List */}
      {budgets.length === 0 ? (
        <Card>
          <Card.Content className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ngân sách nào</h3>
            <p className="text-gray-600 mb-6">Tạo ngân sách đầu tiên để bắt đầu theo dõi chi tiêu</p>
            <Button onClick={() => setShowForm(true)}>Tạo ngân sách đầu tiên</Button>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={getSpentAmount(budget.categoryId)}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Budget Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingBudget ? "Chỉnh sửa ngân sách" : "Tạo ngân sách mới"}
      >
        <BudgetForm
          budget={editingBudget}
          onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  )
}

export default BudgetPage
