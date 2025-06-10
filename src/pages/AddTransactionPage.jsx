"use client"

import TransactionForm from "../components/transactions/TransactionForm"

const AddTransactionPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Thêm giao dịch</h1>
      </div>

      <TransactionForm />
    </div>
  )
}

export default AddTransactionPage
