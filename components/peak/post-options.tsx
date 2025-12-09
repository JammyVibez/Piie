"use client"

import { useState } from "react"
import { MoreVertical, Edit, Trash2, Share, Flag, Link, Zap, Bookmark } from "lucide-react"

interface PostOptionsProps {
  postId: number
  onEdit?: () => void
  onDelete?: () => void
}

export default function PostOptions({ postId, onEdit, onDelete }: PostOptionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { label: "Edit Post", icon: Edit, color: "text-blue-500", onClick: onEdit },
    { label: "Promote to Highlight", icon: Zap, color: "text-yellow-500" },
    { label: "Save Post", icon: Bookmark, color: "text-orange-500" },
    { label: "Share", icon: Share, color: "text-green-500" },
    { label: "Copy Link", icon: Link, color: "text-purple-500" },
    { label: "Report", icon: Flag, color: "text-red-500" },
    { label: "Delete", icon: Trash2, color: "text-destructive", onClick: onDelete },
  ]

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-muted rounded-lg transition-all">
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-48 overflow-hidden">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => {
                  option.onClick?.()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-all text-sm text-left first:rounded-t-lg last:rounded-b-lg"
              >
                <option.icon className={`w-4 h-4 ${option.color}`} />
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
