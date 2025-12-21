"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, MessageCircle, Eye, X } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"

interface StatusData {
  id: string
  content: string
  image: string | null
  createdAt: string
  views: number
  likes: number
}

interface UserData {
  id: string
  name: string
  username: string
  avatar: string | null
}

export default function StatusPage({ params }: { params: { userId: string } }) {
  const { token } = useAuth()
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [statuses, setStatuses] = useState<StatusData[]>([])
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const headers: HeadersInit = {}
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await fetch(`/api/status?userId=${params.userId}`, { headers })
        const data = await response.json()

        if (data.success) {
          if (data.data && data.data.length > 0 && data.data[0].user && data.data[0].statuses) {
            setUser(data.data[0].user)
            setStatuses(data.data[0].statuses)
          } else {
            // Try to get user info even if no statuses
            const userResponse = await fetch(`/api/users/${params.userId}`, { headers })
            const userData = await userResponse.json()
            if (userData.success && userData.data) {
              setUser({
                id: userData.data.id,
                name: userData.data.name,
                username: userData.data.username,
                avatar: userData.data.avatar
              })
            }
            setStatuses([])
          }
        }
      } catch (error) {
        console.error("Failed to fetch statuses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatuses()
  }, [params.userId, token])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading status...</p>
        </div>
      </div>
    )
  }

  if (!statuses.length || !user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No statuses found</p>
          <Link href="/" className="text-primary hover:underline">
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  const currentStatus = statuses[currentStatusIndex]

  const handleNext = () => {
    if (currentStatusIndex < statuses.length - 1) {
      setCurrentStatusIndex(currentStatusIndex + 1)
      setLiked(false)
    }
  }

  const handlePrev = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1)
      setLiked(false)
    }
  }


  return (
    <div className="min-h-screen bg-background pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back button */}
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-secondary mb-6 transition-colors">
          <span>←</span> Back to Feed
        </Link>

        {/* Progress bars */}
        <div className="flex gap-1 mb-6">
          {statuses.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1 rounded-full transition-all ${
                idx < currentStatusIndex
                  ? "bg-white"
                  : idx === currentStatusIndex
                    ? "bg-primary animate-pulse"
                    : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Status content */}
        <div className="bg-card rounded-2xl overflow-hidden border border-border/50 mb-6">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-border/50">
            <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary"
              />
              <div>
                <p className="font-bold text-sm text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </Link>
            <Link href="/">
              <X size={20} className="text-muted-foreground hover:text-foreground transition-colors" />
            </Link>
          </div>

          {/* Content */}
          <div className="relative bg-gradient-to-b from-background to-background/50 min-h-96">
            {currentStatus.image && (
              <Image
                src={currentStatus.image || "/placeholder.svg"}
                alt="Status"
                width={400}
                height={400}
                className="w-full h-96 object-cover"
              />
            )}
            <div className="p-6 flex items-end min-h-96">
              <p className="text-lg text-white font-semibold">{currentStatus.content}</p>
            </div>
          </div>

          {/* Stats & Actions */}
          <div className="p-4 border-t border-border/50 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                  <Eye size={16} /> {currentStatus.views}
                </p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent">{currentStatus.likes}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <div>
                <p className="text-lg font-bold text-secondary">0</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
              <div>
                <p className="text-lg font-bold text-neon-gold">0</p>
                <p className="text-xs text-muted-foreground">Saves</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <Heart size={18} className={liked ? "fill-accent text-accent" : "text-muted-foreground"} />
                <span className="text-sm">{liked ? "Liked" : "Like"}</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors">
                <MessageCircle size={18} className="text-muted-foreground" />
                <span className="text-sm">Reply</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          {currentStatusIndex > 0 && (
            <button
              onClick={handlePrev}
              className="px-6 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              ← Previous
            </button>
          )}
          {currentStatusIndex < statuses.length - 1 && (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}