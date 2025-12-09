"use client"

import { useState } from "react"

const COMMON_REACTIONS = ["👍", "❤️", "😂", "🔥", "🎉", "😍", "🤔", "👀", "🙏", "💯"]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="pop-in grid grid-cols-5 gap-2 rounded-lg bg-card border border-border p-3 shadow-lg">
      {COMMON_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onSelect(emoji)
            onClose()
          }}
          className="p-2 hover:bg-muted rounded transition-colors text-xl"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
