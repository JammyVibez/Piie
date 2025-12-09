import { apiClient } from "@/lib/api-client"

export const searchService = {
  // Global search across communities, messages, members
  async search(query: string, type: "all" | "communities" | "messages" | "members" = "all") {
    const params = new URLSearchParams({
      q: query,
      type,
    })

    return apiClient.get<{
      results: {
        communities: unknown[]
        messages: unknown[]
        members: unknown[]
      }
    }>(`/search?${params}`)
  },
}
