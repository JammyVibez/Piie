"use client"

import { Zap, Lock, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function ChallengesView() {
  const challenges = [
    {
      id: "1",
      title: "Create 5 Posts",
      description: "Share 5 quality posts this week",
      reward: 500,
      difficulty: "Easy",
      progress: 3,
      max: 5,
      status: "active",
    },
    {
      id: "2",
      title: "Gain 100 Likes",
      description: "Get 100 likes across your posts",
      reward: 1000,
      difficulty: "Medium",
      progress: 67,
      max: 100,
      status: "active",
    },
    {
      id: "3",
      title: "Community Helper",
      description: "Help 10 community members",
      reward: 1500,
      difficulty: "Hard",
      progress: 0,
      max: 10,
      status: "locked",
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400"
      case "Hard":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Zap size={24} className="text-accent" />
        Weekly Challenges
      </h2>
      <div className="space-y-3">
        {challenges.map((challenge) => (
          <Card
            key={challenge.id}
            className={`p-4 border border-border/50 glow-border ${challenge.status === "locked" ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
              {challenge.status === "locked" && <Lock size={20} className="text-muted-foreground" />}
              {challenge.status === "active" && <CheckCircle2 size={20} className="text-accent" />}
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${(challenge.progress / challenge.max) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {challenge.progress} / {challenge.max}
              </p>
            </div>

            {/* Reward & Button */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-accent">{challenge.reward} XP</span>
              <Button size="sm" disabled={challenge.status === "locked"} className="bg-primary hover:bg-primary/80">
                {challenge.status === "locked" ? "Locked" : "Join Challenge"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
