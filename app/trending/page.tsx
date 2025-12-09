"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  Flame,
  Crown,
  Users,
  Clock,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronRight,
  Sparkles,
  Hash,
  Play,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Loader2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatNumber } from "@/lib/utils-format"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TrendingTopic {
  id: string
  name: string
  posts: number
  trend: string
  category: string
}

interface TrendingPost {
  id: string
  title: string
  author: string
  authorAvatar?: string
  likes: number
  comments: number
  image?: string
  tags?: string[]
}

interface TrendingCreator {
  id: string
  name: string
  avatar?: string
  followers: number
  isVerified: boolean
  growth?: string
}

interface TrendingRealm {
  id: string
  name: string
  icon: string
  members: number
  trend: string
}

function TrendIndicator({ trend }: { trend: string }) {
  const isUp = trend.includes("+") || trend.includes("↑")
  const isDown = trend.includes("-") || trend.includes("↓")

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-sm font-bold",
        isUp && "text-green-500",
        isDown && "text-red-500",
        !isUp && !isDown && "text-muted-foreground",
      )}
    >
      {isUp && <ArrowUp size={14} />}
      {isDown && <ArrowDown size={14} />}
      {!isUp && !isDown && <Minus size={14} />}
      {trend.replace(/[↑↓+-]/g, "")}
    </span>
  )
}

function TrendingPostCard({ post, rank }: { post: TrendingPost; rank: number }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  return (
    <Card className="overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={post.image || "/placeholder.svg"}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div
          className={cn(
            "absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm",
            rank === 1 && "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
            rank === 2 && "bg-gradient-to-r from-slate-400 to-slate-500 text-white",
            rank === 3 && "bg-gradient-to-r from-amber-600 to-amber-700 text-white",
            rank > 3 && "bg-primary/90 text-primary-foreground",
          )}
        >
          <Crown size={14} />#{rank}
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs">
          <Play size={12} fill="white" />
          2:34
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          {post.tags && (
            <div className="flex gap-2 mb-2">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border-2 border-white/30">
                <AvatarImage src={post.authorAvatar || "/placeholder.svg"} />
                <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-white/90 text-sm">{post.author}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye size={16} />
            {formatNumber(post.likes * 5)}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />
            {formatNumber(post.likes)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={16} />
            {formatNumber(post.comments)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsLiked(!isLiked)}>
            <Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsBookmarked(!isBookmarked)}>
            <Bookmark size={16} className={isBookmarked ? "fill-primary text-primary" : ""} />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <Share2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function TopicRow({ topic, rank }: { topic: TrendingTopic; rank: number }) {
  return (
    <Link
      href={`/topic/${topic.id}`}
      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
          rank <= 3 ? "bg-gradient-to-br from-primary to-secondary text-white" : "bg-muted text-muted-foreground",
        )}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Hash size={16} className="text-primary" />
          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {topic.name}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">{formatNumber(topic.posts)} posts</p>
      </div>
      <TrendIndicator trend={topic.trend} />
      <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  )
}

function CreatorRow({ creator, rank }: { creator: TrendingCreator; rank: number }) {
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
          rank === 1 && "bg-gradient-to-br from-yellow-500 to-orange-500 text-white",
          rank === 2 && "bg-gradient-to-br from-slate-400 to-slate-500 text-white",
          rank === 3 && "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
          rank > 3 && "bg-muted text-muted-foreground",
        )}
      >
        {rank === 1 && <Crown size={16} />}
        {rank !== 1 && rank}
      </div>
      <Link href={`/profile/${creator.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
          <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
          <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{creator.name}</h3>
            {creator.isVerified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{formatNumber(creator.followers)} followers</p>
        </div>
      </Link>
      <div className="text-right mr-2">
        <TrendIndicator trend={creator.growth || "+0%"} />
      </div>
      <Button
        size="sm"
        variant={isFollowing ? "outline" : "default"}
        className={cn("flex-shrink-0", !isFollowing && "bg-gradient-to-r from-primary to-secondary")}
        onClick={() => setIsFollowing(!isFollowing)}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  )
}

function RealmRow({ realm, rank }: { realm: TrendingRealm; rank: number }) {
  return (
    <Link
      href={`/realm/${realm.id}`}
      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all group"
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
          rank <= 3 ? "bg-gradient-to-br from-secondary to-accent text-white" : "bg-muted text-muted-foreground",
        )}
      >
        {rank}
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
        {realm.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{realm.name}</h3>
        <p className="text-sm text-muted-foreground">{formatNumber(realm.members)} members</p>
      </div>
      <TrendIndicator trend={realm.trend} />
      <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  )
}

export default function TrendingPage() {
  const [timeRange, setTimeRange] = useState("today")
  const [activeTab, setActiveTab] = useState("posts")
  const [isLoading, setIsLoading] = useState(true)
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [trendingCreators, setTrendingCreators] = useState<TrendingCreator[]>([])
  const [trendingRealms, setTrendingRealms] = useState<TrendingRealm[]>([])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [postsRes, topicsRes, creatorsRes, realmsRes] = await Promise.all([
          fetch("/api/trending?type=posts&limit=8"),
          fetch("/api/trending?type=topics&limit=10"),
          fetch("/api/trending?type=creators&limit=10"),
          fetch("/api/trending?type=realms&limit=10"),
        ])

        const [postsData, topicsData, creatorsData, realmsData] = await Promise.all([
          postsRes.json(),
          topicsRes.json(),
          creatorsRes.json(),
          realmsRes.json(),
        ])

        if (postsData.success) setTrendingPosts(postsData.data)
        if (topicsData.success) setTrendingTopics(topicsData.data)
        if (creatorsData.success) setTrendingCreators(creatorsData.data)
        if (realmsData.success) setTrendingRealms(realmsData.data)
      } catch (error) {
        console.error("Failed to load trending data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [timeRange])

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-background to-red-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Flame className="text-orange-500" />
                Trending Now
              </h1>
              <p className="text-muted-foreground">Discover what is hot across P!!E</p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40 bg-card/50 border-border/50">
                  <Clock size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="border-border/50 bg-transparent">
                <Filter size={18} />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="bg-card/50 border border-border/50">
              <TabsTrigger value="posts" className="gap-2">
                <TrendingUp size={16} />
                Posts
              </TabsTrigger>
              <TabsTrigger value="topics" className="gap-2">
                <Hash size={16} />
                Topics
              </TabsTrigger>
              <TabsTrigger value="creators" className="gap-2">
                <Users size={16} />
                Creators
              </TabsTrigger>
              <TabsTrigger value="realms" className="gap-2">
                <Sparkles size={16} />
                Realms
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="posts" className="mt-0 space-y-6">
              {trendingPosts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No trending posts yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trendingPosts.map((post, index) => (
                    <TrendingPostCard key={post.id} post={post} rank={index + 1} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="topics" className="mt-0 space-y-4">
              {trendingTopics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No trending topics yet</p>
              ) : (
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <TopicRow key={topic.id} topic={topic} rank={index + 1} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="creators" className="mt-0 space-y-4">
              {trendingCreators.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No trending creators yet</p>
              ) : (
                <div className="space-y-3">
                  {trendingCreators.map((creator, index) => (
                    <CreatorRow key={creator.id} creator={creator} rank={index + 1} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="realms" className="mt-0 space-y-4">
              {trendingRealms.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No trending realms yet</p>
              ) : (
                <div className="space-y-3">
                  {trendingRealms.map((realm, index) => (
                    <RealmRow key={realm.id} realm={realm} rank={index + 1} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
