"use client"

import { useState, useCallback } from "react"
import MonthlyReport from "../components/reports/MonthlyReport"
import TrendAnalysis from "../components/reports/TrendAnalysis"
import ExportButton from "../components/reports/ExportButton"
import Button from "../components/ui/Button"
import { ChevronLeft, ChevronRight, BarChart3, TrendingUp } from "lucide-react"
import { useLanguageStore } from "../store/languageStore"

const ReportsPage = () => {
  const { t } = useLanguageStore()
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [activeTab, setActiveTab] = useState("monthly") // 'monthly' or 'trend'
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
          {/* Tab Navigation */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === "monthly" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("monthly")}
              className="flex items-center space-x-2"
            >
              <BarChart3 size={16} />
              <span>{t("reports.monthlyReport")}</span>
            </Button>
            <Button
              variant={activeTab === "trend" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("trend")}
              className="flex items-center space-x-2"
            >
              <TrendingUp size={16} />
              <span>{t("reports.trendAnalysis")}</span>
            </Button>
          </div>

          {/* Export Button - only show for monthly report */}
          {activeTab === "monthly" && (
            <ExportButton
              stats={reportData.stats}
              transactions={reportData.transactions}
              categories={reportData.categories}
              month={selectedMonth}
              year={selectedYear}
            />
          )}

          {/* Month/Year Navigation - only show for monthly report */}
          {activeTab === "monthly" && (
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
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "monthly" ? (
        <MonthlyReport month={selectedMonth} year={selectedYear} onDataUpdate={handleDataUpdate} />
      ) : (
        <TrendAnalysis />
      )}
    </div>
  )
}

export default ReportsPage
