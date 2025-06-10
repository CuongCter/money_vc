"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} aria-hidden="true" />

        {/* Modal */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:w-full sm:max-w-full sm:p-0">
          <div className={`w-full ${sizes[size]}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button type="button" className="text-gray-400 hover:text-gray-500 focus:outline-none" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-4">{children}</div>

            {/* Footer */}
            {footer && <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
