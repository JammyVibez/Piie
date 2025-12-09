"use client"

import { Home, MessageSquare, Calendar, Users, Settings } from "lucide-react"

interface MobileNavProps {
  joinedCommunities: string[]
  selectedCommunity: string
  onSelectCommunity: (id: string) => void
}

export default function MobileNav() {
  const navItems = [
    { id: "explore", label: "Explore", icon: Home },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "events", label: "Events", icon: Calendar },
    { id: "members", label: "Members", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="hidden max-sm:flex fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex w-full items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className="flex-1 flex flex-col items-center justify-center py-3 text-muted-foreground hover:text-primary transition-colors active:scale-95"
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
