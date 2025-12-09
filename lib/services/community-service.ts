import { apiClient } from "@/lib/api-client"
import type { Community, Message } from "@/types"

export const communityService = {
  // Fetch communities with pagination and filters
  async getCommunities(page = 1, limit = 20, category?: string, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(search && { search }),
    })

    return apiClient.get<{ communities: Community[]; pagination: Record<string, unknown> }>(`/communities?${params}`)
  },

  // Get single community details
  async getCommunity(communityId: string) {
    return apiClient.get<Community>(`/communities/${communityId}`)
  },

  // Create new community
  async createCommunity(data: Partial<Community>) {
    return apiClient.post<Community>("/communities", data)
  },

  // Fetch messages with pagination
  async getMessages(communityId: string, page = 1, limit = 50, search?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    })

    return apiClient.get<{ messages: Message[] }>(`/communities/${communityId}/messages?${params}`)
  },

  // Send new message
  async sendMessage(communityId: string, content: string, type = "text") {
    return apiClient.post<Message>(`/communities/${communityId}/messages`, {
      content,
      type,
      userId: "current-user-id", // Replace with actual user ID
    })
  },

  // Add emoji reaction
  async addReaction(messageId: string, emoji: string) {
    return apiClient.post(`/messages/${messageId}/reactions`, {
      emoji,
      userId: "current-user-id",
    })
  },

  // Remove emoji reaction
  async removeReaction(messageId: string, emoji: string) {
    const params = new URLSearchParams({
      emoji,
      userId: "current-user-id",
    })

    return apiClient.delete(`/messages/${messageId}/reactions?${params}`)
  },
}
