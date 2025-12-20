"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CreatePostModal } from "./create-post-modal"
import {
  Home,
  Bell,
  Bookmark,
  Users,
  Menu,
  X,
  Settings,
  LogOut,
  Flame,
  Mountain,
  Trophy,
  Compass,
  MessageSquare,
  Search,
  Plus,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: number
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Bookmark, label: "Saved Posts", href: "/bookmarks" },
]

const socialItems: NavItem[] = [
  { icon: Users, label: "Communities", href: "/communities" },
  { icon: Video, label: "Rooms", href: "/rooms" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Trophy, label: "Leaderboards", href: "/leaderboard" },
  { icon: Flame, label: "Challenges", href: "/challenges" },
]

export function LeftSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showQuickSearch, setShowQuickSearch] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, token } = useAuth()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowQuickSearch(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetch("/api/notifications?limit=1", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUnreadNotifications(data.data.unreadCount || 0)
          }
        })
        .catch(console.error)

      fetch("/api/messages/conversations?limit=1", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUnreadMessages(data.data.unreadCount || 0)
          }
        })
        .catch(console.error)
    }
  }, [isAuthenticated, token])

  const navItemsWithBadges = mainNavItems.map((item) => {
    if (item.label === "Notifications") {
      return { ...item, badge: unreadNotifications > 0 ? unreadNotifications : undefined }
    }
    if (item.label === "Messages") {
      return { ...item, badge: unreadMessages > 0 ? unreadMessages : undefined }
    }
    return item
  })

  const xpProgress = user ? (user.xp / 12000) * 100 : 0

  const handleLogout = async () => {
    await logout()
  }

  if (!isAuthenticated) {
    return (
      <TooltipProvider delayDuration={0}>
        <aside className="hidden lg:flex w-72 h-screen bg-card border-r border-border overflow-y-auto overflow-x-hidden flex-col">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                  <Mountain size={22} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    P!!E
                  </span>
                </h1>
                <p className="text-[10px] text-muted-foreground truncate">Social Network & Community</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Sign in to access all features</p>
              <Link href="/auth/login">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full">Create Account</Button>
              </Link>
            </div>
          </div>
        </aside>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary text-primary-foreground p-2.5 rounded-xl shadow-lg neon-glow transition-transform active:scale-95"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside
        className={cn(
          "transition-all duration-300 ease-out fixed lg:sticky top-0 h-screen bg-card border-r border-border overflow-y-auto overflow-x-hidden flex flex-col z-40",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-72",
        )}
      >
        <div className="p-4 border-b border-border/50">
          <div className={cn("flex items-center gap-3 transition-all", isCollapsed && "justify-center")}>
            <div className="relative group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                <Mountain size={22} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    P!!E
                  </span>
                </h1>
                <p className="text-[10px] text-muted-foreground truncate">Social Network & Community Engagement</p>
              </div>
            )}

            {!isCollapsed && (
              <div className="flex items-center gap-1">
                <ThemeSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden lg:flex"
                  onClick={() => setIsCollapsed(true)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>

          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="w-full mt-2 hidden lg:flex justify-center"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronRight size={16} className="rotate-180" />
            </Button>
          )}
        </div>

        <div className={cn("px-4 py-3", isCollapsed && "px-2")}>
          <Dialog open={showQuickSearch} onOpenChange={setShowQuickSearch}>
            <DialogTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all group",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <Search size={18} className="flex-shrink-0 group-hover:text-primary transition-colors" />
                {!isCollapsed && (
                  <>
                    <span className="text-sm">Quick search...</span>
                    <kbd className="ml-auto text-[10px] bg-background px-1.5 py-0.5 rounded border border-border hidden sm:inline">
                      Ctrl+K
                    </kbd>
                  </>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Quick Search</DialogTitle>
              </DialogHeader>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search posts, users, communities..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className={cn("px-4 pb-2", isCollapsed && "px-2")}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setShowCreatePost(true)} className="w-full rounded-xl h-10" size="icon">
                  <Plus size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Create Post</TooltipContent>
            </Tooltip>
          ) : (
            <Button onClick={() => setShowCreatePost(true)} className="w-full rounded-xl gap-2 h-11 font-semibold shadow-lg hover:shadow-xl transition-shadow">
              <Sparkles size={18} />
              Create Post
            </Button>
          )}
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItemsWithBadges.map((item) => {
            const isActive = pathname === item.href

            const linkContent = (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted/50 hover:text-foreground",
                  isCollapsed && "justify-center px-0",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <item.icon
                  size={20}
                  className={cn("flex-shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")}
                />
                {!isCollapsed && (
                  <>
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-sm">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            )

            return isCollapsed ? (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 rounded-full">{item.badge}</span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              linkContent
            )
          })}

          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />

          {!isCollapsed && (
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">Explore</p>
          )}

          {socialItems.map((item) => {
            const isActive = pathname === item.href

            const linkContent = (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <item.icon size={20} className="flex-shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            )

            return isCollapsed ? (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              linkContent
            )
          })}
          <Link
            href="/shop"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
              pathname === "/shop" && "bg-primary/10 text-primary",
              isCollapsed && "justify-center px-0",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("flex-shrink-0 transition-transform group-hover:scale-110", pathname === "/shop" && "text-primary")}
            >
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {!isCollapsed && <span className="font-medium text-sm">Shop</span>}
          </Link>
        </nav>

        {!isCollapsed && user && (
          <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-primary/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-primary">Level {user.level}</span>
              <span className="text-xs text-muted-foreground">{user.influenceScore} Influence</span>
            </div>
            <div className="relative w-full h-2 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{user.xp.toLocaleString()} / 12,000 XP</p>
          </div>
        )}

        <div className="border-t border-border/50 p-3">
          {user && (
            <Link
              href={`/profile/${user.id}`}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors mb-2",
                isCollapsed && "justify-center",
              )}
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              )}
            </Link>
          )}

          <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}>
            {isCollapsed ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/settings">
                      <Button variant="ghost" size="icon" className="h-10 w-10">
                        <Settings size={18} />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Settings</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-destructive hover:bg-destructive/10"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Logout</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/80 hover:bg-muted/50 transition-colors"
                >
                  <Settings size={18} />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-destructive/80 hover:bg-destructive/10 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={(post) => {
          console.log("New post created:", post)
          setShowCreatePost(false)
        }}
      />
    </TooltipProvider>
  )
}