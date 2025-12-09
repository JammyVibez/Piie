"use client"

import { useState, useEffect } from "react"
import { Users, Star, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"

interface Community {
  id: string
  name: string
  description: string
  members: number
  category: string
  trending: boolean
  icon: string
}

export function CommunitiesView() {
  const { token } = useAuth()
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchCommunities()
  }, [token])

  const fetchCommunities = async () => {
    try {
      setIsLoading(true)
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch("/api/communities?limit=6", { headers })
      const result = await response.json()

      if (result.success && result.data?.communities) {
        setCommunities(result.data.communities)
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async (communityId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setJoinedCommunities(prev => new Set([...prev, communityId]))
      }
    } catch (error) {
      console.error("Error joining community:", error)
    }
  }

  const getTierColor = (members: number) => {
    if (members > 1000) return "bg-cyan-500/20 text-cyan-400"
    if (members > 500) return "bg-yellow-500/20 text-yellow-400"
    if (members > 100) return "bg-gray-400/20 text-gray-300"
    return "bg-muted text-muted-foreground"
  }

  const getTierLabel = (members: number) => {
    if (members > 1000) return "platinum"
    if (members > 500) return "gold"
    if (members > 100) return "silver"
    return "bronze"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (communities.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users size={24} className="text-primary" />
          Explore Communities
        </h2>
        <div className="text-center py-12 text-muted-foreground">
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p>No communities yet. Be the first to create one!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Users size={24} className="text-primary" />
        Explore Communities
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {communities.map((community) => (
          <Card
            key={community.id}
            className="p-4 border border-border/50 glow-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <span>{community.icon}</span>
                  {community.name}
                </h3>
                {community.trending && (
                  <Badge className="mt-1 bg-orange-500/20 text-orange-400 flex items-center gap-1">
                    <Star size={12} /> Trending
                  </Badge>
                )}
              </div>
              <Badge className={getTierColor(community.members)}>
                {getTierLabel(community.members)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {community.description || "A community for like-minded individuals"}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {community.members.toLocaleString()} members
              </span>
              <Button 
                size="sm" 
                className={joinedCommunities.has(community.id) 
                  ? "bg-muted text-foreground" 
                  : "bg-primary hover:bg-primary/80"
                }
                onClick={() => handleJoin(community.id)}
                disabled={joinedCommunities.has(community.id)}
              >
                {joinedCommunities.has(community.id) ? "Joined" : "Join"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
