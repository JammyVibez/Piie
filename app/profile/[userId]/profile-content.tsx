"use client"
import React, { useState, useCallback, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { FusionPostCard } from "@/components/fusion-post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname } from "next/navigation"
import { MapPin, Calendar, Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import type { FusionPost, FusionLayer } from "@/lib/types"
import { realtimeManager } from "@/lib/realtime/subscriptions"
import { SocialHeader } from "@/components/profile/social-header"
import { SocialConnections } from "@/components/profile/social-connections"

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

export function ProfileContent({ user, userPosts, fusionPosts, userId }: ProfileContentProps) {
  const pathname = usePathname()
  const { user: currentUser, token, isAuthenticated } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [localFollowers, setLocalFollowers] = useState(user.followers)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("posts")

  const isCurrentUser = currentUser?.id === userId

  // Load purchased items
  useEffect(() => {
    const loadPurchasedItems = async () => {
      if (!token || userId !== currentUser?.id) return

      try {
        const response = await fetch('/api/shop/items', {
          credentials: "include",
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

  // Fetch follow status on mount
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!token || !isAuthenticated || isCurrentUser) return

      try {
        const response = await fetch(`/api/users/${userId}/follow`, {
          method: "GET",
          credentials: "include",
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

  // Realtime subscription
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
      window.location.href = '/login'
      return
    }

    setIsFollowLoading(true)
    try {
      const method = isFollowing ? "DELETE" : "POST"
      const response = await fetch(`/api/users/${userId}/follow`, {
        method,
        credentials: "include",
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

  // Map user data for SocialHeader
  const headerUser = {
    ...user,
    handle: `@${user.username}`,
    stats: {
      followers: localFollowers,
      following: user.following,
      posts: user.postsCount
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <FallingSnowballs enabled={true} />
      <SocialHeader user={headerUser} isOwnProfile={isCurrentUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Info & Socials */}
          <div className="lg:col-span-4 space-y-6">
             {/* User Info Card */}
             <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <div className="flex gap-2">
                    {user.isVerified && (
                        <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium">Verified</span>
                    )}
                    {/* Follow Button (Mobile/Desktop logic could vary, but keeping it simple here) */}
                    {!isCurrentUser && (
                        <Button 
                        size="sm"
                        onClick={handleFollow} 
                        disabled={isFollowLoading}
                        variant={isFollowing ? "secondary" : "default"}
                        >
                        {isFollowLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">@{user.username}</p>
                {user.bio && <p className="text-foreground/80 mb-6">{user.bio}</p>}
                
                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {user.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Level {user.level} • {user.xp} XP
                  </div>
                </div>
             </div>

             {/* Social Connections */}
             <SocialConnections isOwnProfile={isCurrentUser} />
          </div>

          {/* Main Content - Tabs */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start bg-card/50 backdrop-blur-md border border-border/50 rounded-xl p-1 mb-6">
                <TabsTrigger value="posts" className="flex-1 rounded-lg">Posts</TabsTrigger>
                <TabsTrigger value="fusions" className="flex-1 rounded-lg">Fusions</TabsTrigger>
                <TabsTrigger value="shop" className="flex-1 rounded-lg">Inventory</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground">No posts yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fusions" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {fusionPosts.length > 0 ? (
                  fusionPosts.map((fusion) => (
                    <FusionPostCard key={fusion.id} fusionPost={fusion} />
                  ))
                ) : (
                  <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-border">
                    <p className="text-muted-foreground">No fusions yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="shop" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {purchasedItems.length > 0 ? (
                    purchasedItems.map((item) => (
                      <div key={item.id} className="bg-card/50 border border-border/50 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-card/80 transition-all hover:scale-105">
                        <div className="text-4xl mb-2">{item.icon}</div>
                        <div className="font-semibold text-center">{item.name}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          item.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-500' :
                          item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-500' :
                          item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {item.rarity.toUpperCase()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 bg-card/30 rounded-2xl border border-dashed border-border">
                      <p className="text-muted-foreground">No items in inventory</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <CommentModal
        isOpen={!!selectedPostForComment}
        onClose={() => setSelectedPostForComment(null)}
        onSubmit={(comment) => {
          console.log('Comment submitted:', comment)
          setSelectedPostForComment(null)
        }}
        postTitle={selectedPostForComment?.title}
        postId={selectedPostForComment?.id}
      />
    </div>
  )
}
