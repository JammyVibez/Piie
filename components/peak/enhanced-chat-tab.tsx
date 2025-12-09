"use client"

import { useState, useEffect, useRef } from "react"
import { useMessages } from "@/hooks/use-messages"
import { useToast } from "@/hooks/use-toast"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageInput } from "@/components/chat/message-input"
import { MessageSearch } from "@/components/chat/message-search"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { Search } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface EnhancedChatTabProps {
  communityId: string
}

export function EnhancedChatTab({ communityId }: EnhancedChatTabProps) {
  const { messages, isLoading, hasMore, fetchMessages, sendMessage, addReaction } = useMessages(communityId)
  const { addToast } = useToast()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  // Load initial messages
  useEffect(() => {
    fetchMessages(1, searchQuery)
  }, [communityId])

  // Real-time message subscription
  useEffect(() => {
    const channel = supabase
      .channel(`community:${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'CommunityMessage',
          filter: `communityId=eq.${communityId}`,
        },
        (payload) => {
          // Refresh messages when new message arrives
          fetchMessages(1, searchQuery)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [communityId, supabase, searchQuery])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Infinite scroll observer
  const observerTarget = useInfiniteScroll({
    onLoadMore: () => {
      if (hasMore && !isLoading) {
        fetchMessages(2) // Load next page
      }
    },
    isLoading,
    hasMore,
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    fetchMessages(1, query)
  }

  const handleSendMessage = async (content: string) => {
    const success = await sendMessage(content, "text")
    if (success) {
      addToast("Message sent", "success")
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with search */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <h2 className="font-semibold">Chat</h2>
        <button onClick={() => setShowSearch(!showSearch)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Search className="h-5 w-5" />
        </button>
      </div>

      {/* Search bar */}
      {showSearch && <MessageSearch isOpen={showSearch} onSearch={handleSearch} onClose={() => setShowSearch(false)} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {/* Load more observer */}
        <div ref={observerTarget} className="py-4">
          {isLoading && <LoadingSpinner size="sm" text="Loading messages..." />}
        </div>

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            id={msg.id}
            author={`User ${msg.userId}`}
            content={msg.content}
            timestamp={new Date(msg.createdAt)}
            reactions={msg.reactions}
            onReact={(emoji) => addReaction(msg.id, emoji)}
          />
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && typingUsers.map((user) => <TypingIndicator key={user} username={user} />)}

        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput onSend={handleSendMessage} communityId={communityId} />
    </div>
  )
}
