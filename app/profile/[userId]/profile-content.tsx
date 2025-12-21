"use client"
import React, { useState, useCallback, useEffect, useRef } from "react"
import { PostCard } from "@/components/post-card"
import { FusionPostCard } from "@/components/fusion-post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname } from "next/navigation"
import { Share, MessageCircle, MapPin, Calendar, Award, Loader2, Palette, Snowflake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import type { FusionPost, FusionLayer } from "@/lib/types"
import { realtimeManager } from "@/lib/realtime/subscriptions"

interface ProfileUser {
  id: string
  name: string
  username: string
  avatar?: string | null
  banner?: string | null
  bio?: string | null
  level: number
  xp: number
  isVerified: boolean
  followers: number
  following: number
  postsCount: number
  createdAt: Date
  location?: string | null
  userRole?: string | null
  workerRole?: string | null
  realm?: string | null
}

interface ProfilePost {
  id: string
  content: string
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
    isVerified: boolean
  }
  createdAt: Date
  timestamp: Date
  likes: number
  comments: number
  shares: number
  views: number
  postType: string
  mediaUrls: string[]
}

interface ProfileFusionPost {
  id: string
  ownerId: string
  owner: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  title: string
  seedContent: string
  seedMediaUrl?: string | null
  seedType: string
  layers: FusionLayer[]
  privacy: string
  currentState: string
  viewMode: string
  contributorCount: number
  totalLayers: number
  forkCount: number
  createdAt: Date
  updatedAt: Date
  likes: number
  comments: any[]
  contributionSettings: {
    allowedContributors: string
    allowedLayerTypes: string[]
    moderationMode: string
  }
  contributors: any[]
}

interface ProfileContentProps {
  user: ProfileUser
  userPosts: ProfilePost[]
  fusionPosts: ProfileFusionPost[]
  userId: string
}

// Theme types
type Theme = "default" | "dark" | "neon" | "ocean" | "sunset" | "forest"

const themes: Record<Theme, { bg: string; primary: string; secondary: string; accent: string; primaryColor: string; secondaryColor: string; accentColor: string }> = {
  default: { bg: "bg-background", primary: "from-primary", secondary: "to-secondary", accent: "via-accent", primaryColor: "hsl(var(--primary))", secondaryColor: "hsl(var(--secondary))", accentColor: "hsl(var(--accent))" },
  dark: { bg: "bg-gray-900", primary: "from-gray-800", secondary: "to-black", accent: "via-gray-700", primaryColor: "#1f2937", secondaryColor: "#000000", accentColor: "#374151" },
  neon: { bg: "bg-black", primary: "from-cyan-500", secondary: "to-purple-500", accent: "via-pink-500", primaryColor: "#06b6d4", secondaryColor: "#a855f7", accentColor: "#ec4899" },
  ocean: { bg: "bg-slate-900", primary: "from-blue-500", secondary: "to-teal-500", accent: "via-cyan-500", primaryColor: "#3b82f6", secondaryColor: "#14b8a6", accentColor: "#06b6d4" },
  sunset: { bg: "bg-orange-50", primary: "from-orange-500", secondary: "to-pink-500", accent: "via-red-500", primaryColor: "#f97316", secondaryColor: "#ec4899", accentColor: "#ef4444" },
  forest: { bg: "bg-green-950", primary: "from-green-600", secondary: "to-emerald-500", accent: "via-teal-500", primaryColor: "#16a34a", secondaryColor: "#10b981", accentColor: "#14b8a6" },
}

// Falling Snowballs Component
function FallingSnowballs({ enabled }: { enabled: boolean }) {
  const [snowballs, setSnowballs] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([])

  useEffect(() => {
    if (!enabled) {
      setSnowballs([])
      return
    }

    const generateSnowballs = () => {
      const newSnowballs = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 5,
        size: 8 + Math.random() * 12,
      }))
      setSnowballs(newSnowballs)
    }

    generateSnowballs()
    const interval = setInterval(generateSnowballs, 10000)
    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {snowballs.map((snowball) => (
        <div
          key={snowball.id}
          className="absolute rounded-full bg-white/80 shadow-lg animate-fall"
          style={{
            left: `${snowball.left}%`,
            width: `${snowball.size}px`,
            height: `${snowball.size}px`,
            animationDelay: `${snowball.delay}s`,
            animationDuration: `${snowball.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

// Check if media is video/GIF
function isVideoOrGif(url: string | null | undefined): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.gif') || lower.includes('video')
}

export function ProfileContent({ user, userPosts, fusionPosts, userId }: ProfileContentProps) {
  const pathname = usePathname()
  const { user: currentUser, token, isAuthenticated } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [localFollowers, setLocalFollowers] = useState(user.followers)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState<any[]>([])
  const [theme, setTheme] = useState<Theme>("default")
  const [snowEnabled, setSnowEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const profileRef = useRef<HTMLDivElement>(null)
  const avatarRef = useRef<HTMLDivElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)

  const isCurrentUser = currentUser?.id === userId
  const currentTheme = themes[theme]

  // 3D Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!profileRef.current) return
      const scrolled = window.scrollY
      const parallaxSpeed = 0.5

      if (bannerRef.current) {
        bannerRef.current.style.transform = `translateY(${scrolled * parallaxSpeed}px)`
      }

      if (avatarRef.current) {
        const rotation = scrolled * 0.1
        avatarRef.current.style.transform = `rotateY(${rotation}deg) rotateX(${rotation * 0.5}deg)`
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 3D mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current) return
      const rect = avatarRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      const rotateX = (y / rect.height) * 20
      const rotateY = (x / rect.width) * -20

      avatarRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
    }

    const handleMouseLeave = () => {
      if (avatarRef.current) {
        avatarRef.current.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)"
      }
    }

    if (avatarRef.current) {
      avatarRef.current.addEventListener("mousemove", handleMouseMove)
      avatarRef.current.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (avatarRef.current) {
        avatarRef.current.removeEventListener("mousemove", handleMouseMove)
        avatarRef.current.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  // Load purchased items
  useEffect(() => {
    const loadPurchasedItems = async () => {
      if (!token || userId !== currentUser?.id) return

      try {
        const response = await fetch('/api/shop/items', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const result = await response.json()
        if (result.success && result.data.purchasedItems) {
          const shopItems = [
            { id: "1", name: "XP Booster", icon: "⚡", rarity: "rare" },
            { id: "2", name: "Premium Badge", icon: "👑", rarity: "epic" },
            { id: "3", name: "Custom Theme", icon: "🎨", rarity: "rare" },
            { id: "4", name: "Profile Frame", icon: "✨", rarity: "legendary" },
            { id: "5", name: "Story Boost", icon: "🚀", rarity: "common" },
            { id: "6", name: "Verified Badge", icon: "✓", rarity: "legendary" },
          ]
          const purchased = shopItems.filter(item => result.data.purchasedItems.includes(item.id))
          setPurchasedItems(purchased)
        }
      } catch (error) {
        console.error('Failed to load purchased items:', error)
      }
    }

    loadPurchasedItems()
  }, [token, userId, currentUser])

  // Fetch follow status on mount (only if authenticated)
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!token || !isAuthenticated || isCurrentUser) return

      try {
        const response = await fetch(`/api/users/${userId}/follow`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const result = await response.json()
        if (result.success && result.data) {
          setIsFollowing(result.data.isFollowing)
          setLocalFollowers(result.data.followerCount)
        }
      } catch (error) {
        console.error("Failed to fetch follow status:", error)
      }
    }

    fetchFollowStatus()
  }, [userId, token, isAuthenticated, isCurrentUser])

  // Realtime subscription for follow updates
  useEffect(() => {
    if (!token || !isAuthenticated || isCurrentUser) return

    const followChannel = realtimeManager.subscribeToTable(
      {
        table: "Follow",
        event: "*",
        filter: `followingId=eq.${userId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          setLocalFollowers(prev => prev + 1)
        } else if (payload.eventType === "DELETE") {
          setLocalFollowers(prev => Math.max(0, prev - 1))
        }
      }
    )

    // Subscribe to current user's follow actions
    if (currentUser?.id) {
      const myFollowChannel = realtimeManager.subscribeToTable(
        {
          table: "Follow",
          event: "*",
          filter: `followerId=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" && (payload.new as any)?.followingId === userId) {
            setIsFollowing(true)
          } else if (payload.eventType === "DELETE" && (payload.old as any)?.followingId === userId) {
            setIsFollowing(false)
          }
        }
      )

      return () => {
        realtimeManager.unsubscribe(`Follow-followingId=eq.${userId}`)
        realtimeManager.unsubscribe(`Follow-followerId=eq.${currentUser.id}`)
      }
    }

    return () => {
      realtimeManager.unsubscribe(`Follow-followingId=eq.${userId}`)
    }
  }, [userId, token, isAuthenticated, isCurrentUser, currentUser?.id])

  const handleFollow = useCallback(async () => {
    if (!token || !currentUser || isCurrentUser) {
      // Redirect to login if not authenticated
      window.location.href = '/login'
      return
    }

    setIsFollowLoading(true)
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success && result.data) {
        setIsFollowing(result.data.isFollowing)
        setLocalFollowers(result.data.followerCount)
      }
    } catch (error) {
      console.error("Failed to follow/unfollow:", error)
    } finally {
      setIsFollowLoading(false)
    }
  }, [token, currentUser, isCurrentUser, isFollowing, userId])

  const handleShare = () => {
    const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}${pathname}`
    const text = `Check out ${user.name}'s P!!E profile! Level: ${user.level} | Followers: ${localFollowers}`

    if (navigator.share) {
      navigator.share({ title: `${user.name} - P!!E`, text, url: profileUrl })
    } else {
      navigator.clipboard.writeText(profileUrl)
      alert("Profile URL copied to clipboard!")
    }
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const isAvatarVideo = isVideoOrGif(user.avatar)
  const isBannerVideo = isVideoOrGif(user.banner)

  return (
    <div ref={profileRef} className={`min-h-screen ${currentTheme.bg} pb-10 relative overflow-hidden`}>
      {/* Theme Background Gradient */}
      <div className={`fixed inset-0 bg-gradient-to-br ${currentTheme.primary} ${currentTheme.accent} ${currentTheme.secondary} opacity-10 -z-10`} />
      
      {/* Falling Snowballs */}
      <FallingSnowballs enabled={snowEnabled} />

      {/* Theme Controls */}
      {isCurrentUser && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(prev => {
              const themesList: Theme[] = ["default", "dark", "neon", "ocean", "sunset", "forest"]
              const currentIndex = themesList.indexOf(prev)
              return themesList[(currentIndex + 1) % themesList.length]
            })}
            className="backdrop-blur-sm bg-card/50 border-border/50"
          >
            <Palette size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSnowEnabled(!snowEnabled)}
            className={`backdrop-blur-sm bg-card/50 border-border/50 ${snowEnabled ? 'bg-primary/20' : ''}`}
          >
            <Snowflake size={16} />
          </Button>
        </div>
      )}

      {/* Banner with 3D effect */}
      <div 
        ref={bannerRef}
        className={`relative w-full h-64 md:h-80 bg-gradient-to-br ${currentTheme.primary} ${currentTheme.accent} ${currentTheme.secondary} overflow-hidden transition-transform duration-300`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {user.banner ? (
          isBannerVideo ? (
            <video
              src={user.banner}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover opacity-90 transform hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <img
              src={user.banner}
              alt="Profile banner"
              className="w-full h-full object-cover opacity-80 transform hover:scale-105 transition-transform duration-700"
            />
          )
        ) : (
          <div className="absolute inset-0 opacity-30">
            <div className={`absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br ${currentTheme.primary} rounded-full blur-3xl animate-pulse`}></div>
            <div className={`absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br ${currentTheme.secondary} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br ${currentTheme.accent} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
          </div>
        )}
        {/* 3D Parallax effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar with 3D effects */}
          <div className="flex flex-col items-center md:items-start gap-4 flex-shrink-0">
            <div 
              ref={avatarRef}
              className="relative group"
              style={{ 
                transformStyle: "preserve-3d",
                perspective: "1000px",
                transition: "transform 0.1s ease-out"
              }}
            >
              <div className="w-40 h-40 rounded-2xl border-4 border-background shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-110 hover:rotate-3 hover:shadow-2xl" style={{ boxShadow: `0 25px 50px -12px ${currentTheme.primaryColor}50` }}>
                {isAvatarVideo ? (
                  <video
                    src={user.avatar || "/placeholder.svg"}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <img 
                    src={user.avatar || "/placeholder.svg"} 
                    alt={user.name} 
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" 
                  />
                )}
              </div>
              {/* 3D Glow effect */}
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" style={{ background: `linear-gradient(to bottom right, ${currentTheme.primaryColor}, ${currentTheme.accentColor})` }}></div>
              {/* Floating particles effect */}
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full animate-ping opacity-75" style={{ background: `linear-gradient(to bottom right, ${currentTheme.primaryColor}, ${currentTheme.accentColor})` }}></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full animate-ping opacity-75" style={{ background: `linear-gradient(to bottom right, ${currentTheme.secondaryColor}, ${currentTheme.accentColor})`, animationDelay: '0.5s' }}></div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {user.isVerified && (
                <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold animate-pulse">
                  ✓ VERIFIED
                </span>
              )}
              {user.workerRole && (
                <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">
                  {user.workerRole.toUpperCase()}
                </span>
              )}
              {user.userRole && (
                <span className="text-xs px-3 py-1 rounded-full text-foreground font-semibold capitalize" style={{ backgroundColor: `${currentTheme.primaryColor}20` }}>
                  {user.userRole}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className={`text-4xl md:text-5xl font-bold text-foreground mb-2 transform hover:scale-105 transition-transform duration-300`}>
                  {user.name}
                </h1>
                {user.workerRole && (
                  <span className={`text-sm px-3 py-1 rounded-full bg-${currentTheme.accent}/20 text-foreground font-medium`}>
                    {user.workerRole}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-lg text-muted-foreground mb-3">@{user.username}</p>
                {user.realm && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium" style={{ color: currentTheme.primaryColor }}>{user.realm}</span>
                  </>
                )}
              </div>
              {user.bio && <p className="text-foreground/80 max-w-2xl mb-4">{user.bio}</p>}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  Joined {joinedDate}
                </div>
              </div>
            </div>

            {/* Stats with 3D hover effects */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform" style={{ transformStyle: "preserve-3d", boxShadow: `0 10px 15px -3px ${currentTheme.primaryColor}20` }}>
                <p className="text-2xl md:text-3xl font-bold transform transition-transform duration-300 hover:scale-110" style={{ color: currentTheme.primaryColor }}>{localFollowers}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Followers</p>
              </div>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform" style={{ transformStyle: "preserve-3d", boxShadow: `0 10px 15px -3px ${currentTheme.secondaryColor}20` }}>
                <p className="text-2xl md:text-3xl font-bold transform transition-transform duration-300 hover:scale-110" style={{ color: currentTheme.secondaryColor }}>{user.following}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Following</p>
              </div>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform" style={{ transformStyle: "preserve-3d", boxShadow: `0 10px 15px -3px ${currentTheme.accentColor}20` }}>
                <p className="text-2xl md:text-3xl font-bold transform transition-transform duration-300 hover:scale-110" style={{ color: currentTheme.accentColor }}>{user.postsCount}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Posts</p>
              </div>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform" style={{ transformStyle: "preserve-3d", boxShadow: `0 10px 15px -3px ${currentTheme.primaryColor}20` }}>
                <p className="text-2xl md:text-3xl font-bold transform transition-transform duration-300 hover:scale-110" style={{ color: currentTheme.primaryColor, opacity: 0.8 }}>Lvl {user.level}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Level</p>
              </div>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:-translate-y-1 transform" style={{ transformStyle: "preserve-3d", boxShadow: `0 10px 15px -3px ${currentTheme.secondaryColor}20` }}>
                <p className="text-2xl md:text-3xl font-bold transform transition-transform duration-300 hover:scale-110" style={{ color: currentTheme.secondaryColor, opacity: 0.8 }}>{user.xp}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">XP</p>
              </div>
            </div>

            {/* Action buttons - visible to all users */}
            {!isCurrentUser && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className="font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: isFollowing 
                      ? undefined 
                      : `linear-gradient(to right, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`,
                    backgroundColor: isFollowing ? "hsl(var(--muted) / 0.5)" : undefined,
                    boxShadow: isFollowing ? undefined : `0 10px 15px -3px ${currentTheme.primaryColor}50`
                  }}
                >
                  {isFollowLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare} 
                  className="gap-2 border-border hover:bg-muted/50 bg-transparent transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Share size={18} />
                  Share
                </Button>
                {isAuthenticated && (
                  <Link href={`/messages?user=${userId}`}>
                    <Button 
                      variant="outline" 
                      className="gap-2 border-border hover:bg-muted/50 bg-transparent transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <MessageCircle size={18} />
                      Message
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Purchased Items Section */}
        {isCurrentUser && purchasedItems.length > 0 && (
          <div className="mt-6 bg-card/50 border border-border/30 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Award size={16} />
              Purchased Items
            </h3>
            <div className="flex flex-wrap gap-2">
              {purchasedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium text-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border rounded-lg p-1 mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="fusion">Fusion</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6 mt-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post.id} className="transform hover:scale-[1.01] transition-transform duration-300" style={{ transformStyle: "preserve-3d" }}>
                  <PostCard
                    post={{
                      id: post.id,
                      content: post.content,
                      author: {
                        id: post.author.id,
                        name: post.author.name,
                        username: post.author.username,
                        avatar: post.author.avatar,
                        isVerified: post.author.isVerified,
                      },
                      timestamp: new Date(post.createdAt),
                      likes: post.likes,
                      comments: post.comments,
                      shares: post.shares,
                      views: post.views,
                      postType: post.postType as "text" | "fusion" | "image" | "video",
                      mediaUrls: post.mediaUrls,
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No posts yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="fusion" className="space-y-6 mt-6">
            {fusionPosts.length > 0 ? (
              fusionPosts.map((fusionPost) => (
                <div key={fusionPost.id} className="transform hover:scale-[1.01] transition-transform duration-300" style={{ transformStyle: "preserve-3d" }}>
                  <FusionPostCard fusionPost={fusionPost} />
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No fusion posts yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6 transform hover:scale-[1.01] transition-transform duration-300" style={{ transformStyle: "preserve-3d" }}>
              <h3 className="text-xl font-semibold mb-4">About {user.name}</h3>
              {user.bio ? (
                <p className="text-foreground/80 mb-6">{user.bio}</p>
              ) : (
                <p className="text-muted-foreground mb-6">No bio yet</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Calendar className="text-primary" size={20} />
                  <div>
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="font-medium">{joinedDate}</p>
                  </div>
                </div>
                {user.location && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <MapPin className="text-primary" size={20} />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{user.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add CSS for falling animation */}
      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  )
}
