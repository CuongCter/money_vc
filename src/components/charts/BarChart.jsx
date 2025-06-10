"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

const BarChart = ({ data, labels, title, horizontal = false }) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")

    chartInstance.current = new Chart(ctx, {
      type: horizontal ? "horizontalBar" : "bar",
      data: {
        labels,
        datasets: [
          {
            label: title || "Dữ liệu",
            data,
            backgroundColor: "#4F46E5", // indigo-600
            borderColor: "#4338CA", // indigo-700
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: !!title,
            text: title,
            font: {
              size: 16,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, labels, title, horizontal])

  return (
    <div className="h-64 md:h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}

export default BarChart
