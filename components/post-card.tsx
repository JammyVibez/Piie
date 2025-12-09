"use client"

import { useState, useRef, useEffect } from "react"
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Eye,
  Send,
  Copy,
  Flag,
  UserMinus,
  Repeat2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  BarChart3,
  Clock,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Post, PollOption } from "@/components/types"
import { formatRelativeTime, formatNumber } from "@/lib/utils-format"
import { parseTextContent } from "@/lib/text-utils"
import Link from "next/link"

interface PostCardProps {
  post: Post
  variant?: "default" | "compact" | "featured"
  onComment?: () => void
}

export function PostCard({ post, variant = "default", onComment }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [shareCount, setShareCount] = useState(post.shares || 0)
  const [isReposted, setIsReposted] = useState(post.isReposted || false)
  const [repostCount, setRepostCount] = useState(post.reposts || 0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Get current user ID on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(result => {
          if (result.success && result.data) {
            setCurrentUserId(result.data.id)
          }
        })
        .catch(err => console.error('Failed to get current user:', err))
    }
  }, [])

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [videoProgress, setVideoProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [selectedOption, setSelectedOption] = useState<string | null>(post.poll?.votedOptionId || null)
  const [hasVoted, setHasVoted] = useState(post.poll?.hasVoted || false)
  const [pollOptions, setPollOptions] = useState<PollOption[]>(post.poll?.options || [])

  const cardRef = useRef<HTMLDivElement>(null)

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Not authenticated')
        return
      }

      const newLikedState = !isLiked
      setIsLiked(newLikedState)
      setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1))

      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setIsLiked(result.liked)
        setLikeCount(result.likeCount)
      }
    } catch (error) {
      console.error('Failed to like post:', error)
      setIsLiked(!isLiked)
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1))
    }
  }

  const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike()
    }
  }

  const handleRepost = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Not authenticated')
        return
      }

      const newRepostedState = !isReposted
      setIsReposted(newRepostedState)
      setRepostCount((prev) => (newRepostedState ? prev + 1 : prev - 1))

      const response = await fetch(`/api/posts/${post.id}/repost`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to repost')
      }
    } catch (error) {
      console.error('Failed to repost:', error)
      setIsReposted(!isReposted)
      setRepostCount((prev) => (isReposted ? prev + 1 : prev - 1))
    }
  }

  const handleShare = async () => {
    try {
      const token = localStorage.getItem('token')
      const shareUrl = `${window.location.origin}/post/${post.id}`

      if (token) {
        const response = await fetch(`/api/posts/${post.id}/share`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          setShareCount(prev => prev + 1)
        }
      }

      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      console.log("Error sharing:", err)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setVideoProgress(progress)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleVote = async (optionId: string) => {
    if (hasVoted) return

    setSelectedOption(optionId)
    setHasVoted(true)

    // Update poll options with new vote
    const totalVotes = (post.poll?.totalVotes || 0) + 1
    const updatedOptions = pollOptions.map((opt) => ({
      ...opt,
      votes: opt.id === optionId ? opt.votes + 1 : opt.votes,
      percentage: Math.round(((opt.id === optionId ? opt.votes + 1 : opt.votes) / totalVotes) * 100),
    }))
    setPollOptions(updatedOptions)

    // In production, send vote to API
    // await fetch(`/api/posts/${post.id}/poll/vote`, { method: "POST", body: JSON.stringify({ optionId }) })
  }

  const rarityColors = {
    common: "border-slate-500/30",
    rare: "border-blue-500/30 shadow-blue-500/10",
    epic: "border-purple-500/30 shadow-purple-500/10",
    legendary: "border-yellow-500/30 shadow-yellow-500/10 shadow-lg",
  }

  const rarityBadgeColors = {
    common: "",
    rare: "bg-blue-500/90 text-white",
    epic: "bg-purple-500/90 text-white",
    legendary: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
  }

  if (variant === "compact") {
    return (
      <Card
        className={`p-4 border ${rarityColors[post.rarity]} hover:shadow-lg transition-all duration-300 cursor-pointer group`}
      >
        <div className="flex gap-4">
          {post.image && (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 relative">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {post.video && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={20} className="text-white" fill="white" />
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {post.poll && <BarChart3 size={14} className="text-primary flex-shrink-0" />}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{post.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart size={12} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                {formatNumber(likeCount)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} />
                {formatNumber(post.comments)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      ref={cardRef}
      onDoubleClick={handleDoubleClick}
      className={`overflow-hidden border ${rarityColors[post.rarity]} hover:shadow-xl transition-all duration-300 group relative`}
    >
      {/* Like Animation Overlay */}
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Heart size={80} className="fill-red-500 text-red-500 animate-bubble-pop" />
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link
          href={`/profile/${post.author.id}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
        >
          <Avatar className="h-11 w-11 ring-2 ring-primary/20 flex-shrink-0">
            <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-foreground text-sm truncate">{post.author.name}</p>
              {post.author.userRole && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold capitalize">
                  {post.author.userRole}
                </span>
              )}
              {(post.author as any).workerRole && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">
                  {(post.author as any).workerRole.toUpperCase()}
                </span>
              )}
              {post.rarity !== "common" && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize ${rarityBadgeColors[post.rarity]}`}
                >
                  {post.rarity}
                </span>
              )}
              {post.postType === "poll" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold flex items-center gap-1">
                  <BarChart3 size={10} /> Poll
                </span>
              )}
              {post.postType === "video" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-500 font-semibold flex items-center gap-1">
                  <Play size={10} /> Video
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatRelativeTime(post.createdAt)}</span>
              {post.author.realm && (
                <>
                  <span>·</span>
                  <span className="text-primary/80">{post.author.realm}</span>
                </>
              )}
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {!isFollowing && currentUserId && post.author.id !== currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token')
                  if (!token) {
                    console.error('Not authenticated')
                    return
                  }

                  const response = await fetch(`/api/users/${post.author.id}/follow`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  })

                  const result = await response.json()
                  if (result.success) {
                    setIsFollowing(true)
                  }
                } catch (error) {
                  console.error('Failed to follow user:', error)
                }
              }}
              className="text-xs h-8 px-3 bg-primary/10 hover:bg-primary/20 text-primary"
            >
              Follow
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2" onClick={async () => {
                const postUrl = `${window.location.origin}/post/${post.id}`
                await navigator.clipboard.writeText(postUrl)
                alert('Link copied to clipboard!')
              }}>
                <Copy size={16} /> Copy link
              </DropdownMenuItem>
              {currentUserId && post.author.id === currentUserId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" onClick={() => {
                    // TODO: Implement edit functionality
                    console.log('Edit post:', post.id)
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive" onClick={async () => {
                    if (!confirm('Are you sure you want to delete this post?')) return
                    try {
                      const token = localStorage.getItem('token')
                      const response = await fetch(`/api/posts/${post.id}`, {
                        method: 'DELETE',
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      })
                      if (response.ok) {
                        alert('Post deleted successfully')
                        window.location.reload()
                      }
                    } catch (error) {
                      console.error('Failed to delete post:', error)
                    }
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Delete post
                  </DropdownMenuItem>
                </>
              )}
              {currentUserId && post.author.id !== currentUserId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2" onClick={async () => {
                    try {
                      const token = localStorage.getItem('token')
                      const response = await fetch(`/api/users/${post.author.id}/follow`, {
                        method: isFollowing ? 'DELETE' : 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
                      })
                      const result = await response.json()
                      if (result.success) {
                        setIsFollowing(!isFollowing)
                      }
                    } catch (error) {
                      console.error('Failed to follow/unfollow:', error)
                    }
                  }}>
                    <UserMinus size={16} /> {isFollowing ? 'Unfollow' : 'Follow'} {post.author.name.split(" ")[0]}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-destructive" onClick={async () => {
                    const reason = prompt('Please select a reason:\n1. Spam\n2. Harassment\n3. Inappropriate content\n4. Other\n\nEnter number:')
                    if (!reason) return

                    const reasonMap: Record<string, string> = {
                      '1': 'spam',
                      '2': 'harassment',
                      '3': 'hate_speech',
                      '4': 'other'
                    }

                    try {
                      const token = localStorage.getItem('token')
                      const response = await fetch('/api/reports', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          targetId: post.id,
                          targetType: 'post',
                          reason: reasonMap[reason] || 'other'
                        })
                      })

                      if (response.ok) {
                        alert('Report submitted successfully')
                      }
                    } catch (error) {
                      console.error('Failed to report post:', error)
                    }
                  }}>
                    <Flag size={16} /> Report
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <h3 className="font-bold text-lg text-foreground mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2">
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3 leading-relaxed">
          {parseTextContent(post.description)}
        </p>
      </div>

      {post.video && (
        <div className="relative overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={post.video}
            poster={post.videoThumbnail || post.image}
            className="w-full max-h-[500px] object-contain"
            muted={isMuted}
            loop
            playsInline
            onTimeUpdate={handleVideoProgress}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Video Overlay Controls */}
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer group/video"
            onClick={togglePlay}
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm group-hover/video:scale-110 transition-transform">
                <Play size={32} className="text-white ml-1" fill="white" />
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:scale-110 transition-transform">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${videoProgress}%` }} />
              </div>
              {post.videoDuration && (
                <span className="text-xs text-white/80">{formatDuration(post.videoDuration)}</span>
              )}
            </div>
          </div>

          {/* View count */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white">
            <Eye size={12} />
            {formatNumber(post.views || 0)}
          </div>
        </div>
      )}

      {/* Image (if no video) */}
      {post.image && !post.video && (
        <Link href={`/post/${post.id}`}>
          <div className="relative overflow-hidden cursor-pointer">
            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-auto max-h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            {/* View count overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs text-foreground">
              <Eye size={12} />
              {formatNumber(post.views || 0)}
            </div>
          </div>
        </Link>
      )}

      {post.poll && (
        <div className="px-4 py-3">
          <div className="space-y-2">
            {pollOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted}
                className={`w-full relative overflow-hidden rounded-lg border transition-all ${
                  hasVoted
                    ? selectedOption === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30"
                    : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                }`}
              >
                {/* Progress bar background */}
                {hasVoted && (
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      selectedOption === option.id ? "bg-primary/20" : "bg-muted/50"
                    }`}
                    style={{ width: `${option.percentage || 0}%` }}
                  />
                )}

                <div className="relative p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === option.id ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {selectedOption === option.id && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${selectedOption === option.id ? "text-primary" : "text-foreground"}`}
                    >
                      {option.text}
                    </span>
                  </div>
                  {hasVoted && (
                    <span
                      className={`text-sm font-semibold ${selectedOption === option.id ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {option.percentage || 0}%
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Poll Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <span>{post.poll.totalVotes + (hasVoted ? 1 : 0)} votes</span>
            {post.poll.endsAt && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                Ends {formatRelativeTime(post.poll.endsAt)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="px-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {(likeCount > 0 || post.comments > 0 || repostCount > 0 || shareCount > 0) && (
        <div className="px-4 pt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {likeCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                  <Heart size={10} className="text-white fill-white" />
                </span>
                {formatNumber(likeCount)}
              </span>
            )}
            {repostCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Repeat2 size={10} className="text-white fill-white" />
                </span>
                {formatNumber(repostCount)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {post.comments > 0 && <span>{formatNumber(post.comments)} comments</span>}
            {shareCount > 0 && <span>{formatNumber(shareCount)} shares</span>}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-2 py-2 mt-2 border-t border-border/50 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 gap-2 hover:bg-red-500/10 ${isLiked ? "text-red-500" : ""}`}
          onClick={handleLike}
        >
          <Heart size={18} className={`transition-all ${isLiked ? "fill-current scale-110" : ""}`} />
          <span className="text-sm hidden sm:inline">Like</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-2 hover:bg-primary/10" 
          onClick={(e) => {
            e.stopPropagation()
            if (onComment) {
              onComment()
            }
          }}
        >
          <MessageCircle size={18} />
          <span className="text-sm hidden sm:inline">Comment</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 gap-2 hover:bg-green-500/10 ${isReposted ? "text-green-500" : ""}`}
          onClick={handleRepost}
        >
          <Repeat2 size={18} className={`transition-all ${isReposted ? "fill-current scale-110" : ""}`} />
          <span className="text-sm hidden sm:inline">Repost</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 hover:bg-primary/10" onClick={handleShare}>
          <Share2 size={18} />
          <span className="text-sm hidden sm:inline">Share</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`hover:bg-primary/10 ${isBookmarked ? "text-primary" : ""}`}
          onClick={async (e) => {
            e.stopPropagation()
            try {
              const token = localStorage.getItem('token')
              if (!token) {
                console.error('Not authenticated')
                return
              }

              const newBookmarkedState = !isBookmarked

              const response = await fetch(`/api/bookmarks/${post.id}`, {
                method: newBookmarkedState ? 'POST' : 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                }
              })

              const result = await response.json()
              if (result.success) {
                setIsBookmarked(newBookmarkedState)
              }
            } catch (error) {
              console.error('Failed to bookmark post:', error)
            }
          }}
        >
          <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
        </Button>
      </div>
    </Card>
  )
}