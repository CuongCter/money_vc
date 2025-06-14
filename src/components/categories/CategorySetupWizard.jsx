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

const DEFAULT_CATEGORIES_PREVIEW = [
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

const CategorySetupWizard = ({ onComplete }) => {
  const { user } = useAuthStore()
  const { setCategories } = useCategoryStore()
  const { showSuccess, showError } = useNotificationStore()
  const { t } = useLanguageStore()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

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

        showSuccess("Đã tạo danh mục mặc định thành công!")
        if (onComplete) onComplete()
      } else {
        showError(`Lỗi tạo danh mục: ${error}`)
      }
    } catch (err) {
      showError("Không thể tạo danh mục mặc định")
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng đến với My Expense App!</h2>
          <p className="text-gray-600">Để bắt đầu quản lý chi tiêu, bạn cần tạo các danh mục cho giao dịch của mình.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">🚀 Tùy chọn nhanh (Khuyến nghị)</h3>
            <p className="text-blue-700 text-sm mb-3">
              Chúng tôi sẽ tạo sẵn các danh mục phổ biến để bạn có thể bắt đầu ngay lập tức.
            </p>
            <Button onClick={() => setStep(2)} className="w-full">
              Xem danh mục mặc định
            </Button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">⚙️ Tùy chỉnh thủ công</h3>
            <p className="text-gray-600 text-sm mb-3">Tạo danh mục theo nhu cầu riêng của bạn.</p>
            <Button variant="outline" onClick={() => onComplete && onComplete()} className="w-full">
              Tự tạo danh mục
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
          ← Quay lại
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Danh mục mặc định</h2>
        <p className="text-gray-600">
          Chúng tôi sẽ tạo {DEFAULT_CATEGORIES_PREVIEW.length} danh mục phổ biến để bạn bắt đầu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Income Categories */}
        <div>
          <h3 className="font-medium text-green-700 mb-3 flex items-center">
            <TrendingUp size={16} className="mr-2" />
            Danh mục Thu nhập ({incomeCategories.length})
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
            Danh mục Chi tiêu ({expenseCategories.length})
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
        <h4 className="font-medium text-blue-900 mb-2">💡 Lưu ý:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Bạn có thể chỉnh sửa hoặc xóa các danh mục này sau</li>
          <li>• Có thể thêm danh mục mới bất cứ lúc nào</li>
          <li>• Mỗi danh mục có thể được tùy chỉnh icon và tên</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => onComplete && onComplete()}>
          Bỏ qua, tự tạo
        </Button>
        <Button onClick={handleCreateDefaultCategories} disabled={isLoading} className="min-w-[140px]">
          {isLoading ? (
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-2" />
              Đang tạo...
            </div>
          ) : (
            "Tạo danh mục"
          )}
        </Button>
      </div>
    </div>
  )
}

export default CategorySetupWizard
