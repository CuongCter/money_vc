"use client"

import { useState } from "react"
import { useAuthStore } from "../../store/authStore"
import { useCategoryStore } from "../../store/categoryStore"
import { useNotificationStore } from "../../store/notificationStore"
import { useLanguageStore } from "../../store/languageStore"
import { createDefaultCategories } from "../../api/categoryService"
import Button from "../ui/Button"
import LoadingSpinner from "../ui/LoadingSpinner"
import {
  Coffee,
  Car,
  FileText,
  ShoppingBag,
  Film,
  Activity,
  Book,
  Home,
  Gift,
  DollarSign,
  CreditCard,
  Briefcase,
  Smartphone,
  Heart,
  Globe,
  MapPin,
  Users,
  Zap,
  PlusCircle,
  Wallet,
  TrendingUp,
  MoreHorizontal,
} from "lucide-react"

const ICON_MAP = {
  coffee: Coffee,
  car: Car,
  "file-text": FileText,
  "shopping-bag": ShoppingBag,
  film: Film,
  activity: Activity,
  book: Book,
  home: Home,
  gift: Gift,
  "dollar-sign": DollarSign,
  "credit-card": CreditCard,
  briefcase: Briefcase,
  smartphone: Smartphone,
  heart: Heart,
  globe: Globe,
  "map-pin": MapPin,
  users: Users,
  zap: Zap,
  "plus-circle": PlusCircle,
  wallet: Wallet,
  "trending-up": TrendingUp,
  "more-horizontal": MoreHorizontal,
}

const CategorySetupWizard = ({ onComplete }) => {
  const { user } = useAuthStore()
  const { setCategories } = useCategoryStore()
  const { showSuccess, showError } = useNotificationStore()
  const { t } = useLanguageStore()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const DEFAULT_CATEGORIES_PREVIEW = [
    // Income categories
    { name: t("icons.wallet"), type: "income", icon: "wallet", isDefault: true },
    { name: t("icons.gift"), type: "income", icon: "gift", isDefault: true },
    { name: t("icons.trending-up"), type: "income", icon: "trending-up", isDefault: true },
    { name: t("icons.plus-circle"), type: "income", icon: "plus-circle", isDefault: true },

    // Expense categories
    { name: t("icons.coffee"), type: "expense", icon: "coffee", isDefault: true },
    { name: t("icons.car"), type: "expense", icon: "car", isDefault: true },
    { name: t("icons.file-text"), type: "expense", icon: "file-text", isDefault: true },
    { name: t("icons.shopping-bag"), type: "expense", icon: "shopping-bag", isDefault: true },
    { name: t("icons.film"), type: "expense", icon: "film", isDefault: true },
    { name: t("icons.activity"), type: "expense", icon: "activity", isDefault: true },
    { name: t("icons.book"), type: "expense", icon: "book", isDefault: true },
    { name: t("icons.plus-circle"), type: "expense", icon: "more-horizontal", isDefault: true },
  ]

  const handleCreateDefaultCategories = async () => {
    if (!user?.uid) return

    setIsLoading(true)
    try {
      const { success, error } = await createDefaultCategories(user.uid)

      if (success) {
        // Update local store with default categories
        const categoriesWithIds = DEFAULT_CATEGORIES_PREVIEW.map((cat, index) => ({
          ...cat,
          id: `default_${index}`,
          userId: user.uid,
        }))
        setCategories(categoriesWithIds)

        showSuccess(t("success.categoriesCreated"))
        if (onComplete) onComplete()
      } else {
        showError(`${t("common.error")}: ${error}`)
      }
    } catch (err) {
      showError(t("errors.unexpectedError"))
    } finally {
      setIsLoading(false)
    }
  }

  const expenseCategories = DEFAULT_CATEGORIES_PREVIEW.filter((cat) => cat.type === "expense")
  const incomeCategories = DEFAULT_CATEGORIES_PREVIEW.filter((cat) => cat.type === "income")

  if (step === 1) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle size={32} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("categorySetup.welcome")}</h2>
          <p className="text-gray-600">{t("categorySetup.welcomeDesc")}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">🚀 {t("categorySetup.quickOption")}</h3>
            <p className="text-blue-700 text-sm mb-3">{t("categorySetup.quickOptionDesc")}</p>
            <Button onClick={() => setStep(2)} className="w-full">
              {t("categorySetup.viewDefault")}
            </Button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">⚙️ {t("categorySetup.customOption")}</h3>
            <p className="text-gray-600 text-sm mb-3">{t("categorySetup.customOptionDesc")}</p>
            <Button variant="outline" onClick={() => onComplete && onComplete()} className="w-full">
              {t("categorySetup.createCustom")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4">
          ← {t("common.back")}
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("categorySetup.defaultCategories")}</h2>
        <p className="text-gray-600">
          {t("categorySetup.defaultCategoriesDesc").replace("{count}", DEFAULT_CATEGORIES_PREVIEW.length)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Income Categories */}
        <div>
          <h3 className="font-medium text-green-700 mb-3 flex items-center">
            <TrendingUp size={16} className="mr-2" />
            {t("categories.incomeCategories")} ({incomeCategories.length})
          </h3>
          <div className="space-y-2">
            {incomeCategories.map((category, index) => {
              const IconComponent = ICON_MAP[category.icon] || PlusCircle
              return (
                <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <IconComponent size={16} className="text-green-600" />
                  </div>
                  <span className="font-medium text-green-800">{category.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Expense Categories */}
        <div>
          <h3 className="font-medium text-red-700 mb-3 flex items-center">
            <Coffee size={16} className="mr-2" />
            {t("categories.expenseCategories")} ({expenseCategories.length})
          </h3>
          <div className="space-y-2">
            {expenseCategories.map((category, index) => {
              const IconComponent = ICON_MAP[category.icon] || PlusCircle
              return (
                <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <IconComponent size={16} className="text-red-600" />
                  </div>
                  <span className="font-medium text-red-800">{category.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">💡 {t("categorySetup.note")}</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          {t("categorySetup.noteItems").map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => onComplete && onComplete()}>
          {t("categorySetup.skipCreate")}
        </Button>
        <Button onClick={handleCreateDefaultCategories} disabled={isLoading} className="min-w-[140px]">
          {isLoading ? (
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              {t("categorySetup.creating")}
            </div>
          ) : (
            t("categorySetup.createCategories")
          )}
        </Button>
      </div>
    </div>
  )
}

export default CategorySetupWizard
