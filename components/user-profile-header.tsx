"use client"

import type { User } from "./types"
import { RoleBadge } from "./role-badge"
import { Bell, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserProfileHeaderProps {
  user: User
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden">
          <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-foreground">{user.name}</h3>
            <RoleBadge role={user.role} size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">Level {user.level}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell size={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="hover:text-destructive">
          <LogOut size={20} />
        </Button>
      </div>
    </div>
  )
}
