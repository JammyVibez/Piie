"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, Crown, Zap, Loader2, Medal, TrendingUp, Users, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface LeaderboardUser {
  rank: number
  id: string
  name: string
  username: string
  avatar: string | null
  level: number
  xp: number
  influenceScore: number
  followers: number
  posts: number
  isCurrentUser: boolean
}

export function LeaderboardView() {
  const { token } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [leaderboardType, setLeaderboardType] = useState("influence")
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [leaderboardType, token])

  const loadLeaderboard = async () => {
    setIsLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/leaderboard?type=${leaderboardType}&limit=50`, { headers })
      const result = await response.json()

      if (result.success) {
        setLeaderboard(result.data.leaderboard)
        setCurrentUserRank(result.data.currentUserRank)
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  const getMetricIcon = () => {
    switch (leaderboardType) {
      case "xp": return <Zap size={16} className="text-yellow-400" />
      case "level": return <Star size={16} className="text-blue-400" />
      case "followers": return <Users size={16} className="text-green-400" />
      default: return <Trophy size={16} className="text-purple-400" />
    }
  }

  const getMetricValue = (user: LeaderboardUser) => {
    switch (leaderboardType) {
      case "xp": return user.xp
      case "level": return user.level
      case "followers": return user.followers
      default: return user.influenceScore
    }
  }

  const PodiumStep = ({ user, position }: { user: LeaderboardUser; position: 1 | 2 | 3 }) => {
    const isFirst = position === 1
    const isSecond = position === 2
    const isThird = position === 3

    return (
      <div className={cn(
        "flex flex-col items-center justify-end relative transition-all duration-500 hover:scale-105",
        isFirst ? "order-2 -mt-8 z-20" : isSecond ? "order-1 z-10" : "order-3 z-10"
      )}>
        <div className="relative mb-4 group cursor-pointer">
          <div className={cn(
            "absolute inset-0 rounded-full blur-xl opacity-50 transition-opacity duration-500",
            isFirst ? "bg-yellow-500/50" : isSecond ? "bg-gray-300/50" : "bg-orange-600/50"
          )} />
          <Avatar className={cn(
            "border-4 transition-all duration-300",
            isFirst ? "h-24 w-24 border-yellow-500 ring-4 ring-yellow-500/20" : 
            isSecond ? "h-20 w-20 border-gray-300 ring-4 ring-gray-300/20" : 
            "h-20 w-20 border-orange-600 ring-4 ring-orange-600/20"
          )}>
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className={cn(
            "absolute -top-4 -right-2 rounded-full p-1.5 shadow-lg flex items-center justify-center border-2",
            isFirst ? "bg-yellow-500 border-yellow-300 text-black" : 
            isSecond ? "bg-gray-300 border-gray-100 text-black" : 
            "bg-orange-600 border-orange-400 text-white"
          )}>
            <Crown size={isFirst ? 20 : 16} fill="currentColor" />
          </div>
        </div>

        <div className={cn(
          "w-full rounded-t-lg p-4 text-center backdrop-blur-md border-x border-t relative overflow-hidden",
          isFirst ? "h-48 bg-gradient-to-b from-yellow-500/20 to-transparent border-yellow-500/30" : 
          isSecond ? "h-40 bg-gradient-to-b from-gray-400/20 to-transparent border-gray-400/30" : 
          "h-32 bg-gradient-to-b from-orange-600/20 to-transparent border-orange-600/30"
        )}>
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          
          <div className="relative z-10">
            <h3 className="font-bold text-foreground truncate max-w-[120px] mx-auto">{user.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">@{user.username}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
              {getMetricIcon()}
              <span className="font-bold">{getMetricValue(user).toLocaleString()}</span>
            </div>
          </div>
          
          <div className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 text-6xl font-black opacity-10 select-none",
            isFirst ? "text-yellow-500" : isSecond ? "text-gray-400" : "text-orange-600"
          )}>
            {position}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-primary/20 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground animate-pulse">Summoning the champions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x">
          Hall of Fame
        </h2>
        <p className="text-muted-foreground">Top performers in the Fusion community</p>
      </div>

      <Tabs value={leaderboardType} onValueChange={setLeaderboardType} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-muted/50 p-1 border border-border/50 rounded-full">
            <TabsTrigger value="influence" className="rounded-full px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              <TrendingUp size={16} className="mr-2" /> Influence
            </TabsTrigger>
            <TabsTrigger value="xp" className="rounded-full px-6 data-[state=active]:bg-yellow-500 data-[state=active]:text-black transition-all">
              <Zap size={16} className="mr-2" /> XP
            </TabsTrigger>
            <TabsTrigger value="followers" className="rounded-full px-6 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all">
              <Users size={16} className="mr-2" /> Followers
            </TabsTrigger>
            <TabsTrigger value="level" className="rounded-full px-6 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all">
              <Star size={16} className="mr-2" /> Level
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Podium Section */}
        {topThree.length > 0 && (
          <div className="flex justify-center items-end gap-2 md:gap-4 mb-12 min-h-[300px] px-4">
            {topThree[1] && <PodiumStep user={topThree[1]} position={2} />}
            {topThree[0] && <PodiumStep user={topThree[0]} position={1} />}
            {topThree[2] && <PodiumStep user={topThree[2]} position={3} />}
          </div>
        )}

        {/* User Rank Card */}
        {currentUserRank && (
          <Card className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-transparent border-primary/20 backdrop-blur-sm sticky top-4 z-30 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/30">
                  <span className="text-xs text-primary font-medium">RANK</span>
                  <span className="text-lg font-bold text-primary">#{currentUserRank}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Your Position</p>
                  <p className="text-sm text-muted-foreground">Keep pushing to reach the top!</p>
                </div>
              </div>
              <TrendingUp className="text-primary opacity-50" size={24} />
            </div>
          </Card>
        )}

        {/* List Section */}
        <div className="space-y-3">
          {rest.map((user) => (
            <div
              key={user.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 hover:bg-muted/50 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:translate-x-1",
                user.isCurrentUser ? "ring-2 ring-primary bg-primary/5" : ""
              )}
            >
              <div className="flex items-center p-4 gap-4">
                <div className="flex-shrink-0 w-8 text-center font-bold text-muted-foreground">
                  #{user.rank}
                </div>
                
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {user.name}
                    </h3>
                    {user.level >= 10 && <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-yellow-500/50 text-yellow-500 bg-yellow-500/10">PRO</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">@{user.username} • Level {user.level}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end font-bold text-foreground">
                    {getMetricIcon()}
                    <span>{getMetricValue(user).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{leaderboardType}</p>
                </div>
              </div>
              
              {/* Hover highlight effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
            </div>
          ))}

          {rest.length === 0 && topThree.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No users found for this category.
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}

function Badge({ children, className, variant }: any) {
  return (
    <span className={cn("inline-flex items-center rounded-full border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </span>
  )
}
