"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { useTransactionStore } from "../store/transactionStore"
import { useCategoryStore } from "../store/categoryStore"
import { useLanguageStore } from "../store/languageStore"
import { getTransactions } from "../api/transactionService"
import { getCategories } from "../api/categoryService"
import { ArrowUpRight, ArrowDownRight, Plus, DollarSign } from "lucide-react"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import TransactionList from "../components/transactions/TransactionList"
import { formatCurrency } from "../utils/formatDate"
import LoadingSpinner from "../components/ui/LoadingSpinner"

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { transactions, setTransactions, setLoading, isLoading, getTotalIncome, getTotalExpense, getBalance } =
    useTransactionStore()
  const { setCategories } = useCategoryStore()
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        // Fetch categories
        const { categories, error: categoriesError } = await getCategories(user.uid)
        if (categoriesError) {
          setError(categoriesError)
        } else {
          setCategories(categories)
        }

        // Fetch transactions
        const { transactions, error: transactionsError } = await getTransactions(user.uid)
        if (transactionsError) {
          setError(transactionsError)
        } else {
          setTransactions(transactions)
        }
      } catch (err) {
        setError(t("errors.unexpectedError"))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, setLoading, setTransactions, setCategories, t])

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5)

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.overview")}</h1>
        <Button onClick={() => navigate("/transactions/add")}>
          <Plus size={16} className="mr-2" />
          {t("dashboard.addTransaction")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t("dashboard.currentBalance")}</p>
              <div className="p-2 bg-blue-50 rounded-full">
                <DollarSign size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(getBalance())}</p>
          </Card.Content>
        </Card>

        {/* Income Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t("dashboard.totalIncome")}</p>
              <div className="p-2 bg-green-50 rounded-full">
                <ArrowUpRight size={20} className="text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(getTotalIncome())}</p>
          </Card.Content>
        </Card>

        {/* Expense Card */}
        <Card>
          <Card.Content className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">{t("dashboard.totalExpense")}</p>
              <div className="p-2 bg-red-50 rounded-full">
                <ArrowDownRight size={20} className="text-red-600" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(getTotalExpense())}</p>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">{t("dashboard.recentTransactions")}</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
              {t("dashboard.viewAll")}
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <TransactionList transactions={recentTransactions} showActions={false} />
        </Card.Content>
      </Card>
    </div>
  )
}

export default DashboardPage
