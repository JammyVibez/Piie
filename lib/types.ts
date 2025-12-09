import type { User } from "@/components/types"

export type RoomType = "game" | "post_sharing" | "discussion" | "collab" | "vibe" | "anonymous"
export type RoomPrivacy = "public" | "private" | "friends_only" | "invite_code"
export type MemberRole = "owner" | "moderator" | "member" | "guest" | "spectator"
export type TeamName = string

export interface RoomMember {
  id?: string
  userId: string
  user?: User
  role: MemberRole
  joinedAt: Date
  readyState?: boolean
  team?: TeamName
  isAnonymous?: boolean
  anonymousName?: string
}

export interface BaseRoom {
  id: string
  owner: User
  type: RoomType
  title: string
  description?: string
  privacy: RoomPrivacy
  inviteCode?: string
  maxMembers: number
  members: RoomMember[]
  isLive: boolean
  createdAt: Date
  expiresAt: Date
  theme?: string
}

export interface GameRoom extends BaseRoom {
  type: "game"
  gameId: string
  gameName: string
  difficulty: "casual" | "competitive" | "practice"
  currentPlayers: number
  maxPlayers: number
  teams?: Record<string, string[]>
  matchSchedule?: Date
  lobbyCode?: string
  liveStreamUrl?: string
  isStreaming?: boolean
  platform?: "mobile" | "pc" | "cross"
  voiceChannelActive?: boolean
}

export interface PostSharingRoom extends BaseRoom {
  type: "post_sharing"
  posts: string[]
  allowedPostTypes: string[]
}

export interface DiscussionRoom extends BaseRoom {
  type: "discussion"
  topic: string
  isVoiceEnabled: boolean
  isVideoEnabled: boolean
}

export interface CollabRoom extends BaseRoom {
  type: "collab"
  fusionPostId?: string
  allowedLayerTypes: string[]
}

export interface VibeRoom extends BaseRoom {
  type: "vibe"
  mood: string
  playlist?: string[]
}

export interface AnonymousRoom extends BaseRoom {
  type: "anonymous"
  anonymousMode: boolean
}

export type Room = GameRoom | PostSharingRoom | DiscussionRoom | CollabRoom | VibeRoom | AnonymousRoom

export interface RoomPost {
  id: string
  roomId: string
  authorId: string
  content: string
  mediaUrl?: string
  likes: number
  createdAt: Date
}

export interface LiveSession {
  id: string
  roomId: string
  hostId: string
  type: "video" | "voice"
  startedAt: Date
  viewerCount: number
  isActive: boolean
}

export interface GameSession {
  id: string
  roomId: string
  gameId: string
  lobbyCode?: string
  platform: string
  status: "waiting" | "in_progress" | "completed"
  startedAt?: Date
  endedAt?: Date
}

export interface MatchResult {
  id: string
  sessionId: string
  rankings: PlayerRanking[]
  winningTeam?: TeamName
  createdAt: Date
}

export interface PlayerRanking {
  userId: string
  username: string
  avatar?: string
  rank: number
  kills?: number
  deaths?: number
  score: number
  team?: TeamName
}

export interface RoomMemory {
  id: string
  roomId: string
  topClips: Array<{
    id: string
    url: string
    title: string
    author: string
    likes: number
  }>
  topMembers: Array<{
    userId: string
    username: string
    avatar: string
    contributions: number
  }>
  finalStats?: Record<string, any>
  createdAt: Date
}

export type FusionLayerType = "text" | "image" | "video" | "draw" | "sticker" | "overlay"
export type FusionViewMode = "merged" | "timeline" | "step_through"
export type FusionPermission = "public" | "followers" | "invited" | "close_circle"
export type FusionModerationMode = "auto" | "pre_approve" | "none"

export interface FusionLayer {
  id: string
  fusionPostId: string
  authorId: string
  author?: User
  type: FusionLayerType
  content: string
  mediaUrl?: string
  position?: { x: number; y: number }
  order: number
  parentLayerId?: string
  likes: number
  createdAt: Date
  isApproved: boolean
}

export interface FusionPost {
  id: string
  owner: User
  ownerId: string
  title: string
  seedContent: string
  seedMediaUrl?: string
  seedType: FusionLayerType
  layers: FusionLayer[]
  privacy: FusionPermission
  contributionSettings: {
    allowedContributors: FusionPermission
    allowedLayerTypes: FusionLayerType[]
    moderationMode: FusionModerationMode
  }
  currentState: "active" | "locked" | "archived"
  viewMode: FusionViewMode
  forkCount: number
  forkedFromId?: string
  contributorCount: number
  contributors: User[]
  totalLayers: number
  createdAt: Date
  updatedAt: Date
}

export interface FusionReaction {
  id: string
  layerId: string
  userId: string
  type: "like" | "love" | "fire" | "wow"
  createdAt: Date
}