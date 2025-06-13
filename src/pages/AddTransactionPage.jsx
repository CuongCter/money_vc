"use client"

import TransactionForm from "../components/transactions/TransactionForm"
import { useLanguageStore } from "../store/languageStore"

const AddTransactionPage = () => {
  const { t } = useLanguageStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("transactions.addTransaction")}</h1>
      </div>

      <TransactionForm />
    </div>
  )
}

export default AddTransactionPage
