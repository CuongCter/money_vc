"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

const SimpleModal = ({ isOpen, onClose, title, children }) => {
  console.log("SimpleModal render - isOpen:", isOpen, "title:", title)

  useEffect(() => {
    console.log("SimpleModal useEffect - isOpen:", isOpen)

    if (isOpen) {
      document.body.style.overflow = "hidden"
      console.log("Modal opened, body overflow hidden")
    } else {
      document.body.style.overflow = "unset"
      console.log("Modal closed, body overflow reset")
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) {
    console.log("Modal not open, returning null")
    return null
  }

  console.log("Modal is open, rendering...")

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => {
        console.log("Backdrop clicked")
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#111827",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={() => {
              console.log("Close button clicked")
              onClose()
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              color: "#6b7280",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  )
}

export default SimpleModal
