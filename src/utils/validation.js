export const validateTransaction = (data, t) => {
    const errors = {}
  
    // Validate description
    if (!data.description?.trim()) {
      errors.description = t("errors.descriptionRequired")
    } else if (data.description.trim().length < 2) {
      errors.description = "Mô tả phải có ít nhất 2 ký tự"
    } else if (data.description.trim().length > 100) {
      errors.description = "Mô tả không được quá 100 ký tự"
    }
  
    // Validate amount
    if (!data.amount) {
      errors.amount = t("errors.invalidAmount")
    } else {
      const amount = Number.parseFloat(data.amount)
      if (isNaN(amount) || amount <= 0) {
        errors.amount = "Số tiền phải lớn hơn 0"
      } else if (amount > 999999999) {
        errors.amount = "Số tiền quá lớn (tối đa 999,999,999)"
      }
    }
  
    // Validate date
    if (!data.date) {
      errors.date = "Vui lòng chọn ngày"
    } else {
      const selectedDate = new Date(data.date)
      const today = new Date()
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(today.getFullYear() - 1)
  
      if (selectedDate > today) {
        errors.date = "Không thể chọn ngày trong tương lai"
      } else if (selectedDate < oneYearAgo) {
        errors.date = "Ngày không được quá 1 năm trước"
      }
    }
  
    // Validate category
    if (!data.categoryId) {
      errors.categoryId = t("errors.categoryRequired")
    }
  
    // Validate type
    if (!data.type || !["income", "expense"].includes(data.type)) {
      errors.type = "Vui lòng chọn loại giao dịch"
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }
  
  export const validateAmount = (amount) => {
    if (!amount) return false
    const num = Number.parseFloat(amount)
    return !isNaN(num) && num > 0 && num <= 999999999
  }
  
  export const validateDate = (date) => {
    if (!date) return false
    const selectedDate = new Date(date)
    const today = new Date()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(today.getFullYear() - 1)
  
    return selectedDate <= today && selectedDate >= oneYearAgo
  }
  