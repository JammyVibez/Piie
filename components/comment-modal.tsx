"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Smile, ImageIcon, AtSign, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface Comment {
  id: string
  author: { id?: string; name: string; avatar: string; username?: string }
  content: string
  likes: number
  createdAt: Date
  replies?: Comment[]
  repliesCount?: number
  isLiked?: boolean
}

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (comment: string) => void
  postTitle?: string
  postId?: string
}

const EMOJI_LIST = ["❤️", "🔥", "👏", "🎉", "💯", "😂", "🤔", "👀", "✨", "💪", "🙌", "😊"]

export function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  postTitle,
  postId,
}: CommentModalProps) {
  const [comment, setComment] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user: currentUser, token } = useAuth()

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments()
    }
  }, [isOpen, postId])

  const fetchComments = async () => {
    if (!postId) return
    
    setIsLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/posts/${postId}/comments?limit=50`, { headers })
      const result = await response.json()

      if (result.success) {
        const formattedComments = result.data.items.map((c: any) => ({
          id: c.id,
          author: {
            id: c.author.id,
            name: c.author.name || c.author.username,
            avatar: c.author.avatar || "/placeholder.svg",
            username: c.author.username,
          },
          content: c.content,
          likes: c.likes || 0,
          createdAt: new Date(c.createdAt),
          replies: c.replies?.map((r: any) => ({
            id: r.id,
            author: {
              id: r.author.id,
              name: r.author.name || r.author.username,
              avatar: r.author.avatar || "/placeholder.svg",
            },
            content: r.content,
            likes: r.likes || 0,
            createdAt: new Date(r.createdAt),
          })) || [],
          repliesCount: c.repliesCount || 0,
          isLiked: c.isLiked || false,
        }))
        setComments(formattedComments)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!comment.trim() || !postId || isSubmitting) return

    if (!token) {
      toast.error("Please sign in to comment")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: comment,
          parentId: replyingTo || undefined,
          image: attachedImage || undefined,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const newComment: Comment = {
          id: result.data.id,
          author: {
            id: result.data.author.id,
            name: result.data.author.name || result.data.author.username,
            avatar: result.data.author.avatar || "/placeholder.svg",
          },
          content: result.data.content,
          likes: 0,
          createdAt: new Date(result.data.createdAt),
          replies: [],
        }

        if (replyingTo) {
          setComments(
            comments.map((c) => {
              if (c.id === replyingTo) {
                return { ...c, replies: [...(c.replies || []), newComment] }
              }
              return c
            }),
          )
        } else {
          setComments([newComment, ...comments])
        }

        onSubmit(comment)
        toast.success("Comment posted!")
        setComment("")
        setReplyingTo(null)
        setAttachedImage(null)
      } else {
        toast.error(result.error || "Failed to post comment")
      }
    } catch (error) {
      console.error("Failed to create comment:", error)
      toast.error("Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    const newLiked = new Set(likedComments)
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId)
    } else {
      newLiked.add(commentId)
    }
    setLikedComments(newLiked)
  }

  const insertEmoji = (emoji: string) => {
    setComment((prev) => prev + emoji)
    setShowEmojiPicker(false)
    textareaRef.current?.focus()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAttachedImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-3 ${isReply ? "ml-12 mt-3" : ""} animate-message-slide`}>
      <Avatar className={`${isReply ? "h-8 w-8" : "h-10 w-10"} flex-shrink-0`}>
        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/30 rounded-2xl rounded-tl-sm px-4 py-2.5">
          <p className="font-semibold text-sm text-foreground">{comment.author.name}</p>
          <p className="text-sm text-foreground/90 mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 px-2">
          <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
          <button
            onClick={() => handleLikeComment(comment.id)}
            className={`text-xs font-medium transition-colors ${
              likedComments.has(comment.id) ? "text-accent" : "text-muted-foreground hover:text-accent"
            }`}
          >
            Like{" "}
            {comment.likes + (likedComments.has(comment.id) ? 1 : 0) > 0 &&
              `(${comment.likes + (likedComments.has(comment.id) ? 1 : 0)})`}
          </button>
          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Reply
            </button>
          )}
        </div>
        {comment.replies?.map((reply) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] p-0 bg-card border glow-border rounded-xl overflow-hidden">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle size={22} className="text-secondary" />
            Comments ({comments.length})
          </DialogTitle>
        </DialogHeader>

        {postTitle && (
          <div className="mx-4 mt-4 bg-muted/40 rounded-lg p-3 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Replying to</p>
            <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2">{postTitle}</p>
          </div>
        )}

        <ScrollArea className="flex-1 max-h-[40vh] px-4">
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              </div>
            ) : comments.length > 0 ? (
              comments.map((c) => <CommentItem key={c.id} comment={c} />)
            ) : (
              <div className="text-center py-8">
                <MessageCircle size={40} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">No comments yet. Be the first!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 space-y-3">
          {replyingTo && (
            <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2 animate-message-slide">
              <p className="text-xs text-primary">
                Replying to {comments.find((c) => c.id === replyingTo)?.author.name}
              </p>
              <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            </div>
          )}

          {attachedImage && (
            <div className="relative inline-block animate-bubble-pop">
              <img
                src={attachedImage || "/placeholder.svg"}
                alt="Attachment"
                className="h-20 rounded-lg border border-border"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-white"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{currentUser?.name?.[0] || "Y"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder="Write a comment..."
                  rows={2}
                  className="w-full px-4 py-3 pr-12 border border-border rounded-2xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none scrollbar-thin"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!comment.trim() || isSubmitting}
                  className="absolute right-3 bottom-3 p-1.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>

              <div className="flex items-center gap-1 mt-2">
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Smile size={18} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-lg shadow-lg z-10 animate-bubble-pop">
                      <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {EMOJI_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => insertEmoji(emoji)}
                            className="p-1.5 hover:bg-muted rounded text-lg transition-transform hover:scale-125"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ImageIcon size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                  <AtSign size={18} />
                </button>
                <div className="flex-1" />
                <span className="text-xs text-muted-foreground">{comment.length}/500</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <p className="text-xs font-medium text-muted-foreground">Quick:</p>
            {["❤️", "🔥", "👏", "🎉", "💯"].map((react) => (
              <button
                key={react}
                onClick={() => insertEmoji(react)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {react}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
