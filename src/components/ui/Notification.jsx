"use client"
import { useNotificationStore } from "../../store/notificationStore"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

const NotificationItem = ({ notification }) => {
  const { removeNotification } = useNotificationStore()

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle size={20} className="text-green-500" />
      case "error":
        return <AlertCircle size={20} className="text-red-500" />
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-500" />
      case "info":
      default:
        return <Info size={20} className="text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case "success":
        return "text-green-800"
      case "error":
        return "text-red-800"
      case "warning":
        return "text-yellow-800"
      case "info":
      default:
        return "text-blue-800"
    }
  }

  return (
    <div
      className={`max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg pointer-events-auto transform transition-all duration-300 ease-in-out`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 w-0 flex-1">
            {notification.title && <p className={`text-sm font-medium ${getTextColor()}`}>{notification.title}</p>}
            <p className={`text-sm ${getTextColor()} ${notification.title ? "mt-1" : ""}`}>{notification.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              onClick={() => removeNotification(notification.id)}
            >
              <span className="sr-only">Đóng</span>
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const NotificationContainer = () => {
  const { notifications } = useNotificationStore()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  )
}

export default NotificationContainer
