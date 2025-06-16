import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "../config/firebase"

// Create a new transaction
export const addTransaction = async (transaction, userId) => {
  try {
    // Ensure the transaction has a userId
    const transactionWithUser = {
      ...transaction,
      userId,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "transactions"), transactionWithUser)
    return { id: docRef.id, ...transactionWithUser, error: null }
  } catch (error) {
    console.error("Error adding transaction:", error)
    return { error: error.message }
  }
}

// Get all transactions for a user with optimized queries
export const getTransactions = async (userId, filters = {}) => {
  try {
    if (!userId) {
      return { transactions: [], error: "User ID is required" }
    }

    // Base query with userId and date ordering
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(100), // Limit to prevent large data loads
    )

    // For filtered queries, we'll use simpler approaches
    if (filters.startDate || filters.endDate || filters.categoryId || filters.type) {
      // Get all user transactions first, then filter in memory for complex queries
      const baseQuery = query(collection(db, "transactions"), where("userId", "==", userId))

      const querySnapshot = await getDocs(baseQuery)
      let transactions = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        transactions.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to Date for filtering
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        })
      })

      // Apply filters in memory
      if (filters.startDate) {
        const startDate = new Date(filters.startDate)
        startDate.setHours(0, 0, 0, 0)
        transactions = transactions.filter((t) => new Date(t.date) >= startDate)
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        transactions = transactions.filter((t) => new Date(t.date) <= endDate)
      }

      if (filters.categoryId) {
        transactions = transactions.filter((t) => t.categoryId === filters.categoryId)
      }

      if (filters.type) {
        transactions = transactions.filter((t) => t.type === filters.type)
      }

      // Sort by date descending
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date))

      return { transactions, error: null }
    }

    // For simple queries without filters, use the optimized query
    const querySnapshot = await getDocs(q)
    const transactions = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      transactions.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to Date
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      })
    })

    return { transactions, error: null }
  } catch (error) {
    console.error("Error getting transactions:", error)
    return { transactions: [], error: error.message }
  }
}

// Get recent transactions (optimized for dashboard)
export const getRecentTransactions = async (userId, limitCount = 5) => {
  try {
    if (!userId) {
      return { transactions: [], error: "User ID is required" }
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(limitCount),
    )

    const querySnapshot = await getDocs(q)
    const transactions = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      transactions.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      })
    })

    return { transactions, error: null }
  } catch (error) {
    console.error("Error getting recent transactions:", error)
    return { transactions: [], error: error.message }
  }
}

// Get a single transaction by ID
export const getTransaction = async (id) => {
  try {
    if (!id) {
      return { transaction: null, error: "Transaction ID is required" }
    }

    const docRef = doc(db, "transactions", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        transaction: {
          id: docSnap.id,
          ...data,
          date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
        },
        error: null,
      }
    } else {
      return { transaction: null, error: "Transaction not found" }
    }
  } catch (error) {
    console.error("Error getting transaction:", error)
    return { transaction: null, error: error.message }
  }
}

// Update a transaction
export const updateTransaction = async (id, transaction) => {
  try {
    if (!id) {
      return { error: "Transaction ID is required" }
    }

    const docRef = doc(db, "transactions", id)

    // Ensure date is a Timestamp
    const updateData = {
      ...transaction,
      date: transaction.date instanceof Date ? Timestamp.fromDate(transaction.date) : transaction.date,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(docRef, updateData)
    return { error: null }
  } catch (error) {
    console.error("Error updating transaction:", error)
    return { error: error.message }
  }
}

// Delete a transaction
export const deleteTransaction = async (id) => {
  try {
    if (!id) {
      return { error: "Transaction ID is required" }
    }

    const docRef = doc(db, "transactions", id)
    await deleteDoc(docRef)
    return { error: null }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return { error: error.message }
  }
}

// Get transaction statistics for a specific time period (optimized)
export const getTransactionStats = async (userId, startDate, endDate) => {
  try {
    if (!userId) {
      return {
        stats: { totalIncome: 0, totalExpense: 0, balance: 0, expensesByCategory: {} },
        transactions: [],
        error: "User ID is required",
      }
    }

    // Get all transactions for the user first
    const q = query(collection(db, "transactions"), where("userId", "==", userId))

    const querySnapshot = await getDocs(q)
    let transactions = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      transactions.push({
        id: doc.id,
        ...data,
        date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
      })
    })

    // Filter by date range in memory
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    transactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= start && transactionDate <= end
    })

    // Calculate statistics
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + (t.amount || 0), 0)

    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + (t.amount || 0), 0)

    const balance = totalIncome - totalExpense

    // Group expenses by category
    const expensesByCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        if (!acc[t.categoryId]) {
          acc[t.categoryId] = 0
        }
        acc[t.categoryId] += t.amount || 0
        return acc
      }, {})

    return {
      stats: {
        totalIncome,
        totalExpense,
        balance,
        expensesByCategory,
      },
      transactions,
      error: null,
    }
  } catch (error) {
    console.error("Error getting transaction stats:", error)
    return {
      stats: {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        expensesByCategory: {},
      },
      transactions: [],
      error: error.message,
    }
  }
}
