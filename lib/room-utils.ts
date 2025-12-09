import type { Room, RoomType } from "./types"

export const GAME_LIST = [
  { id: "ff", name: "Free Fire", icon: "🔥", platform: "mobile" },
  { id: "codm", name: "Call of Duty Mobile", icon: "🎯", platform: "mobile" },
  { id: "fortnite", name: "Fortnite", icon: "🏗️", platform: "cross" },
  { id: "pubgm", name: "PUBG Mobile", icon: "🎖️", platform: "mobile" },
  { id: "valorant", name: "Valorant", icon: "⚔️", platform: "pc" },
  { id: "apex", name: "Apex Legends", icon: "🦊", platform: "cross" },
  { id: "lol", name: "League of Legends", icon: "⚡", platform: "pc" },
  { id: "ml", name: "Mobile Legends", icon: "👑", platform: "mobile" },
]

export function getRoomTypeLabel(type: RoomType): string {
  const labels: Record<RoomType, string> = {
    game: "Game Room",
    post_sharing: "Post Sharing",
    discussion: "Discussion",
    collab: "Collab Creation",
    vibe: "Vibe Room",
    anonymous: "Anonymous",
  }
  return labels[type] || type
}

export function getGameIcon(gameId: string): string {
  const game = GAME_LIST.find((g) => g.id === gameId)
  return game?.icon || "🎮"
}

export function getGameName(gameId: string): string {
  const game = GAME_LIST.find((g) => g.id === gameId)
  return game?.name || gameId
}

export function formatTimeUntilExpiry(expiresAt: Date): string {
  const now = new Date()
  const diff = expiresAt.getTime() - now.getTime()
  
  if (diff <= 0) return "Expired"
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function getAvailableSlots(room: Room): number {
  return room.maxMembers - room.members.length
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function generateLobbyCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function getRoomGradient(type: RoomType): string {
  const gradients: Record<RoomType, string> = {
    game: "from-red-500 via-red-600 to-orange-500",
    post_sharing: "from-blue-500 via-blue-600 to-cyan-500",
    discussion: "from-purple-500 via-purple-600 to-pink-500",
    collab: "from-green-500 via-green-600 to-emerald-500",
    vibe: "from-yellow-500 via-yellow-600 to-orange-500",
    anonymous: "from-gray-500 via-gray-600 to-slate-500",
  }
  return gradients[type] || "from-blue-500 to-cyan-500"
}

export function calculateRoomExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000)
}
