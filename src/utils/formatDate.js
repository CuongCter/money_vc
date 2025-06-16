export const formatDate = (date, format = "dd/MM/yyyy") => {
  if (!date) return ""

  let d

  // Handle different date formats
  if (date instanceof Date) {
    d = date
  } else if (date.seconds) {
    // Firestore Timestamp
    d = new Date(date.seconds * 1000)
  } else if (typeof date === "string") {
    d = new Date(date)
  } else {
    d = new Date(date)
  }

  // Check if date is valid
  if (isNaN(d.getTime())) {
    return "Invalid Date"
  }

  if (format === "yyyy-MM-dd") {
    return d.toISOString().split("T")[0]
  }

  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export const formatDateTime = (date) => {
  if (!date) return ""

  let d

  if (date instanceof Date) {
    d = date
  } else if (date.seconds) {
    // Firestore Timestamp
    d = new Date(date.seconds * 1000)
  } else {
    d = new Date(date)
  }

  // Check if date is valid
  if (isNaN(d.getTime())) {
    return "Invalid Date"
  }

  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatCurrency = (amount) => {
  if (typeof amount !== "number" && typeof amount !== "string") return "0 ₫"

  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  if (isNaN(numAmount)) return "0 ₫"

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)
}

export const formatNumber = (number) => {
  if (typeof number !== "number" && typeof number !== "string") return "0"

  const numValue = typeof number === "string" ? Number.parseFloat(number) : number

  if (isNaN(numValue)) return "0"

  return new Intl.NumberFormat("vi-VN").format(numValue)
}

// Helper function to safely convert date
export const safeFormatDate = (date) => {
  try {
    if (!date) return ""

    let dateObj

    if (date instanceof Date) {
      dateObj = date
    } else if (date.toDate && typeof date.toDate === "function") {
      // Firestore Timestamp
      dateObj = date.toDate()
    } else if (date.seconds) {
      // Firestore Timestamp object
      dateObj = new Date(date.seconds * 1000)
    } else if (typeof date === "string" || typeof date === "number") {
      dateObj = new Date(date)
    } else {
      return "Invalid Date"
    }

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"
    }

    return dateObj.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid Date"
  }
}
