"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/authStore"
import { useCategoryStore } from "../../store/categoryStore"
import { getTransactionStats } from "../../api/transactionService"
import { getCategories } from "../../api/categoryService"
import Card from "../ui/Card"
import ExpenseSummary from "./ExpenseSummary"
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react"
import { formatCurrency } from "../../utils/formatDate"
import LoadingSpinner from "../ui/LoadingSpinner"

const MonthlyReport = ({ month, year }) => {
  const { user } = useAuthStore()
  const { setCategories } = useCategoryStore()
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  })
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch categories if needed
        const { categories, error: categoriesError } = await getCategories(user.uid)
        if (!categoriesError) {
          setCategories(categories)
        }

        // Calculate start and end date for the month
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0) // Last day of the month

        // Fetch transaction stats
        const { stats, transactions, error } = await getTransactionStats(user.uid, startDate, endDate)

        if (error) {
          setError(error)
        } else {
          setStats(stats)
          setTransactions(transactions)
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, month, year, setCategories])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
  }

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">
        Báo cáo {monthNames[month - 1]} {year}
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Số dư</p>
              <div className="p-2 bg-blue-50 rounded-full">
                <DollarSign size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(stats.balance)}</p>
          </Card.Content>
        </Card>

        {/* Income Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Tổng thu</p>
              <div className="p-2 bg-green-50 rounded-full">
                <ArrowUpRight size={20} className="text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(stats.totalIncome)}</p>
          </Card.Content>
        </Card>

        {/* Expense Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Tổng chi</p>
              <div className="p-2 bg-red-50 rounded-full">
                <ArrowDownRight size={20} className="text-red-600" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(stats.totalExpense)}</p>
          </Card.Content>
        </Card>
      </div>

      {/* Expense Analysis */}
      <ExpenseSummary transactions={transactions} />
    </div>
  )
}

export default MonthlyReport
