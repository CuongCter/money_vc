"use client"

import { useEffect } from "react"
import { useTransactionStore } from "../store/transactionStore"
import { useAuthStore } from "../store/authStore"
import { getTransactions } from "../api/firestoreService"
import { ArrowUpRight, ArrowDownRight, Plus, DollarSign, TrendingUp } from "lucide-react"
import Button from "../components/ui/Button"
import { useNavigate } from "react-router-dom"

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { transactions, setTransactions, setLoading, isLoading, getTotalIncome, getTotalExpense, getBalance } =
    useTransactionStore()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return

      setLoading(true)
      const { transactions, error } = await getTransactions(user.uid)

      if (!error) {
        setTransactions(transactions)
      }

      setLoading(false)
    }

    fetchTransactions()
  }, [user, setLoading, setTransactions])

  // Get recent transactions (last 5)
  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button onClick={() => navigate("/transactions/add")}>
          <Plus size={16} className="mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Current Balance</p>
            <div className="p-2 bg-primary-50 rounded-full">
              <DollarSign size={20} className="text-primary-600" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">${getBalance().toFixed(2)}</p>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+2.5%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Income</p>
            <div className="p-2 bg-green-50 rounded-full">
              <ArrowUpRight size={20} className="text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">${getTotalIncome().toFixed(2)}</p>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-500 font-medium">+4.3%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <div className="p-2 bg-red-50 rounded-full">
              <ArrowDownRight size={20} className="text-red-600" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">${getTotalExpense().toFixed(2)}</p>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp size={16} className="text-red-500 mr-1" />
            <span className="text-red-500 font-medium">+2.7%</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
              View all
            </Button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-6 text-center">Loading transactions...</div>
          ) : recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-50" : "bg-red-50"}`}>
                      {transaction.type === "income" ? (
                        <ArrowUpRight size={16} className="text-green-600" />
                      ) : (
                        <ArrowDownRight size={16} className="text-red-600" />
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">No transactions found. Add your first transaction!</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
