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
  { name: "Khác", type: "expense", icon: "more-horizontal", isDefault: true },
]

// Create default categories for a new user
export const createDefaultCategories = async (userId) => {
  try {
    const batch = []

    for (const category of DEFAULT_CATEGORIES) {
      batch.push(
        addDoc(collection(db, "categories"), {
          ...category,
          userId: userId, // Đảm bảo userId được set
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
    return { error: error.message }
  }
}

// Update a category (only if it belongs to the user and is not a default category)
export const updateCategory = async (id, category, userId) => {
  try {
    const docRef = doc(db, "categories", id)

    // Only update if it's not a default category and belongs to the user
    if (!category.isDefault && category.userId === userId) {
      await updateDoc(docRef, {
        ...category,
        updatedAt: serverTimestamp(),
      })
    }

    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}

// Delete a category (only if it belongs to the user and is not a default category)
export const deleteCategory = async (id, category) => {
  try {
    // Only delete if it's not a default category
    if (!category.isDefault) {
      const docRef = doc(db, "categories", id)
      await deleteDoc(docRef)
    }

    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}
