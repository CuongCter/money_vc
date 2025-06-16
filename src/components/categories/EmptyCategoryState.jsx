"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguageStore } from "../../store/languageStore"
import Button from "../ui/Button"
import CategorySetupWizard from "./CategorySetupWizard"
import { PlusCircle, Settings, BookOpen } from "lucide-react"

const EmptyCategoryState = ({ type = "all" }) => {
  const [showWizard, setShowWizard] = useState(false)
  const navigate = useNavigate()
  const { t } = useLanguageStore()

  const handleWizardComplete = () => {
    setShowWizard(false)
    // Refresh the page or update categories
    window.location.reload()
  }

  if (showWizard) {
    return <CategorySetupWizard onComplete={handleWizardComplete} />
  }

  const getTitle = () => {
    switch (type) {
      case "expense":
        return t("categories.expenseCategories")
      case "income":
        return t("categories.incomeCategories")
      default:
        return t("categories.noCategories")
    }
  }

  const getDescription = () => {
    switch (type) {
      case "expense":
        return t("categories.expenseCategories")
      case "income":
        return t("categories.incomeCategories")
      default:
        return t("categories.createFirst")
    }
  }

  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PlusCircle size={32} className="text-gray-400" />
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-2">{getTitle()}</h3>
        <p className="text-gray-500 mb-6">{getDescription()}</p>

        <div className="space-y-3">
          <Button onClick={() => setShowWizard(true)} className="w-full">
            <BookOpen size={16} className="mr-2" />
            {t("categorySetup.viewDefault")}
          </Button>

          <Button variant="outline" onClick={() => navigate("/settings")} className="w-full">
            <Settings size={16} className="mr-2" />
            {t("categorySetup.createCustom")}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
          <h4 className="font-medium text-blue-900 mb-2">💡 {t("categorySetup.note")}</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            {t("categorySetup.noteItems").map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EmptyCategoryState
