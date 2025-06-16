import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../config/firebase"
import { useAuthStore } from "../store/authStore"

const COLLECTION_NAME = "budgets"

export const budgetService = {
  // Get all budgets for current user - simplified query
  async getBudgets() {
    try {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error("User not authenticated")

      // Simplified query without orderBy to avoid index requirement
      const q = query(collection(db, COLLECTION_NAME), where("userId", "==", user.uid))

      const querySnapshot = await getDocs(q)
      const budgets = []

      querySnapshot.forEach((doc) => {
        budgets.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          startDate: doc.data().startDate?.toDate(),
          endDate: doc.data().endDate?.toDate(),
        })
      })

      // Sort in JavaScript instead of Firestore
      return budgets.sort((a, b) => (b.createdAt || new Date()) - (a.createdAt || new Date()))
    } catch (error) {
      console.error("Error fetching budgets:", error)
      throw new Error("Không thể tải danh sách ngân sách")
    }
  },

  // Create new budget
  async createBudget(budgetData) {
    try {
      const { user } = useAuthStore.getState()
      if (!user) throw new Error("User not authenticated")

      const budget = {
        ...budgetData,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), budget)

      return {
        id: docRef.id,
        ...budget,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } catch (error) {
      console.error("Error creating budget:", error)
      throw new Error("Không thể tạo ngân sách")
    }
  },

  // Update budget
  async updateBudget(budgetId, budgetData) {
    try {
      const budgetRef = doc(db, COLLECTION_NAME, budgetId)
      const updateData = {
        ...budgetData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(budgetRef, updateData)

      return {
        id: budgetId,
        ...budgetData,
        updatedAt: new Date(),
      }
    } catch (error) {
      console.error("Error updating budget:", error)
      throw new Error("Không thể cập nhật ngân sách")
    }
  },

  // Delete budget
  async deleteBudget(budgetId) {
    try {
      const budgetRef = doc(db, COLLECTION_NAME, budgetId)
      await deleteDoc(budgetRef)
    } catch (error) {
      console.error("Error deleting budget:", error)
      throw new Error("Không thể xóa ngân sách")
    }
  },
}
