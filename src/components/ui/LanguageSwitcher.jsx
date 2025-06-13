"use client"

import { useLanguageStore } from "../../store/languageStore"
import { Globe } from "lucide-react"

const LanguageSwitcher = ({ className = "" }) => {
  const { language, setLanguage, t } = useLanguageStore()

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi")
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none ${className}`}
      aria-label={t("settings.language")}
    >
      <Globe size={20} />
      <span className="text-sm font-medium">{language === "vi" ? "EN" : "VI"}</span>
    </button>
  )
}

export default LanguageSwitcher
