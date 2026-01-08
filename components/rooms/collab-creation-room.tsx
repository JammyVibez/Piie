"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Layers, Users, Sparkles, GitBranch } from "lucide-react"
import { realtimeManager } from "@/lib/realtime/subscriptions"
import { RoomChat } from "./room-chat"
import { FusionPostCard } from "@/components/fusion-post-card"

interface CollabCreationRoomProps {
  roomId: string
  room: any
  currentUser: any
  token: string
}

export function CollabCreationRoom({ roomId, room, currentUser, token }: CollabCreationRoomProps) {
  const [fusionPost, setFusionPost] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [members, setMembers] = useState(room.members || [])
  const [contributions, setContributions] = useState<any[]>([])

  // Fetch fusion post
  useEffect(() => {
    if (room.fusionPostId) {
      const fetchFusionPost = async () => {
        try {
          const response = await fetch(`/api/fusion/${room.fusionPostId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const result = await response.json()
          if (result.success) {
            setFusionPost(result.data)
          }
        } catch (error) {
          console.error("Failed to fetch fusion post:", error)
        }
      }

      fetchFusionPost()
    }
  }, [room.fusionPostId, token])

  // Realtime subscriptions
  useEffect(() => {
    // Subscribe to fusion post updates
    if (room.fusionPostId) {
      const fusionChannel = realtimeManager.subscribeToTable(
        {
          table: "FusionLayer",
          event: "INSERT",
          filter: `fusionPostId=eq.${room.fusionPostId}`,
        },
        () => {
          // Reload fusion post when new layer is added
          if (room.fusionPostId) {
            fetch(`/api/fusion/${room.fusionPostId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
              .then(res => res.json())
              .then(result => {
                if (result.success) {
                  setFusionPost(result.data)
                }
              })
          }
        }
      )

      return () => {
        realtimeManager.unsubscribe(`FusionLayer-fusionPostId=eq.${room.fusionPostId}`)
      }
    }
  }, [room.fusionPostId, token])

  // Subscribe to room messages
  useEffect(() => {
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

    return () => {
      realtimeManager.unsubscribe(`RoomMessage-roomId=eq.${roomId}`)
    }
  }, [roomId, token])

  const handleAddLayer = async () => {
    // This would open a modal to add a layer to the fusion post
    // Implementation depends on your fusion layer creation UI
    console.log("Add layer clicked")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Layers size={24} />
                Collaborative Creation
              </h2>
              <p className="text-muted-foreground">{room.description || "Create together in real-time"}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={16} />
              {members.length} contributors
            </div>
          </div>

          {/* Fusion Post Display */}
          {fusionPost ? (
            <div className="mb-6">
              <FusionPostCard fusionPost={fusionPost} onAddLayer={handleAddLayer} />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No fusion post created yet</p>
              {room.ownerId === currentUser.id && (
                <Button onClick={handleAddLayer} className="mt-4">
                  Create Fusion Post
                </Button>
              )}
            </div>
          )}

          {/* Contributors */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <GitBranch size={18} />
              Contributors
            </h3>
            <div className="flex flex-wrap gap-2">
              {members.map((member: any) => (
                <div
                  key={member.userId}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/50"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{member.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.user?.name || "Unknown"}</span>
                </div>
              ))}
            </div>
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



