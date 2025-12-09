// User Types
export type UserRole = "creator" | "analyst" | "entertainer" | "educator" | "explorer"
export type WorkerRole = "admin" | "mod" | "developer" | "support"
export type BadgeRarity = "common" | "rare" | "epic" | "legendary"

export interface Badge {
  id: string
  name: string
  icon: string
  rarity: BadgeRarity
}

export interface Achievement {
  id: string
  name: string
  icon: string
  description: string
  rarity: BadgeRarity
  unlockedAt: Date
}

export interface User {
  id: string
  name: string
  username?: string
  email?: string
  userRole: UserRole
  workerRole?: WorkerRole
  level: number
  xp: number
  influenceScore: number
  followers: number
  following: number
  bio?: string
  joinedDate?: string
  location?: string
  badges: Badge[]
  achievements?: Achievement[]
  avatar?: string
  bannerImage?: string
  realm?: string
  isOnline?: boolean
  lastSeen?: Date
}

// Post Types
export type PostRarity = "common" | "rare" | "epic" | "legendary"
export type PostType = "post" | "insight" | "media" | "poll" | "video"
export type PostVisibility = "public" | "followers" | "private"

export interface PollOption {
  id: string
  text: string
  votes: number
  percentage?: number
}

export interface Poll {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
  endsAt?: Date
  isMultipleChoice?: boolean
  hasVoted?: boolean
  votedOptionId?: string
}

export interface Post {
  id: string
  author: User
  title: string
  description: string
  content?: string
  image?: string
  images?: string[]
  video?: string
  videoThumbnail?: string
  videoDuration?: number
  poll?: Poll
  postType?: PostType
  visibility?: PostVisibility
  likes: number
  comments: number
  shares?: number
  views?: number
  tags: string[]
  rarity: PostRarity
  rating?: number
  createdAt: Date
  updatedAt?: Date
  isLiked?: boolean
  isBookmarked?: boolean
  scheduledFor?: Date
  isScheduled?: boolean
}

// Message Types
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed"

export interface Message {
  id: string
  sender: User
  receiver: User
  content: string
  timestamp: Date
  read: boolean
  status?: MessageStatus
  replyTo?: Message
  reactions?: MessageReaction[]
  attachments?: MessageAttachment[]
  isEdited?: boolean
  editedAt?: Date
}

export interface MessageReaction {
  emoji: string
  userId: string
  timestamp: Date
}

export interface MessageAttachment {
  id: string
  type: "image" | "video" | "file" | "audio"
  url: string
  name: string
  size?: number
  thumbnail?: string
}

// Conversation Types
export interface Conversation {
  id: string
  user1: User
  user2: User
  lastMessage?: Message
  unreadCount: number
  lastUpdated: Date
  isPinned?: boolean
  isMuted?: boolean
  isArchived?: boolean
}

// Trending Types
export interface TrendingTopic {
  id: string
  name: string
  hashtag: string
  posts: number
  trend: string
  color?: string
  category?: string
}

export interface TrendingPost {
  id: string
  title: string
  author: string
  authorAvatar?: string
  likes: number
  comments: number
  trending: number
  image?: string
  tags?: string[]
}

export interface TrendingCreator {
  id: string
  name: string
  username?: string
  followers: number
  role: string
  avatar?: string
  isVerified?: boolean
  growth?: string
}

export interface TrendingRealm {
  id: string
  name: string
  members: number
  trend: string
  icon: string
  description?: string
  category?: string
}

// Report Types
export type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "violence"
  | "nudity"
  | "false_info"
  | "copyright"
  | "other"

export interface Report {
  id: string
  reporterId: string
  targetId: string
  targetType: "user" | "post" | "message" | "comment"
  reason: ReportReason
  description?: string
  status: "pending" | "reviewing" | "resolved" | "dismissed"
  createdAt: Date
  resolvedAt?: Date
}

// Notification Types
export type NotificationType = "like" | "comment" | "follow" | "mention" | "message" | "system"

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  sender?: User
  targetId?: string
  targetType?: string
  read: boolean
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Comment Types
export interface Comment {
  id: string
  postId: string
  author: User
  content: string
  likes: number
  replies?: Comment[]
  parentId?: string
  createdAt: Date
  updatedAt?: Date
  isLiked?: boolean
}

// Bookmark Types
export interface Bookmark {
  id: string
  userId: string
  postId: string
  collectionId?: string
  createdAt: Date
}

export interface BookmarkCollection {
  id: string
  userId: string
  name: string
  color: string
  count: number
  createdAt: Date
}
