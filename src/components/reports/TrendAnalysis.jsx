"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "../../store/authStore"
import { useLanguageStore } from "../../store/languageStore"
import { getTransactions } from "../../api/transactionService"
import LineChart from "../charts/LineChart"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { Calendar, TrendingUp, Filter, Download } from "lucide-react"
import LoadingSpinner from "../ui/LoadingSpinner"

const TrendAnalysis = () => {
  const { user } = useAuthStore()
  const { t } = useLanguageStore()

  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  })
  const [showIncome, setShowIncome] = useState(true)
  const [showExpense, setShowExpense] = useState(true)
  const [period, setPeriod] = useState("month") // 'week', 'month', 'quarter', 'year'

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        const { transactions: fetchedTransactions, error } = await getTransactions(user.uid)

        if (error) {
          setError(error)
        } else {
          setTransactions(fetchedTransactions)
        }
      } catch (err) {
        setError(t("errors.unexpectedError"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [user, t])

  useEffect(() => {
    // Filter transactions based on date range
    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      const startDate = new Date(dateRange.startDate)
      const endDate = new Date(dateRange.endDate)

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)

      return transactionDate >= startDate && transactionDate <= endDate
    })

    setFilteredTransactions(filtered)
  }, [transactions, dateRange])

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    const now = new Date()
    let startDate, endDate

    switch (newPeriod) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        endDate = now
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = now
        break
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = now
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = now
        break
      default:
        return
    }

    setDateRange({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    })
  }

  const exportChartData = () => {
    const csvContent = [
      ["Date", "Type", "Amount", "Description", "Category"].join(","),
      ...filteredTransactions.map((t) =>
        [
          new Date(t.date).toLocaleDateString(),
          t.type,
          t.amount,
          `"${t.description || ""}"`,
          `"${t.categoryName || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trend-analysis-${dateRange.startDate}-to-${dateRange.endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp size={24} className="text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t("reports.trendAnalysis")}</h2>
        </div>

        <Button onClick={exportChartData} variant="outline" size="sm">
          <Download size={16} className="mr-2" />
          {t("reports.exportData")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Card.Content className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                {t("reports.period")}
              </label>
              <div className="grid grid-cols-2 gap-1">
                {["week", "month", "quarter", "year"].map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? "primary" : "outline"}
                    size="sm"
                    onClick={() => handlePeriodChange(p)}
                  >
                    {t(`reports.${p}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("transactions.startDate")}</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("transactions.endDate")}</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Display Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                {t("reports.displayOptions")}
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showIncome}
                    onChange={(e) => setShowIncome(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">{t("transactions.income")}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showExpense}
                    onChange={(e) => setShowExpense(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">{t("transactions.expense")}</span>
                </label>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Chart */}
      <Card>
        <Card.Content className="p-6">
          <LineChart
            data={filteredTransactions}
            showIncome={showIncome}
            showExpense={showExpense}
            width={800}
            height={400}
          />
        </Card.Content>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Card.Content className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</div>
            <div className="text-sm text-gray-500">{t("reports.totalTransactions")}</div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredTransactions.filter((t) => t.type === "income").length}
            </div>
            <div className="text-sm text-gray-500">{t("reports.incomeTransactions")}</div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredTransactions.filter((t) => t.type === "expense").length}
            </div>
            <div className="text-sm text-gray-500">{t("reports.expenseTransactions")}</div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}

export default TrendAnalysis
