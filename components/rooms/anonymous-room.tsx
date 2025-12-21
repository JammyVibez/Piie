"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Eye, EyeOff, Users } from "lucide-react"
import { realtimeManager } from "@/lib/realtime/subscriptions"

interface AnonymousRoomProps {
  roomId: string
  room: any
  currentUser: any
  token: string
}

interface AnonymousMessage {
  id: string
  content: string
  anonymousName: string
  createdAt: Date
}

export function AnonymousRoom({ roomId, room, currentUser, token }: AnonymousRoomProps) {
  const [messages, setMessages] = useState<AnonymousMessage[]>([])
  const [input, setInput] = useState("")
  const [anonymousName, setAnonymousName] = useState("")
  const [memberCount, setMemberCount] = useState(room.members?.length || 0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate or load anonymous name
  useEffect(() => {
    const storedName = localStorage.getItem(`anonymous_name_${roomId}`)
    if (storedName) {
      setAnonymousName(storedName)
    } else {
      const names = ["Anonymous", "Mystery", "Shadow", "Ghost", "Phantom", "Stranger", "Unknown"]
      const randomName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000)
      setAnonymousName(randomName)
      localStorage.setItem(`anonymous_name_${roomId}`, randomName)
    }
  }, [roomId])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const result = await response.json()
        if (result.success) {
          // Get room members to map anonymous names
          const roomRes = await fetch(`/api/rooms/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const roomResult = await roomRes.json()
          const membersMap = new Map()
          if (roomResult.success) {
            roomResult.data.members?.forEach((m: any) => {
              if (m.anonymousName) {
                membersMap.set(m.userId, m.anonymousName)
              }
            })
          }

          setMessages(result.data.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            anonymousName: membersMap.get(msg.user?.id) || msg.anonymousName || "Anonymous",
            createdAt: new Date(msg.createdAt),
          })))
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      }
    }

    fetchMessages()
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
                const msg = result.data
                // Get anonymous name from room member if available
                fetch(`/api/rooms/${roomId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                  .then(roomRes => roomRes.json())
                  .then(roomResult => {
                    if (roomResult.success) {
                      const member = roomResult.data.members?.find((m: any) => m.userId === msg.user?.id)
                      const anonName = member?.anonymousName || msg.anonymousName || `Anonymous${Math.floor(Math.random() * 1000)}`
                      setMessages(prev => [...prev, {
                        id: msg.id,
                        content: msg.content,
                        anonymousName: anonName,
                        createdAt: new Date(msg.createdAt),
                      }])
                    }
                  })
              }
            })
        }
      }
    )

    // Subscribe to member count
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
              setMemberCount(result.data.members?.length || 0)
            }
          })
      }
    )

    return () => {
      realtimeManager.unsubscribe(`RoomMessage-roomId=eq.${roomId}`)
      realtimeManager.unsubscribe(`RoomMember-roomId=eq.${roomId}`)
    }
  }, [roomId, token])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: input,
          anonymousName: anonymousName,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setInput("")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <EyeOff size={24} />
              Anonymous Room
            </h2>
            <p className="text-muted-foreground">{room.description || "Chat anonymously"}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={16} />
            {memberCount} online
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto mb-4 space-y-3 p-4 bg-muted/20 rounded-lg">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
                <p className="text-xs mt-2">Your identity is hidden</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary">{msg.anonymousName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground break-words">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type a message (anonymous)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSend()
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim()}>
            <Send size={18} />
          </Button>
        </div>

        <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
          <EyeOff size={16} />
          <span>You're chatting as <strong className="text-primary">{anonymousName}</strong>. Your identity is hidden.</span>
        </div>
      </Card>
    </div>
  )
}

