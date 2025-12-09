"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import CommunityHeader from "./community-header"
import TopicTrails from "./topic-trails"
import FeedPost from "./feed-post"
import ChatTab from "./tabs/chat-tab"
import MediaTab from "./tabs/media-tab"
import ThreadsTab from "./tabs/threads-tab"
import EventsTab from "./tabs/events-tab"
import MembersTab from "./tabs/members-tab"
import AboutTab from "./tabs/about-tab"
import AdminDashboard from "./admin-dashboard"
import CreatePostModal from "./create-post-modal"
import { useAuth } from "@/contexts/auth-context"

interface Post {
  id: string | number
  author: string
  avatar: string
  timestamp: string
  type: string
  content: string
  excerpt?: string
  images?: string[]
  poll?: {
    options: Array<{ text: string; votes: number }>
    total: number
  }
  viewers?: number
  engagement: { likes: number; comments: number; reactions: number }
  tags: string[]
  mood?: string
}

interface MiddleContentProps {
  mood: string
  onMoodChange: (mood: string) => void
  selectedCommunity: string
  activeTab: string
  onTabChange: (tab: string) => void
  onOpenRightSidebar?: () => void
}

export default function MiddleContent({
  mood,
  onMoodChange,
  selectedCommunity,
  activeTab,
  onTabChange,
  onOpenRightSidebar,
}: MiddleContentProps) {
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; x: number; y: number }>>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [headerCollapsed, setHeaderCollapsed] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const feedRef = useRef<HTMLDivElement>(null)
  const { token } = useAuth()

  useEffect(() => {
    if (selectedCommunity && activeTab === "posts") {
      fetchPosts(1)
    }
  }, [selectedCommunity, activeTab])

  const fetchPosts = async (pageNum: number, append = false) => {
    if (!append) {
      setIsLoading(true)
    }
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(
        `/api/communities/${selectedCommunity}/posts?page=${pageNum}&limit=10`,
        { headers }
      )
      const result = await response.json()

      if (result.success) {
        const formattedPosts = result.data.items.map((p: any) => ({
          id: p.id,
          author: p.author?.name || p.author?.username || "Unknown",
          avatar: p.author?.avatar || "/placeholder.svg",
          timestamp: formatTimestamp(p.createdAt),
          type: p.postType || "text",
          content: p.content || p.description || "",
          images: p.images || [],
          engagement: {
            likes: p.likesCount || 0,
            comments: p.commentsCount || 0,
            reactions: p.reactionsCount || 0,
          },
          tags: p.tags || [],
          mood: p.mood,
        }))

        if (append) {
          setPosts((prev) => [...prev, ...formattedPosts])
        } else {
          setPosts(formattedPosts)
        }
        setHasMore(result.data.hasMore)
        setPage(pageNum)
      }
    } catch (error) {
      console.error("Failed to fetch community posts:", error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr)
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const handleReaction = (emoji: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const newId = Date.now()
    setFloatingEmojis((prev) => [
      ...prev,
      {
        id: newId,
        emoji,
        x: rect.x,
        y: rect.y,
      },
    ])

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== newId))
    }, 1000)
  }

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget
      const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 500

      if (isNearBottom && !isLoadingMore && hasMore && activeTab === "posts") {
        setIsLoadingMore(true)
        fetchPosts(page + 1, true)
      }
    },
    [isLoadingMore, activeTab, hasMore, page],
  )

  return (
    <div className="flex-1 flex flex-col border-r border-border overflow-hidden bg-background max-lg:border-r-0">
      <div className="relative z-20 flex-shrink-0">
        <CommunityHeader
          mood={mood}
          onMoodChange={onMoodChange}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onCreatePost={() => setShowCreateModal(true)}
          isCollapsed={headerCollapsed}
          onToggleCollapse={() => setHeaderCollapsed(!headerCollapsed)}
          onOpenRightSidebar={onOpenRightSidebar}
        />
      </div>

      {activeTab === "posts" && !headerCollapsed && <TopicTrails />}

      <div ref={feedRef} className="flex-1 overflow-y-auto relative z-10" onScroll={handleScroll}>
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="fixed float-emoji text-2xl pointer-events-none"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
          >
            {item.emoji}
          </div>
        ))}

        {activeTab === "posts" && (
          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No posts in this community yet. Be the first to share something!
              </div>
            ) : (
              posts.map((post) => (
                <FeedPost key={post.id} post={post} onReaction={handleReaction} />
              ))
            )}
            {isLoadingMore && (
              <div className="p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}

        {activeTab === "chat" && <ChatTab />}
        {activeTab === "media" && <MediaTab />}
        {activeTab === "threads" && <ThreadsTab />}
        {activeTab === "events" && <EventsTab />}
        {activeTab === "members" && <MembersTab />}
        {activeTab === "about" && <AboutTab />}
        {activeTab === "admin" && <AdminDashboard communityId={selectedCommunity} isAdmin={true} />}
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreate={(post) => {
            setPosts((prev) => [post, ...prev])
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}
