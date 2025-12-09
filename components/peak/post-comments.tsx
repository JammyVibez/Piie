"use client"

import { useState, useEffect } from "react"
import { Heart, Reply, MoreVertical } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface Comment {
  id: string
  author: {
    id: string
    name: string
    avatar: string
    username: string
  }
  content: string
  createdAt: string
  likes: number
  repliesCount: number
  isLiked?: boolean
}

interface PostCommentsProps {
  postId: string
  isOpen: boolean
  onClose: () => void
}

export default function PostComments({ postId, isOpen, onClose }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState<string | null>(null)
  const { token, user } = useAuth()

  useEffect(() => {
    if (isOpen && postId) {
      fetchComments()
    }
  }, [isOpen, postId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/posts/${postId}/comments?limit=50`, { headers })
      const result = await response.json()

      if (result.success) {
        setComments(result.data.items.map((c: any) => ({
          id: c.id,
          author: {
            id: c.author.id,
            name: c.author.name || c.author.username,
            avatar: c.author.avatar || "/placeholder.svg",
            username: c.author.username,
          },
          content: c.content,
          createdAt: c.createdAt,
          likes: c.likes || 0,
          repliesCount: c.repliesCount || 0,
          isLiked: c.isLiked || false,
        })))
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || isSubmitting) return

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
        body: JSON.stringify({ content: newComment }),
      })

      const result = await response.json()

      if (result.success) {
        setComments([{
          id: result.data.id,
          author: {
            id: result.data.author.id,
            name: result.data.author.name || result.data.author.username,
            avatar: result.data.author.avatar || "/placeholder.svg",
            username: result.data.author.username,
          },
          content: result.data.content,
          createdAt: result.data.createdAt,
          likes: 0,
          repliesCount: 0,
          isLiked: false,
        }, ...comments])
        setNewComment("")
        toast.success("Comment posted!")
      } else {
        toast.error(result.error || "Failed to post comment")
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast.error("Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-card w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Comments ({comments.length})</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-all">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="group hover:bg-muted/30 p-3 rounded-lg transition-all">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={comment.author.avatar || "/placeholder.svg"}
                      alt={comment.author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.author.name}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground break-words mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <button className="hover:text-primary transition-colors flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {comment.likes}
                      </button>
                      <button className="hover:text-primary transition-colors flex items-center gap-1">
                        <Reply className="w-3 h-3" />
                        Reply
                      </button>
                      {comment.repliesCount > 0 && (
                        <button
                          onClick={() => setExpandedReplies(expandedReplies === comment.id ? null : comment.id)}
                          className="hover:text-primary transition-colors"
                        >
                          {comment.repliesCount} {comment.repliesCount === 1 ? "reply" : "replies"}
                        </button>
                      )}
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={user?.avatar || "/placeholder.svg"}
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border/50 focus:border-primary/50 focus:outline-none text-sm"
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isSubmitting}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
