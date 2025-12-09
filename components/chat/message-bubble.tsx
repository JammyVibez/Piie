"use client"

import { useState } from "react"
import { MoreVertical, Forward, Reply, Copy, Trash } from "lucide-react"
import { MessageReactions } from "./message-reactions"

interface MessageBubbleProps {
  id: string
  author: string
  avatar?: string
  content: string
  timestamp: Date
  isOwn?: boolean
  reactions?: Record<string, string[]>
  isEdited?: boolean
  onReact?: (emoji: string) => void
  onForward?: () => void
  onReply?: () => void
  onDelete?: () => void
}

export function MessageBubble({
  id,
  author,
  avatar,
  content,
  timestamp,
  isOwn = false,
  reactions = {},
  isEdited = false,
  onReact,
  onForward,
  onReply,
  onDelete,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setShowMenu(false)
  }

  return (
    <div className={`animate-messageSlide flex gap-3 mb-4 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isOwn && avatar && (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0" />
      )}

      {/* Message container */}
      <div className={`flex flex-col gap-1 max-w-xs ${isOwn ? "items-end" : ""}`}>
        {/* Header */}
        {!isOwn && (
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm font-semibold">{author}</span>
            {isEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`group relative rounded-2xl px-4 py-2 transition-colors ${
            isOwn ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
          }`}
        >
          <p className="text-sm break-words">{content}</p>

          {/* Actions menu */}
          <div className="absolute top-full mt-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded hover:bg-muted transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="pop-in absolute right-0 top-8 bg-card border border-border rounded-lg shadow-lg p-2 w-max z-10">
                <button
                  onClick={onReply}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  Reply
                </button>
                <button
                  onClick={onForward}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  <Forward className="h-4 w-4" />
                  Forward
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                {isOwn && (
                  <button
                    onClick={onDelete}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Timestamp and reactions */}
        <div className="flex items-center gap-2 px-3 text-xs text-muted-foreground">
          <span>{timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <MessageReactions reactions={reactions} onAddReaction={onReact || (() => {})} messageId={id} />
        )}
      </div>
    </div>
  )
}
