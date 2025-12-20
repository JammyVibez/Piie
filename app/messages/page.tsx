"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Plus,
  ArrowLeft,
  Check,
  CheckCheck,
  Pin,
  Archive,
  Trash2,
  Bell,
  BellOff,
  Mic,
  X,
  Reply,
  Copy,
  Forward,
  Play,
  Pause,
  Download,
  File,
  StopCircle,
  Settings,
  Camera,
  MessageSquare,
  Pencil,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { User, Message, Conversation, MessageStatus } from "@/components/types"
import { formatRelativeTime } from "@/lib/utils-format"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

// Emoji picker data
const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥", "🎉", "👏"]
const emojiCategories = {
  recent: ["👍", "❤️", "😂", "🔥", "✨", "💯", "🙏", "😊"],
  smileys: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘"],
  gestures: ["👋", "🤚", "✋", "🖐️", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👍", "👎"],
  hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "💕", "💞", "💓", "💗", "💖"],
}

// Chat wallpaper options
const wallpapers = [
  { id: "default", class: "bg-background" },
  { id: "gradient-blue", class: "bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-slate-900/30" },
  { id: "gradient-purple", class: "bg-gradient-to-br from-purple-900/30 via-pink-800/20 to-slate-900/30" },
  { id: "gradient-green", class: "bg-gradient-to-br from-emerald-900/30 via-teal-800/20 to-slate-900/30" },
  { id: "gradient-orange", class: "bg-gradient-to-br from-orange-900/30 via-red-800/20 to-slate-900/30" },
  { id: "gradient-dark", class: "bg-gradient-to-br from-gray-900/50 via-slate-800/30 to-black/50" },
]

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2 max-w-fit">
      <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-typing-dot"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Message status indicator
function MessageStatusIndicator({ status }: { status?: MessageStatus }) {
  if (!status) return null

  return (
    <span className="ml-1 inline-flex">
      {status === "sending" && (
        <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {status === "sent" && <Check size={14} className="text-muted-foreground/70" />}
      {status === "delivered" && <CheckCheck size={14} className="text-muted-foreground/70" />}
      {status === "read" && <CheckCheck size={14} className="text-primary" />}
      {status === "failed" && <X size={14} className="text-destructive" />}
    </span>
  )
}

// Voice message component
function VoiceMessage({
  duration,
  isOwn,
  isPlaying,
  onTogglePlay,
}: {
  duration: number
  isOwn: boolean
  isPlaying: boolean
  onTogglePlay: () => void
}) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 100 / duration))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying, duration])

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <button
        onClick={onTogglePlay}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
          isOwn ? "bg-primary-foreground/20 hover:bg-primary-foreground/30" : "bg-primary/20 hover:bg-primary/30",
        )}
      >
        {isPlaying ? (
          <Pause size={18} className={isOwn ? "text-primary-foreground" : "text-primary"} />
        ) : (
          <Play size={18} className={cn("ml-0.5", isOwn ? "text-primary-foreground" : "text-primary")} />
        )}
      </button>
      <div className="flex-1">
        <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300", isOwn ? "bg-primary-foreground/60" : "bg-primary")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={cn("text-[10px] mt-1 block", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {formatDuration(duration)}
        </span>
      </div>
    </div>
  )
}

// File attachment component
function FileAttachment({
  name,
  size,
  type,
  isOwn,
}: {
  name: string
  size: string
  type: string
  isOwn: boolean
}) {
  return (
    <div className={cn("flex items-center gap-3 p-2 rounded-lg", isOwn ? "bg-primary-foreground/10" : "bg-muted/50")}>
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isOwn ? "bg-primary-foreground/20" : "bg-primary/20",
        )}
      >
        <File size={20} className={isOwn ? "text-primary-foreground" : "text-primary"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isOwn ? "text-primary-foreground" : "text-foreground")}>
          {name}
        </p>
        <p className={cn("text-[10px]", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {size} • {type}
        </p>
      </div>
      <Button size="icon" variant="ghost" className={cn("h-8 w-8", isOwn && "hover:bg-primary-foreground/20")}>
        <Download size={16} />
      </Button>
    </div>
  )
}

// Chat bubble component with animations
function ChatBubble({
  message,
  isOwn,
  showAvatar,
  isFirst,
  isLast,
  onReply,
  onReact,
  onCopy,
  onEdit,
  onDelete,
  onForward,
}: {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  isFirst: boolean
  isLast: boolean
  onReply: () => void
  onReact: (emoji: string) => void
  onCopy: () => void
  onEdit: () => void
  onDelete: () => void
  onForward: () => void
}) {
  const [showActions, setShowActions] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)

  const bubbleRadius = cn(
    "rounded-2xl",
    isOwn
      ? isFirst && isLast
        ? "rounded-2xl"
        : isFirst
          ? "rounded-tr-md"
          : isLast
            ? "rounded-br-md"
            : "rounded-r-md"
      : isFirst && isLast
        ? "rounded-2xl"
        : isFirst
          ? "rounded-tl-md"
          : isLast
            ? "rounded-bl-md"
            : "rounded-l-md",
  )

  return (
    <div
      className={cn("group flex gap-2 max-w-[85%] animate-message-slide", isOwn ? "ml-auto flex-row-reverse" : "")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        setShowReactions(false)
      }}
    >
      {/* Avatar */}
      <div className={cn("w-8 flex-shrink-0", !showAvatar && "invisible")}>
        {showAvatar && (
          <Avatar className="h-8 w-8 ring-2 ring-background shadow-md">
            <AvatarImage src={message.sender.avatar || "/placeholder.svg"} alt={message.sender.name} />
            <AvatarFallback className="text-xs">{message.sender.name.charAt(0)}</AvatarFallback>
          </Avatar>
        )}
      </div>

      {/* Message bubble */}
      <div className="relative">
        {/* Reply preview */}
        {message.replyTo && (
          <div
            className={cn(
              "text-xs px-3 py-2 mb-1 rounded-lg border-l-2 max-w-[250px]",
              isOwn ? "bg-primary-foreground/10 border-primary-foreground/50" : "bg-muted/50 border-primary",
            )}
          >
            <span className={cn("font-semibold", isOwn ? "text-primary-foreground/80" : "text-primary")}>
              {message.replyTo.sender.name}
            </span>
            <p className={cn("truncate", isOwn ? "text-primary-foreground/60" : "text-muted-foreground")}>
              {message.replyTo.content}
            </p>
          </div>
        )}

        <div
          className={cn(
            "px-4 py-2.5 relative shadow-sm",
            bubbleRadius,
            isOwn
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
              : "bg-card border border-border/50 text-foreground",
          )}
        >
          {/* Text content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          )}

          {/* Voice message simulation */}
          {message.attachments?.some((a) => a.type === "audio") && (
            <VoiceMessage
              duration={45}
              isOwn={isOwn}
              isPlaying={isPlayingVoice}
              onTogglePlay={() => setIsPlayingVoice(!isPlayingVoice)}
            />
          )}

          {/* Image attachments */}
          {message.attachments
            ?.filter((a) => a.type === "image")
            .map((attachment) => (
              <div key={attachment.id} className="mt-2 rounded-lg overflow-hidden">
                <img
                  src={attachment.url || "/placeholder.svg"}
                  alt={attachment.name}
                  className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>
            ))}

          {/* File attachments */}
          {message.attachments
            ?.filter((a) => a.type === "file")
            .map((attachment) => (
              <div key={attachment.id} className="mt-2">
                <FileAttachment name={attachment.name} size="2.4 MB" type="PDF" isOwn={isOwn} />
              </div>
            ))}

          {/* Timestamp and status */}
          <div
            className={cn(
              "flex items-center gap-1.5 mt-1.5 text-[10px]",
              isOwn ? "text-primary-foreground/60 justify-end" : "text-muted-foreground",
            )}
          >
            <span>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            {message.isEdited && <span className="italic">(edited)</span>}
            {isOwn && <MessageStatusIndicator status={message.status} />}
          </div>
        </div>

        {/* Reactions display */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={cn("absolute -bottom-3 flex gap-0.5", isOwn ? "right-2" : "left-2")}>
            {message.reactions.slice(0, 3).map((reaction, i) => (
              <span
                key={i}
                className="text-sm bg-card border border-border rounded-full px-1.5 py-0.5 shadow-sm pop-in cursor-pointer hover:scale-110 transition-transform"
              >
                {reaction.emoji}
              </span>
            ))}
            {message.reactions.length > 3 && (
              <span className="text-[10px] bg-card border border-border rounded-full px-1.5 py-0.5 text-muted-foreground">
                +{message.reactions.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Hover actions */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 transition-all duration-200",
            isOwn ? "-left-24" : "-right-24",
            showActions ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          )}
        >
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full bg-card/90 backdrop-blur border border-border/50 shadow-sm hover:bg-card"
                  onClick={() => setShowReactions(!showReactions)}
                >
                  <Smile size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">React</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full bg-card/90 backdrop-blur border border-border/50 shadow-sm hover:bg-card"
                  onClick={onReply}
                >
                  <Reply size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Reply</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full bg-card/90 backdrop-blur border border-border/50 shadow-sm hover:bg-card"
                >
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "start" : "end"} className="w-40">
                <DropdownMenuItem onClick={onCopy}>
                  <Copy size={14} className="mr-2" /> Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onForward}>
                  <Forward size={14} className="mr-2" /> Forward
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil size={14} className="mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>

        {/* Quick reactions panel */}
        {showReactions && (
          <div
            className={cn(
              "absolute -top-12 flex gap-1 p-2 bg-card border border-border rounded-full shadow-xl scale-in z-10",
              isOwn ? "right-0" : "left-0",
            )}
          >
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji)
                  setShowReactions(false)
                }}
                className="hover:scale-125 transition-transform p-1 text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Conversation list item
function ConversationItem({
  conversation,
  isSelected,
  onClick,
  onPin,
  onMute,
  onArchive,
  currentUserId,
}: {
  conversation: Conversation & { otherUser?: User }
  isSelected: boolean
  onClick: () => void
  onPin: () => void
  onMute: () => void
  onArchive: () => void
  currentUserId: string
}) {
  const otherUser = conversation.otherUser || (conversation.user1?.id === currentUserId ? conversation.user2 : conversation.user1)
  const timeAgo = conversation.lastUpdated ? formatRelativeTime(conversation.lastUpdated) : ""

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 rounded-xl mx-2",
        "hover:bg-muted/50 active:scale-[0.98]",
        isSelected && "bg-primary/10 border border-primary/20",
      )}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
          <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
          <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
        {otherUser.isOnline && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background shadow-sm" />
        )}
        {conversation.isPinned && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
            <Pin size={10} className="text-primary-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={cn(
              "font-semibold text-sm truncate",
              conversation.unreadCount > 0 ? "text-foreground" : "text-foreground/80",
            )}
          >
            {otherUser.name}
          </h3>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs truncate",
              conversation.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground",
            )}
          >
            {conversation.lastMessage?.isOwn && (
              <span className="text-muted-foreground">You: </span>
            )}
            {conversation.lastMessage?.content || "No messages yet"}
          </p>
          <div className="flex items-center gap-1.5">
            {conversation.isMuted && <BellOff size={12} className="text-muted-foreground flex-shrink-0" />}
            {conversation.unreadCount > 0 && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-primary-foreground">
                  {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity"
          >
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onPin()
            }}
          >
            <Pin size={14} className="mr-2" />
            {conversation.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onMute()
            }}
          >
            {conversation.isMuted ? <Bell size={14} className="mr-2" /> : <BellOff size={14} className="mr-2" />}
            {conversation.isMuted ? "Unmute" : "Mute"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onArchive()
            }}
          >
            <Archive size={14} className="mr-2" />
            {conversation.isArchived ? "Unarchive" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <Trash2 size={14} className="mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Voice recording component
function VoiceRecorder({
  onStop,
  onCancel,
}: {
  onStop: (audioBlob: Blob, duration: number) => void
  onCancel: () => void
}) {
  const [duration, setDuration] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  useEffect(() => {
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        })
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          onStop(audioBlob, duration)
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
          }
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error("Error accessing microphone:", error)
        alert("Could not access microphone. Please check permissions.")
        onCancel()
      }
    }

    startRecording()

    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center gap-3 flex-1 px-4 py-2 bg-destructive/10 rounded-xl border border-destructive/20">
      <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
      <span className="text-sm font-medium text-destructive">{formatDuration(duration)}</span>
      <div className="flex-1 flex items-center gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-1 bg-destructive/60 rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 20 + 8}px`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onCancel}>
        <X size={18} className="text-destructive" />
      </Button>
      <Button size="icon" className="h-8 w-8 bg-destructive hover:bg-destructive/90" onClick={handleStop}>
        <StopCircle size={18} />
      </Button>
    </div>
  )
}

export default function DMPage() {
  const { user: currentUser, token, isAuthenticated, isLoading: authLoading } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { otherUser?: User }) | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [conversations, setConversations] = useState<(Conversation & { otherUser?: User })[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [gifSearchQuery, setGifSearchQuery] = useState("")
  const [gifs, setGifs] = useState<any[]>([])
  const [chatWallpaper, setChatWallpaper] = useState("default")
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([])
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadConversations = useCallback(async () => {
    if (!token) return
    setIsLoadingConversations(true)
    try {
      const response = await fetch("/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success) {
        setConversations(result.data.conversations)
        if (result.data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(result.data.conversations[0])
        }
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }, [token, selectedConversation])

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!token) return
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success) {
        const formattedMessages = result.data.messages.map((msg: Record<string, unknown>) => ({
          ...msg,
          timestamp: new Date(msg.createdAt as string),
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [token])

  const loadSuggestedUsers = useCallback(async () => {
    if (!token) return
    try {
      const response = await fetch("/api/users/suggested?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (result.success) {
        setSuggestedUsers(result.data)
      }
    } catch (error) {
      console.error("Failed to load suggested users:", error)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      loadConversations()
      loadSuggestedUsers()
    }
  }, [isAuthenticated, token, loadConversations, loadSuggestedUsers])

  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation?.id, loadMessages])

  // Load wallpaper preference
  useEffect(() => {
    const saved = localStorage.getItem("chat-wallpaper") || "default"
    setChatWallpaper(saved)
  }, [])

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, selectedConversation, scrollToBottom])

  // Simulate typing indicator
  useEffect(() => {
    if (selectedConversation) {
      const timer = setTimeout(() => {
        setIsTyping(Math.random() > 0.7)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [selectedConversation, messages])

  const handleSendMessage = async (content: string, files?: File[]) => {
    if ((!content.trim() && (!files || files.length === 0)) || !selectedConversation || !token) return

    try {
      let messageContent = content.trim()
      const attachmentUrls: string[] = []

      // Upload files if present
      if (files && files.length > 0) {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('type', file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('image/') ? 'image' : 'file')

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })

          const uploadResult = await uploadResponse.json()
          if (uploadResult.success && uploadResult.data) {
            attachmentUrls.push(uploadResult.data.url)
          }
        }
      }

      // If only attachments, add a placeholder message
      if (!messageContent && attachmentUrls.length > 0) {
        messageContent = attachmentUrls.length === 1 && attachmentUrls[0].includes('audio')
          ? '🎤 Voice message'
          : `📎 ${attachmentUrls.length} attachment(s)`
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageContent,
          attachments: attachmentUrls,
        }),
      })

      const result = await response.json()
      if (result.success && result.data) {
        setMessages((prev) => [...prev, result.data])
        await loadConversations() // Re-fetch conversations to update last message/unread count
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!selectedConversation || !currentUser || !token) return

    setIsRecording(false)

    try {
      // Convert blob to file
      const audioFile = new File([audioBlob], `voice_message_${Date.now()}.webm`, { type: 'audio/webm' })
      
      // Upload the audio file
      await handleSendMessage("", [audioFile])
    } catch (error) {
      console.error("Failed to send voice message:", error)
    }
  }

  const startNewChat = async (user: User) => {
    if (!token || !currentUser) return

    const existingConv = conversations.find((c) => c.otherUser?.id === user.id)

    if (existingConv) {
      setSelectedConversation(existingConv)
      setShowNewChat(false)
      return
    }

    try {
      const response = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()
      if (result.success) {
        const newConversation: Conversation & { otherUser?: User } = {
          id: result.data.conversationId,
          user1: currentUser,
          user2: user,
          otherUser: user,
          unreadCount: 0,
          lastUpdated: new Date(),
        }
        setConversations((prev) => [newConversation, ...prev])
        setMessages([])
        setSelectedConversation(newConversation)
      }
    } catch (error) {
      console.error("Failed to start new chat:", error)
    }
    setShowNewChat(false)
    setShowMobileChat(true)
  }

  const handleReact = async (messageId: string, emoji: string) => {
    if (!selectedConversation || !currentUser || !token) return

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              reactions: [...(m.reactions || []), { emoji, userId: currentUser.id, timestamp: new Date() }],
            }
          : m,
      ),
    )

    try {
      await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      })
    } catch (error) {
      console.error("Failed to add reaction:", error)
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleEdit = async (messageId: string, newContent: string) => {
    if (!token || !newContent.trim()) return

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newContent }),
      })

      const result = await response.json()
      if (result.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, content: newContent, isEdited: true } : m,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to edit message:", error)
    }
  }

  const handleDelete = async (messageId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      }
    } catch (error) {
      console.error("Failed to delete message:", error)
    }
  }

  const handleForward = (message: Message) => {
    setMessageInput(message.content)
    inputRef.current?.focus()
  }

  const togglePin = (convId: string) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isPinned: !c.isPinned } : c)))
  }

  const toggleMute = (convId: string) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isMuted: !c.isMuted } : c)))
  }

  const toggleArchive = (convId: string) => {
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, isArchived: !c.isArchived } : c)))
  }

  const filteredConversations = conversations
    .filter((conv) => !conv.isArchived)
    .filter((conv) => {
      const otherUser = conv.otherUser
      return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      const aTime = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0
      const bTime = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0
      return bTime - aTime
    })

  const availableUsers = suggestedUsers.filter((u) => u.id !== currentUser?.id)
  const conversationMessages = messages
  const otherUser = selectedConversation?.otherUser || null

  const activeWallpaper = wallpapers.find((w) => w.id === chatWallpaper)?.class || wallpapers[0].class

  if (authLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Sign in to view messages</h1>
        <p className="text-muted-foreground text-sm">You need to be logged in to access your messages</p>
        <Link href="/login">
          <Button className="rounded-full">Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar - Conversations List */}
      <div
        className={cn(
          "w-full md:w-96 bg-card border-r border-border flex flex-col transition-all duration-300",
          showMobileChat && "hidden md:flex",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full hover:bg-muted/50"
                onClick={() => setShowNewChat(!showNewChat)}
              >
                <Plus size={20} />
              </Button>
              <Link href="/settings">
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-muted/50">
                  <Settings size={18} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-xl h-10"
            />
          </div>
        </div>

        {/* New Chat Dialog */}
        <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
            </DialogHeader>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Search people..." className="pl-10 rounded-xl" />
            </div>
            <ScrollArea className="h-[300px] mt-4">
              <div className="space-y-1">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startNewChat(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-background">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                    {user.isOnline && <span className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Conversations List */}
        <ScrollArea className="flex-1 py-2">
          <div className="space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-muted-foreground text-sm">No conversations yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full bg-transparent"
                  onClick={() => setShowNewChat(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Start a conversation
                </Button>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedConversation?.id === conversation.id}
                  currentUserId={currentUser?.id || ""}
                  onClick={() => {
                    setSelectedConversation(conversation)
                    setShowMobileChat(true)
                  }}
                  onPin={() => togglePin(conversation.id)}
                  onMute={() => toggleMute(conversation.id)}
                  onArchive={() => toggleArchive(conversation.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", !showMobileChat && "hidden md:flex")}>
        {selectedConversation && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border/50 bg-card/80 backdrop-blur-lg flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-full"
                onClick={() => setShowMobileChat(false)}
              >
                <ArrowLeft size={20} />
              </Button>

              <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                    <AvatarImage src={otherUser.avatar || "/placeholder.svg"} alt={otherUser.name} />
                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {otherUser.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-sm truncate">{otherUser.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {otherUser.isOnline ? (
                      <span className="text-green-500">Online</span>
                    ) : otherUser.lastSeen ? (
                      `Last seen ${formatRelativeTime(otherUser.lastSeen)}`
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Phone size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice Call</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Video size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Video Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                      <MoreVertical size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${otherUser.id}`}>View Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Search in conversation</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleMute(selectedConversation.id)}>
                      {selectedConversation.isMuted ? "Unmute" : "Mute"} notifications
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">Block user</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className={cn("flex-1 p-4", activeWallpaper)}>
              <div className="max-w-3xl mx-auto space-y-1">
                {conversationMessages.map((message, index) => {
                  const isOwn = message.sender.id === currentUser.id
                  const prevMessage = conversationMessages[index - 1]
                  const nextMessage = conversationMessages[index + 1]
                  const showAvatar = !isOwn && (!nextMessage || nextMessage.sender.id !== message.sender.id)
                  const isFirst = !prevMessage || prevMessage.sender.id !== message.sender.id
                  const isLast = !nextMessage || nextMessage.sender.id !== message.sender.id

                  return (
                    <div key={message.id} className={cn("py-0.5", isFirst && "pt-3")}>
                      <ChatBubble
                        message={message}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                        isFirst={isFirst}
                        isLast={isLast}
                        onReply={() => setReplyingTo(message)}
                        onReact={(emoji) => handleReact(message.id, emoji)}
                        onCopy={() => handleCopy(message.content)}
                        onEdit={() => {
                          setEditingMessage(message)
                          setMessageInput(message.content)
                        }}
                        onDelete={() => handleDelete(message.id)}
                        onForward={() => handleForward(message)}
                      />
                    </div>
                  )
                })}

                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Editing Preview */}
            {editingMessage && (
              <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/30 flex items-center gap-3">
                <div className="w-1 h-10 bg-amber-500 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Pencil size={12} className="text-amber-500" />
                    <p className="text-xs font-medium text-amber-500">Editing message</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{editingMessage.content}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                  setEditingMessage(null)
                  setMessageInput("")
                }}>
                  <X size={16} />
                </Button>
              </div>
            )}

            {/* Reply Preview */}
            {replyingTo && !editingMessage && (
              <div className="px-4 py-2 bg-muted/30 border-t border-border/50 flex items-center gap-3">
                <div className="w-1 h-10 bg-primary rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary">{replyingTo.sender.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReplyingTo(null)}>
                  <X size={16} />
                </Button>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-lg">
              {isRecording ? (
                <VoiceRecorder onStop={handleSendVoiceMessage} onCancel={() => setIsRecording(false)} />
              ) : (
                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,audio/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleSendMessage("", Array.from(e.target.files))
                        e.target.value = "" // Clear the input
                      }
                    }}
                  />

                  <div className="flex gap-1">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full flex-shrink-0"
                            onClick={() => {
                              setShowGifPicker(false)
                              setShowStickerPicker(false)
                              setShowEmojiPicker(false)
                              fileInputRef.current?.click()
                            }}
                          >
                            <Paperclip size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach File</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-full flex-shrink-0"
                            onClick={() => {
                              setShowGifPicker(!showGifPicker)
                              setShowStickerPicker(false)
                              setShowEmojiPicker(false)
                            }}
                          >
                            <span className="text-lg">🎬</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>GIF</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-full flex-shrink-0"
                            onClick={() => {
                              setShowStickerPicker(!showStickerPicker)
                              setShowGifPicker(false)
                              setShowEmojiPicker(false)
                            }}
                          >
                            <span className="text-lg">🎨</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Stickers</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full flex-shrink-0">
                            <Camera size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Camera</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage(messageInput)
                        }
                      }}
                      className="pr-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 rounded-2xl h-11"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker)
                        setShowGifPicker(false)
                        setShowStickerPicker(false)
                      }}
                    >
                      <Smile size={20} className="text-muted-foreground" />
                    </Button>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 p-3 bg-card border border-border rounded-xl shadow-xl scale-in w-72 max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-8 gap-1">
                          {Object.values(emojiCategories)
                            .flat()
                            .map((emoji, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setMessageInput((prev) => prev + emoji)
                                  setShowEmojiPicker(false)
                                }}
                                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-lg"
                              >
                                {emoji}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* GIF Picker */}
                    {showGifPicker && (
                      <div className="absolute bottom-full right-0 mb-2 p-3 bg-card border border-border rounded-xl shadow-xl scale-in w-80 max-h-96 overflow-y-auto">
                        <div className="space-y-3">
                          <Input
                            placeholder="Search GIFs..."
                            value={gifSearchQuery}
                            onChange={(e) => setGifSearchQuery(e.target.value)}
                            className="mb-2"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {/* Sample GIFs - In production, use Giphy API */}
                            {[
                              "https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif",
                              "https://media.giphy.com/media/l0MYC0LajaoPoHABu/giphy.gif",
                              "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
                              "https://media.giphy.com/media/3o7abldb0xnta2S3ug/giphy.gif",
                            ].map((gifUrl, i) => (
                              <button
                                key={i}
                                onClick={async () => {
                                  // Send GIF as image attachment
                                  try {
                                    setShowGifPicker(false)
                                    // Use the GIF URL directly instead of fetching
                                    const gifBlob = await fetch(gifUrl, { mode: 'cors' }).then(r => r.blob()).catch(() => null)
                                    if (!gifBlob) {
                                      // Fallback: send as URL in message content
                                      await handleSendMessage(`[GIF] ${gifUrl}`, [])
                                      return
                                    }
                                    const file = new File([gifBlob], `gif_${Date.now()}.gif`, { type: 'image/gif' })
                                    await handleSendMessage("", [file])
                                  } catch (error) {
                                    console.error("Failed to send GIF:", error)
                                    // Fallback: send URL as text
                                    try {
                                      await handleSendMessage(`[GIF] ${gifUrl}`, [])
                                    } catch (fallbackError) {
                                      alert("Failed to send GIF. Please try again.")
                                    }
                                  }
                                }}
                                className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                              >
                                <img src={gifUrl} alt={`GIF ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground text-center">Powered by Giphy</p>
                        </div>
                      </div>
                    )}

                    {/* Sticker Picker */}
                    {showStickerPicker && (
                      <div className="absolute bottom-full right-0 mb-2 p-3 bg-card border border-border rounded-xl shadow-xl scale-in w-72 max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-4 gap-2">
                          {/* Sample Stickers - In production, use your sticker pack */}
                          {["😀", "😂", "🥰", "😎", "🤔", "😴", "🤗", "😋", "🥳", "😍", "🤩", "😇"].map((sticker, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                setMessageInput((prev) => prev + sticker)
                                setShowStickerPicker(false)
                              }}
                              className="p-3 hover:bg-muted rounded-lg transition-colors text-3xl"
                            >
                              {sticker}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {messageInput.trim() ? (
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full flex-shrink-0 shadow-lg"
                      onClick={() => handleSendMessage(messageInput)}
                    >
                      <Send size={18} />
                    </Button>
                  ) : (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setIsRecording(true)}
                          >
                            <Mic size={20} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Voice Message</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm px-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold mb-2">Your Messages</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Send private messages to your friends and connections. Start a conversation to share ideas and stay
                connected.
              </p>
              <Button className="rounded-full gap-2" onClick={() => setShowNewChat(true)}>
                <Plus size={18} />
                New Message
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}