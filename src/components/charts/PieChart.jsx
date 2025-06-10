"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

const PieChart = ({ data, labels, colors, title }) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")

    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors || [
              "#4F46E5", // indigo-600
              "#0EA5E9", // sky-500
              "#10B981", // emerald-500
              "#F59E0B", // amber-500
              "#EF4444", // red-500
              "#8B5CF6", // violet-500
              "#EC4899", // pink-500
              "#6366F1", // indigo-500
              "#14B8A6", // teal-500
              "#F97316", // orange-500
            ],
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 15,
              padding: 15,
            },
          },
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.formattedValue
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = Math.round((context.raw / total) * 100)
                return `${label}: ${value} (${percentage}%)`
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, labels, colors, title])

  return (
    <div className="h-64 md:h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default PieChart
