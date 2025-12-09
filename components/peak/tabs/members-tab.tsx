"use client"

import { Search, UserPlus, MessageCircle } from "lucide-react"
import { useState } from "react"

const MEMBERS = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Moderator",
    avatar: "👩‍💼",
    badges: ["🏔️ Summit Climber", "✨ Trail Guide"],
    joinedDate: "8 months ago",
    posts: 342,
    online: true,
  },
  {
    id: 2,
    name: "Marcus Dev",
    role: "Core Contributor",
    avatar: "👨‍💻",
    badges: ["🌪️ Avalanche", "👑 Founder"],
    joinedDate: "1 year ago",
    posts: 1240,
    online: true,
  },
  {
    id: 3,
    name: "Alex Designer",
    role: "Community Lead",
    avatar: "🎨",
    badges: ["⭐ P!!E Star", "🎨 Artist"],
    joinedDate: "6 months ago",
    posts: 567,
    online: false,
  },
  {
    id: 4,
    name: "Jordan Tech",
    role: "Moderator",
    avatar: "👨‍🔬",
    badges: ["🚀 Innovator"],
    joinedDate: "10 months ago",
    posts: 423,
    online: true,
  },
]

export default function MembersTab() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border/50 focus:border-primary/50 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {MEMBERS.map((member) => (
          <div key={member.id} className="p-4 hover:bg-muted/30 transition-colors group">
            <div className="flex items-start gap-3 mb-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl flex-shrink-0">
                  {member.avatar}
                </div>
                {member.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{member.name}</h4>
                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full font-medium">
                    {member.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Joined {member.joinedDate}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  {member.badges.map((badge) => (
                    <span key={badge} className="text-xs px-2 py-1 bg-muted rounded-full">
                      {badge}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-2">{member.posts} posts</p>
              </div>

              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                <button className="p-2 hover:bg-muted rounded-lg transition-all" title="Message">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-all" title="Follow">
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
