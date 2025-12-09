"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Trophy,
  Share2,
  AtSign,
  Repeat2,
  Settings,
  Check,
  CheckCheck,
  Trash2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { pusherClient } from "@/lib/pusher"
import { useAuth } from "@/contexts/auth-context"

interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "achievement" | "share" | "mention" | "repost"
  user: {
    name: string
    avatar: string
    id: string
  }
  action: string
  content?: string
  postTitle?: string
  postId?: string
  timestamp: Date
  read: boolean
  title?: string
  message?: string
  targetId?: string
  targetType?: "post" | "story"
  createdAt: string
}

export function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const { token } = useAuth()

  useEffect(() => {
    // Fetch real notifications from API
    const fetchNotifications = async () => {
      if (!token) return
      
      try {
        const response = await fetch('/api/notifications?limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const result = await response.json()
        
        if (result.success) {
          const formattedNotifications = result.data.items.map((notif: any) => ({
            id: notif.id,
            type: notif.type,
            user: notif.sender || { name: "System", avatar: "/placeholder.svg", id: "system" },
            action: notif.message,
            timestamp: new Date(notif.createdAt),
            read: notif.read,
            title: notif.title,
            message: notif.message,
            targetId: notif.targetId,
            targetType: notif.targetType,
            createdAt: notif.createdAt,
          }))
          setNotifications(formattedNotifications)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchNotifications()

    // Set up Pusher listeners for real-time updates (only if configured)
    let channel: any
    
    try {
      if (process.env.NEXT_PUBLIC_PUSHER_KEY && token) {
        channel = pusherClient.subscribe("notifications");
        channel.bind("new-notification", (notificationData: any) => {
          const formattedNotif = {
            id: notificationData.id,
            type: notificationData.type,
            user: notificationData.sender || { name: "System", avatar: "/placeholder.svg", id: "system" },
            action: notificationData.message,
            timestamp: new Date(notificationData.createdAt),
            read: false,
            title: notificationData.title,
            message: notificationData.message,
            targetId: notificationData.targetId,
            targetType: notificationData.targetType,
            createdAt: notificationData.createdAt,
          }
          setNotifications((prev) => [formattedNotif, ...prev]);
        });
      }
    } catch (error) {
      console.error("Pusher connection error:", error);
    }

    // Clean up Pusher listeners on component unmount
    return () => {
      try {
        if (channel) pusherClient.unsubscribe("notifications");
      } catch (error) {
        console.error("Pusher cleanup error:", error);
      }
    };
  }, [token])

  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: Notification["type"]) => {
    const icons = {
      like: <Heart className="text-red-500 fill-red-500" size={16} />,
      comment: <MessageCircle className="text-blue-500" size={16} />,
      follow: <UserPlus className="text-green-500" size={16} />,
      achievement: <Trophy className="text-yellow-500 fill-yellow-500" size={16} />,
      share: <Share2 className="text-purple-500" size={16} />,
      mention: <AtSign className="text-cyan-500" size={16} />,
      repost: <Repeat2 className="text-emerald-500" size={16} />,
    }
    return icons[type]
  }

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const markAllAsRead = async () => {
    if (!token) return
    
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }

  const markAsRead = async (id: string) => {
    if (!token) return
    
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: [id] })
      })
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!token) return
    
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setNotifications(notifications.filter((n) => n.id !== id))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !n.read
    // Filter by notification type matching the tab value
    // For types like 'like', 'comment', etc.
    return n.type === activeTab
  })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-primary/15 transition-colors relative group"
        title="Notifications"
      >
        <Bell size={20} className="text-primary group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-4 pb-0 border-b border-border/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">{unreadCount} new</span>
                )}
              </DialogTitle>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs gap-1">
                    <CheckCheck size={14} />
                    Mark all read
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Notification settings</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setNotifications([])}>Clear all</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
              <TabsList className="w-full grid grid-cols-4 h-9">
                <TabsTrigger value="all" className="text-xs">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread
                </TabsTrigger>
                <TabsTrigger value="like" className="text-xs">
                  Likes
                </TabsTrigger>
                <TabsTrigger value="comment" className="text-xs">
                  Comments
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {/* Display Notifications */}
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer group mb-2 ${
                      notification.read
                        ? "bg-background/50 border-border/30 hover:bg-muted/30"
                        : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 p-1 bg-card rounded-full border border-border">
                          {getIcon(notification.type)}
                        </div>
                      </div>
                      {/* Updated notification rendering */}
                      <div>
                        <p className="text-sm font-semibold">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        {notification.targetId && notification.targetType === "post" && (
                          <Link
                            href={`/post/${notification.targetId}`}
                            className="text-xs text-primary hover:underline mt-1 block"
                          >
                            View post
                          </Link>
                        )}
                        <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                          {formatTime(new Date(notification.createdAt))}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="p-1.5 hover:bg-muted rounded"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="p-1.5 hover:bg-destructive/10 rounded text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {activeTab === "unread" ? "All caught up!" : "When you get notifications, they'll show up here"}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t border-border/50 text-center">
            <Link href="/notifications" className="text-sm text-primary hover:underline" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}