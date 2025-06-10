"use client"

import { useState } from "react"
import MonthlyReport from "../components/reports/MonthlyReport"
import Button from "../components/ui/Button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ReportsPage = () => {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>

        {/* Month/Year Navigation */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft size={16} />
          </Button>
          <span className="px-4 py-2 text-sm font-medium">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <MonthlyReport month={selectedMonth} year={selectedYear} />
    </div>
  )
}

export default ReportsPage
