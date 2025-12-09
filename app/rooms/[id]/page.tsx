"use client"

import { useState, useEffect, use } from "react"
import { LiveStreamWindow } from "@/components/rooms/live-stream-window"
import { ClipRecorder } from "@/components/rooms/clip-recorder"
import { MatchResults } from "@/components/rooms/match-results"
import { RoomChat } from "@/components/rooms/room-chat"
import { HighlightReel } from "@/components/rooms/highlight-reel"
import { Button } from "@/components/ui/button"
import { Video, MessageSquare, Trophy, Zap, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

interface ChatMessage {
  id: string
  username: string
  avatar: string
  text: string
  timestamp: Date
}

interface RoomData {
  id: string
  title: string
  description: string
  isLive: boolean
  maxMembers: number
  difficulty: string
  owner: {
    id: string
    name: string
    username: string
    avatar: string
  }
  members: Array<{
    userId: string
    user: {
      id: string
      name: string
      username: string
      avatar: string
    }
    role: string
  }>
}

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { token, user } = useAuth()
  const [room, setRoom] = useState<RoomData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiveOpen, setIsLiveOpen] = useState(false)
  const [isClipOpen, setIsClipOpen] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [highlights, setHighlights] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    fetchRoom()
    fetchMessages()
    fetchHighlights()
  }, [resolvedParams.id])

  const fetchRoom = async () => {
    try {
      setIsLoading(true)
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch(`/api/rooms/${resolvedParams.id}`, { headers })
      const result = await response.json()

      if (result.success) {
        setRoom(result.data)
        if (result.data.isLive) {
          setIsLiveOpen(true)
        }
      }
    } catch (error) {
      console.error("Error fetching room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch(`/api/rooms/${resolvedParams.id}/messages`, { headers })
      const result = await response.json()

      if (result.success && result.data) {
        setMessages(result.data.map((msg: any) => ({
          id: msg.id,
          username: msg.user?.username || msg.user?.name || "Unknown",
          avatar: msg.user?.avatar || "/placeholder.svg",
          text: msg.content,
          timestamp: new Date(msg.createdAt)
        })))
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const fetchHighlights = async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch(`/api/rooms/${resolvedParams.id}/highlights`, { headers })
      const result = await response.json()

      if (result.success && result.data) {
        setHighlights(result.data)
      }
    } catch (error) {
      console.error("Error fetching highlights:", error)
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!token || !user) return

    try {
      const response = await fetch(`/api/rooms/${resolvedParams.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: text })
      })

      const result = await response.json()
      if (result.success) {
        const newMessage: ChatMessage = {
          id: result.data.id,
          username: user.username || user.name || "You",
          avatar: user.avatar || "/placeholder.svg",
          text,
          timestamp: new Date()
        }
        setMessages([...messages, newMessage])
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Room not found</p>
        <Link href="/rooms">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} /> Back to Rooms
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="border-b border-border/50 bg-black/20 backdrop-blur-md p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/rooms">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{room.title}</h1>
                <p className="text-muted-foreground mt-1">
                  {room.members.length}/{room.maxMembers} players | {room.difficulty || "casual"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {room.isLive && (
                <div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-sm font-bold text-red-500">LIVE</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full aspect-video bg-black rounded-2xl border border-border/50 flex items-center justify-center overflow-hidden glass">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-red-500" />
                </div>
                <p className="text-white font-bold">{room.isLive ? "Live Stream Active" : "Stream Not Started"}</p>
                <p className="text-gray-400 text-sm mt-2">{room.members.length} participants</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => setIsClipOpen(true)}
                variant="outline"
                className="bg-transparent border-white/20 text-foreground hover:bg-white/10"
              >
                <Video className="w-4 h-4 mr-2" />
                Record Clip
              </Button>
              <Button
                onClick={() => setShowResults(true)}
                variant="outline"
                className="bg-transparent border-white/20 text-foreground hover:bg-white/10"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Results
              </Button>
              <Button variant="outline" className="bg-transparent border-white/20 text-foreground hover:bg-white/10">
                <MessageSquare className="w-4 h-4 mr-2" />
                More
              </Button>
            </div>

            <div>
              <HighlightReel highlights={highlights} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-96">
              <RoomChat messages={messages} onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>

      <ClipRecorder
        isOpen={isClipOpen}
        onClose={() => setIsClipOpen(false)}
        onUpload={(data) => {
          console.log("Clip uploaded:", data)
          setIsClipOpen(false)
        }}
      />

      {showResults && (
        <MatchResults
          roomTitle={room.title}
          gameIcon="🎮"
          results={results.length > 0 ? results : room.members.map((m, i) => ({
            userId: m.user.id,
            username: m.user.username || m.user.name,
            avatar: m.user.avatar || "/placeholder.svg",
            rank: i + 1,
            kills: 0,
            deaths: 0,
            score: 0,
            team: "Team A"
          }))}
          onClose={() => setShowResults(false)}
          onPublish={() => {
            console.log("Results published")
            setShowResults(false)
          }}
        />
      )}

      {isLiveOpen && room.isLive && (
        <LiveStreamWindow
          roomTitle={room.title}
          hostName={room.owner.username || room.owner.name}
          isMinimized={false}
          onMinimize={() => setIsLiveOpen(false)}
        />
      )}
    </main>
  )
}
