"use client"

import type React from "react"
import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle, X } from "lucide-react"
import type { Toast, ToastType } from "@/hooks/use-toast"

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  info: <InfoIcon className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
}

const toastColors: Record<ToastType, string> = {
  success: "bg-green-900/20 border-green-500/30 text-green-100",
  error: "bg-red-900/20 border-red-500/30 text-red-100",
  info: "bg-blue-900/20 border-blue-500/30 text-blue-100",
  warning: "bg-yellow-900/20 border-yellow-500/30 text-yellow-100",
}

interface ToastNotificationProps {
  toast: Toast
  onClose: (id: string) => void
}

export function ToastNotification({ toast, onClose }: ToastNotificationProps) {
  return (
    <div className={`toast-slide-up flex items-center gap-3 rounded-lg border p-4 ${toastColors[toast.type]}`}>
      {toastIcons[toast.type]}
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button onClick={() => onClose(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}
