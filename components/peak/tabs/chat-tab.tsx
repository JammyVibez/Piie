"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Smile, MoreVertical, Pin, Reply, CheckCheck } from "lucide-react"

interface ChatMessage {
  id: number
  author: string
  avatar: string
  content: string
  timestamp: string
  edited?: boolean
  pinned?: boolean
  read?: boolean
  reactions?: Record<string, number>
  replyTo?: { author: string; content: string }
}

const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "👩‍💼",
    content: "Hey everyone! Welcome to the tech hub chat!",
    timestamp: "2:30 PM",
    read: true,
    reactions: { "❤️": 5, "🔥": 3 },
  },
  {
    id: 2,
    author: "Marcus Dev",
    avatar: "👨‍💻",
    content: "Just finished deploying the new feature. Check out the posts tab!",
    timestamp: "3:15 PM",
    read: true,
    reactions: { "👍": 12, "🎉": 8 },
    pinned: true,
  },
  {
    id: 3,
    author: "You",
    avatar: "😊",
    content: "That looks amazing! Great work team.",
    timestamp: "3:45 PM",
    read: true,
  },
  {
    id: 4,
    author: "Alex Designer",
    avatar: "🎨",
    content: "The UI is looking so smooth. Love the Telegram-inspired design!",
    timestamp: "4:12 PM",
    read: true,
    reactions: { "✨": 10, "❤️": 4 },
  },
]

const EMOJI_REACTIONS = ["❤️", "😂", "😮", "🔥", "👏", "✨", "🎉", "💯"]

export default function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_MESSAGES)
  const [inputValue, setInputValue] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>(["James Brown"])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: ChatMessage = {
        id: messages.length + 1,
        author: "You",
        avatar: "😊",
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true,
      }
      setMessages([...messages, newMessage])
      setInputValue("")
      setShowEmojiPicker(false)
    }
  }

  const addReaction = (messageId: number, emoji: string) => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || {}
          return {
            ...msg,
            reactions: {
              ...reactions,
              [emoji]: (reactions[emoji] || 0) + 1,
            },
          }
        }
        return msg
      }),
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onMouseEnter={() => setHoveredMessage(msg.id)}
            onMouseLeave={() => setHoveredMessage(null)}
            className="group flex gap-3 hover:bg-muted/30 p-3 rounded-xl transition-all animate-messageSlide"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg flex-shrink-0">
              {msg.avatar}
            </div>

            {/* Message Bubble */}
            <div className="flex-1 min-w-0">
              {/* Reply To */}
              {msg.replyTo && (
                <div className="mb-2 pl-3 border-l-2 border-primary/50 text-xs text-muted-foreground italic">
                  Replying to {msg.replyTo.author}: {msg.replyTo.content}
                </div>
              )}

              {/* Header */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-sm">{msg.author}</span>
                <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                {msg.edited && <span className="text-xs text-muted-foreground">(edited)</span>}
                {msg.pinned && <Pin className="w-3 h-3 text-orange-500" />}
              </div>

              {/* Message Text */}
              <p className="text-sm text-foreground break-words bg-muted/50 p-3 rounded-lg inline-block max-w-xs">
                {msg.content}
              </p>

              {/* Reactions */}
              {msg.reactions && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(msg.reactions).map(([emoji, count]) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(msg.id, emoji)}
                      className="px-2 py-1 rounded-full bg-muted hover:bg-primary/20 hover:text-primary text-xs transition-all hover:scale-110 flex items-center gap-1 active:scale-95"
                    >
                      <span>{emoji}</span>
                      <span className="text-muted-foreground text-xs">{count}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowEmojiPicker(true)}
                    className="px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-xs transition-all hover:scale-110 active:scale-95 flex items-center gap-1"
                  >
                    <span>+</span>
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            {hoveredMessage === msg.id && (
              <div className="flex gap-1 transition-opacity">
                <button className="p-1.5 hover:bg-muted rounded-lg transition-all active:scale-95" title="Reply">
                  <Reply className="w-4 h-4" />
                </button>
                <button
                  className="p-1.5 hover:bg-muted rounded-lg transition-all active:scale-95"
                  title="Add reaction"
                  onClick={() => setShowEmojiPicker(true)}
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-muted rounded-lg transition-all active:scale-95" title="More">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-3 p-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg flex-shrink-0">
              👤
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
              </p>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card/50 backdrop-blur max-sm:p-3">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="flex gap-2 mb-3 p-2 bg-muted rounded-lg flex-wrap animate-popIn max-sm:gap-1">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInputValue(inputValue + emoji)
                  setShowEmojiPicker(false)
                }}
                className="text-lg hover:scale-125 transition-transform active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="flex gap-2 items-end max-sm:gap-1">
          <button
            className="p-2 hover:bg-muted rounded-lg transition-all active:scale-95 max-sm:p-1.5"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Message..."
            className="flex-1 px-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none transition-all text-sm max-sm:px-3 max-sm:py-1.5"
          />

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-muted rounded-lg transition-all active:scale-95 max-sm:p-1.5"
            title="Add emoji"
          >
            <Smile className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          </button>

          <button
            onClick={handleSendMessage}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all active:scale-95 max-sm:p-1.5"
            title="Send message"
          >
            <Send className="w-5 h-5 max-sm:w-4 max-sm:h-4" />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <CheckCheck className="w-4 h-4" />
          <span>Messages synced</span>
        </div>
      </div>
    </div>
  )
}
