"use client"

import { Trophy, Crown, Zap } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function LeaderboardView() {
  const topUsers = [
    { rank: 1, name: "Sarah Wolf", influence: 2850, level: 45, avatar: "/diverse-group-avatars.png" },
    { rank: 2, name: "Alex Chen", influence: 2640, level: 42, avatar: "/diverse-group-avatars.png" },
    { rank: 3, name: "Marcus Echo", influence: 2420, level: 39, avatar: "/diverse-group-avatars.png" },
    { rank: 4, name: "Luna Sky", influence: 2180, level: 36, avatar: "/diverse-group-avatars.png" },
    { rank: 5, name: "Jordan Park", influence: 1950, level: 33, avatar: "/diverse-group-avatars.png" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy size={24} className="text-accent" />
          Top Influencers
        </h2>
        <div className="space-y-2">
          {topUsers.map((user) => (
            <Card
              key={user.rank}
              className="p-4 border border-border/50 glow-border hover:bg-muted/30 transition-colors"
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
                  <p className="text-xs text-muted-foreground">Level {user.level}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent flex items-center gap-1">
                    <Zap size={16} /> {user.influence}
                  </p>
                  <p className="text-xs text-muted-foreground">Influence</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
