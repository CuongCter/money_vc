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
    return { error: error.message }
  }
}

// Get all transactions for a user
export const getTransactions = async (userId, filters = {}) => {
  try {
    let q = query(collection(db, "transactions"), where("userId", "==", userId), orderBy("date", "desc"))

    // Apply date filters if provided
    if (filters.startDate) {
      const startDate = new Date(filters.startDate)
      startDate.setHours(0, 0, 0, 0)
      q = query(q, where("date", ">=", Timestamp.fromDate(startDate)))
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59, 999)
      q = query(q, where("date", "<=", Timestamp.fromDate(endDate)))
    }

    // Apply category filter if provided
    if (filters.categoryId) {
      q = query(q, where("categoryId", "==", filters.categoryId))
    }

    // Apply type filter if provided
    if (filters.type) {
      q = query(q, where("type", "==", filters.type))
    }

    const querySnapshot = await getDocs(q)
    const transactions = []

    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { transactions, error: null }
  } catch (error) {
    return { transactions: [], error: error.message }
  }
}

// Get a single transaction by ID
export const getTransaction = async (id) => {
  try {
    const docRef = doc(db, "transactions", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { transaction: { id: docSnap.id, ...docSnap.data() }, error: null }
    } else {
      return { transaction: null, error: "Transaction not found" }
    }
  } catch (error) {
    return { transaction: null, error: error.message }
  }
}

// Update a transaction
export const updateTransaction = async (id, transaction) => {
  try {
    const docRef = doc(db, "transactions", id)
    await updateDoc(docRef, {
      ...transaction,
      updatedAt: serverTimestamp(),
    })

    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Delete a transaction
export const deleteTransaction = async (id) => {
  try {
    const docRef = doc(db, "transactions", id)
    await deleteDoc(docRef)

    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Get transaction statistics for a specific time period
export const getTransactionStats = async (userId, startDate, endDate) => {
  try {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("date", ">=", Timestamp.fromDate(start)),
      where("date", "<=", Timestamp.fromDate(end)),
    )

    const querySnapshot = await getDocs(q)
    const transactions = []

    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    // Calculate statistics
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    // Group expenses by category
    const expensesByCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        if (!acc[t.categoryId]) {
          acc[t.categoryId] = 0
        }
        acc[t.categoryId] += t.amount
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
