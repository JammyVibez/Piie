"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, Hash } from "lucide-react"
import { realtimeManager } from "@/lib/realtime/subscriptions"
import { RoomChat } from "./room-chat"

interface DiscussionRoomProps {
  roomId: string
  room: any
  currentUser: any
  token: string
}

interface DiscussionTopic {
  id: string
  title: string
  content: string
  author: any
  createdAt: Date
  replies: DiscussionReply[]
}

interface DiscussionReply {
  id: string
  content: string
  author: any
  createdAt: Date
}

export function DiscussionRoom({ roomId, room, currentUser, token }: DiscussionRoomProps) {
  const [topics, setTopics] = useState<DiscussionTopic[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newTopicTitle, setNewTopicTitle] = useState("")
  const [newTopicContent, setNewTopicContent] = useState("")
  const [showNewTopic, setShowNewTopic] = useState(false)

  // Fetch discussion topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // You'll need to create this API endpoint
        const response = await fetch(`/api/rooms/${roomId}/topics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTopics(result.data || [])
          }
        }
      } catch (error) {
        console.error("Failed to fetch topics:", error)
      }
    }

    fetchTopics()
  }, [roomId, token])

  // Realtime subscriptions
  useEffect(() => {
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

    return () => {
      realtimeManager.unsubscribe(`RoomMessage-roomId=eq.${roomId}`)
    }
  }, [roomId, token])

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return

    try {
      const response = await fetch(`/api/rooms/${roomId}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTopicTitle,
          content: newTopicContent,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setTopics(prev => [result.data, ...prev])
        setNewTopicTitle("")
        setNewTopicContent("")
        setShowNewTopic(false)
      }
    } catch (error) {
      console.error("Failed to create topic:", error)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare size={24} />
                Discussion Room
              </h2>
              <p className="text-muted-foreground">{room.description || "Discuss topics together"}</p>
            </div>
            <Button onClick={() => setShowNewTopic(!showNewTopic)}>
              New Topic
            </Button>
          </div>

          {/* New Topic Form */}
          {showNewTopic && (
            <Card className="p-4 mb-6 border-primary/20">
              <div className="space-y-4">
                <Input
                  placeholder="Topic title"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                />
                <textarea
                  placeholder="Start a discussion..."
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                  className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateTopic} size="sm">
                    Create Topic
                  </Button>
                  <Button onClick={() => setShowNewTopic(false)} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Discussion Topics */}
          <div className="space-y-4">
            {topics.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No topics yet. Start a discussion!</p>
              </div>
            ) : (
              topics.map((topic) => (
                <Card key={topic.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={topic.author?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{topic.author?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground">{topic.author?.name}</p>
                    </div>
                  </div>
                  <p className="text-foreground mb-3">{topic.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{topic.replies?.length || 0} replies</span>
                    <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
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



