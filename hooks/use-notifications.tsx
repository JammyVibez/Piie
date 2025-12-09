"use client"

import { useState, useCallback, useEffect } from "react"
import { notificationService } from "@/lib/services/notification-service"
import type { Notification } from "@/types"

export function useNotifications(userId: string, pollInterval = 5000) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await notificationService.getNotifications(userId, 50)

      if (result.success && result.data) {
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.notifications.filter((n) => !n.read).length)
      }
    } catch (err) {
      console.error("[v0] Error fetching notifications:", err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Poll for new notifications
  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(fetchNotifications, pollInterval)
    return () => clearInterval(interval)
  }, [fetchNotifications, pollInterval])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("[v0] Error marking as read:", err)
    }
  }, [])

  return { notifications, unreadCount, isLoading, markAsRead, refetch: fetchNotifications }
}
