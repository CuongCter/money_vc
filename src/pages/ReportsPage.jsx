"use client"

import { useState, useCallback } from "react"
import MonthlyReport from "../components/reports/MonthlyReport"
import ExportButton from "../components/reports/ExportButton"
import Button from "../components/ui/Button"
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react"
import { useLanguageStore } from "../store/languageStore"

const ReportsPage = () => {
  const { t } = useLanguageStore()
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [reportData, setReportData] = useState({
    stats: { totalIncome: 0, totalExpense: 0, balance: 0, expensesByCategory: {} },
    transactions: [],
    categories: [],
  })

  const monthNames = [
    t("months.january"),
    t("months.february"),
    t("months.march"),
    t("months.april"),
    t("months.may"),
    t("months.june"),
    t("months.july"),
    t("months.august"),
    t("months.september"),
    t("months.october"),
    t("months.november"),
    t("months.december"),
  ]

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const handleDataUpdate = useCallback((data) => {
    setReportData(data)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 size={24} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("reports.reports")}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Export Button */}
          <ExportButton
            stats={reportData.stats}
            transactions={reportData.transactions}
            categories={reportData.categories}
            month={selectedMonth}
            year={selectedYear}
          />

          {/* Month/Year Navigation */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft size={16} />
            </Button>
            <span className="px-4 py-2 text-sm font-medium bg-gray-50 rounded-md min-w-[140px] text-center">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      <MonthlyReport month={selectedMonth} year={selectedYear} onDataUpdate={handleDataUpdate} />
    </div>
  )
}

export default ReportsPage
