"use client"

import { useState, useEffect, useRef } from "react"
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Mail,
  Layers,
  Check,
  CheckCheck,
  Trash2,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatRelativeTime } from "@/lib/utils-format"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  sender: {
    id: string
    name: string
    username: string
    avatar: string | null
  } | null
  targetId: string | null
  targetType: string | undefined
  read: boolean
  createdAt: string
}

const notificationIcons: Record<string, React.ReactNode> = {
  like: <Heart className="text-red-500" size={18} />,
  comment: <MessageCircle className="text-blue-500" size={18} />,
  follow: <UserPlus className="text-green-500" size={18} />,
  mention: <AtSign className="text-purple-500" size={18} />,
  message: <Mail className="text-orange-500" size={18} />,
  system: <Bell className="text-muted-foreground" size={18} />,
  room_invite: <Mail className="text-cyan-500" size={18} />,
  fusion_layer: <Layers className="text-pink-500" size={18} />,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filterType, setFilterType] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const tokenRef = useRef<string | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoadedRef.current) {
      tokenRef.current = localStorage.getItem("auth_token")
      hasLoadedRef.current = true
      fetchNotifications()
    }
  }, [])

  const fetchNotifications = async (loadMore = false) => {
    if (!tokenRef.current) return

    if (!loadMore) {
      setIsLoading(true)
    }

    try {
      const params = new URLSearchParams({
        page: loadMore ? String(page + 1) : "1",
        limit: "20",
      })
      if (filterType) {
        params.set("type", filterType)
      }

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      })
      const data = await response.json()

      if (data.success && data.data) {
        if (loadMore) {
          setNotifications((prev) => [...prev, ...data.data.items])
          setPage((prev) => prev + 1)
        } else {
          setNotifications(data.data.items)
          setPage(1)
        }
        setUnreadCount(data.data.unreadCount)
        setHasMore(data.data.hasMore)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (ids: string[]) => {
    if (!tokenRef.current || ids.length === 0) return

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRef.current}`,
        },
        body: JSON.stringify({ ids }),
      })

      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - ids.length))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const markAllAsRead = async () => {
    if (!token) return

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const handleFilterChange = (type: string | null) => {
    setFilterType(type)
    setPage(1)
    setTimeout(() => fetchNotifications(), 0)
  }

  const getNotificationLink = (notification: Notification): string | null => {
    if (notification.targetType === "post" && notification.targetId) {
      return `/post/${notification.targetId}`
    }
    if (notification.type === "follow" && notification.sender) {
      return `/profile/${notification.sender.id}`
    }
    if (notification.type === "message") {
      return "/messages"
    }
    return null
  }

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const link = getNotificationLink(notification)
    const content = (
      <div
        className={`flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer ${
          notification.read ? "bg-background" : "bg-primary/5"
        } hover:bg-muted/50`}
        onClick={() => !notification.read && markAsRead([notification.id])}
      >
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.sender?.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {notification.sender?.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background">
            {notificationIcons[notification.type] || notificationIcons.system}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{notification.sender?.name || "Someone"}</span>{" "}
            {notification.message.replace(notification.sender?.name || "Someone", "").trim()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>

        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
        )}
      </div>
    )

    if (link) {
      return <Link href={link}>{content}</Link>
    }
    return content
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Bell className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCheck size={16} />
                Mark all read
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleFilterChange(null)}
                  className={!filterType ? "bg-muted" : ""}
                >
                  All notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleFilterChange("like")}
                  className={filterType === "like" ? "bg-muted" : ""}
                >
                  <Heart size={16} className="mr-2 text-red-500" /> Likes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("comment")}
                  className={filterType === "comment" ? "bg-muted" : ""}
                >
                  <MessageCircle size={16} className="mr-2 text-blue-500" /> Comments
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("follow")}
                  className={filterType === "follow" ? "bg-muted" : ""}
                >
                  <UserPlus size={16} className="mr-2 text-green-500" /> Follows
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("mention")}
                  className={filterType === "mention" ? "bg-muted" : ""}
                >
                  <AtSign size={16} className="mr-2 text-purple-500" /> Mentions
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No notifications yet
              </h3>
              <p className="text-muted-foreground text-sm">
                When someone interacts with your content, you&apos;ll see it here
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[70vh]">
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>

              {hasMore && (
                <div className="p-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => fetchNotifications(true)}
                    className="w-full"
                  >
                    Load more
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </Card>
      </div>
    </div>
  )
}
