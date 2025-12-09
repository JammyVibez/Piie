"use client"

import { useState } from "react"
import { SmilePlus } from "lucide-react"
import { EmojiPicker } from "@/components/ui/emoji-picker"

interface MessageReactionsProps {
  reactions: Record<string, string[]>
  onAddReaction: (emoji: string) => void
  messageId: string
}

export function MessageReactions({ reactions, onAddReaction, messageId }: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false)

  const groupedReactions = Object.entries(reactions).map(([emoji, userIds]) => ({
    emoji,
    count: userIds.length,
  }))

  return (
    <div className="flex flex-wrap gap-2 mt-2 items-center">
      {groupedReactions.map(({ emoji, count }) => (
        <button
          key={emoji}
          className="float-emoji flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
          title={`${count} reaction${count > 1 ? "s" : ""}`}
        >
          <span>{emoji}</span>
          {count > 1 && <span className="text-muted-foreground">{count}</span>}
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full hover:bg-muted transition-colors"
        >
          <SmilePlus className="h-4 w-4" />
        </button>
        {showPicker && (
          <div className="absolute bottom-full mb-2 right-0 z-20">
            <EmojiPicker onSelect={onAddReaction} onClose={() => setShowPicker(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
