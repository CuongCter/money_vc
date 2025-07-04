"use client"

import { useMemo } from "react"
import { useCategoryStore } from "../../store/categoryStore"
import { useLanguageStore } from "../../store/languageStore"
import PieChart from "../charts/PieChart"
import Card from "../ui/Card"
import { formatCurrency } from "../../utils/formatDate"

const ExpenseSummary = ({ transactions = [] }) => {
  const { getCategoryById } = useCategoryStore()
  const { t } = useLanguageStore()

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, transaction) => {
        const categoryId = transaction.categoryId
        if (!acc[categoryId]) {
          acc[categoryId] = 0
        }
        acc[categoryId] += transaction.amount
        return acc
      }, {})
  }, [transactions])

  // Prepare data for pie chart
  const chartData = useMemo(() => {
    const data = []
    const labels = []
    const categoryIds = Object.keys(expensesByCategory)

    categoryIds.forEach((categoryId) => {
      const category = getCategoryById(categoryId)
      labels.push(category?.name || t("common.noData"))
      data.push(expensesByCategory[categoryId])
    })

    return { data, labels }
  }, [expensesByCategory, getCategoryById, t])

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0)
  }, [expensesByCategory])

  // Sort categories by amount (descending)
  const sortedCategories = useMemo(() => {
    return Object.entries(expensesByCategory)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        name: getCategoryById(categoryId)?.name || t("common.noData"),
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [expensesByCategory, getCategoryById, t])

  if (transactions.length === 0 || totalExpenses === 0) {
    return (
      <Card>
        <Card.Content>
          <p className="text-center text-gray-500">{t("reports.noData")}</p>
        </Card.Content>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">{t("reports.expenseAnalysis")}</h3>
        </Card.Header>
        <Card.Content>
          <PieChart data={chartData.data} labels={chartData.labels} title={t("reports.expenseAnalysis")} />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">{t("reports.expenseByCategory")}</h3>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            {sortedCategories.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>{category.name}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium">{formatCurrency(category.amount)}</span>
                  <span className="text-sm text-gray-500">{Math.round((category.amount / totalExpenses) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  )
}

export default ExpenseSummary
