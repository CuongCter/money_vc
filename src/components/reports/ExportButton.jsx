"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import Button from "../ui/Button"
import { useLanguageStore } from "../../store/languageStore"
import { useNotificationStore } from "../../store/notificationStore"
import { exportToExcel, exportToPDF, prepareExportData } from "../../services/exportService"

const ExportButton = ({ stats, transactions, categories, month, year }) => {
  const { t } = useLanguageStore()
  const { addNotification } = useNotificationStore()
  const [isExporting, setIsExporting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleExport = async (format) => {
    setIsExporting(true)
    setShowDropdown(false)

    try {
      // Prepare data
      const exportData = prepareExportData(stats, transactions, categories, month, year, t)

      // Generate filename
      const monthNames = [
        "thang-1",
        "thang-2",
        "thang-3",
        "thang-4",
        "thang-5",
        "thang-6",
        "thang-7",
        "thang-8",
        "thang-9",
        "thang-10",
        "thang-11",
        "thang-12",
      ]
      const filename = `bao-cao-thu-chi-${monthNames[month - 1]}-${year}`

      let result
      if (format === "excel") {
        result = exportToExcel(exportData, filename)
      } else if (format === "pdf") {
        result = exportToPDF(exportData, filename)
      }

      if (result.success) {
        addNotification({
          type: "success",
          message: t(`reports.export${format.charAt(0).toUpperCase() + format.slice(1)}Success`),
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Export error:", error)
      addNotification({
        type: "error",
        message: t("reports.exportError"),
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting || transactions.length === 0}
        className="flex items-center space-x-2"
      >
        <Download size={16} />
        <span>{isExporting ? t("reports.exporting") : t("reports.exportReport")}</span>
      </Button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                onClick={() => handleExport("excel")}
                disabled={isExporting}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <FileSpreadsheet size={16} className="mr-3 text-green-600" />
                {t("reports.exportExcel")}
              </button>

              <button
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <FileText size={16} className="mr-3 text-red-600" />
                {t("reports.exportPdf")}
              </button>
            </div>
          </div>
        </>
      )}

      {transactions.length === 0 && (
        <div className="absolute top-full right-0 mt-1 text-xs text-gray-500">{t("reports.noDataToExport")}</div>
      )}
    </div>
  )
}

export default ExportButton
