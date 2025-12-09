"use client"

import { useState, useCallback } from "react"
import { communityService } from "@/lib/services/community-service"
import { useToast } from "./use-toast"
import type { Message } from "@/types"

export function useMessages(communityId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const { addToast } = useToast()

  const fetchMessages = useCallback(
    async (pageNum = 1, search?: string) => {
      if (!hasMore && pageNum > 1) return

      setIsLoading(true)

      try {
        const result = await communityService.getMessages(communityId, pageNum, 50, search)

        if (result.success && result.data) {
          const newMessages = result.data.messages

          if (pageNum === 1) {
            setMessages(newMessages)
          } else {
            setMessages((prev) => [...prev, ...newMessages])
          }

          setHasMore(newMessages.length === 50)
          setPage(pageNum)
        } else {
          addToast(result.error || "Failed to fetch messages", "error")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch messages"
        addToast(message, "error")
      } finally {
        setIsLoading(false)
      }
    },
    [communityId, hasMore, addToast],
  )

  const sendMessage = useCallback(
    async (content: string, type = "text") => {
      try {
        const result = await communityService.sendMessage(communityId, content, type)

        if (result.success && result.data) {
          setMessages((prev) => [...prev, result.data as Message])
          addToast("Message sent", "success")
          return true
        } else {
          addToast(result.error || "Failed to send message", "error")
          return false
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message"
        addToast(message, "error")
        return false
      }
    },
    [communityId, addToast],
  )

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      const result = await communityService.addReaction(messageId, emoji)

      if (result.success) {
        // Update local state
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: {
                  ...msg.reactions,
                  [emoji]: [...(msg.reactions[emoji] || []), "current-user-id"],
                },
              }
            }
            return msg
          }),
        )
      }
    } catch (err) {
      console.error("[v0] Error adding reaction:", err)
    }
  }, [])

  return { messages, isLoading, hasMore, page, fetchMessages, sendMessage, addReaction }
}
