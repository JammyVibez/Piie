import { apiClient } from "@/lib/api-client"
import type { Notification } from "@/types"

export const notificationService = {
  // Fetch notifications
  async getNotifications(userId: string, limit = 20) {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
    })

    return apiClient.get<{ notifications: Notification[] }>(`/notifications?${params}`)
  },

  // Mark all as read
  async markAllAsRead(userId: string) {
    return apiClient.put("/notifications", { userId })
  },

  // Mark single as read
  async markAsRead(notificationId: string) {
    return apiClient.put(`/notifications/${notificationId}`)
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    return apiClient.delete(`/notifications/${notificationId}`)
  },
}
