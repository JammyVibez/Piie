"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Users, Play, Pause, Settings, Crown } from "lucide-react"
import { realtimeManager } from "@/lib/realtime/subscriptions"
import { RoomChat } from "./room-chat"

interface GameRoomProps {
  roomId: string
  room: any
  currentUser: any
  token: string
}

export function GameRoom({ roomId, room, currentUser, token }: GameRoomProps) {
  const [members, setMembers] = useState(room.members || [])
  const [isLive, setIsLive] = useState(room.isLive || false)
  const [gameState, setGameState] = useState("waiting") // waiting, in_progress, completed
  const [messages, setMessages] = useState<any[]>([])
  const [readyStates, setReadyStates] = useState<Record<string, boolean>>({})

  // Realtime subscriptions
  useEffect(() => {
    // Subscribe to room member updates
    const memberChannel = realtimeManager.subscribeToTable(
      {
        table: "RoomMember",
        event: "*",
        filter: `roomId=eq.${roomId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          fetch(`/api/rooms/${roomId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(result => {
              if (result.success) {
                setMembers(result.data.members || [])
              }
            })
        } else if (payload.eventType === "DELETE") {
          setMembers(prev => prev.filter(m => m.user?.id !== (payload.old as any)?.userId))
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as any
          if (updated.readyState !== undefined && updated.userId) {
            setReadyStates(prev => ({ ...prev, [updated.userId]: updated.readyState }))
          }
        }
      }
    )

    // Subscribe to room updates
    const roomChannel = realtimeManager.subscribeToTable(
      {
        table: "Room",
        event: "UPDATE",
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        if (payload.eventType === "UPDATE" && payload.new) {
          const updated = payload.new as any
          setIsLive(updated.isLive || false)
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

    return () => {
      realtimeManager.unsubscribe(`RoomMember-roomId=eq.${roomId}`)
      realtimeManager.unsubscribe(`Room-id=eq.${roomId}`)
      realtimeManager.unsubscribe(`RoomMessage-roomId=eq.${roomId}`)
    }
  }, [roomId, token])

  const handleReady = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/ready`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ready: !readyStates[currentUser.id] }),
      })

      const result = await response.json()
      if (result.success) {
        setReadyStates(prev => ({ ...prev, [currentUser.id]: result.data.ready }))
      }
    } catch (error) {
      console.error("Failed to toggle ready:", error)
    }
  }

  const handleStartGame = async () => {
    if (currentUser.id !== room.ownerId) return

    try {
      const response = await fetch(`/api/rooms/${roomId}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()
      if (result.success) {
        setGameState("in_progress")
        setIsLive(true)
      }
    } catch (error) {
      console.error("Failed to start game:", error)
    }
  }

  const allReady = members.every(m => {
    const memberUserId = m.userId || m.user?.id
    return readyStates[memberUserId] || memberUserId === room.ownerId
  })
  const canStart = currentUser.id === room.ownerId && allReady && members.length >= 2

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Game Lobby */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{room.gameName || "Game Lobby"}</h2>
              <p className="text-muted-foreground">{room.difficulty || "Casual"}</p>
            </div>
            {isLive && (
              <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-bold text-red-500">LIVE</span>
              </div>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Users size={18} /> Players ({members.length}/{room.maxMembers})
            </h3>
            <div className="space-y-2">
              {members.map((member: any) => {
                const memberUserId = member.userId || member.user?.id
                return (
                  <div
                    key={memberUserId}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{member.user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {member.user?.name || "Unknown"}
                          {memberUserId === room.ownerId && <Crown size={14} className="text-yellow-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {readyStates[memberUserId] && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Ready</span>
                      )}
                      {memberUserId === currentUser.id && (
                        <Button size="sm" onClick={handleReady} variant="outline">
                          {readyStates[memberUserId] ? "Not Ready" : "Ready"}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Game Controls */}
          {gameState === "waiting" && (
            <div className="flex gap-3">
              {canStart && (
                <Button onClick={handleStartGame} className="flex-1 gap-2">
                  <Play size={18} />
                  Start Game
                </Button>
              )}
              {!canStart && currentUser.id === room.ownerId && (
                <Button disabled className="flex-1">
                  Waiting for players to be ready...
                </Button>
              )}
            </div>
          )}

          {gameState === "in_progress" && (
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="text-lg font-semibold">Game in Progress</p>
              <p className="text-sm text-muted-foreground mt-2">Good luck!</p>
            </div>
          )}
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

