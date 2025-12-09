"use client"

import { useState, useEffect } from "react"
import { PermissionGate } from "@/components/permission-gate"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  FileText, 
  Shield, 
  Trophy, 
  Plus, 
  Loader2,
  Zap,
  MessageSquare,
  Heart,
  Home,
  Radio
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AdminStats {
  users: { total: number; online: number; banned: number }
  content: { posts: number; comments: number; likes: number }
  communities: { total: number }
  rooms: { active: number }
  moderation: { activeReports: number; resolvedReports: number; dismissedReports: number }
}

interface Challenge {
  id: string
  name: string
  description: string
  icon: string
  rarity: string
  participants: number
  createdAt: string
}

export default function AdminPage() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateChallenge, setShowCreateChallenge] = useState(false)
  const [newChallenge, setNewChallenge] = useState({ name: "", description: "", icon: "🏆", rarity: "common", xpReward: 100 })
  const [xpGrant, setXpGrant] = useState({ username: "", amount: 100, reason: "" })

  const currentUserRole = user?.workerRole || ""

  useEffect(() => {
    if (token) {
      fetchStats()
      fetchChallenges()
    }
  }, [token])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChallenges = async () => {
    try {
      const response = await fetch("/api/admin/challenges")
      const result = await response.json()
      if (result.success) {
        setChallenges(result.data)
      }
    } catch (error) {
      console.error("Error fetching challenges:", error)
    }
  }

  const handleCreateChallenge = async () => {
    try {
      const response = await fetch("/api/admin/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newChallenge),
      })
      const result = await response.json()
      if (result.success) {
        setChallenges([result.data, ...challenges])
        setShowCreateChallenge(false)
        setNewChallenge({ name: "", description: "", icon: "🏆", rarity: "common", xpReward: 100 })
      }
    } catch (error) {
      console.error("Error creating challenge:", error)
    }
  }

  const handleGrantXp = async () => {
    try {
      const userResponse = await fetch(`/api/users/search?q=${xpGrant.username}`)
      const userResult = await userResponse.json()
      if (!userResult.success || !userResult.data.length) {
        alert("User not found")
        return
      }

      const response = await fetch("/api/admin/users/xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userResult.data[0].id,
          xpAmount: xpGrant.amount,
          reason: xpGrant.reason,
        }),
      })
      const result = await response.json()
      if (result.success) {
        alert(`Successfully granted ${xpGrant.amount} XP to ${xpGrant.username}`)
        setXpGrant({ username: "", amount: 100, reason: "" })
      }
    } catch (error) {
      console.error("Error granting XP:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Admin Dashboard</h1>

        <PermissionGate
          userRole={currentUserRole}
          requiredPermissions={["admin", "mod"]}
          fallback={
            <Card className="p-6 border-destructive/50 bg-destructive/10">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle size={24} />
                <p className="font-semibold">Access Denied</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">You don't have permission to access this area.</p>
            </Card>
          }
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stats?.users.total || 0}</div>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Radio className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stats?.users.online || 0}</div>
                      <p className="text-xs text-muted-foreground">Online Now</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stats?.content.posts || 0}</div>
                      <p className="text-xs text-muted-foreground">Total Posts</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Home className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{stats?.communities.total || 0}</div>
                      <p className="text-xs text-muted-foreground">Communities</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Comments</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stats?.content.comments || 0}</div>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Likes</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stats?.content.likes || 0}</div>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Radio className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active Rooms</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stats?.rooms.active || 0}</div>
                </Card>
              </div>

              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Shield className="text-primary" size={24} />
                  Moderation Stats
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{stats?.moderation.activeReports || 0}</div>
                    <p className="text-sm text-muted-foreground">Active Reports</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-500">{stats?.moderation.resolvedReports || 0}</div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-500">{stats?.users.banned || 0}</div>
                    <p className="text-sm text-muted-foreground">Users Banned</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Trophy className="text-yellow-500" size={24} />
                    Challenges
                  </h2>
                  <Button onClick={() => setShowCreateChallenge(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                  </Button>
                </div>

                {showCreateChallenge && (
                  <div className="mb-6 p-4 border border-border rounded-lg space-y-4">
                    <Input
                      placeholder="Challenge name"
                      value={newChallenge.name}
                      onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
                    />
                    <Input
                      placeholder="Description"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                    />
                    <div className="flex gap-4">
                      <Input
                        placeholder="Icon (emoji)"
                        value={newChallenge.icon}
                        onChange={(e) => setNewChallenge({ ...newChallenge, icon: e.target.value })}
                        className="w-24"
                      />
                      <select
                        value={newChallenge.rarity}
                        onChange={(e) => setNewChallenge({ ...newChallenge, rarity: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-md border border-border bg-background"
                      >
                        <option value="common">Common</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="XP Reward"
                        value={newChallenge.xpReward}
                        onChange={(e) => setNewChallenge({ ...newChallenge, xpReward: parseInt(e.target.value) })}
                        className="w-32"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateChallenge}>Create</Button>
                      <Button variant="outline" onClick={() => setShowCreateChallenge(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {challenges.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No challenges yet</p>
                  ) : (
                    challenges.map((challenge) => (
                      <div key={challenge.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{challenge.icon}</span>
                          <div>
                            <p className="font-semibold">{challenge.name}</p>
                            <p className="text-xs text-muted-foreground">{challenge.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded ${
                            challenge.rarity === "legendary" ? "bg-yellow-500/20 text-yellow-500" :
                            challenge.rarity === "epic" ? "bg-purple-500/20 text-purple-500" :
                            challenge.rarity === "rare" ? "bg-blue-500/20 text-blue-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {challenge.rarity}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1">{challenge.participants} participants</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                  <Zap className="text-yellow-500" size={24} />
                  Grant XP
                </h2>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">Username</label>
                    <Input
                      placeholder="Enter username"
                      value={xpGrant.username}
                      onChange={(e) => setXpGrant({ ...xpGrant, username: e.target.value })}
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-sm text-muted-foreground mb-1 block">XP Amount</label>
                    <Input
                      type="number"
                      value={xpGrant.amount}
                      onChange={(e) => setXpGrant({ ...xpGrant, amount: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-1 block">Reason</label>
                    <Input
                      placeholder="Optional reason"
                      value={xpGrant.reason}
                      onChange={(e) => setXpGrant({ ...xpGrant, reason: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleGrantXp}>Grant XP</Button>
                </div>
              </Card>
            </div>
          )}
        </PermissionGate>
      </div>
    </div>
  )
}
