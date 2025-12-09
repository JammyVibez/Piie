"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface StatusUser {
  user: {
    id: string
    name: string
    username: string
    avatar: string | null
    isOnline: boolean
  }
  statuses: {
    id: string
    content: string
    image: string | null
    createdAt: string
    views: number
    likes: number
  }[]
}

export function StatusCarousel() {
  const { user: currentUser, token } = useAuth()
  const [userStatuses, setUserStatuses] = useState<StatusUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const headers: HeadersInit = {}
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await fetch("/api/status", { headers })
        const data = await response.json()

        if (data.success) {
          setUserStatuses(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch statuses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatuses()
    const interval = setInterval(fetchStatuses, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [token])

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="w-16 h-20 rounded-lg bg-muted animate-pulse" />
            <div className="w-12 h-3 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {/* Create status button */}
      <Link href="/status/create" className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group">
        <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-primary to-secondary p-1 hover:shadow-lg transition-all">
          <div className="w-full h-full bg-card rounded-md flex items-center justify-center">
            <Plus size={24} className="text-primary group-hover:text-secondary transition-colors" />
          </div>
        </div>
        <span className="text-xs text-muted-foreground text-center">Your Story</span>
      </Link>

      {/* User stories */}
      {userStatuses.map(({ user, statuses }) => (
        <Link
          key={user.id}
          href={`/status/${user.id}`}
          className="flex-shrink-0 flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-primary/30 group-hover:border-primary/70 transition-all">
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <span className="text-xs text-muted-foreground text-center truncate w-16">{user.name.split(" ")[0]}</span>
        </Link>
      ))}
    </div>
  )
}
