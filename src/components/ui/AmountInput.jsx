"use client"

import { useState } from "react"
import { Calculator } from "lucide-react"

const AmountInput = ({ value, onChange, placeholder = "0", error, currency = "VNĐ", className = "", ...props }) => {
  const [focused, setFocused] = useState(false)

  const handleChange = (e) => {
    const inputValue = e.target.value
    // Only allow numbers and decimal point
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      onChange(e)
    }
  }

  const formatDisplayValue = (val) => {
    if (!val || focused) return val
    const num = Number.parseFloat(val)
    if (isNaN(num)) return val
    return new Intl.NumberFormat("vi-VN").format(num)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={focused ? value : formatDisplayValue(value)}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={`w-full pl-8 pr-12 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      <Calculator size={16} className="absolute left-2.5 top-3 text-gray-400" />
      <span className="absolute right-3 top-3 text-sm text-gray-500">{currency}</span>
    </div>
  )
}

export default AmountInput
