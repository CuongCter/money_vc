"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/authStore"
import { useCategoryStore } from "../../store/categoryStore"
import { useLanguageStore } from "../../store/languageStore"
import { getTransactionStats } from "../../api/transactionService"
import { getCategories } from "../../api/categoryService"
import Card from "../ui/Card"
import ExpenseSummary from "./ExpenseSummary"
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency } from "../../utils/formatDate"
import LoadingSpinner from "../ui/LoadingSpinner"

const MonthlyReport = ({ month, year, onDataUpdate }) => {
  const { user } = useAuthStore()
  const { categories, setCategories } = useCategoryStore()
  const { t } = useLanguageStore()
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    expensesByCategory: {},
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
        const { categories: fetchedCategories, error: categoriesError } = await getCategories(user.uid)
        if (!categoriesError) {
          setCategories(fetchedCategories)
        }

        // Calculate start and end date for the month
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0) // Last day of the month

        // Fetch transaction stats
        const {
          stats: fetchedStats,
          transactions: fetchedTransactions,
          error,
        } = await getTransactionStats(user.uid, startDate, endDate)

        if (error) {
          setError(error)
        } else {
          setStats(fetchedStats)
          setTransactions(fetchedTransactions)

          // Update parent component with data for export
          if (onDataUpdate) {
            onDataUpdate({
              stats: fetchedStats,
              transactions: fetchedTransactions,
              categories: fetchedCategories || [],
            })
          }
        }
      } catch (err) {
        setError(t("errors.unexpectedError"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, month, year, setCategories, t]) // Removed categories, onDataUpdate from dependencies

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{t("common.error")}:</span>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  const balanceColor = stats.balance >= 0 ? "text-green-600" : "text-red-600"
  const balanceIcon = stats.balance >= 0 ? TrendingUp : TrendingDown
  const BalanceIcon = balanceIcon

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {t("reports.monthlyReport")} {month}/{year}
        </h2>

        {transactions.length > 0 && (
          <div className="text-sm text-gray-500">
            {t("reports.totalTransactions")}: {transactions.length}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t("reports.balance")}</p>
              <div className={`p-2 rounded-full ${stats.balance >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                <BalanceIcon size={20} className={stats.balance >= 0 ? "text-green-600" : "text-red-600"} />
              </div>
            </div>
            <p className={`mt-2 text-3xl font-bold ${balanceColor}`}>{formatCurrency(stats.balance)}</p>
            {stats.balance < 0 && <p className="mt-1 text-xs text-red-500">{t("reports.negativeBalance")}</p>}
          </Card.Content>
        </Card>

        {/* Income Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t("reports.income")}</p>
              <div className="p-2 bg-green-50 rounded-full">
                <ArrowUpRight size={20} className="text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(stats.totalIncome)}</p>
            <p className="mt-1 text-xs text-gray-500">
              {transactions.filter((t) => t.type === "income").length} {t("reports.incomeTransactions")}
            </p>
          </Card.Content>
        </Card>

        {/* Expense Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t("reports.expense")}</p>
              <div className="p-2 bg-red-50 rounded-full">
                <ArrowDownRight size={20} className="text-red-600" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(stats.totalExpense)}</p>
            <p className="mt-1 text-xs text-gray-500">
              {transactions.filter((t) => t.type === "expense").length} {t("reports.expenseTransactions")}
            </p>
          </Card.Content>
        </Card>
      </div>

      {/* Expense Analysis */}
      <ExpenseSummary transactions={transactions} />

      {/* No data message */}
      {transactions.length === 0 && (
        <Card>
          <Card.Content className="p-8 text-center">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t("reports.noTransactions")}</h3>
            <p className="text-gray-500">{t("reports.noTransactionsDesc")}</p>
          </Card.Content>
        </Card>
      )}
    </div>
  )
}

export default MonthlyReport
