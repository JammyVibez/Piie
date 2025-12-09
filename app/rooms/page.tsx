"use client"

import { useState, useEffect } from "react"
import { RoomCard } from "@/components/rooms/room-card"
import { CreateRoomModal } from "@/components/rooms/create-room-modal"
import { RoomLobby } from "@/components/rooms/room-lobby"
import type { Room, GameRoom } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, Gamepad2, Radio, Users, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function RoomsPage() {
  const { token } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRooms()
  }, [token])

  const fetchRooms = async () => {
    try {
      setIsLoading(true)
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch("/api/rooms", { headers })
      const result = await response.json()
      
      if (result.success) {
        setRooms(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      setRooms([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRoom = async (data: any) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: data.roomType,
          title: data.title,
          description: data.description,
          privacy: data.privacy,
          gameId: data.selectedGame,
          gameName: data.selectedGame,
          maxPlayers: data.maxMembers,
          maxMembers: data.maxMembers,
          difficulty: data.difficulty,
          platform: data.platform || "cross"
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setRooms([result.data, ...rooms])
        setIsCreateOpen(false)
      }
    } catch (error) {
      console.error("Error creating room:", error)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          team: "Team A" // Default to Team A, can be customized
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success("Successfully joined the room!")
        // Refresh rooms to get updated member count
        await fetchRooms()
        // Find and open the room
        const room = rooms.find(r => r.id === roomId)
        if (room && room.type === "game") {
          setSelectedRoom(room as GameRoom)
        }
      } else {
        toast.error(result.error || "Failed to join room")
      }
    } catch (error) {
      console.error("Error joining room:", error)
      toast.error("Failed to join room. Please try again.")
    }
  }

  const gameRooms = rooms.filter((r) => r.type === "game") as GameRoom[]

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10 bg-card/80">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-primary/30">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Ripple Rooms</h1>
              <p className="text-sm text-muted-foreground font-medium">24-hour gaming sessions • Play together</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)} 
            className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Section: Trending Rooms */}
        <section className="mb-16">
          <div className="mb-10">
            <h2 className="text-4xl font-bold text-balance mb-3 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">Trending Game Rooms</h2>
            <p className="text-muted-foreground text-lg">Join live gaming sessions and compete with players worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onClick={() => setSelectedRoom(room as GameRoom)}
                onJoin={() => handleJoinRoom(room.id)}
              />
            ))}
          </div>
        </section>

        {/* Section: Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl transition-shadow">
            <p className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              Active Rooms
            </p>
            <p className="text-5xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              {rooms.filter((r) => r.isLive).length}
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl transition-shadow">
            <p className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Total Players
            </p>
            <p className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
              {rooms.reduce((acc, r) => acc + r.members.length, 0)}
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 shadow-xl hover:shadow-2xl transition-shadow">
            <p className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-green-500" />
              Rooms Available
            </p>
            <p className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
              {rooms.filter((r) => r.privacy === "public").length}
            </p>
          </div>
        </section>
      </div>

      {/* Modals */}
      <CreateRoomModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateRoom} />

      {selectedRoom && (
        <RoomLobby
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onStartMatch={() => {
            // Later: Start match
          }}
        />
      )}
    </main>
  )
}
