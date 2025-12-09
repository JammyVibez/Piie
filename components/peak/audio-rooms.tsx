"use client"

import { useState } from "react"
import { Mic, MicOff, Phone, Users, Volume2 } from "lucide-react"

const AUDIO_ROOMS = [
  {
    id: 1,
    title: "Tech Talk Live",
    host: "Sarah Chen",
    icon: "🎙️",
    participants: 23,
    topic: "AI & Machine Learning",
    isLive: true,
    duration: "45 min",
  },
  {
    id: 2,
    title: "Design Critique Session",
    host: "Alex Designer",
    icon: "🎨",
    participants: 12,
    topic: "UI/UX Best Practices",
    isLive: true,
    duration: "1h 20m",
  },
  {
    id: 3,
    title: "Startup Founders Chat",
    host: "Marcus Dev",
    icon: "🚀",
    participants: 8,
    topic: "Building & Scaling",
    isLive: true,
    duration: "2h 15m",
  },
]

export default function AudioRooms() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string }>>([])

  const handleReactionClick = (emoji: string) => {
    const id = Date.now()
    setFloatingEmojis((prev) => [...prev, { id, emoji }])
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id))
    }, 2000)
  }

  const selectedAudioRoom = AUDIO_ROOMS.find((r) => r.id === selectedRoom)

  return (
    <div className="flex flex-col h-full">
      {!selectedRoom ? (
        <>
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold mb-2">Audio Rooms</h2>
            <p className="text-sm text-muted-foreground">Join live conversations with the community</p>
          </div>

          {/* Audio Rooms List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {AUDIO_ROOMS.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{room.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{room.title}</h3>
                      {room.isLive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                    </div>
                    <p className="text-sm text-muted-foreground">Hosted by {room.host}</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all whitespace-nowrap">
                    Join Room
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Topic</p>
                    <p className="font-semibold">{room.topic}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Participants</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {room.participants}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold">{room.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Active Room */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            {/* Floating Reactions */}
            {floatingEmojis.map((item) => (
              <div
                key={item.id}
                className="fixed float-emoji text-4xl pointer-events-none"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 60 + 20}%`,
                }}
              >
                {item.emoji}
              </div>
            ))}

            {/* Room Info */}
            <div className="text-center mb-12">
              <div className="text-8xl mb-4">{selectedAudioRoom?.icon}</div>
              <h2 className="text-3xl font-bold mb-2">{selectedAudioRoom?.title}</h2>
              <p className="text-lg text-muted-foreground mb-4">{selectedAudioRoom?.topic}</p>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{selectedAudioRoom?.participants} participants</span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                <div>
                  {selectedAudioRoom?.duration} <span className="text-red-500 font-semibold">● LIVE</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-12">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isMuted
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
              <button
                onClick={() => setSelectedRoom(null)}
                className="w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-all"
              >
                <Phone className="w-7 h-7" />
              </button>
              <button className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all">
                <Volume2 className="w-7 h-7" />
              </button>
            </div>

            {/* Reactions */}
            <div className="flex gap-2 mb-8">
              {["👏", "🔥", "❤️", "🎉", "😂", "🤔"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="w-12 h-12 rounded-full bg-muted hover:bg-primary/20 text-2xl hover:scale-125 transition-transform active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold transition-all">
                Save as Podcast
              </button>
              <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold transition-all">
                Share Room
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
