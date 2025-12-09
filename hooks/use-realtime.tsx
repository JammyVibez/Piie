"use client"

import { useEffect, useRef, useCallback } from "react"
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { realtimeManager } from "@/lib/realtime/subscriptions"

export function useRealtimeMessages(
  conversationId: string | null,
  onMessage: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!conversationId) return

    channelRef.current = realtimeManager.subscribeToMessages(conversationId, onMessage)

    return () => {
      if (channelRef.current) {
        realtimeManager.unsubscribe(`Message-conversationId=eq.${conversationId}`)
      }
    }
  }, [conversationId, onMessage])

  return channelRef.current
}

export function useRealtimeCommunityMessages(
  communityId: string | null,
  onMessage: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!communityId) return

    channelRef.current = realtimeManager.subscribeToCommunityMessages(communityId, onMessage)

    return () => {
      if (channelRef.current) {
        realtimeManager.unsubscribe(`CommunityMessage-communityId=eq.${communityId}`)
      }
    }
  }, [communityId, onMessage])

  return channelRef.current
}

export function useRealtimeCommunityPosts(
  communityId: string | null,
  onPost: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!communityId) return

    channelRef.current = realtimeManager.subscribeToCommunityPosts(communityId, onPost)

    return () => {
      if (channelRef.current) {
        realtimeManager.unsubscribe(`CommunityPost-communityId=eq.${communityId}`)
      }
    }
  }, [communityId, onPost])

  return channelRef.current
}

export function useRealtimeNotifications(
  userId: string | null,
  onNotification: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    channelRef.current = realtimeManager.subscribeToNotifications(userId, onNotification)

    return () => {
      if (channelRef.current) {
        realtimeManager.unsubscribe(`Notification-recipientId=eq.${userId}`)
      }
    }
  }, [userId, onNotification])

  return channelRef.current
}

export function useRealtimeAudioRoom(
  roomId: string | null,
  onParticipantChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!roomId) return

    channelRef.current = realtimeManager.subscribeToAudioRoom(roomId, onParticipantChange)

    return () => {
      if (channelRef.current) {
        realtimeManager.unsubscribe(`AudioParticipant-audioRoomId=eq.${roomId}`)
      }
    }
  }, [roomId, onParticipantChange])

  return channelRef.current
}

export function useRealtimeCommunities(
  onCommunityChange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    channelRef.current = realtimeManager.subscribeToCommunities(onCommunityChange)

    return () => {
      if (channelRef.current) {
        realtimeManager.unsubscribe("Community-all")
      }
    }
  }, [onCommunityChange])

  return channelRef.current
}

export function usePresence(
  channelName: string,
  userId: string | null,
  userInfo: Record<string, unknown>
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    channelRef.current = realtimeManager.subscribeToUserPresence(channelName, userId, userInfo)

    return () => {
      if (channelRef.current) {
        realtimeManager.unsubscribe(channelName)
      }
    }
  }, [channelName, userId, userInfo])

  const broadcast = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      realtimeManager.broadcastToChannel(channelName, event, payload)
    },
    [channelName]
  )

  return { channel: channelRef.current, broadcast }
}
