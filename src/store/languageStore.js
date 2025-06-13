import { create } from "zustand"
import { persist } from "zustand/middleware"
import { vi } from "../locales/vi"
import { en } from "../locales/en"

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: "vi", // Default language is Vietnamese
      translations: {
        vi,
        en,
      },

      // Change language
      setLanguage: (language) => {
        set({ language })
      },

      // Get translation for a key
      t: (key) => {
        const { language, translations } = get()
        const keys = key.split(".")
        let translation = translations[language]

        for (const k of keys) {
          if (!translation[k]) return key
          translation = translation[k]
        }

        return translation
      },

      // Check if current language is Vietnamese
      isVietnamese: () => get().language === "vi",

      // Check if current language is English
      isEnglish: () => get().language === "en",
    }),
    {
      name: "language-storage", // Name for localStorage
    },
  ),
)
