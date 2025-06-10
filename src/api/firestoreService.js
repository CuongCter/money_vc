import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { initializeApp } from "firebase/app"
import { firebaseConfig } from "../config/firebase"

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Collection references
const transactionsRef = collection(db, "transactions")

// Create a new transaction
export const addTransaction = async (transaction) => {
  try {
    const docRef = await addDoc(transactionsRef, {
      ...transaction,
      createdAt: new Date(),
    })
    return { id: docRef.id, ...transaction, error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Update a transaction
export const updateTransaction = async (id, transaction) => {
  try {
    const docRef = doc(db, "transactions", id)
    await updateDoc(docRef, {
      ...transaction,
      updatedAt: new Date(),
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

// Get all transactions for a user
export const getTransactions = async (userId) => {
  try {
    const q = query(transactionsRef, where("userId", "==", userId), orderBy("date", "desc"))

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
