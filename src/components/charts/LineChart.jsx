"use client"

import { useMemo } from "react"
import { useLanguageStore } from "../../store/languageStore"
import { formatCurrency } from "../../utils/formatDate"

const LineChart = ({ data, width = 800, height = 400, showIncome = true, showExpense = true }) => {
  const { t } = useLanguageStore()

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { points: [], maxValue: 0, minValue: 0 }

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date))

    // Calculate cumulative values
    let cumulativeIncome = 0
    let cumulativeExpense = 0
    let cumulativeBalance = 0

    const points = sortedData.map((item, index) => {
      if (item.type === "income") {
        cumulativeIncome += item.amount
      } else {
        cumulativeExpense += item.amount
      }
      cumulativeBalance = cumulativeIncome - cumulativeExpense

      return {
        date: new Date(item.date),
        income: cumulativeIncome,
        expense: cumulativeExpense,
        balance: cumulativeBalance,
        index,
      }
    })

    const allValues = []
    if (showIncome) allValues.push(...points.map((p) => p.income))
    if (showExpense) allValues.push(...points.map((p) => p.expense))
    allValues.push(...points.map((p) => p.balance))

    const maxValue = Math.max(...allValues, 0)
    const minValue = Math.min(...allValues, 0)

    return { points, maxValue, minValue }
  }, [data, showIncome, showExpense])

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📈</div>
          <p className="text-gray-500">{t("reports.noData")}</p>
        </div>
      </div>
    )
  }

  const { points, maxValue, minValue } = chartData
  const padding = 60
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  // Calculate scales
  const xScale = chartWidth / (points.length - 1 || 1)
  const valueRange = maxValue - minValue || 1
  const yScale = chartHeight / valueRange

  // Generate path for line
  const generatePath = (getValue) => {
    return points
      .map((point, index) => {
        const x = padding + index * xScale
        const y = padding + chartHeight - (getValue(point) - minValue) * yScale
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  // Generate grid lines
  const gridLines = []
  const numGridLines = 5
  for (let i = 0; i <= numGridLines; i++) {
    const y = padding + (i * chartHeight) / numGridLines
    const value = maxValue - (i * valueRange) / numGridLines
    gridLines.push({ y, value })
  }

  // Generate x-axis labels (show every few points to avoid crowding)
  const xAxisLabels = []
  const labelInterval = Math.max(1, Math.floor(points.length / 6))
  for (let i = 0; i < points.length; i += labelInterval) {
    const point = points[i]
    const x = padding + i * xScale
    xAxisLabels.push({
      x,
      date: point.date,
      label: point.date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    })
  }

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("reports.trendAnalysis")}</h3>
        <div className="flex items-center space-x-4 text-sm">
          {showIncome && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>{t("transactions.income")}</span>
            </div>
          )}
          {showExpense && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>{t("transactions.expense")}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{t("reports.balance")}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {gridLines.map((line, index) => (
            <g key={index}>
              <line
                x1={padding}
                y1={line.y}
                x2={width - padding}
                y2={line.y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text x={padding - 10} y={line.y + 4} textAnchor="end" className="text-xs fill-gray-500">
                {formatCurrency(line.value, true)}
              </text>
            </g>
          ))}

          {/* X-axis */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#374151"
            strokeWidth="2"
          />

          {/* Y-axis */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />

          {/* X-axis labels */}
          {xAxisLabels.map((label, index) => (
            <g key={index}>
              <line
                x1={label.x}
                y1={height - padding}
                x2={label.x}
                y2={height - padding + 5}
                stroke="#374151"
                strokeWidth="1"
              />
              <text x={label.x} y={height - padding + 20} textAnchor="middle" className="text-xs fill-gray-600">
                {label.label}
              </text>
            </g>
          ))}

          {/* Income line */}
          {showIncome && points.length > 1 && (
            <path d={generatePath((p) => p.income)} fill="none" stroke="#10b981" strokeWidth="2" />
          )}

          {/* Expense line */}
          {showExpense && points.length > 1 && (
            <path d={generatePath((p) => p.expense)} fill="none" stroke="#ef4444" strokeWidth="2" />
          )}

          {/* Balance line */}
          {points.length > 1 && (
            <path d={generatePath((p) => p.balance)} fill="none" stroke="#3b82f6" strokeWidth="3" />
          )}

          {/* Data points */}
          {points.map((point, index) => {
            const x = padding + index * xScale
            return (
              <g key={index}>
                {showIncome && (
                  <circle
                    cx={x}
                    cy={padding + chartHeight - (point.income - minValue) * yScale}
                    r="4"
                    fill="#10b981"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${t("transactions.income")}: ${formatCurrency(point.income)}`}</title>
                  </circle>
                )}
                {showExpense && (
                  <circle
                    cx={x}
                    cy={padding + chartHeight - (point.expense - minValue) * yScale}
                    r="4"
                    fill="#ef4444"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`${t("transactions.expense")}: ${formatCurrency(point.expense)}`}</title>
                  </circle>
                )}
                <circle
                  cx={x}
                  cy={padding + chartHeight - (point.balance - minValue) * yScale}
                  r="5"
                  fill="#3b82f6"
                  className="hover:r-7 transition-all cursor-pointer"
                >
                  <title>{`${t("reports.balance")}: ${formatCurrency(point.balance)}`}</title>
                </circle>
              </g>
            )
          })}

          {/* Zero line */}
          {minValue < 0 && maxValue > 0 && (
            <line
              x1={padding}
              y1={padding + chartHeight - (0 - minValue) * yScale}
              x2={width - padding}
              y2={padding + chartHeight - (0 - minValue) * yScale}
              stroke="#6b7280"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        {showIncome && (
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-green-600 font-medium">{t("transactions.income")}</div>
            <div className="text-green-800 font-bold">{formatCurrency(points[points.length - 1]?.income || 0)}</div>
          </div>
        )}
        {showExpense && (
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-red-600 font-medium">{t("transactions.expense")}</div>
            <div className="text-red-800 font-bold">{formatCurrency(points[points.length - 1]?.expense || 0)}</div>
          </div>
        )}
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-blue-600 font-medium">{t("reports.balance")}</div>
          <div
            className={`font-bold ${(points[points.length - 1]?.balance || 0) >= 0 ? "text-blue-800" : "text-red-800"}`}
          >
            {formatCurrency(points[points.length - 1]?.balance || 0)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LineChart
