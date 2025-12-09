"use client"

import { useState, useEffect, use, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Download,
  Flag,
  Reply,
  ThumbsUp,
  MoreHorizontal,
  Send,
  Smile,
  ImageIcon,
  ArrowLeft,
  Copy,
  UserMinus,
  Loader2,
  Repeat2,
  Pencil,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Post } from "@/components/types"
import { formatRelativeTime, formatNumber } from "@/lib/utils-format"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

interface Comment {
  id: string
  author: { id: string; name: string; username?: string; avatar: string }
  content: string
  likes: number
  dislikes: number
  createdAt: Date
  replies?: Comment[]
}

const EMOJI_LIST = ["❤️", "🔥", "👏", "🎉", "💯", "😂", "🤔", "👀", "✨", "💪"]

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const resolvedParams = use(params)
  const { user: currentUser, token } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likes, setLikes] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [repostCount, setRepostCount] = useState(0)
  const [isReposted, setIsReposted] = useState(false)
  const [shareCount, setShareCount] = useState(0)
  const [bookmarkCount, setBookmarkCount] = useState(0)

  const fetchPost = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/posts/${resolvedParams.postId}`, { headers })
      const data = await response.json()

      if (data.success && data.data) {
        setPost(data.data)
        setLikes(data.data.likes || 0)
        setLiked(data.data.isLiked || false)
        setSaved(data.data.isBookmarked || false)
        setRepostCount(data.data.reposts || 0)
        setIsReposted(data.data.isReposted || false)
        setShareCount(data.data.shares || 0)
      } else {
        setError("Post not found")
      }
    } catch (err) {
      console.error("Failed to fetch post:", err)
      setError("Failed to load post")
    } finally {
      setIsLoading(false)
    }
  }, [resolvedParams.postId, token])

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${resolvedParams.postId}/comments`)
      const data = await response.json()

      if (data.success && data.data?.items) {
        const formattedComments = data.data.items.map((c: any) => ({
          id: c.id,
          author: { 
            id: c.author.id, 
            name: c.author.name, 
            username: c.author.username,
            avatar: c.author.avatar 
          },
          content: c.content,
          likes: c.likes || 0,
          dislikes: 0,
          createdAt: new Date(c.createdAt),
          replies: c.replies?.map((r: any) => ({
            id: r.id,
            author: { id: r.author.id, name: r.author.name, avatar: r.author.avatar },
            content: r.content,
            likes: r.likes || 0,
            dislikes: 0,
            createdAt: new Date(r.createdAt),
          })) || [],
        }))
        setComments(formattedComments)
      }
    } catch (err) {
      console.error("Failed to fetch comments:", err)
    }
  }, [resolvedParams.postId])

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [fetchPost, fetchComments])

  const handleLike = async () => {
    if (!token) {
      toast.error("Please login to like posts")
      return
    }

    const newLikedState = !liked
    setLiked(newLikedState)
    setLikes((prev) => (newLikedState ? prev + 1 : prev - 1))

    try {
      const response = await fetch(`/api/posts/${resolvedParams.postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setLiked(result.liked)
        setLikes(result.likeCount)
      }
    } catch (error) {
      setLiked(!newLikedState)
      setLikes((prev) => (newLikedState ? prev - 1 : prev + 1))
      toast.error("Failed to like post")
    }
  }

  const handleBookmark = async () => {
    if (!token) {
      toast.error("Please login to bookmark posts")
      return
    }

    const newSavedState = !saved
    setSaved(newSavedState)

    try {
      const response = await fetch(`/api/bookmarks/${resolvedParams.postId}`, {
        method: newSavedState ? 'POST' : 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        toast.success(newSavedState ? "Post saved to bookmarks" : "Post removed from bookmarks")
      }
    } catch (error) {
      setSaved(!newSavedState)
      toast.error("Failed to update bookmark")
    }
  }

  const handleRepost = async () => {
    if (!token) {
      toast.error("Please login to repost")
      return
    }

    const newRepostedState = !isReposted
    setIsReposted(newRepostedState)
    setRepostCount((prev) => (newRepostedState ? prev + 1 : prev - 1))

    try {
      const response = await fetch(`/api/posts/${resolvedParams.postId}/repost`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Failed to repost')
      toast.success(newRepostedState ? "Reposted!" : "Repost removed")
    } catch (error) {
      setIsReposted(!newRepostedState)
      setRepostCount((prev) => (newRepostedState ? prev - 1 : prev + 1))
      toast.error("Failed to repost")
    }
  }

  const handleFollow = async () => {
    if (!token || !post) {
      toast.error("Please login to follow users")
      return
    }

    try {
      const response = await fetch(`/api/users/${post.author.id}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await response.json()
      if (result.success) {
        setIsFollowing(result.following)
        toast.success(result.following ? "Following!" : "Unfollowed")
      }
    } catch (error) {
      toast.error("Failed to follow user")
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    if (!token) {
      toast.error("Please login to comment")
      return
    }

    try {
      const response = await fetch(`/api/posts/${resolvedParams.postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: newComment,
          parentId: replyingTo || undefined
        })
      })

      const result = await response.json()
      if (result.success) {
        const newCommentData: Comment = {
          id: result.data.id,
          author: { 
            id: currentUser?.id || '', 
            name: currentUser?.name || 'You', 
            avatar: currentUser?.avatar || '/placeholder.svg' 
          },
          content: newComment,
          likes: 0,
          dislikes: 0,
          createdAt: new Date(),
        }

        if (replyingTo) {
          setComments(comments.map((c) => {
            if (c.id === replyingTo) {
              return { ...c, replies: [...(c.replies || []), newCommentData] }
            }
            return c
          }))
        } else {
          setComments([newCommentData, ...comments])
        }
        setNewComment("")
        setReplyingTo(null)
        toast.success("Comment added!")
      }
    } catch (error) {
      toast.error("Failed to add comment")
    }
  }

  const handleLikeComment = (commentId: string) => {
    const newLiked = new Set(likedComments)
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId)
    } else {
      newLiked.add(commentId)
    }
    setLikedComments(newLiked)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${resolvedParams.postId}`
    
    try {
      if (token) {
        await fetch(`/api/posts/${resolvedParams.postId}/share`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
        setShareCount(prev => prev + 1)
      }

      if (navigator.share) {
        await navigator.share({
          title: post?.title || 'Check out this post',
          text: post?.description || '',
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl)
        toast.success("Link copied to clipboard!")
      }
    }
  }

  const handleReport = async () => {
    if (!token) {
      toast.error("Please login to report")
      return
    }
    toast.info("Report feature coming soon")
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-12 mt-4" : ""} animate-message-slide group`}>
      <div className="flex gap-3">
        <Link href={`/profile/${comment.author.id}`}>
          <Avatar className={`${isReply ? "h-8 w-8" : "h-10 w-10"} hover:ring-2 ring-primary/50 transition-all`}>
            <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/30 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <Link href={`/profile/${comment.author.id}`}>
                <p className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                  {comment.author.name}
                </p>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Copy size={14} /> Copy text
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive">
                    <Flag size={14} /> Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-foreground/90 mt-1 leading-relaxed">{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-2 px-2">
            <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
            <button
              onClick={() => handleLikeComment(comment.id)}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                likedComments.has(comment.id) ? "text-accent" : "text-muted-foreground hover:text-accent"
              }`}
            >
              <ThumbsUp size={12} className={likedComments.has(comment.id) ? "fill-current" : ""} />
              {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply size={12} /> Reply
              </button>
            )}
          </div>
          {comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "Post not found"}</p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} /> Back to Feed
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-secondary mb-6 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </Link>

        <div className="bg-card border glow-border rounded-xl overflow-hidden mb-8">
          <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between gap-3">
            <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              <Avatar className="w-12 h-12 md:w-14 md:h-14 ring-2 ring-primary/50 hover:ring-secondary/70 transition-all">
                <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                <AvatarFallback>{post.author.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-foreground hover:text-primary transition-colors truncate">
                    {post.author.name}
                  </span>
                  {post.author.workerRole && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">
                      {post.author.workerRole}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{post.author.username || post.author.name?.toLowerCase().replace(" ", "")}</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              {currentUser && post.author.id !== currentUser.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFollow}
                  className={isFollowing 
                    ? "bg-muted border-border text-foreground" 
                    : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="bg-transparent">
                    <MoreHorizontal size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2" onClick={handleShare}>
                    <Copy size={16} /> Copy link
                  </DropdownMenuItem>
                  {currentUser && post.author.id === currentUser.id && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2">
                        <Pencil size={16} /> Edit post
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 size={16} /> Delete post
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  {currentUser && post.author.id !== currentUser.id && (
                    <DropdownMenuItem className="gap-2" onClick={handleFollow}>
                      <UserMinus size={16} /> {isFollowing ? "Unfollow" : "Follow"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="gap-2 text-destructive" onClick={handleReport}>
                    <Flag size={16} /> Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-2">{post.title}</h1>
              <p className="text-muted-foreground text-sm">
                {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            {post.image && (
              <div className="rounded-lg overflow-hidden border border-border/50">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-auto object-cover max-h-[500px]"
                />
              </div>
            )}

            {post.video && (
              <div className="rounded-lg overflow-hidden border border-border/50">
                <video
                  src={post.video}
                  poster={post.videoThumbnail || post.image}
                  controls
                  className="w-full max-h-[500px]"
                />
              </div>
            )}

            <p className="text-foreground leading-relaxed">{post.description}</p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 md:px-6 py-4 border-t border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: post.views || 0, label: "Views", icon: Eye, color: "text-primary" },
              { value: likes, label: "Likes", icon: Heart, color: "text-red-500" },
              { value: comments.length, label: "Comments", icon: MessageCircle, color: "text-blue-500" },
              { value: bookmarkCount, label: "Saved", icon: Bookmark, color: "text-yellow-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 bg-muted/20 rounded-lg border border-border/30">
                <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>{formatNumber(stat.value || 0)}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <stat.icon size={12} /> {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="px-4 md:px-6 py-4 border-t border-border/50 grid grid-cols-5 gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
                liked
                  ? "bg-red-500/20 text-red-500"
                  : "bg-muted/30 hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
              }`}
            >
              <Heart size={20} className={liked ? "fill-current" : ""} />
              <span className="text-sm font-medium hidden md:inline">{liked ? "Liked" : "Like"}</span>
            </button>
            <button 
              onClick={() => document.getElementById('comment-input')?.focus()}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium hidden md:inline">Comment</span>
            </button>
            <button
              onClick={handleRepost}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
                isReposted
                  ? "bg-green-500/20 text-green-500"
                  : "bg-muted/30 hover:bg-green-500/10 text-muted-foreground hover:text-green-500"
              }`}
            >
              <Repeat2 size={20} />
              <span className="text-sm font-medium hidden md:inline">Repost</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-cyan-500/10 text-muted-foreground hover:text-cyan-500 transition-colors"
            >
              <Share2 size={20} />
              <span className="text-sm font-medium hidden md:inline">Share</span>
            </button>
            <button
              onClick={handleBookmark}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all ${
                saved
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "bg-muted/30 hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-500"
              }`}
            >
              <Bookmark size={20} className={saved ? "fill-current" : ""} />
              <span className="text-sm font-medium hidden md:inline">{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Comments ({comments.length})</h2>

          <div className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                <AvatarFallback>{currentUser?.name?.[0] || 'Y'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {replyingTo && (
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2 mb-2 animate-message-slide">
                    <p className="text-xs text-primary">
                      Replying to {comments.find((c) => c.id === replyingTo)?.author.name}
                    </p>
                    <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground">
                      ✕
                    </button>
                  </div>
                )}
                <div className="relative">
                  <textarea
                    id="comment-input"
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleAddComment()
                      }
                    }}
                    className="w-full bg-muted/30 border border-border/50 rounded-xl px-4 py-3 pr-12 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none scrollbar-thin"
                    rows={3}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="absolute right-3 bottom-3 p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1">
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 hover:bg-muted/50 rounded transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Smile size={18} />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-card border border-border rounded-lg shadow-lg z-10 animate-bubble-pop">
                          <div className="flex gap-1 flex-wrap max-w-[200px]">
                            {EMOJI_LIST.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setNewComment((prev) => prev + emoji)
                                  setShowEmojiPicker(false)
                                }}
                                className="p-1.5 hover:bg-muted rounded text-lg transition-transform hover:scale-125"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button className="p-2 hover:bg-muted/50 rounded transition-colors text-muted-foreground hover:text-foreground">
                      <ImageIcon size={18} />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">{newComment.length}/500</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="bg-card border border-border/50 rounded-xl p-4 hover:border-border/80 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CommentItem comment={comment} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-card border border-border/50 rounded-xl">
                <MessageCircle size={40} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
