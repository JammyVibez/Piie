"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MessageCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Bookmark,
  Copy,
  Eye,
  TrendingUp,
  Zap,
  GitFork,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { FusionPost, FusionLayer } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { CommentModal } from "@/components/comment-modal"

interface FusionPostCardProps {
  fusionPost: FusionPost
  onAddLayer?: () => void
}

const LAYER_TYPE_COLORS = {
  text: "from-blue-500 to-cyan-500",
  image: "from-purple-500 to-pink-500",
  video: "from-red-500 to-orange-500",
  voice: "from-green-500 to-emerald-500",
  draw: "from-yellow-500 to-orange-500",
  sticker: "from-indigo-500 to-purple-500",
  overlay: "from-pink-500 to-rose-500",
}

const renderContentWithLinks = (content: string | undefined | null) => {
  if (!content) return null
  const parts = content.split(/(\s+)/)
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span key={index} className="text-primary font-semibold hover:underline cursor-pointer">
          {part}
        </span>
      )
    } else if (part.startsWith('@')) {
      return (
        <span key={index} className="text-accent font-semibold hover:underline cursor-pointer">
          {part}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: diffInSeconds / 31536000,
    month: diffInSeconds / 2592000,
    week: diffInSeconds / 604800,
    day: diffInSeconds / 86400,
    hour: diffInSeconds / 3600,
    minute: diffInSeconds / 60,
  };

  let result = "";
  if (intervals.year >= 1) {
    result = Math.floor(intervals.year) + "y";
  } else if (intervals.month >= 1) {
    result = Math.floor(intervals.month) + "m";
  } else if (intervals.week >= 1) {
    result = Math.floor(intervals.week) + "w";
  } else if (intervals.day >= 1) {
    result = Math.floor(intervals.day) + "d";
  } else if (intervals.hour >= 1) {
    result = Math.floor(intervals.hour) + "h";
  } else if (intervals.minute >= 1) {
    result = Math.floor(intervals.minute) + "m";
  } else {
    result = "just now";
  }
  return result;
};

export function FusionPostCard({ fusionPost, onAddLayer }: FusionPostCardProps) {
  const { toast } = useToast()
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(fusionPost.likes || 0)
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 1000))
  const [forkCount, setForkCount] = useState(fusionPost.forkCount || 0)
  const [commentCount, setCommentCount] = useState(0)
  const [isForking, setIsForking] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [showLayerInfo, setShowLayerInfo] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const autoPlayInterval = useRef<NodeJS.Timeout>()

  const allLayers = [
    {
      id: "seed",
      type: fusionPost.seedType,
      content: fusionPost.seedContent,
      mediaUrl: fusionPost.seedMediaUrl,
      author: fusionPost.owner,
      authorId: fusionPost.ownerId,
      fusionPostId: fusionPost.id,
      layerOrder: 0,
      likes: 0,
      isApproved: true,
      createdAt: fusionPost.createdAt,
    } as FusionLayer,
    ...(fusionPost.layers || []),
  ]

  const currentLayer = allLayers[currentLayerIndex]
  const totalLayers = allLayers.length

  // Load real-time data on mount
  useEffect(() => {
    const loadRealtimeData = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      try {
        // Load likes, comments, fork count
        const [likeRes, commentRes] = await Promise.all([
          fetch(`/api/fusion/${fusionPost.id}/like`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null),
          fetch(`/api/posts/${fusionPost.id}/comments?limit=1`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null),
        ])

        if (likeRes?.ok) {
          const likeData = await likeRes.json()
          if (likeData.success) {
            setLikeCount(likeData.likeCount || 0)
            setIsLiked(likeData.liked || false)
          }
        }

        if (commentRes?.ok) {
          const commentData = await commentRes.json()
          if (commentData.success) {
            setCommentCount(commentData.data?.total || 0)
          }
        }

        // Check if bookmarked
        const bookmarkRes = await fetch(`/api/bookmarks/${fusionPost.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null)
        
        if (bookmarkRes?.ok) {
          const bookmarkData = await bookmarkRes.json()
          setIsBookmarked(bookmarkData.isBookmarked || false)
        }
      } catch (error) {
        console.error("Failed to load real-time data:", error)
      }
    }

    loadRealtimeData()
  }, [fusionPost.id])

  useEffect(() => {
    if (isAutoPlaying && totalLayers > 1) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentLayerIndex((prev) => (prev + 1) % totalLayers)
      }, 3000)
    } else {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current)
      }
    }

    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current)
      }
    }
  }, [isAutoPlaying, totalLayers])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX - translateX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const x = e.clientX - startX
    setTranslateX(x)
  }

  const handleMouseUp = () => {
    setIsDragging(false)

    if (Math.abs(translateX) > 100) {
      if (translateX > 0 && currentLayerIndex > 0) {
        setCurrentLayerIndex(currentLayerIndex - 1)
      } else if (translateX < 0 && currentLayerIndex < totalLayers - 1) {
        setCurrentLayerIndex(currentLayerIndex + 1)
      }
    }

    setTranslateX(0)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX - translateX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const x = e.touches[0].clientX - startX
    setTranslateX(x)
  }

  const handleTouchEnd = handleMouseUp

  const nextLayer = () => {
    if (currentLayerIndex < totalLayers - 1) {
      setCurrentLayerIndex(currentLayerIndex + 1)
    }
  }

  const prevLayer = () => {
    if (currentLayerIndex > 0) {
      setCurrentLayerIndex(currentLayerIndex - 1)
    }
  }

  const handleLike = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to like this fusion",
        variant: "destructive",
      })
      return
    }

    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1))

    try {
      const response = await fetch(`/api/fusion/${fusionPost.id}/like`, {
        method: newLikedState ? "POST" : "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setIsLiked(!newLikedState)
        setLikeCount((prev) => (newLikedState ? prev - 1 : prev + 1))
        throw new Error("Failed to update like")
      }

      const data = await response.json()
      if (data.success) {
        setLikeCount(data.likeCount || likeCount)
        setIsLiked(data.liked !== undefined ? data.liked : newLikedState)
      }
    } catch (error) {
      console.error("Error liking fusion:", error)
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      })
    }
  }

  const handleBookmark = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to bookmark this fusion",
        variant: "destructive",
      })
      return
    }

    const newBookmarkState = !isBookmarked
    setIsBookmarked(newBookmarkState)

    try {
      const response = await fetch(`/api/bookmarks/${fusionPost.id}`, {
        method: newBookmarkState ? "POST" : "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        setIsBookmarked(!newBookmarkState)
        throw new Error("Failed to update bookmark")
      }

      toast({
        title: newBookmarkState ? "Bookmarked!" : "Removed from bookmarks",
        description: newBookmarkState ? "Fusion saved to your collection" : "Fusion removed from your collection",
      })
    } catch (error) {
      console.error("Error bookmarking fusion:", error)
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      })
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/fusion/${fusionPost.id}`)
    toast({
      title: "Link Copied!",
      description: "Fusion post link copied to clipboard",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fusionPost.title,
          text: fusionPost.seedContent,
          url: `${window.location.origin}/fusion/${fusionPost.id}`,
        })
        // Track share
        const token = localStorage.getItem("auth_token")
        if (token) {
          fetch(`/api/fusion/${fusionPost.id}/share`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => {})
        }
      } catch (error) {
        // User cancelled or error
      }
    } else {
      handleCopyLink()
    }
  }

  const handleFork = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please login to fork this fusion",
        variant: "destructive",
      })
      return
    }

    setIsForking(true)
    try {
      const response = await fetch(`/api/fusion/${fusionPost.id}/fork`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `${fusionPost.title} (Fork)`,
          seedContent: fusionPost.seedContent,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setForkCount(prev => prev + 1)
        toast({
          title: "Fusion Forked!",
          description: "You've created a fork of this fusion",
        })
        // Navigate to the new fork
        if (result.data?.id) {
          window.location.href = `/fusion/${result.data.id}`
        }
      } else {
        throw new Error(result.error || "Failed to fork")
      }
    } catch (error) {
      console.error("Error forking fusion:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fork fusion",
        variant: "destructive",
      })
    } finally {
      setIsForking(false)
    }
  }

  const layerGradient = LAYER_TYPE_COLORS[currentLayer.type as keyof typeof LAYER_TYPE_COLORS] || LAYER_TYPE_COLORS.text

  return (
    <Card
      ref={cardRef}
      className="relative overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 bg-card shadow-lg hover:shadow-xl group"
    >
      {/* Fusion Badge */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <Badge className="bg-gradient-to-r from-primary to-accent text-white font-bold px-3 py-1 shadow-lg animate-pulse">
          <Sparkles className="w-3 h-3 mr-1" />
          FUSED
        </Badge>
        {forkCount > 0 && (
          <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
            <TrendingUp className="w-3 h-3 mr-1" />
            {forkCount} Forks
          </Badge>
        )}
      </div>

      {/* Layer Counter & View Count */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        <Badge variant="secondary" className="font-semibold backdrop-blur-sm bg-background/80">
          <Layers className="w-3 h-3 mr-1" />
          {currentLayerIndex + 1} / {totalLayers}
        </Badge>
        <Badge variant="outline" className="backdrop-blur-sm bg-background/60 text-xs">
          <Eye className="w-3 h-3 mr-1" />
          {viewCount}
        </Badge>
      </div>

      {/* Main Card Content */}
      <div
        className="relative transition-transform duration-300 cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${translateX}px) perspective(1000px) rotateY(${translateX * 0.02}deg)`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Layer Content */}
        <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-muted/50 to-background overflow-hidden">
          {/* Background particles effect */}
          <div className="absolute inset-0 opacity-30">
            <div className={`absolute inset-0 bg-gradient-to-br ${layerGradient} blur-3xl animate-pulse`} />
          </div>

          {/* Content based on type */}
          {currentLayer.type === "image" && currentLayer.mediaUrl && (
            <img
              src={currentLayer.mediaUrl}
              alt={currentLayer.content}
              className="w-full h-full object-cover"
            />
          )}

          {currentLayer.type === "video" && currentLayer.mediaUrl && (
            <video
              src={currentLayer.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
            />
          )}

          {(currentLayer.type === "text" || !currentLayer.mediaUrl) && (
            <div className="relative z-10 flex items-center justify-center h-full p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-foreground">{fusionPost.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {renderContentWithLinks(currentLayer.content)}
                </p>
              </div>
            </div>
          )}

          {/* Layer Type Badge */}
          <div className="absolute top-4 left-4">
            <Badge className={`bg-gradient-to-r ${layerGradient} text-white capitalize shadow-lg`}>
              <Zap className="w-3 h-3 mr-1" />
              {currentLayer.type} Layer
            </Badge>
          </div>

          {/* Layer Info Toggle */}
          <button
            onClick={() => setShowLayerInfo(!showLayerInfo)}
            className="absolute top-4 right-4 backdrop-blur-md bg-background/60 rounded-full p-2 hover:bg-background/80 transition-all"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Layer Info Panel */}
          {showLayerInfo && (
            <div className="absolute top-16 right-4 backdrop-blur-xl bg-background/90 rounded-lg p-4 shadow-xl border border-border/50 max-w-xs">
              <h4 className="font-bold text-sm mb-2">Layer Info</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Order: {currentLayer.layerOrder}</p>
                <p>Type: {currentLayer.type}</p>
                <p>Likes: {currentLayer.likes}</p>
                <p>Created: {new Date(currentLayer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Author Info */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 backdrop-blur-md bg-background/60 rounded-full px-3 py-2 group-hover:bg-background/80 transition-all">
            <Avatar className="h-8 w-8 ring-2 ring-primary/30">
              <AvatarImage src={currentLayer.author?.avatar} />
              <AvatarFallback>{currentLayer.author?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {currentLayer.author?.name || "Unknown"}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentLayerIndex === 0 ? "Creator" : "Contributor"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {currentLayerIndex > 0 && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all"
            onClick={prevLayer}
          >
            <ChevronLeft />
          </Button>
        )}

        {currentLayerIndex < totalLayers - 1 && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all"
            onClick={nextLayer}
          >
            <ChevronRight />
          </Button>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-4">
        {/* Contributors Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {fusionPost.contributors?.slice(0, 5).map((contributor, idx) => (
                <Avatar key={idx} className="h-8 w-8 ring-2 ring-background hover:scale-110 transition-transform">
                  <AvatarImage src={contributor.avatar} />
                  <AvatarFallback>{contributor.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              {fusionPost.contributorCount > 5 && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold ring-2 ring-background">
                  +{fusionPost.contributorCount - 5}
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {fusionPost.contributorCount} contributor{fusionPost.contributorCount !== 1 ? "s" : ""}
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="gap-2 hover:scale-105 transition-transform"
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isAutoPlaying ? "Pause" : "Play"}
          </Button>
        </div>

        {/* Timeline Dots */}
        <div className="flex gap-1 justify-center">
          {allLayers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentLayerIndex(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all hover:scale-125",
                idx === currentLayerIndex
                  ? "w-8 bg-gradient-to-r from-primary to-accent"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "gap-2 hover:scale-110 transition-transform",
                isLiked && "text-red-500 hover:text-red-600"
              )}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current animate-pulse")} />
              {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover:scale-110 transition-transform"
              onClick={() => {
                const token = localStorage.getItem("auth_token")
                if (!token) {
                  toast({
                    title: "Authentication required",
                    description: "Please login to comment",
                    variant: "destructive",
                  })
                  return
                }
                setShowCommentModal(true)
              }}
            >
              <MessageCircle className="w-5 h-5" />
              {commentCount > 0 && <span className="text-sm">{commentCount}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleFork}
              disabled={isForking}
              className="gap-2 hover:scale-110 transition-transform"
            >
              <GitFork className="w-5 h-5" />
              {forkCount > 0 && <span className="text-sm">{forkCount}</span>}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={cn(
                "gap-2 hover:scale-110 transition-transform",
                isBookmarked && "text-primary"
              )}
            >
              <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="gap-2 hover:scale-110 transition-transform"
            >
              <Share2 className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2 hover:scale-110 transition-transform"
            >
              <Copy className="w-5 h-5" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={onAddLayer}
            className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all gap-2"
          >
            <Layers className="w-4 h-4" />
            Add Layer
          </Button>
        </div>
      </div>

      {/* Fusion Ripple Effect (on swipe) */}
      {isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-r ${layerGradient} opacity-20 animate-pulse`} />
        </div>
      )}

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onSubmit={async (comment) => {
          setCommentCount(prev => prev + 1)
          toast({
            title: "Comment posted!",
            description: "Your comment has been added to this fusion.",
          })
        }}
        postTitle={fusionPost.title}
        postId={fusionPost.id}
      />
    </Card>
  )
}