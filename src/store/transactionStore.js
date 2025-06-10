import { create } from "zustand"

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    categoryId: null,
    type: null, // 'income' or 'expense'
  },
  stats: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    expensesByCategory: {},
  },

  // Actions
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setStats: (stats) => set({ stats }),

  // Filter actions
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  resetFilters: () =>
    set({
      filters: {
        startDate: null,
        endDate: null,
        categoryId: null,
        type: null,
      },
    }),

  // Transaction actions
  addTransaction: (transaction) =>
    set({
      transactions: [transaction, ...get().transactions],
    }),

  updateTransaction: (id, updatedTransaction) =>
    set({
      transactions: get().transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, ...updatedTransaction } : transaction,
      ),
    }),

  deleteTransaction: (id) =>
    set({
      transactions: get().transactions.filter((transaction) => transaction.id !== id),
    }),

  // Computed values
  getTotalIncome: () => {
    return get()
      .transactions.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getTotalExpense: () => {
    return get()
      .transactions.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getBalance: () => {
    return get().getTotalIncome() - get().getTotalExpense()
  },

  // Filtered transactions
  getFilteredTransactions: () => {
    const { transactions, filters } = get()
    return transactions.filter((transaction) => {
      // Apply date filters
      if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
        return false
      }
      if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
        return false
      }
      // Apply category filter
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false
      }
      // Apply type filter
      if (filters.type && transaction.type !== filters.type) {
        return false
      }
      return true
    })
  },

  // Get transactions grouped by category
  getTransactionsByCategory: (type = "expense") => {
    const transactions = get().transactions.filter((t) => t.type === type)

    return transactions.reduce((acc, transaction) => {
      if (!acc[transaction.categoryId]) {
        acc[transaction.categoryId] = {
          total: 0,
          transactions: [],
        }
      }

      acc[transaction.categoryId].total += transaction.amount
      acc[transaction.categoryId].transactions.push(transaction)

      return acc
    }, {})
  },
}))
