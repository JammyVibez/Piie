"use client"

import type { User, UserRole, WorkerRole } from "./types"
import { Zap, Award, Share2, Mail, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface UserProfileProps {
  user: User
  isCurrentUser?: boolean
  onProfileClick?: () => void
}

const userRoleConfig: Record<UserRole, { icon: string; color: string; description: string }> = {
  creator: { icon: "✨", color: "from-purple-500 to-pink-500", description: "Content Creator" },
  entertainer: { icon: "🎬", color: "from-red-500 to-orange-500", description: "Entertainer" },
  analyst: { icon: "📊", color: "from-blue-500 to-cyan-500", description: "Analyst" },
  educator: { icon: "🎓", color: "from-green-500 to-emerald-500", description: "Educator" },
  explorer: { icon: "🚀", color: "from-yellow-500 to-orange-500", description: "Explorer" },
}

const workerRoleConfig: Record<WorkerRole, { icon: string; color: string; description: string }> = {
  mod: { icon: "🛡️", color: "from-slate-500 to-gray-600", description: "Moderator" },
  admin: { icon: "👑", color: "from-red-600 to-pink-600", description: "Administrator" },
  support: { icon: "🤝", color: "from-indigo-500 to-purple-500", description: "Support Staff" },
  developer: { icon: "💻", color: "from-cyan-500 to-blue-500", description: "Developer" },
  contributor: { icon: "🤲", color: "from-teal-500 to-green-500", description: "Contributor" },
  helper: { icon: "🆘", color: "from-amber-500 to-orange-500", description: "Community Helper" },
}

export function UserProfile({ user, isCurrentUser = false, onProfileClick }: UserProfileProps) {
  const userRole = userRoleConfig[user.userRole]
  const workerRole = user.workerRole ? workerRoleConfig[user.workerRole] : null
  const [showIframe, setShowIframe] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Banner with gradient */}
      <div className="relative h-40 bg-gradient-to-r from-primary via-secondary to-accent rounded-t-xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          }}
        />
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-b-xl p-6 relative -mt-20">
        {/* Avatar with iframe modal and role badges */}
        <div className="flex justify-between items-start mb-6">
          <div className="relative z-10">
            <div
              className="w-40 h-40 rounded-2xl border-4 border-card bg-muted overflow-hidden cursor-pointer group relative shadow-xl"
              onClick={() => setShowIframe(!showIframe)}
            >
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <span className="text-white text-xs font-semibold">View Gallery</span>
              </div>
            </div>

            <div className="absolute -bottom-2 -right-2 flex gap-2">
              {workerRole && (
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-r ${workerRole.color} flex items-center justify-center text-2xl shadow-lg border-4 border-card hover:scale-110 transition-transform`}
                  title={`${workerRole.description}`}
                >
                  {workerRole.icon}
                </div>
              )}
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-r ${userRole.color} flex items-center justify-center text-2xl shadow-lg border-4 border-card hover:scale-110 transition-transform`}
                title={`${userRole.description}`}
              >
                {userRole.icon}
              </div>
            </div>
          </div>

          {isCurrentUser && (
            <Button className="gap-2 bg-primary hover:bg-primary/90 transition-colors">Edit Profile</Button>
          )}
        </div>

        {/* Iframe Modal Gallery */}
        {showIframe && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border p-6 max-w-2xl w-full max-h-96 overflow-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-foreground">{user.name}'s Gallery</h3>
                <button
                  onClick={() => setShowIframe(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
              <iframe
                src={`data:text/html,<html><head><style>body { background: linear-gradient(135deg, %231e1b4b 0%25, %23312e81 100%25); color: %23fff; padding: 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; border-radius: 8px; } .container { text-align: center; } h2 { font-size: 28px; margin-bottom: 10px; } .role { font-size: 16px; margin: 10px 0; } .stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 20px; } .stat { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(144, 39, 255, 0.3); } .stat-value { font-size: 24px; font-weight: bold; color: %23a78bfa; } .stat-label { font-size: 12px; margin-top: 5px; opacity: 0.8; }</style></head><body><div class='container'><h2>${user.name}</h2><div class='role'><strong>Role:</strong> ${userRole.description}</div>${user.workerRole ? `<div class='role'><strong>Worker Role:</strong> ${workerRole?.description}</div>` : ""}<div class='role'><strong>Realm:</strong> ${user.realm || "N/A"}</div><div class='stats'><div class='stat'><div class='stat-value'>Lvl ${user.level}</div><div class='stat-label'>Level</div></div><div class='stat'><div class='stat-value'>${user.influenceScore}</div><div class='stat-label'>Influence</div></div><div class='stat'><div class='stat-value'>${(user.xp / 1000).toFixed(1)}k</div><div class='stat-label'>XP</div></div></div></div></body></html>`}
                title="User Profile Gallery"
                className="w-full h-64 rounded border border-border/50"
              />
            </div>
          </div>
        )}

        {/* User Info and Roles */}
        <h2 className="text-3xl font-bold text-foreground mb-2">{user.name}</h2>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
            <span className="text-lg">{userRole.icon}</span>
            <span className="text-sm font-semibold text-primary">{userRole.description}</span>
          </div>

          {workerRole && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <span className="text-lg">{workerRole.icon}</span>
              <span className="text-sm font-semibold text-orange-400">{workerRole.description}</span>
            </div>
          )}

          <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-semibold">
            {workerRole ? "Worker + User" : "User"}
          </span>
        </div>

        {/* Stats with Followers/Following */}
        <div className="grid grid-cols-4 gap-2 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-accent font-bold text-lg mb-1">
              <Zap size={18} />
              {user.level}
            </div>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
          <div className="text-center border-r border-border/50">
            <div className="flex items-center justify-center gap-1 text-secondary font-bold text-lg mb-1">
              <Heart size={18} />
              {user.influenceScore}
            </div>
            <p className="text-xs text-muted-foreground">Influence</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary font-bold text-lg mb-1">
              <Users size={18} />
              {user.followers}
            </div>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-secondary font-bold text-lg mb-1">
              {user.following}
            </div>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Badges */}
        {user.badges.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2">
              <Award size={14} />
              BADGES & ACHIEVEMENTS
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/50 hover:bg-accent/30 transition-colors cursor-pointer hover:scale-105 transform"
                  title={badge.name}
                >
                  {badge.icon} {badge.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Realm */}
        {user.realm && (
          <div className="p-3 bg-secondary/20 border border-secondary/50 rounded-lg mb-4">
            <p className="text-xs text-muted-foreground mb-1">REALM</p>
            <p className="text-sm font-semibold text-secondary">{user.realm}</p>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <div className="p-3 bg-muted/20 border border-border/50 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        {!isCurrentUser && (
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex-1 gap-2 ${
                isFollowing ? "bg-muted hover:bg-muted/80 text-foreground" : "bg-primary hover:bg-primary/90"
              } transition-colors`}
            >
              <span>{isFollowing ? "Following" : "Follow"}</span>
            </Button>
            <Button
              onClick={() => (window.location.href = "/dm")}
              variant="outline"
              className="flex-1 bg-transparent hover:bg-muted/40 gap-2"
            >
              <Mail size={16} />
              Message
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent hover:bg-muted/40">
              <Share2 size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
