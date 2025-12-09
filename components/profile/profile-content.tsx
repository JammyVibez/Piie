"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PostCard } from "@/components/post-card"
import { Leaderboard } from "@/components/leaderboard"
import {
  Share2,
  MessageCircle,
  MapPin,
  Calendar,
  Award,
  Settings,
  Edit,
  Users,
  Heart,
  Eye,
  TrendingUp,
  MoreHorizontal,
  Flag,
  UserMinus,
  Bell,
  BellOff,
  Copy,
  Check,
  Verified,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { User, Post } from "@/components/types"
import { formatNumber } from "@/lib/utils-format"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProfileContentProps {
  user: User
  userPosts: Post[]
  isCurrentUser: boolean
  currentUserId: string
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card/50 border border-border/30 rounded-xl p-4 text-center backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all group">
      <div className={cn("w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center", color)}>
        <Icon size={20} className="text-foreground" />
      </div>
      <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

// Badge/Achievement Card
function AchievementCard({
  badge,
  type,
}: {
  badge: { id: string; name: string; icon: string; rarity: string; description?: string }
  type: "badge" | "achievement"
}) {
  const rarityColors = {
    common: "bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20",
    rare: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20",
    epic: "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20",
    legendary:
      "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30 hover:from-yellow-500/20 hover:to-orange-500/20",
  }

  return (
    <div
      className={cn(
        "p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 cursor-pointer hover:scale-105",
        rarityColors[badge.rarity as keyof typeof rarityColors] || rarityColors.common,
      )}
    >
      <div className="text-3xl mb-2">{badge.icon}</div>
      <p className="font-semibold text-foreground text-sm">{badge.name}</p>
      {badge.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>}
      <Badge variant="outline" className="mt-2 text-xs capitalize">
        {badge.rarity}
      </Badge>
    </div>
  )
}

// Followers/Following Dialog Content
function FollowList({ users, title }: { users: User[]; title: string }) {
  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {users.map((user) => (
        <Link
          key={user.id}
          href={`/profile/${user.id}`}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-foreground truncate">{user.name}</p>
              {user.workerRole && <Verified size={14} className="text-primary" />}
            </div>
            <p className="text-sm text-muted-foreground capitalize">{user.userRole}</p>
          </div>
          <Button size="sm" variant="outline" className="bg-transparent">
            View
          </Button>
        </Link>
      ))}
    </div>
  )
}

export function ProfileContent({ user, userPosts, isCurrentUser, currentUserId }: ProfileContentProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [followerCount, setFollowerCount] = useState(user.followers || 0)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")

  const handleFollow = () => {
    if (isCurrentUser) return
    setIsFollowing(!isFollowing)
    setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1))
  }

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${user.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name} - P!!E`,
          text: `Check out ${user.name}'s profile on P!!E!`,
          url: profileUrl,
        })
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const xpProgress = ((user.xp % 1000) / 1000) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden">
        {user.bannerImage ? (
          <img
            src={user.bannerImage || "/placeholder.svg"}
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/20">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Avatar and Basic Info */}
          <div className="flex flex-col items-center lg:items-start gap-4 flex-shrink-0">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32 lg:h-40 lg:w-40 ring-4 ring-background shadow-2xl">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-4 border-background" />
              )}
              {isCurrentUser && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg"
                >
                  <Edit size={16} />
                </Button>
              )}
            </div>

            {/* Role Badges */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {user.workerRole && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
                  {user.workerRole.toUpperCase()}
                </Badge>
              )}
              {user.userRole && (
                <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
                  {user.userRole.toUpperCase()}
                </Badge>
              )}
            </div>

            {/* Level Progress - Desktop */}
            <Card className="hidden lg:block w-full p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Level {user.level}</span>
                <span className="text-xs text-muted-foreground">{user.xp % 1000}/1000 XP</span>
              </div>
              <Progress value={xpProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {1000 - (user.xp % 1000)} XP to level {(user.level || 0) + 1}
              </p>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="flex-1 space-y-6">
            {/* Name and Actions Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">{user.name}</h1>
                  {user.workerRole && <Verified size={24} className="text-primary" />}
                </div>
                <p className="text-muted-foreground">@{user.username || user.name.toLowerCase().replace(" ", "")}</p>
                {user.realm && <p className="text-primary font-medium mt-1">{user.realm}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center lg:justify-end gap-2 flex-wrap">
                {isCurrentUser ? (
                  <>
                    <Link href="/settings">
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <Settings size={16} />
                        Settings
                      </Button>
                    </Link>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <Edit size={16} />
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleFollow}
                      className={cn(
                        "gap-2 transition-all",
                        isFollowing
                          ? "bg-muted/50 hover:bg-muted/70 text-foreground"
                          : "bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30",
                      )}
                    >
                      <Users size={16} />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Link href={`/messages?user=${user.id}`}>
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <MessageCircle size={16} />
                        Message
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-transparent">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleShare}>
                          <Share2 size={14} className="mr-2" />
                          Share Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsMuted(!isMuted)}>
                          {isMuted ? (
                            <>
                              <Bell size={14} className="mr-2" />
                              Unmute
                            </>
                          ) : (
                            <>
                              <BellOff size={14} className="mr-2" />
                              Mute
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <UserMinus size={14} className="mr-2" />
                          Block
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Flag size={14} className="mr-2" />
                          Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                <Button variant="outline" size="icon" className="bg-transparent" onClick={handleShare}>
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            {/* Bio */}
            {user.bio && <p className="text-foreground/80 max-w-2xl text-center lg:text-left">{user.bio}</p>}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  {user.location}
                </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  Joined {user.joinedDate}
                </div>
              )}
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Users size={16} />
                    <strong className="text-foreground">{formatNumber(followerCount)}</strong> followers
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Followers</DialogTitle>
                    <DialogDescription>People following {user.name}</DialogDescription>
                  </DialogHeader>
                  <FollowList users={allUsers.filter((u) => u.id !== user.id).slice(0, 5)} title="Followers" />
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <strong className="text-foreground">{formatNumber(user.following || 0)}</strong> following
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Following</DialogTitle>
                    <DialogDescription>People {user.name} follows</DialogDescription>
                  </DialogHeader>
                  <FollowList users={allUsers.filter((u) => u.id !== user.id).slice(0, 5)} title="Following" />
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Followers" value={formatNumber(followerCount)} icon={Users} color="bg-primary/10" />
              <StatCard
                label="Influence"
                value={formatNumber(user.influenceScore || 0)}
                icon={TrendingUp}
                color="bg-secondary/30"
              />
              <StatCard label="Level" value={user.level || 0} icon={Award} color="bg-accent/10" />
              <StatCard label="XP" value={formatNumber(user.xp || 0)} icon={Heart} color="bg-primary/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-6xl mx-auto px-4 mt-8 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border/50 rounded-xl p-1 mb-6 overflow-x-auto">
            <TabsTrigger value="posts" className="gap-2">
              <Eye size={16} />
              Posts
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award size={16} />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Users size={16} />
              About
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <TrendingUp size={16} />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6 mt-0">
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border border-border/50">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Eye size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isCurrentUser ? "Start sharing your thoughts!" : `${user.name} hasn't posted anything yet.`}
                </p>
                {isCurrentUser && (
                  <Button className="mt-4 gap-2">
                    <Edit size={16} />
                    Create Post
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <Card className="p-6 border border-border/50">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Award size={20} className="text-primary" />
                    Badges
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {user.badges.map((badge) => (
                      <AchievementCard key={badge.id} badge={badge} type="badge" />
                    ))}
                  </div>
                </Card>
              )}

              {/* Achievements */}
              {user.achievements && user.achievements.length > 0 && (
                <Card className="p-6 border border-border/50">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-secondary-foreground" />
                    Achievements
                  </h3>
                  <div className="space-y-3">
                    {user.achievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        badge={{ ...achievement, rarity: achievement.rarity }}
                        type="achievement"
                      />
                    ))}
                  </div>
                </Card>
              )}

              {/* Empty State */}
              {(!user.badges || user.badges.length === 0) && (!user.achievements || user.achievements.length === 0) && (
                <Card className="p-12 text-center border border-border/50 col-span-2">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Award size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No achievements yet</h3>
                  <p className="text-muted-foreground">
                    {isCurrentUser
                      ? "Keep engaging to earn badges!"
                      : `${user.name} is working on earning achievements.`}
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 border border-border/50">
                <h3 className="text-lg font-bold text-foreground mb-4">About {user.name}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bio</p>
                    <p className="text-foreground">{user.bio || "No bio provided"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="text-foreground">{user.location || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Joined</p>
                      <p className="text-foreground">{user.joinedDate || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Realm</p>
                      <p className="text-foreground">{user.realm || "Explorer"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Role</p>
                      <p className="text-foreground capitalize">{user.userRole}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border/50">
                <h3 className="text-lg font-bold text-foreground mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Total Posts</span>
                    <span className="font-bold text-foreground">{userPosts.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Total Likes</span>
                    <span className="font-bold text-foreground">
                      {formatNumber(userPosts.reduce((acc, post) => acc + post.likes, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Total Comments</span>
                    <span className="font-bold text-foreground">
                      {formatNumber(userPosts.reduce((acc, post) => acc + post.comments, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-muted-foreground">Engagement Rate</span>
                    <span className="font-bold text-green-500">8.4%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="mt-0">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
