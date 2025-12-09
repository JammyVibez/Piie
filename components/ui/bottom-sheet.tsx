"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  height?: string
}

export function BottomSheet({ isOpen, onClose, title, children, height = "h-1/2" }: BottomSheetProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />

      {/* Sheet */}
      <div
        className={`drawer-slide-in fixed bottom-0 left-0 right-0 ${height} bg-card rounded-t-2xl border-t border-border shadow-2xl flex flex-col`}
      >
        {/* Handle and header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="mx-auto h-1 w-12 rounded-full bg-muted mb-2" />
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4">{children}</div>
      </div>
    </div>
  )
}
