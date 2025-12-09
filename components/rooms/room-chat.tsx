"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Send, MessageCircle } from "lucide-react"

interface ChatMessage {
  id: string
  username: string
  avatar: string
  text: string
  timestamp: Date
}

interface RoomChatProps {
  messages: ChatMessage[]
  onSendMessage?: (text: string) => void
}

export function RoomChat({ messages, onSendMessage }: RoomChatProps) {
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage?.(input)
    setInput("")
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        <h3 className="font-bold text-sm">Room Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex gap-2">
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage src={msg.avatar || "/placeholder.svg"} />
                <AvatarFallback>{msg.username[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{msg.username}</p>
                <p className="text-sm text-foreground break-words">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50 flex gap-2">
        <input
          type="text"
          placeholder="Send a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend()
            }
          }}
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm placeholder-muted-foreground"
        />
        <Button size="sm" onClick={handleSend} disabled={!input.trim()} className="px-3">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
