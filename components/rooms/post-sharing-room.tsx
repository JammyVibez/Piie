"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Share2, Heart, MessageCircle, Eye } from "lucide-react"
import { realtimeManager } from "@/lib/realtime/subscriptions"
import { RoomChat } from "./room-chat"
import { PostCard } from "@/components/post-card"

interface PostSharingRoomProps {
  roomId: string
  room: any
  currentUser: any
  token: string
}

export function PostSharingRoom({ roomId, room, currentUser, token }: PostSharingRoomProps) {
  const [sharedPosts, setSharedPosts] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [members, setMembers] = useState(room.members || [])

  // Fetch shared posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/posts`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const result = await response.json()
        if (result.success) {
          setSharedPosts(result.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      }
    }

    fetchPosts()
  }, [roomId, token])

  // Realtime subscriptions
  useEffect(() => {
    // Subscribe to room posts
    const postChannel = realtimeManager.subscribeToTable(
      {
        table: "Post",
        event: "INSERT",
      },
      (payload) => {
        if (payload.eventType === "INSERT" && payload.new) {
          const newPost = payload.new as any
          // Check if post is related to this room (you may need to add a roomId field to Post)
          fetchPosts()
        }
      }
    )

    // Subscribe to room messages
    const messageChannel = realtimeManager.subscribeToTable(
      {
        table: "RoomMessage",
        event: "INSERT",
        filter: `roomId=eq.${roomId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT" && payload.new) {
          const newMessage = payload.new as any
          fetch(`/api/rooms/${roomId}/messages/${newMessage.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                setMessages(prev => [...prev, result.data])
              }
            })
        }
      }
    )

    // Subscribe to member updates
    const memberChannel = realtimeManager.subscribeToTable(
      {
        table: "RoomMember",
        event: "*",
        filter: `roomId=eq.${roomId}`,
      },
      () => {
        fetch(`/api/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(result => {
            if (result.success) {
              setMembers(result.data.members || [])
            }
          })
      }
    )

    return () => {
      realtimeManager.unsubscribe("Post-all")
      realtimeManager.unsubscribe(`RoomMessage-roomId=eq.${roomId}`)
      realtimeManager.unsubscribe(`RoomMember-roomId=eq.${roomId}`)
    }
  }, [roomId, token])

  const handleSharePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      })

      const result = await response.json()
      if (result.success) {
        setSharedPosts(prev => [...prev, result.data])
      }
    } catch (error) {
      console.error("Failed to share post:", error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Share2 size={24} />
                Post Sharing Room
              </h2>
              <p className="text-muted-foreground">{room.description || "Share and discuss posts together"}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye size={16} />
              {members.length} members
            </div>
          </div>

          {/* Shared Posts */}
          <div className="space-y-4">
            {sharedPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No posts shared yet. Be the first to share something!</p>
              </div>
            ) : (
              sharedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </Card>
      </div>

      <div>
        <RoomChat
          messages={messages}
          onSendMessage={async (text) => {
            try {
              const response = await fetch(`/api/rooms/${roomId}/messages`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: text }),
              })

              const result = await response.json()
              if (result.success) {
                setMessages(prev => [...prev, result.data])
              }
            } catch (error) {
              console.error("Failed to send message:", error)
            }
          }}
        />
      </div>
    </div>
  )
}

