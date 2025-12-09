import { createClient } from "@/lib/supabase/client"
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js"

export type SubscriptionEvent = "INSERT" | "UPDATE" | "DELETE" | "*"

export interface SubscriptionConfig {
  table: string
  schema?: string
  event?: SubscriptionEvent
  filter?: string
}

class RealtimeManager {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()

  createChannel(name: string): RealtimeChannel {
    const existingChannel = this.channels.get(name)
    if (existingChannel) {
      return existingChannel
    }

    const channel = this.supabase.channel(name)
    this.channels.set(name, channel)
    return channel
  }

  subscribeToTable<T = Record<string, unknown>>(
    config: SubscriptionConfig,
    callback: (payload: RealtimePostgresChangesPayload<T>) => void
  ): RealtimeChannel {
    const channelName = `${config.table}-${config.filter || "all"}`
    const channel = this.createChannel(channelName)

    const subscriptionConfig: {
      event: SubscriptionEvent
      schema: string
      table: string
      filter?: string
    } = {
      event: config.event || "*",
      schema: config.schema || "public",
      table: config.table,
    }

    if (config.filter) {
      subscriptionConfig.filter = config.filter
    }

    channel
      .on(
        "postgres_changes",
        subscriptionConfig,
        (payload) => callback(payload as RealtimePostgresChangesPayload<T>)
      )
      .subscribe()

    return channel
  }

  subscribeToMessages(
    conversationId: string,
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      {
        table: "Message",
        event: "*",
        filter: `conversationId=eq.${conversationId}`,
      },
      callback
    )
  }

  subscribeToCommunityMessages(
    communityId: string,
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      {
        table: "CommunityMessage",
        event: "*",
        filter: `communityId=eq.${communityId}`,
      },
      callback
    )
  }

  subscribeToCommunityPosts(
    communityId: string,
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      {
        table: "CommunityPost",
        event: "*",
        filter: `communityId=eq.${communityId}`,
      },
      callback
    )
  }

  subscribeToNotifications(
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      {
        table: "Notification",
        event: "INSERT",
        filter: `recipientId=eq.${userId}`,
      },
      callback
    )
  }

  subscribeToAudioRoom(
    roomId: string,
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      {
        table: "AudioParticipant",
        event: "*",
        filter: `audioRoomId=eq.${roomId}`,
      },
      callback
    )
  }

  subscribeToCommunities(
    callback: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
  ): RealtimeChannel {
    return this.subscribeToTable(
      {
        table: "Community",
        event: "*",
      },
      callback
    )
  }

  subscribeToUserPresence(
    channelName: string,
    userId: string,
    userInfo: Record<string, unknown>
  ): RealtimeChannel {
    const channel = this.createChannel(channelName)

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        console.log("Presence state:", state)
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("User joined:", key, newPresences)
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("User left:", key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: userId,
            online_at: new Date().toISOString(),
            ...userInfo,
          })
        }
      })

    return channel
  }

  broadcastToChannel(
    channelName: string,
    event: string,
    payload: Record<string, unknown>
  ): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.send({
        type: "broadcast",
        event,
        payload,
      })
    }
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => channel.unsubscribe())
    this.channels.clear()
  }
}

export const realtimeManager = new RealtimeManager()
export default RealtimeManager
