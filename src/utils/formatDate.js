export const formatDate = (date, format = "dd/MM/yyyy") => {
  if (!date) return ""

  const d = date instanceof Date ? date : new Date(date)

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

  const d = date instanceof Date ? date : new Date(date)

  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫"

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount)
}

export const formatNumber = (number) => {
  if (typeof number !== "number") return "0"

  return new Intl.NumberFormat("vi-VN").format(number)
}
