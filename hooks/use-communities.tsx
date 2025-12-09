"use client"

import { useState, useCallback } from "react"
import { communityService } from "@/lib/services/community-service"
import { useToast } from "./use-toast"
import type { Community } from "@/types"

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const { addToast } = useToast()

  const fetchCommunities = useCallback(
    async (page = 1, category?: string, search?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await communityService.getCommunities(page, pagination.limit, category, search)

        if (result.success && result.data) {
          setCommunities(result.data.communities)
          setPagination({
            ...pagination,
            page,
            total: (result.data.pagination as Record<string, unknown>).total as number,
            totalPages: (result.data.pagination as Record<string, unknown>).totalPages as number,
          })
        } else {
          setError(result.error || "Failed to fetch communities")
          addToast(result.error || "Failed to fetch communities", "error")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setError(message)
        addToast(message, "error")
      } finally {
        setIsLoading(false)
      }
    },
    [pagination, addToast],
  )

  return { communities, isLoading, error, pagination, fetchCommunities }
}
