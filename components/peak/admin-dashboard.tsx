"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  MessageSquare,
  AlertCircle,
  Settings,
  Ban,
  CheckCircle,
  BarChart3,
  Users,
  Calendar,
  Zap,
  Loader2,
} from "lucide-react"
import CommunitySettings from "./community-settings"
import BadgesSystem from "./badges-system"

interface AdminDashboardProps {
  communityId: string
  isAdmin: boolean
}

interface ModerationAction {
  id: string
  type: "warning" | "mute" | "ban" | "remove-post"
  user: string
  reason: string
  date: string
  status: "active" | "resolved"
}

export default function AdminDashboard({ communityId, isAdmin }: AdminDashboardProps) {
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([])
  const [selectedAction, setSelectedAction] = useState<ModerationAction | null>(null)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({ members: 0, posts: 0, activeToday: 0 })

  useEffect(() => {
    const fetchModerationData = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
        if (!token) return

        const response = await fetch(`/api/communities/${communityId}/moderation`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await response.json()
        
        if (result.success) {
          setModerationActions(result.data.actions || [])
          setStats(result.data.stats || { members: 0, posts: 0, activeToday: 0 })
        }
      } catch (error) {
        console.error("Failed to fetch moderation data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isAdmin && communityId) {
      fetchModerationData()
    } else {
      setIsLoading(false)
    }
  }, [communityId, isAdmin])

  const handleBanUser = async (userId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) return

    try {
      const response = await fetch(`/api/communities/${communityId}/moderation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "ban",
          targetUserId: userId,
          reason: banReason,
        }),
      })

      const result = await response.json()
      if (result.success) {
        const newAction: ModerationAction = {
          id: result.data.id,
          type: "ban",
          user: userId,
          reason: banReason,
          date: "now",
          status: "active",
        }
        setModerationActions([newAction, ...moderationActions])
        setShowBanDialog(false)
        setBanReason("")
      }
    } catch (error) {
      console.error("Failed to ban user:", error)
    }
  }

  const handleResolveAction = async (actionId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!token) return

    try {
      const response = await fetch(`/api/communities/${communityId}/moderation/${actionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "resolved" }),
      })

      const result = await response.json()
      if (result.success) {
        setModerationActions(
          moderationActions.map((action) => 
            action.id === actionId ? { ...action, status: "resolved" } : action
          ),
        )
      }
    } catch (error) {
      console.error("Failed to resolve action:", error)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Only community admins can access this dashboard</p>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "members", label: "Members", icon: Users },
    { id: "badges", label: "Badges", icon: Zap },
    { id: "events", label: "Events", icon: Calendar },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Community Admin</h1>
            <p className="text-sm text-muted-foreground">Manage your community</p>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-muted rounded-lg transition-all">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Active Warnings</p>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold">
                {moderationActions.filter((a) => a.type === "warning" && a.status === "active").length}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Muted Users</p>
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">
                {moderationActions.filter((a) => a.type === "mute" && a.status === "active").length}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Banned Users</p>
                <Ban className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold">
                {moderationActions.filter((a) => a.type === "ban" && a.status === "active").length}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Removed Posts</p>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold">
                {moderationActions.filter((a) => a.type === "remove-post").length}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4">Community Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{stats.members}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-secondary-foreground">{stats.posts}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{stats.activeToday}</p>
                <p className="text-sm text-muted-foreground">Active Today</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "moderation" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Moderation Actions</h3>
          {moderationActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No moderation actions yet</p>
            </div>
          ) : (
            moderationActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-4 rounded-lg bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  {action.type === "warning" && <AlertCircle className="w-5 h-5 text-yellow-500" />}
                  {action.type === "mute" && <MessageSquare className="w-5 h-5 text-blue-500" />}
                  {action.type === "ban" && <Ban className="w-5 h-5 text-red-500" />}
                  {action.type === "remove-post" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  <div>
                    <p className="font-semibold">{action.user}</p>
                    <p className="text-sm text-muted-foreground">{action.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{action.date}</span>
                  {action.status === "active" ? (
                    <button
                      onClick={() => handleResolveAction(action.id)}
                      className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-full"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="px-3 py-1 text-xs bg-green-500/20 text-green-500 rounded-full">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Member management coming soon</p>
        </div>
      )}

      {activeTab === "badges" && <BadgesSystem communityId={communityId} />}

      {activeTab === "events" && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Events management coming soon</p>
        </div>
      )}

      {showSettings && (
        <CommunitySettings communityId={communityId} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
