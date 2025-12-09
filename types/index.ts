export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  status?: "online" | "away" | "offline"
  theme?: string
  createdAt: Date
}

export interface Community {
  id: string
  name: string
  description: string
  icon?: string
  banner?: string
  category: string
  members: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  communityId: string
  userId: string
  content: string
  type: "text" | "image" | "voice" | "file"
  reactions: Record<string, string[]>
  isEdited: boolean
  editedAt?: Date
  createdAt: Date
  forwardedFrom?: string
}

export interface Thread {
  id: string
  communityId: string
  userId: string
  title: string
  messageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: "mention" | "reaction" | "reply" | "join" | "event"
  read: boolean
  data: Record<string, unknown>
  createdAt: Date
}

export interface Event {
  id: string
  communityId: string
  title: string
  description: string
  startTime: Date
  endTime: Date
  location?: string
  attendees: string[]
  createdAt: Date
}

export interface Badge {
  id: string
  name: string
  icon: string
  criteria: string
  users: string[]
}
