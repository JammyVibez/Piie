"use client"

import { useState, useEffect, useCallback } from "react"
import { Crown, TrendingUp, Medal, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface LeaderboardUser {
  id: string
  name: string
  username: string
  avatar?: string | null
  level: number
  xp: number
  isVerified: boolean
}

export function Leaderboard() {
  const { token } = useAuth()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch("/api/leaderboard?limit=10", { headers })
      const result = await response.json()

      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadLeaderboard()
  }, [loadLeaderboard])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-500" size={20} />
    if (rank === 2) return <Medal className="text-slate-400" size={20} />
    if (rank === 3) return <Medal className="text-amber-600" size={20} />
    return <span className="text-muted-foreground font-bold w-5 text-center">{rank}</span>
  }

  if (isLoading) {
    return (
      <Card className="p-6 border border-border/50">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          XP Leaderboard
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border border-border/50">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-primary" />
        XP Leaderboard
      </h3>
      <div className="space-y-3">
        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No users yet</p>
        ) : (
          users.map((user, index) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-muted/50
                ${index === 0 ? "bg-yellow-500/10 border border-yellow-500/20" : ""}
                ${index === 1 ? "bg-slate-500/10 border border-slate-500/20" : ""}
                ${index === 2 ? "bg-amber-500/10 border border-amber-500/20" : ""}
              `}
            >
              <div className="w-6 flex justify-center">{getRankIcon(index + 1)}</div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{user.xp}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  )
}
