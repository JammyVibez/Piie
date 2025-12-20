"use client"
import React, { useState, useCallback, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname } from "next/navigation"
import { Share, MessageCircle, MapPin, Calendar, Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

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
  userRole?: string | null; // Added for user role
  workerRole?: string | null; // Added for worker role
  realm?: string | null; // Added for realm
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

interface ProfileContentProps {
  user: ProfileUser
  userPosts: ProfilePost[]
  userId: string
}

export function ProfileContent({ user, userPosts, userId }: ProfileContentProps) {
  const pathname = usePathname()
  const { user: currentUser, token, isAuthenticated } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [localFollowers, setLocalFollowers] = useState(user.followers)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState<any[]>([])

  const isCurrentUser = currentUser?.id === userId

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
          // Get full item details
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

  // Fetch follow status on mount
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

  const handleFollow = useCallback(async () => {
    if (!token || !currentUser || isCurrentUser) return

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

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/20 overflow-hidden">
        {user.banner ? (
          <img
            src={user.banner}
            alt="Profile banner"
            className="w-full h-full object-cover opacity-80 transform hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        )}
        {/* 3D Parallax effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center md:items-start gap-4 flex-shrink-0">
            <div className="relative group">
              <div className="w-40 h-40 rounded-2xl border-4 border-background shadow-2xl overflow-hidden ring-2 ring-primary/50 transform transition-all duration-500 hover:scale-110 hover:rotate-3 hover:shadow-primary/50 hover:shadow-2xl">
                <img 
                  src={user.avatar || "/placeholder.svg"} 
                  alt={user.name} 
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              {/* 3D Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              {/* Floating particles effect */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-ping opacity-75"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-secondary rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {user.isVerified && (
                <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  ✓ VERIFIED
                </span>
              )}
              {user.workerRole && (
                <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">
                  {user.workerRole.toUpperCase()}
                </span>
              )}
              {user.userRole && (
                <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-semibold capitalize">
                  {user.userRole}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{user.name}</h1>
                {/* RoleBadge component would be placed here if it existed and was imported */}
                {user.workerRole && (
                  <span className="text-sm px-3 py-1 rounded-full bg-accent/20 text-accent font-medium">
                    {user.workerRole}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-lg text-muted-foreground mb-3">@{user.username}</p>
                {user.realm && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-primary font-medium">{user.realm}</span>
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

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transform">
                <p className="text-2xl md:text-3xl font-bold text-primary transform transition-transform duration-300 hover:scale-110">{localFollowers}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Followers</p>
              </div>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-1 transform">
                <p className="text-2xl md:text-3xl font-bold text-secondary transform transition-transform duration-300 hover:scale-110">{user.following}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Following</p>
              </div>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1 transform">
                <p className="text-2xl md:text-3xl font-bold text-accent transform transition-transform duration-300 hover:scale-110">{user.postsCount}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Posts</p>
              </div>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transform">
                <p className="text-2xl md:text-3xl font-bold text-primary/80 transform transition-transform duration-300 hover:scale-110">Lvl {user.level}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Level</p>
              </div>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 text-center backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-1 transform">
                <p className="text-2xl md:text-3xl font-bold text-secondary/80 transform transition-transform duration-300 hover:scale-110">{user.xp}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">XP</p>
              </div>
            </div>

            {!isCurrentUser && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleFollow}
                  disabled={!isAuthenticated || isFollowLoading}
                  className={`font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${
                    isFollowing
                      ? "bg-muted/50 hover:bg-muted/70 text-foreground hover:shadow-lg"
                      : "bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50"
                  }`}
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
                <Link href={`/messages?user=${userId}`}>
                  <Button 
                    variant="outline" 
                    className="gap-2 border-border hover:bg-muted/50 bg-transparent transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <MessageCircle size={18} />
                    Message
                  </Button>
                </Link>
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
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border rounded-lg p-1 mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6 mt-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
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
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No posts yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6">
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

          <TabsContent value="achievements" className="mt-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="text-primary" size={24} />
                <h3 className="text-xl font-semibold">Achievements</h3>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <Award className="mx-auto mb-3 text-muted-foreground/50" size={48} />
                <p>Achievements coming soon</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}