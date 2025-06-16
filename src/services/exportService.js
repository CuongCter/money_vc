import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Format currency for display
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format currency for PDF (simple format)
const formatCurrencyForPDF = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND"
}

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// Get month key for translation
const getMonthKey = (month) => {
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ]
  return months[month - 1]
}

// Prepare data for export
export const prepareExportData = (stats, transactions, categories, month, year, t) => {
  // Create category lookup
  const categoryLookup = {}
  categories.forEach((cat) => {
    categoryLookup[cat.id] = cat.name
  })

  // Calculate category breakdown
  const categoryBreakdown = []
  if (stats.expensesByCategory) {
    Object.entries(stats.expensesByCategory).forEach(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId)
      const percentage = stats.totalExpense > 0 ? (amount / stats.totalExpense) * 100 : 0
      categoryBreakdown.push({
        category: category ? category.name : "Không có danh mục",
        amount: amount,
        percentage: percentage,
      })
    })
  }

  // Prepare summary data
  const summary = {
    period: `${t(`months.${getMonthKey(month)}`)} ${year}`,
    totalIncome: stats.totalIncome || 0,
    totalExpense: stats.totalExpense || 0,
    balance: (stats.totalIncome || 0) - (stats.totalExpense || 0),
    totalTransactions: transactions.length,
    incomeTransactions: transactions.filter((t) => t.type === "income").length,
    expenseTransactions: transactions.filter((t) => t.type === "expense").length,
  }

  // Prepare transaction details
  const transactionDetails = transactions.map((transaction) => ({
    date: formatDate(transaction.date),
    description: transaction.description || "Không có mô tả",
    category: categoryLookup[transaction.categoryId] || "Không có danh mục",
    type: transaction.type === "income" ? "Thu nhập" : "Chi tiêu",
    amount: transaction.amount,
    formattedAmount: formatCurrency(transaction.amount),
  }))

  return {
    summary,
    categoryBreakdown,
    transactionDetails,
    t,
  }
}

// Export to Excel
export const exportToExcel = (data, filename) => {
  try {
    const { summary, categoryBreakdown, transactionDetails } = data

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ["BÁO CÁO THU CHI"],
      [""],
      ["Khoảng thời gian", summary.period],
      ["Tổng giao dịch", summary.totalTransactions],
      ["Thu nhập", formatCurrency(summary.totalIncome)],
      ["Chi tiêu", formatCurrency(summary.totalExpense)],
      ["Số dư", formatCurrency(summary.balance)],
      [""],
      ["PHÂN TÍCH THEO DANH MỤC"],
      [""],
    ]

    // Add category breakdown
    if (categoryBreakdown.length > 0) {
      summaryData.push(["Danh mục", "Số tiền", "Tỷ lệ %"])
      categoryBreakdown.forEach((item) => {
        summaryData.push([item.category, formatCurrency(item.amount), `${item.percentage.toFixed(1)}%`])
      })
    } else {
      summaryData.push(["Không có dữ liệu"])
    }

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, summaryWs, "Tổng quan")

    // Transactions sheet
    if (transactionDetails.length > 0) {
      const transactionData = [["Ngày", "Mô tả", "Danh mục", "Loại", "Số tiền"]]

      transactionDetails.forEach((transaction) => {
        transactionData.push([
          transaction.date,
          transaction.description,
          transaction.category,
          transaction.type,
          transaction.formattedAmount,
        ])
      })

      const transactionWs = XLSX.utils.aoa_to_sheet(transactionData)

      // Set column widths
      transactionWs["!cols"] = [
        { wch: 12 }, // Date
        { wch: 30 }, // Description
        { wch: 20 }, // Category
        { wch: 12 }, // Type
        { wch: 15 }, // Amount
      ]

      XLSX.utils.book_append_sheet(wb, transactionWs, "Chi tiết giao dịch")
    }

    // Save file
    XLSX.writeFile(wb, `${filename}.xlsx`)

    return { success: true }
  } catch (error) {
    console.error("Excel export error:", error)
    return { success: false, error: error.message }
  }
}

// Export to PDF using jsPDF with better Vietnamese support
export const exportToPDF = (data, filename) => {
  try {
    const { summary, categoryBreakdown, transactionDetails } = data

    // Create PDF
    const doc = new jsPDF("p", "mm", "a4")
    let yPosition = 20

    // Title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text("BAO CAO THU CHI", 105, yPosition, { align: "center" })
    yPosition += 15

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    // Convert Vietnamese text to safe characters for PDF
    const safePeriod = summary.period
      .replace(/ă/g, "a")
      .replace(/â/g, "a")
      .replace(/á/g, "a")
      .replace(/à/g, "a")
      .replace(/ã/g, "a")
      .replace(/ạ/g, "a")
      .replace(/ê/g, "e")
      .replace(/é/g, "e")
      .replace(/è/g, "e")
      .replace(/ẽ/g, "e")
      .replace(/ẹ/g, "e")
      .replace(/ô/g, "o")
      .replace(/ơ/g, "o")
      .replace(/ó/g, "o")
      .replace(/ò/g, "o")
      .replace(/õ/g, "o")
      .replace(/ọ/g, "o")
      .replace(/ư/g, "u")
      .replace(/ú/g, "u")
      .replace(/ù/g, "u")
      .replace(/ũ/g, "u")
      .replace(/ụ/g, "u")
      .replace(/í/g, "i")
      .replace(/ì/g, "i")
      .replace(/ĩ/g, "i")
      .replace(/ị/g, "i")
      .replace(/ý/g, "y")
      .replace(/ỳ/g, "y")
      .replace(/ỹ/g, "y")
      .replace(/ỵ/g, "y")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")

    doc.text(safePeriod, 105, yPosition, { align: "center" })
    yPosition += 20

    // Summary section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("TONG QUAN", 20, yPosition)
    yPosition += 10

    const summaryRows = [
      ["Tong giao dich", summary.totalTransactions.toString()],
      ["Thu nhap", formatCurrencyForPDF(summary.totalIncome)],
      ["Chi tieu", formatCurrencyForPDF(summary.totalExpense)],
      ["So du", formatCurrencyForPDF(summary.balance)],
    ]

    autoTable(doc, {
      startY: yPosition,
      head: [["Muc", "Gia tri"]],
      body: summaryRows,
      theme: "grid",
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
      },
      margin: { left: 20, right: 20 },
    })

    yPosition = doc.lastAutoTable.finalY + 20

    // Category breakdown
    if (categoryBreakdown.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("PHAN TICH THEO DANH MUC", 20, yPosition)
      yPosition += 10

      const categoryRows = categoryBreakdown.map((item) => [
        item.category
          .replace(/ă/g, "a")
          .replace(/â/g, "a")
          .replace(/á/g, "a")
          .replace(/à/g, "a")
          .replace(/ã/g, "a")
          .replace(/ạ/g, "a")
          .replace(/ê/g, "e")
          .replace(/é/g, "e")
          .replace(/è/g, "e")
          .replace(/ẽ/g, "e")
          .replace(/ẹ/g, "e")
          .replace(/ô/g, "o")
          .replace(/ơ/g, "o")
          .replace(/ó/g, "o")
          .replace(/ò/g, "o")
          .replace(/õ/g, "o")
          .replace(/ọ/g, "o")
          .replace(/ư/g, "u")
          .replace(/ú/g, "u")
          .replace(/ù/g, "u")
          .replace(/ũ/g, "u")
          .replace(/ụ/g, "u")
          .replace(/í/g, "i")
          .replace(/ì/g, "i")
          .replace(/ĩ/g, "i")
          .replace(/ị/g, "i")
          .replace(/ý/g, "y")
          .replace(/ỳ/g, "y")
          .replace(/ỹ/g, "y")
          .replace(/ỵ/g, "y")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D"),
        formatCurrencyForPDF(item.amount),
        `${item.percentage.toFixed(1)}%`,
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [["Danh muc", "So tien", "Ty le %"]],
        body: categoryRows,
        theme: "grid",
        headStyles: {
          fillColor: [40, 167, 69],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 9,
        },
        margin: { left: 20, right: 20 },
      })

      yPosition = doc.lastAutoTable.finalY + 20
    }

    // Transaction details (limit to 30 for PDF)
    if (transactionDetails.length > 0) {
      // Add new page if needed
      if (yPosition > 220) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("CHI TIET GIAO DICH", 20, yPosition)
      yPosition += 5

      if (transactionDetails.length > 30) {
        doc.setFontSize(10)
        doc.setFont("helvetica", "italic")
        doc.text(`(Hien thi 30 trong tong so ${transactionDetails.length} giao dich)`, 20, yPosition)
      }
      yPosition += 10

      const transactionRows = transactionDetails
        .slice(0, 30)
        .map((transaction) => [
          transaction.date,
          (transaction.description.length > 25
            ? transaction.description.substring(0, 25) + "..."
            : transaction.description
          )
            .replace(/ă/g, "a")
            .replace(/â/g, "a")
            .replace(/á/g, "a")
            .replace(/à/g, "a")
            .replace(/ã/g, "a")
            .replace(/ạ/g, "a")
            .replace(/ê/g, "e")
            .replace(/é/g, "e")
            .replace(/è/g, "e")
            .replace(/ẽ/g, "e")
            .replace(/ẹ/g, "e")
            .replace(/ô/g, "o")
            .replace(/ơ/g, "o")
            .replace(/ó/g, "o")
            .replace(/ò/g, "o")
            .replace(/õ/g, "o")
            .replace(/ọ/g, "o")
            .replace(/ư/g, "u")
            .replace(/ú/g, "u")
            .replace(/ù/g, "u")
            .replace(/ũ/g, "u")
            .replace(/ụ/g, "u")
            .replace(/í/g, "i")
            .replace(/ì/g, "i")
            .replace(/ĩ/g, "i")
            .replace(/ị/g, "i")
            .replace(/ý/g, "y")
            .replace(/ỳ/g, "y")
            .replace(/ỹ/g, "y")
            .replace(/ỵ/g, "y")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D"),
          (transaction.category.length > 15 ? transaction.category.substring(0, 15) + "..." : transaction.category)
            .replace(/ă/g, "a")
            .replace(/â/g, "a")
            .replace(/á/g, "a")
            .replace(/à/g, "a")
            .replace(/ã/g, "a")
            .replace(/ạ/g, "a")
            .replace(/ê/g, "e")
            .replace(/é/g, "e")
            .replace(/è/g, "e")
            .replace(/ẽ/g, "e")
            .replace(/ẹ/g, "e")
            .replace(/ô/g, "o")
            .replace(/ơ/g, "o")
            .replace(/ó/g, "o")
            .replace(/ò/g, "o")
            .replace(/õ/g, "o")
            .replace(/ọ/g, "o")
            .replace(/ư/g, "u")
            .replace(/ú/g, "u")
            .replace(/ù/g, "u")
            .replace(/ũ/g, "u")
            .replace(/ụ/g, "u")
            .replace(/í/g, "i")
            .replace(/ì/g, "i")
            .replace(/ĩ/g, "i")
            .replace(/ị/g, "i")
            .replace(/ý/g, "y")
            .replace(/ỳ/g, "y")
            .replace(/ỹ/g, "y")
            .replace(/ỵ/g, "y")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D"),
          transaction.type
            .replace(/ă/g, "a")
            .replace(/â/g, "a")
            .replace(/á/g, "a")
            .replace(/à/g, "a")
            .replace(/ã/g, "a")
            .replace(/ạ/g, "a")
            .replace(/ê/g, "e")
            .replace(/é/g, "e")
            .replace(/è/g, "e")
            .replace(/ẽ/g, "e")
            .replace(/ẹ/g, "e")
            .replace(/ô/g, "o")
            .replace(/ơ/g, "o")
            .replace(/ó/g, "o")
            .replace(/ò/g, "o")
            .replace(/õ/g, "o")
            .replace(/ọ/g, "o")
            .replace(/ư/g, "u")
            .replace(/ú/g, "u")
            .replace(/ù/g, "u")
            .replace(/ũ/g, "u")
            .replace(/ụ/g, "u")
            .replace(/í/g, "i")
            .replace(/ì/g, "i")
            .replace(/ĩ/g, "i")
            .replace(/ị/g, "i")
            .replace(/ý/g, "y")
            .replace(/ỳ/g, "y")
            .replace(/ỹ/g, "y")
            .replace(/ỵ/g, "y")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D"),
          formatCurrencyForPDF(transaction.amount),
        ])

      autoTable(doc, {
        startY: yPosition,
        head: [["Ngay", "Mo ta", "Danh muc", "Loai", "So tien"]],
        body: transactionRows,
        theme: "grid",
        headStyles: {
          fillColor: [220, 53, 69],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8,
        },
        margin: { left: 20, right: 20 },
        columnStyles: {
          0: { cellWidth: 25 }, // Date
          1: { cellWidth: 45 }, // Description
          2: { cellWidth: 30 }, // Category
          3: { cellWidth: 25 }, // Type
          4: { cellWidth: 30 }, // Amount
        },
      })
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(
        `Tao ngay ${new Date().toLocaleDateString("vi-VN")} - Trang ${i}/${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      )
    }

    // Save file
    doc.save(`${filename}.pdf`)

    return { success: true }
  } catch (error) {
    console.error("PDF export error:", error)
    return { success: false, error: error.message }
  }
}
