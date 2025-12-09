"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Flame,
  Clock,
  ChevronRight,
  Users,
  TrendingUp,
  Sparkles,
  Crown,
  Star,
  Target,
  Zap,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

interface Realm {
  id: string
  name: string
  icon: string
  members: number
  description: string
  tier: "bronze" | "silver" | "gold" | "platinum"
  trending?: boolean
}

interface Challenge {
  id: string
  title: string
  description: string
  xpReward: number
  difficulty: "easy" | "medium" | "hard" | "legendary"
  endsAt: Date
  progress?: number
  maxProgress?: number
  completed?: boolean
}

interface SuggestedCreator {
  id: string
  name: string
  username: string
  avatar: string | null
  followers: string | number
  isVerified?: boolean
  role?: string
}

interface TrendingTopic {
  id?: string
  name?: string
  hashtag?: string
  posts: number
  trend: string
  tag?: string
}

const fallbackRealms: Realm[] = [
  {
    id: "r1",
    name: "Code Realm",
    icon: "💻",
    members: 1234,
    description: "For developers and engineers",
    tier: "platinum",
    trending: true,
  },
  {
    id: "r2",
    name: "Creator's Hub",
    icon: "🎨",
    members: 856,
    description: "For content creators",
    tier: "gold",
  },
  {
    id: "r3",
    name: "Tech Explorers",
    icon: "🚀",
    members: 542,
    description: "For innovators",
    tier: "silver",
  },
]

export function RightSidebar() {
  const [hoveredRealm, setHoveredRealm] = useState<string | null>(null)
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [realms, setRealms] = useState<Realm[]>(fallbackRealms)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [suggestedCreators, setSuggestedCreators] = useState<SuggestedCreator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  const { token, isAuthenticated } = useAuth()

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }, [token])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      try {
        const [trendingRes, challengesRes, suggestedRes, realmsRes] = await Promise.all([
          fetch("/api/trending?type=topics&limit=3", { headers: getHeaders() }),
          fetch("/api/challenges", { headers: getHeaders() }),
          fetch("/api/users/suggested?limit=5", { headers: getHeaders() }),
          fetch("/api/trending?type=realms&limit=3", { headers: getHeaders() }),
        ])

        const [trendingData, challengesData, suggestedData, realmsData] = await Promise.all([
          trendingRes.ok ? trendingRes.json() : { success: false },
          challengesRes.ok ? challengesRes.json() : { success: false },
          suggestedRes.ok ? suggestedRes.json() : { success: false },
          realmsRes.ok ? realmsRes.json() : { success: false },
        ])

        if (trendingData.success && trendingData.data.length > 0) {
          setTrendingTopics(trendingData.data)
        } else {
          setTrendingTopics([
            { tag: "#NextJS15", posts: 12500, trend: "+32%" },
            { tag: "#ReactServer", posts: 8900, trend: "+28%" },
            { tag: "#TypeScript", posts: 15600, trend: "+15%" },
          ])
        }

        if (challengesData.success && challengesData.data.length > 0) {
          setChallenges(challengesData.data.slice(0, 3).map((c: Challenge & { endsAt: string }) => ({
            ...c,
            endsAt: new Date(c.endsAt),
          })))
        }

        if (suggestedData.success && suggestedData.data.length > 0) {
          setSuggestedCreators(suggestedData.data)
        }

        if (realmsData.success && realmsData.data.length > 0) {
          setRealms(realmsData.data.map((r: { id: string; name: string; members: number; description?: string }, i: number) => ({
            ...r,
            icon: ["💻", "🎨", "🚀", "🎮", "📚"][i % 5],
            tier: ["platinum", "gold", "silver", "bronze"][i % 4] as Realm["tier"],
            trending: i === 0,
          })))
        }
      } catch (error) {
        console.error("Failed to load sidebar data:", error)
        setTrendingTopics([
          { tag: "#NextJS15", posts: 12500, trend: "+32%" },
          { tag: "#ReactServer", posts: 8900, trend: "+28%" },
          { tag: "#TypeScript", posts: 15600, trend: "+15%" },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [getHeaders])

  const handleFollow = async (userId: string) => {
    if (!isAuthenticated || !token) return

    try {
      const response = await fetch("/api/users/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        setFollowingUsers((prev) => new Set(prev).add(userId))
      }
    } catch (error) {
      console.error("Failed to follow user:", error)
    }
  }

  const tierConfig = {
    bronze: {
      bg: "bg-amber-900/20",
      border: "border-amber-600/30",
      text: "text-amber-400",
      glow: "hover:shadow-amber-500/20",
    },
    silver: {
      bg: "bg-slate-600/20",
      border: "border-slate-500/30",
      text: "text-slate-300",
      glow: "hover:shadow-slate-400/20",
    },
    gold: {
      bg: "bg-yellow-600/20",
      border: "border-yellow-500/30",
      text: "text-yellow-400",
      glow: "hover:shadow-yellow-500/20",
    },
    platinum: {
      bg: "bg-cyan-600/20",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      glow: "hover:shadow-cyan-500/20",
    },
  }

  const difficultyConfig = {
    easy: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", icon: Star },
    medium: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", icon: Zap },
    hard: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: Target },
    legendary: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", icon: Crown },
  }

  const formatTimeRemaining = (date: Date) => {
    const diff = date.getTime() - Date.now()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days > 0) return `${days}d left`
    const hours = Math.floor(diff / (1000 * 60 * 60))
    return `${hours}h left`
  }

  return (
    <aside className="hidden xl:flex w-80 h-screen bg-card border-l border-border flex-col overflow-y-auto scrollbar-thin">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Trending
          </h3>
          <Link href="/trending" className="text-xs text-primary hover:underline">
            See all
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        ) : (
          <div className="space-y-3">
            {trendingTopics.map((topic, i) => (
              <Link
                key={topic.hashtag || topic.tag || i}
                href={`/explore?tag=${(topic.hashtag || topic.tag || "").replace("#", "")}`}
                className="group flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {topic.hashtag || topic.tag}
                  </p>
                  <p className="text-xs text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
                </div>
                <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                  <ArrowUpRight size={12} />
                  {topic.trend}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Trophy size={18} className="text-accent" />
            Realms
          </h3>
          <Link href="/communities" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {realms.map((realm) => {
            const config = tierConfig[realm.tier]
            const isHovered = hoveredRealm === realm.id

            return (
              <Link
                key={realm.id}
                href={`/communities/${realm.id}`}
                className={cn(
                  "block p-3 rounded-xl border transition-all duration-300 cursor-pointer",
                  config.bg,
                  config.border,
                  config.glow,
                  isHovered && "shadow-lg scale-[1.02]",
                )}
                onMouseEnter={() => setHoveredRealm(realm.id)}
                onMouseLeave={() => setHoveredRealm(null)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{realm.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm truncate">{realm.name}</h4>
                      {realm.trending && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users size={10} />
                      {realm.members.toLocaleString()} members
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={cn("text-muted-foreground transition-transform", isHovered && "translate-x-1")}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Clock size={18} className="text-secondary" />
            Challenges
          </h3>
          <Link href="/challenges" className="text-xs text-primary hover:underline">
            All challenges
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        ) : challenges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No active challenges</p>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => {
              const config = difficultyConfig[challenge.difficulty]
              const DifficultyIcon = config.icon
              const progressPercent =
                challenge.progress !== undefined && challenge.maxProgress
                  ? (challenge.progress / challenge.maxProgress) * 100
                  : 0

              return (
                <div
                  key={challenge.id}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer",
                    config.bg,
                    config.border,
                    challenge.completed && "opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DifficultyIcon size={14} className={config.text} />
                      <h4 className="font-semibold text-sm">{challenge.title}</h4>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {challenge.completed ? "Completed!" : formatTimeRemaining(challenge.endsAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{challenge.description}</p>

                  {challenge.progress !== undefined && challenge.maxProgress && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className={config.text}>
                          {challenge.progress}/{challenge.maxProgress}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            challenge.difficulty === "easy" && "bg-green-500",
                            challenge.difficulty === "medium" && "bg-yellow-500",
                            challenge.difficulty === "hard" && "bg-red-500",
                            challenge.difficulty === "legendary" && "bg-purple-500",
                          )}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent flex items-center gap-1">
                      <Flame size={12} />+{challenge.xpReward} XP
                    </span>
                    <span className={cn("text-[10px] font-medium capitalize", config.text)}>{challenge.difficulty}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Suggested
          </h3>
          <Link href="/explore?tab=creators" className="text-xs text-primary hover:underline">
            See more
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          </div>
        ) : suggestedCreators.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No suggestions available</p>
        ) : (
          <div className="space-y-3">
            {suggestedCreators.slice(0, 3).map((creator) => (
              <div
                key={creator.id}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <Link href={`/profile/${creator.id}`}>
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
                    <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${creator.id}`}>
                    <p className="text-sm font-semibold truncate flex items-center gap-1 group-hover:text-primary transition-colors">
                      {creator.name}
                      {creator.isVerified && (
                        <span className="text-primary">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </span>
                      )}
                    </p>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {typeof creator.followers === "number"
                      ? creator.followers.toLocaleString()
                      : creator.followers}{" "}
                    followers
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={followingUsers.has(creator.id) ? "secondary" : "outline"}
                  className={cn(
                    "h-8 text-xs rounded-full transition-colors",
                    followingUsers.has(creator.id)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary hover:text-primary-foreground bg-transparent",
                  )}
                  onClick={() => handleFollow(creator.id)}
                  disabled={followingUsers.has(creator.id)}
                >
                  {followingUsers.has(creator.id) ? "Following" : "Follow"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 mt-auto border-t border-border/50">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/help" className="hover:text-foreground transition-colors">
            Help
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-2">© 2025 P!!E! Social</p>
      </div>
    </aside>
  )
}
