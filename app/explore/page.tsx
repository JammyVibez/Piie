"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  Flame,
  Sparkles,
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  Play,
  Eye,
  Bookmark,
  Share2,
  Crown,
  ChevronRight,
  Verified,
  Loader2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

interface TrendingPost {
  id: string
  title: string
  image?: string
  author: string
  authorAvatar?: string
  likes: number
  comments: number
  tags?: string[]
  trending?: number
}

interface TrendingTopic {
  id: string
  name: string
  hashtag: string
  posts: number
  trend: string
  category: string
}

interface TrendingCreator {
  id: string
  name: string
  username: string
  avatar?: string
  followers: number
  isVerified: boolean
  growth?: string
}

interface TrendingRealm {
  id: string
  name: string
  icon: string
  description?: string
  members: number
  trend?: string
}

// Featured Post Card - Large hero card
function FeaturedPostCard({ post, index }: { post: TrendingPost; index: number }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 cursor-pointer",
        index === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("relative w-full overflow-hidden", index === 0 ? "h-[400px]" : "h-[200px]")}>
        <img
          src={post.image || "/placeholder.svg"}
          alt={post.title}
          className={cn("w-full h-full object-cover transition-transform duration-700", isHovered && "scale-110")}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Rank badge */}
        <div
          className={cn(
            "absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full",
            "bg-gradient-to-r from-primary to-secondary text-primary-foreground",
            "font-bold text-sm shadow-lg",
          )}
        >
          <Crown size={14} />#{post.trending}
        </div>

        {/* Play button for video indication */}
        {index === 0 && (
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm",
              "flex items-center justify-center transition-all duration-300",
              isHovered ? "scale-110 bg-white/30" : "",
            )}
          >
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <h3 className={cn("font-bold text-white mb-2 line-clamp-2", index === 0 ? "text-2xl" : "text-lg")}>
            {post.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white/30">
                <AvatarImage src={post.authorAvatar || "/placeholder.svg"} />
                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-white/90 text-sm font-medium">{post.author}</span>
            </div>

            <div className="flex items-center gap-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Heart size={14} />
                {formatNumber(post.likes)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={14} />
                {formatNumber(post.comments)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Compact Post Card - Grid style
function CompactPostCard({ post }: { post: TrendingPost }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  return (
    <Card className="group overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer bg-card">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={post.image || "/placeholder.svg"}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white",
              isLiked && "text-red-500",
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
            }}
          >
            <Heart size={18} className={isLiked ? "fill-current" : ""} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white",
              isBookmarked && "text-primary",
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsBookmarked(!isBookmarked)
            }}
          >
            <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          >
            <Share2 size={18} />
          </Button>
        </div>

        {/* Rank indicator */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
          #{post.trending}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.authorAvatar || "/placeholder.svg"} />
              <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{post.author}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart size={12} />
              {formatNumber(post.likes)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} />
              {formatNumber(post.likes * 4)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Topic Card - Glassmorphism style
function TopicCard({ topic }: { topic: TrendingTopic }) {
  const gradientMap: Record<string, string> = {
    "from-blue-500 to-cyan-500": "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    "from-purple-500 to-pink-500": "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30",
    "from-orange-500 to-red-500": "bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30",
    "from-green-500 to-emerald-500": "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30",
    "from-blue-600 to-blue-400": "bg-gradient-to-br from-blue-600/20 to-blue-400/20 border-blue-600/30",
    "from-cyan-500 to-blue-500": "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  }

  return (
    <Card
      className={cn(
        "p-4 border backdrop-blur-sm cursor-pointer transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        gradientMap[topic.color || "from-blue-500 to-cyan-500"] || "bg-card/50 border-border/50",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-bold text-foreground text-lg">{topic.hashtag}</h3>
          <p className="text-sm text-muted-foreground">{formatNumber(topic.posts)} posts</p>
          {topic.category && (
            <Badge variant="outline" className="mt-2 text-xs">
              {topic.category}
            </Badge>
          )}
        </div>
        <div className="text-right">
          <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            {topic.trend}
          </span>
          <p className="text-xs text-muted-foreground">trending</p>
        </div>
      </div>
    </Card>
  )
}

// Creator Card - Profile style
function CreatorCard({ creator, rank }: { creator: TrendingCreator; rank: number }) {
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <Card className="p-4 border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
            rank === 1 && "bg-yellow-500/20 text-yellow-500",
            rank === 2 && "bg-slate-400/20 text-slate-400",
            rank === 3 && "bg-amber-600/20 text-amber-600",
            rank > 3 && "bg-muted text-muted-foreground",
          )}
        >
          {rank}
        </div>

        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
            <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {creator.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Verified size={12} className="text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{creator.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground">@{creator.username}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">{formatNumber(creator.followers)} followers</span>
            {creator.growth && <span className="text-xs text-green-500 font-medium">{creator.growth}</span>}
          </div>
        </div>

        {/* Follow button */}
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          className={cn("flex-shrink-0 transition-all", !isFollowing && "bg-gradient-to-r from-primary to-primary/80")}
          onClick={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    </Card>
  )
}

// Realm Card - Community style with icon
function RealmCard({ realm }: { realm: TrendingRealm }) {
  const [isJoined, setIsJoined] = useState(false)

  return (
    <Card className="p-4 border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
          {realm.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{realm.name}</h3>
            <span className="text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              {realm.trend}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{realm.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{formatNumber(realm.members)} members</span>
            </div>
            <Button
              size="sm"
              variant={isJoined ? "outline" : "secondary"}
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                setIsJoined(!isJoined)
              }}
            >
              {isJoined ? "Joined" : "Join"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function ExplorePage() {
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [trendingCreators, setTrendingCreators] = useState<TrendingCreator[]>([])
  const [trendingRealms, setTrendingRealms] = useState<TrendingRealm[]>([])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const [postsRes, topicsRes, creatorsRes, realmsRes] = await Promise.all([
        fetch("/api/trending?type=posts&limit=8", { headers }),
        fetch("/api/trending?type=topics&limit=6", { headers }),
        fetch("/api/users/suggested?limit=6", { headers }),
        fetch("/api/trending?type=realms&limit=6", { headers }),
      ])

      const [postsData, topicsData, creatorsData, realmsData] = await Promise.all([
        postsRes.json(),
        topicsRes.json(),
        creatorsRes.json(),
        realmsRes.json(),
      ])

      if (postsData.success) {
        setTrendingPosts(
          postsData.data.map((p: Record<string, unknown>, i: number) => ({
            id: p.id,
            title: (p.content as string)?.substring(0, 50) || "Untitled",
            image: (p.mediaUrls as string[])?.[0] || "/placeholder.svg",
            author: (p.author as Record<string, unknown>)?.name || "Unknown",
            authorAvatar: (p.author as Record<string, unknown>)?.avatar || null,
            likes: p.likes || 0,
            comments: p.comments || 0,
            tags: p.tags || [],
            trending: i + 1,
          }))
        )
      }

      if (topicsData.success) {
        setTrendingTopics(topicsData.data)
      }

      if (creatorsData.success) {
        setTrendingCreators(
          creatorsData.data.map((c: Record<string, unknown>) => ({
            id: c.id,
            name: c.name,
            username: c.username,
            avatar: c.avatar,
            followers: (c._count as Record<string, number>)?.followers || c.followers || 0,
            isVerified: c.isVerified || false,
            growth: "+5%",
          }))
        )
      }

      if (realmsData.success) {
        setTrendingRealms(realmsData.data)
      }
    } catch (error) {
      console.error("Failed to load explore data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Sparkles className="text-primary" />
                Explore
              </h1>
              <p className="text-muted-foreground">Discover trending content, creators, and communities</p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
                />
              </div>
              <Button variant="outline" size="icon" className="border-border/50 bg-transparent">
                <Filter size={18} />
              </Button>
              <div className="hidden md:flex border border-border/50 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 size={16} />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="bg-card/50 border border-border/50">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="creators">Creators</TabsTrigger>
              <TabsTrigger value="realms">Realms</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Featured Posts - Bento Grid */}
        {(activeTab === "all" || activeTab === "posts") && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={24} className="text-primary" />
                Trending Posts
              </h2>
              <Link href="/trending" className="text-primary hover:underline text-sm flex items-center gap-1">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {trendingPosts.slice(0, 4).map((post, index) => (
                <FeaturedPostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Topics */}
        {(activeTab === "all" || activeTab === "topics") && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Flame size={24} className="text-orange-500" />
                Hot Topics
              </h2>
              <Link href="/topics" className="text-primary hover:underline text-sm flex items-center gap-1">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingTopics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Creators */}
        {(activeTab === "all" || activeTab === "creators") && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users size={24} className="text-primary" />
                Rising Creators
              </h2>
              <Link href="/creators" className="text-primary hover:underline text-sm flex items-center gap-1">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingCreators.map((creator, index) => (
                <CreatorCard key={creator.id} creator={creator} rank={index + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Trending Realms */}
        {(activeTab === "all" || activeTab === "realms") && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles size={24} className="text-secondary-foreground" />
                Popular Communities
              </h2>
              <Link href="/realms" className="text-primary hover:underline text-sm flex items-center gap-1">
                View all <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingRealms.map((realm) => (
                <RealmCard key={realm.id} realm={realm} />
              ))}
            </div>
          </section>
        )}

        {/* More Posts Grid */}
        {(activeTab === "all" || activeTab === "posts") && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">More to Explore</h2>
            </div>

            <div
              className={cn(
                "grid gap-4",
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1",
              )}
            >
              {[...trendingPosts, ...trendingPosts].slice(0, 8).map((post, index) => (
                <CompactPostCard key={`${post.id}-${index}`} post={{ ...post, trending: index + 5 }} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="border-border/50 bg-transparent">
                Load More
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
