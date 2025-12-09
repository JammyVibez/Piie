
"use client"

import type { GameRoom } from "@/lib/types"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getGameIcon, getGameName } from "@/lib/room-utils"
import { Users, Play, Copy, Radio, Video, Mic, MicOff, VideoOff, Link2, ExternalLink, Share2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface RoomLobbyProps {
  room: GameRoom
  onStartMatch?: () => void
  onClose?: () => void
  onGoLive?: () => void
  onShareInvite?: () => void
}

export function RoomLobby({ room, onStartMatch, onClose, onGoLive, onShareInvite }: RoomLobbyProps) {
  const [teams, setTeams] = useState(room.teams || {})
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState("Team A")

  const teamA = Object.values(teams)[0] || []
  const teamB = Object.values(teams)[1] || []

  const copyLobbyCode = () => {
    if (room.lobbyCode) {
      navigator.clipboard.writeText(room.lobbyCode)
      toast.success("Lobby code copied!")
    }
  }

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/rooms/${room.id}`
    navigator.clipboard.writeText(inviteUrl)
    toast.success("Invite link copied!")
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 border-b border-white/10 p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/40" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
          
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl shadow-lg shadow-primary/30">
                  {getGameIcon(room.gameId)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-1">{room.title}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      {getGameName(room.gameId)} • {room.difficulty}
                    </p>
                    {room.platform && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                        {room.platform}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Lobby code & invite */}
              <div className="flex items-center gap-3">
                {room.lobbyCode && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                    <span className="text-xs text-muted-foreground font-medium">Lobby Code:</span>
                    <span className="text-lg font-mono font-bold text-green-400">{room.lobbyCode}</span>
                    <Button size="sm" variant="ghost" onClick={copyLobbyCode} className="h-7 w-7 p-0">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={copyInviteLink}
                  className="bg-black/40 backdrop-blur-md border-white/10 hover:bg-black/60"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Copy Invite
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onShareInvite}
                  className="bg-black/40 backdrop-blur-md border-white/10 hover:bg-black/60"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/10">
              ✕
            </Button>
          </div>

          {/* Live/Voice controls */}
          <div className="relative flex items-center gap-2 mt-4">
            <Button
              size="sm"
              variant={isVoiceEnabled ? "default" : "outline"}
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={isVoiceEnabled ? "bg-green-500 hover:bg-green-600" : "bg-black/40 backdrop-blur-md border-white/10"}
            >
              {isVoiceEnabled ? <Mic className="w-4 h-4 mr-2" /> : <MicOff className="w-4 h-4 mr-2" />}
              Voice
            </Button>
            <Button
              size="sm"
              variant={isVideoEnabled ? "default" : "outline"}
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={isVideoEnabled ? "bg-blue-500 hover:bg-blue-600" : "bg-black/40 backdrop-blur-md border-white/10"}
            >
              {isVideoEnabled ? <Video className="w-4 h-4 mr-2" /> : <VideoOff className="w-4 h-4 mr-2" />}
              Video
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onGoLive}
              className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-md border-red-500/30 hover:from-red-500/30 hover:to-orange-500/30"
            >
              <Radio className="w-4 h-4 mr-2" />
              Go Live
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Team A */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                <h3 className="font-bold text-lg">Team A</h3>
                <span className="ml-auto text-sm text-muted-foreground">{teamA.length} players</span>
              </div>
              <div className="space-y-2">
                {room.members.filter(m => m.team === "Team A").map((member) => (
                  <div
                    key={member.userId}
                    className="p-4 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm border border-white/5 flex items-center gap-3 hover:border-blue-500/30 transition-colors"
                  >
                    <Avatar className="w-10 h-10 border-2 border-blue-500/30">
                      <AvatarImage src={member.user?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{member.user?.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{member.user?.username}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                        {member.role === "owner" && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 text-xs font-bold border border-yellow-500/30">
                            Host
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${member.readyState ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" : "bg-gray-500"}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                <h3 className="font-bold text-lg">Team B</h3>
                <span className="ml-auto text-sm text-muted-foreground">{teamB.length} players</span>
              </div>
              <div className="space-y-2">
                {room.members.filter(m => m.team === "Team B").length > 0 ? (
                  room.members.filter(m => m.team === "Team B").map((member) => (
                    <div
                      key={member.userId}
                      className="p-4 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm border border-white/5 flex items-center gap-3 hover:border-red-500/30 transition-colors"
                    >
                      <Avatar className="w-10 h-10 border-2 border-red-500/30">
                        <AvatarImage src={member.user?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{member.user?.username[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{member.user?.username}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${member.readyState ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse" : "bg-gray-500"}`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-medium">Waiting for players...</p>
                    <p className="text-xs mt-1">Invite friends to join Team B</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game launch instructions */}
          <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20 backdrop-blur-sm mb-6">
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary" />
              How to Play
            </h4>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
                <span>Copy the lobby code above and open {getGameName(room.gameId)} on your device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
                <span>Enter the lobby code in the game to join the match</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
                <span>Tap "Go Live" above to stream your gameplay to the room</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span>
                <span>After the match, share your highlights and results here!</span>
              </li>
            </ol>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm border border-white/5 text-center">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Players</p>
              <p className="text-3xl font-bold">{room.members.length}/{room.maxPlayers}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm border border-white/5 text-center">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Ready</p>
              <p className="text-3xl font-bold text-green-600">{room.members.filter((m) => m.readyState).length}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm border border-white/5 text-center">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Difficulty</p>
              <p className="text-sm font-bold capitalize mt-2">{room.difficulty}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm border border-white/5 text-center">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Mode</p>
              <p className="text-sm font-bold capitalize mt-2">{room.privacy}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 p-6 bg-muted/30 backdrop-blur-sm flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 bg-transparent border-white/10 hover:bg-white/5 rounded-xl" 
            onClick={async () => {
              try {
                // Call leave API
                const response = await fetch(`/api/rooms/${room.id}/leave`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" }
                })
                if (response.ok) {
                  onClose?.()
                }
              } catch (error) {
                console.error("Error leaving room:", error)
              }
            }}
          >
            Leave Room
          </Button>
          <Button 
            onClick={async () => {
              try {
                // Call ready API
                const response = await fetch(`/api/rooms/${room.id}/ready`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ready: true })
                })
                if (response.ok) {
                  onStartMatch?.()
                }
              } catch (error) {
                console.error("Error readying up:", error)
              }
            }}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-bold shadow-lg shadow-green-500/30"
          >
            <Play className="w-4 h-4 mr-2" />
            Ready Up
          </Button>
        </div>
      </div>
    </div>
  )
}
