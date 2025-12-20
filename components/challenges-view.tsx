"use client"

import { useState, useEffect } from "react"
import { Zap, Lock, CheckCircle2, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface Challenge {
  id: string
  title: string
  description: string | null
  type: string
  requirement: string
  targetValue: number
  xpReward: number
  progress: number
  maxProgress: number
  completed: boolean
  progressPercentage: number
  status: string
  badgeReward?: {
    id: string
    name: string
    icon: string
  }
}

export function ChallengesView() {
  const { token } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadChallenges()
  }, [token])

  const loadChallenges = async () => {
    setIsLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch("/api/challenges?status=active", { headers })
      const result = await response.json()

      if (result.success) {
        setChallenges(result.data)
      }
    } catch (error) {
      console.error("Failed to load challenges:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinChallenge = async (challengeId: string) => {
    if (!token) {
      alert("Please login to join challenges")
      return
    }

    try {
      const response = await fetch(`/api/challenges/${challengeId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        loadChallenges()
        alert("Successfully joined challenge!")
      } else {
        alert(result.error || "Failed to join challenge")
      }
    } catch (error) {
      console.error("Failed to join challenge:", error)
      alert("Failed to join challenge")
    }
  }

  const getDifficultyColor = (type: string) => {
    switch (type) {
      case "daily":
        return "bg-green-500/20 text-green-400"
      case "weekly":
        return "bg-yellow-500/20 text-yellow-400"
      case "monthly":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-muted text-muted-foreground"
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
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Zap size={24} className="text-accent" />
        Challenges
      </h2>
      <div className="space-y-3">
        {challenges.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No active challenges at the moment. Check back soon!</p>
          </Card>
        ) : (
          challenges.map((challenge) => (
            <Card
              key={challenge.id}
              className={`p-4 border border-border/50 glow-border ${challenge.status === "locked" ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                    <Badge className={getDifficultyColor(challenge.type)}>{challenge.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{challenge.description || challenge.requirement}</p>
                </div>
                {challenge.status === "locked" && <Lock size={20} className="text-muted-foreground" />}
                {challenge.completed ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : challenge.status === "active" ? (
                  <Zap size={20} className="text-accent" />
                ) : null}
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${challenge.progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {challenge.progress} / {challenge.maxProgress}
                </p>
              </div>

              {/* Reward & Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-accent">{challenge.xpReward} XP</span>
                  {challenge.badgeReward && (
                    <Badge variant="outline" className="text-xs">
                      {challenge.badgeReward.icon} {challenge.badgeReward.name}
                    </Badge>
                  )}
                </div>
                <Button 
                  size="sm" 
                  disabled={challenge.status === "locked" || challenge.completed} 
                  className="bg-primary hover:bg-primary/80"
                  onClick={() => handleJoinChallenge(challenge.id)}
                >
                  {challenge.completed ? "Completed" : challenge.status === "locked" ? "Locked" : "Join Challenge"}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
