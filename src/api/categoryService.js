import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../config/firebase"

// Default categories to be created for new users
export const DEFAULT_CATEGORIES = [
  // Income categories
  { name: "Lương", type: "income", icon: "wallet", isDefault: true },
  { name: "Thưởng", type: "income", icon: "gift", isDefault: true },
  { name: "Đầu tư", type: "income", icon: "trending-up", isDefault: true },
  { name: "Khác", type: "income", icon: "plus-circle", isDefault: true },

  // Expense categories
  { name: "Ăn uống", type: "expense", icon: "coffee", isDefault: true },
  { name: "Di chuyển", type: "expense", icon: "car", isDefault: true },
  { name: "Hóa đơn", type: "expense", icon: "file-text", isDefault: true },
  { name: "Mua sắm", type: "expense", icon: "shopping-bag", isDefault: true },
  { name: "Giải trí", type: "expense", icon: "film", isDefault: true },
  { name: "Y tế", type: "expense", icon: "activity", isDefault: true },
  { name: "Giáo dục", type: "expense", icon: "book", isDefault: true },
  { name: "Khác", type: "expense", icon: "plus-circle", isDefault: true },
]

// Create default categories for a new user
export const createDefaultCategories = async (userId) => {
  try {
    const batch = []

    for (const category of DEFAULT_CATEGORIES) {
      batch.push(
        addDoc(collection(db, "categories"), {
          ...category,
          userId: userId,
          createdAt: serverTimestamp(),
        }),
      )
    }

    await Promise.all(batch)
    return { success: true, error: null }
  } catch (error) {
    console.error("Error creating default categories:", error)
    return { success: false, error: error.message }
  }
}

// Get all categories for a user (including default ones)
export const getCategories = async (userId) => {
  try {
    // First, get user's own categories
    const userCategoriesQuery = query(collection(db, "categories"), where("userId", "==", userId))

    // Then, get default categories (where userId is null or doesn't exist)
    const defaultCategoriesQuery = query(collection(db, "categories"), where("userId", "==", null))

    const [userSnapshot, defaultSnapshot] = await Promise.all([
      getDocs(userCategoriesQuery),
      getDocs(defaultCategoriesQuery),
    ])

    const categories = []

    // Add user categories
    userSnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    // Add default categories
    defaultSnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return { categories, error: null }
  } catch (error) {
    console.error("Error getting categories:", error)
    return { categories: [], error: error.message }
  }
}

// Add a new custom category
export const addCategory = async (category, userId) => {
  try {
    const docRef = await addDoc(collection(db, "categories"), {
      ...category,
      userId,
      isDefault: false,
      createdAt: serverTimestamp(),
    })

    return { id: docRef.id, ...category, error: null }
  } catch (error) {
    console.error("Error adding category:", error)
    return { error: error.message }
  }
}

// Update a category (only if it belongs to the user and is not a default category)
export const updateCategory = async (id, categoryData, userId) => {
  try {
    if (!id) {
      return { error: "Category ID is required" }
    }

    const docRef = doc(db, "categories", id)

    // Prepare update data
    const updateData = {
      ...categoryData,
      updatedAt: serverTimestamp(),
    }

    await updateDoc(docRef, updateData)
    return { error: null }
  } catch (error) {
    console.error("Error updating category:", error)
    return { error: error.message }
  }
}

// Delete a category (only if it belongs to the user and is not a default category)
export const deleteCategory = async (id, category) => {
  try {
    if (!id) {
      return { error: "Category ID is required" }
    }

    // Only delete if it's not a default category
    if (category.isDefault) {
      return { error: "Cannot delete default category" }
    }

    const docRef = doc(db, "categories", id)
    await deleteDoc(docRef)
    return { error: null }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { error: error.message }
  }
}

// Check if category is being used by any transactions
export const checkCategoryUsage = async (categoryId, userId) => {
  try {
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("categoryId", "==", categoryId),
    )

    const snapshot = await getDocs(transactionsQuery)
    return {
      isUsed: !snapshot.empty,
      count: snapshot.size,
      error: null,
    }
  } catch (error) {
    console.error("Error checking category usage:", error)
    return { isUsed: false, count: 0, error: error.message }
  }
}
