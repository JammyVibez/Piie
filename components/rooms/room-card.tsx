
"use client"

import type { Room, GameRoom } from "@/lib/types"
import { getRoomTypeLabel, formatTimeUntilExpiry, getAvailableSlots, getGameIcon } from "@/lib/room-utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Users, Clock, Zap, Lock, Globe, Play, Trophy, Radio, Video, Mic } from "lucide-react"
import { useState } from "react"

interface RoomCardProps {
  room: Room
  onJoin?: () => void
  onClick?: () => void
}

export function RoomCard({ room, onJoin, onClick }: RoomCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const availableSlots = getAvailableSlots(room)
  const timeLeft = formatTimeUntilExpiry(room.expiresAt)
  const isGameRoom = room.type === "game"
  const gameRoom = isGameRoom ? (room as GameRoom) : null

  const roomGradient = {
    game: "from-red-500/20 via-orange-500/20 to-yellow-500/20",
    post_sharing: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
    discussion: "from-purple-500/20 via-pink-500/20 to-rose-500/20",
    collab: "from-green-500/20 via-emerald-500/20 to-lime-500/20",
    vibe: "from-yellow-500/20 via-amber-500/20 to-orange-500/20",
  }

  const bgGradient = roomGradient[room.type as keyof typeof roomGradient] || "from-blue-500/20 to-cyan-500/20"

  return (
    <div
      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 hover:border-primary/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Animated background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      {/* Top decorative bar */}
      <div className={`relative h-32 bg-gradient-to-br ${bgGradient.replace('/20', '/40')} overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/80" />
        
        {/* Animated orbs */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        
        {/* Room type badge */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-1.5 border border-white/10">
          {room.type === "game" && <Play className="w-3.5 h-3.5" />}
          {room.type === "discussion" && <Trophy className="w-3.5 h-3.5" />}
          {room.type !== "game" && room.type !== "discussion" && <Zap className="w-3.5 h-3.5" />}
          {getRoomTypeLabel(room.type)}
        </div>

        {/* Status indicators */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {room.isLive && (
            <div className="px-3 py-1.5 bg-red-500/90 backdrop-blur-md text-white rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse border border-red-300/30">
              <Radio className="w-3.5 h-3.5" />
              LIVE
            </div>
          )}
          {gameRoom?.isStreaming && (
            <div className="px-3 py-1.5 bg-purple-500/90 backdrop-blur-md text-white rounded-full text-xs font-bold flex items-center gap-1.5 border border-purple-300/30">
              <Video className="w-3.5 h-3.5" />
              STREAMING
            </div>
          )}
          {gameRoom?.voiceChannelActive && (
            <div className="px-2.5 py-1.5 bg-green-500/90 backdrop-blur-md text-white rounded-full flex items-center border border-green-300/30">
              <Mic className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Privacy badge */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
          {room.privacy === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {room.privacy}
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg line-clamp-2 text-balance leading-tight mb-2">{room.title}</h3>
          {room.description && <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-3">{room.description}</p>}
          
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 border-2 border-primary/30 ring-2 ring-primary/10">
              <AvatarImage src={room.owner.avatar || "/placeholder.svg"} />
              <AvatarFallback>{room.owner.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground font-medium truncate block">@{room.owner.username}</span>
            </div>
          </div>
        </div>

        {gameRoom && (
          <div className="relative p-4 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl border border-primary/20 backdrop-blur-sm overflow-hidden group-hover:border-primary/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-start gap-3">
              <span className="text-3xl">{getGameIcon(gameRoom.gameId)}</span>
              <div className="flex-1">
                <p className="text-sm font-bold mb-1">{gameRoom.gameName}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {gameRoom.difficulty && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium border border-primary/30">
                      {gameRoom.difficulty}
                    </span>
                  )}
                  {gameRoom.platform && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground font-medium">
                      {gameRoom.platform}
                    </span>
                  )}
                  {gameRoom.lobbyCode && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 font-mono font-bold border border-green-500/30">
                      {gameRoom.lobbyCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {gameRoom.matchSchedule && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5 relative">
                <Clock className="w-3.5 h-3.5" />
                Match in {Math.ceil((gameRoom.matchSchedule.getTime() - Date.now()) / 60000)} mins
              </p>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-br from-muted/60 to-muted/30 rounded-xl backdrop-blur-sm border border-white/5">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Players</div>
            <div className="text-sm font-bold flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-primary" />
              {room.members.length}/{room.maxMembers}
            </div>
          </div>
          <div className="text-center border-l border-r border-border/50">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Slots</div>
            <div className={`text-sm font-bold ${availableSlots > 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {availableSlots}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Expires</div>
            <div className="text-xs font-semibold text-orange-600 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {timeLeft}
            </div>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation()
            onJoin?.()
          }}
          disabled={availableSlots === 0}
          className={`w-full rounded-xl font-semibold transition-all duration-300 ${
            availableSlots === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary hover:to-primary hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]"
          }`}
        >
          {availableSlots === 0 ? "Room Full" : `Join Room (${availableSlots} slot${availableSlots !== 1 ? 's' : ''})`}
        </Button>
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  )
}
