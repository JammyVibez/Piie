"use client"

import { useState } from "react"
import { Zap, Users, Calendar, ChevronDown, Mic } from "lucide-react"

interface RightSidebarProps {
  mood: string
  selectedCommunity: string
}

const LIVE_ACTIVITIES = [
  { id: 1, type: "join", user: "Emma Wilson", action: "joined", time: "2m ago", icon: "👋" },
  { id: 2, type: "post", user: "James Brown", action: "posted", time: "4m ago", icon: "✍️" },
  { id: 3, type: "voice", user: "Sarah Chen", action: "started audio room", time: "6m ago", icon: "🎙️" },
  { id: 4, type: "badge", user: "Marcus Dev", action: "earned Summit Climber", time: "8m ago", icon: "🏔️" },
  { id: 5, type: "event", user: "Design Team", action: "started Q&A", time: "10m ago", icon: "📅" },
]

const FEATURED_MEMBERS = [
  { id: 1, name: "Sarah Chen", role: "Moderator", avatar: "👩‍💼", badge: "🏔️ Summit" },
  { id: 2, name: "Marcus Dev", role: "Contributor", avatar: "👨‍💻", badge: "✨ Guide" },
  { id: 3, name: "Alex Creative", role: "Lead", avatar: "🎨", badge: "⭐ Star" },
]

const UPCOMING_EVENTS = [
  { id: 1, name: "Web Dev Stream", time: "Today 4:00 PM", icon: "🎬" },
  { id: 2, name: "Design Challenge", time: "Tomorrow 10:00 AM", icon: "🎨" },
  { id: 3, name: "Q&A Session", time: "Dec 15, 6:00 PM", icon: "🎤" },
]

export default function RightSidebar({ mood, selectedCommunity }: RightSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("activity")

  return (
    /* Removed max-lg:hidden to make sidebar visible in mobile drawer, removed w-80 constraints */
    <div className="w-full border-l border-border bg-card flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-lg">Community Hub</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Live Activity */}
        <div className="border-b border-border">
          <button
            onClick={() => setExpandedSection(expandedSection === "activity" ? null : "activity")}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Live Activity
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSection === "activity" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "activity" && (
            <div className="px-4 pb-4 space-y-3">
              {LIVE_ACTIVITIES.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all"
                >
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Members */}
        <div className="border-b border-border">
          <button
            onClick={() => setExpandedSection(expandedSection === "members" ? null : "members")}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Featured Members
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSection === "members" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "members" && (
            <div className="px-4 pb-4 space-y-3">
              {FEATURED_MEMBERS.map((member) => (
                <div key={member.id} className="p-3 rounded-lg hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/15 text-primary rounded w-fit">{member.badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-border">
          <button
            onClick={() => setExpandedSection(expandedSection === "events" ? null : "events")}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Upcoming Events
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expandedSection === "events" ? "rotate-180" : ""}`}
            />
          </button>

          {expandedSection === "events" && (
            <div className="px-4 pb-4 space-y-2">
              {UPCOMING_EVENTS.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg hover:bg-muted/50 transition-all flex items-start gap-2 cursor-pointer"
                >
                  <span className="text-lg">{event.icon}</span>
                  <div>
                    <p className="text-xs font-semibold">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audio Rooms Quick Access */}
        <div className="border-b border-border px-4 py-3">
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all text-sm font-semibold">
            <Mic className="w-4 h-4" />
            Join Audio Room
          </button>
        </div>
      </div>
    </div>
  )
}
