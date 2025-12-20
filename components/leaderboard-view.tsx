"use client"

import { useState, useEffect } from "react"
import { Trophy, Crown, Zap, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

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

      const response = await fetch(`/api/leaderboard?type=${leaderboardType}&limit=20`, { headers })
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy size={24} className="text-accent" />
          Leaderboard
        </h2>

        <Tabs value={leaderboardType} onValueChange={setLeaderboardType} className="mb-6">
          <TabsList>
            <TabsTrigger value="influence">Influence</TabsTrigger>
            <TabsTrigger value="xp">XP</TabsTrigger>
            <TabsTrigger value="level">Level</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
          </TabsList>
        </Tabs>

        {currentUserRank && (
          <Card className="p-4 mb-4 bg-primary/10 border-primary/20">
            <p className="text-sm text-muted-foreground">
              Your rank: <span className="font-bold text-primary">#{currentUserRank}</span>
            </p>
          </Card>
        )}

        <div className="space-y-2">
          {leaderboard.map((user) => (
            <Card
              key={user.id}
              className={`p-4 border border-border/50 glow-border hover:bg-muted/30 transition-colors ${
                user.isCurrentUser ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary">
                  {user.rank <= 3 ? (
                    <Crown size={20} className="text-white" />
                  ) : (
                    <span className="font-bold text-white">#{user.rank}</span>
                  )}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-xs text-muted-foreground">@{user.username} • Level {user.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent flex items-center gap-1">
                    <Zap size={16} /> {leaderboardType === "xp" ? user.xp : leaderboardType === "level" ? user.level : leaderboardType === "followers" ? user.followers : user.influenceScore}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{leaderboardType}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
