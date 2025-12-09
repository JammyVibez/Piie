"use client"

import { useState } from "react"
import { MoreVertical, Copy, Flag, Volume2, Eye, Share2, Edit, Trash2 } from "lucide-react"

interface PostMenuDropdownProps {
  postId: string
  postTitle: string
  isOwner?: boolean
}

export function PostMenuDropdown({ postId, postTitle, isOwner = false }: PostMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleMenuClick = (action: string) => {
    console.log(`[v0] Post action: ${action}`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-muted/40 rounded-lg transition-colors">
        <MoreVertical size={18} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {isOwner && (
            <>
              <button
                onClick={() => handleMenuClick("edit")}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
              >
                <Edit size={16} className="text-primary" />
                <span className="text-sm text-foreground">Edit Post</span>
              </button>
              <button
                onClick={() => handleMenuClick("delete")}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-red-500/10 transition-colors text-left border-b border-border/50"
              >
                <Trash2 size={16} className="text-red-500" />
                <span className="text-sm text-red-500">Delete Post</span>
              </button>
            </>
          )}

          <button
            onClick={() => handleMenuClick("view-detail")}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
          >
            <Eye size={16} className="text-secondary" />
            <span className="text-sm text-foreground">View Details</span>
          </button>

          <button
            onClick={() => handleMenuClick("copy-link")}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
          >
            <Copy size={16} className="text-primary/70" />
            <span className="text-sm text-foreground">Copy Link</span>
          </button>

          <button
            onClick={() => handleMenuClick("share")}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
          >
            <Share2 size={16} className="text-accent" />
            <span className="text-sm text-foreground">Share Post</span>
          </button>

          <button
            onClick={() => handleMenuClick("mute")}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50"
          >
            <Volume2 size={16} className="text-muted-foreground" />
            <span className="text-sm text-foreground">Mute Content</span>
          </button>

          <button
            onClick={() => handleMenuClick("report")}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-orange-500/10 transition-colors text-left"
          >
            <Flag size={16} className="text-orange-500" />
            <span className="text-sm text-orange-500">Report Post</span>
          </button>
        </div>
      )}

      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
