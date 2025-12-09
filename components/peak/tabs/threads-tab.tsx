"use client"

import { MessageSquare, Users, Clock } from "lucide-react"

const THREADS = [
  {
    id: 1,
    title: "How to scale React apps efficiently?",
    author: "Marcus Dev",
    avatar: "👨‍💻",
    replies: 24,
    participants: 8,
    lastMessage: "Use Next.js with App Router for better performance",
    lastAuthor: "Sarah Chen",
    time: "2h ago",
    views: 412,
    trending: true,
  },
  {
    id: 2,
    title: "Best design tools for 2025?",
    author: "Design Team",
    avatar: "🎨",
    replies: 18,
    participants: 5,
    lastMessage: "Figma is still the best, but consider Framer for interactions",
    lastAuthor: "Alex Designer",
    time: "4h ago",
    views: 287,
    trending: false,
  },
  {
    id: 3,
    title: "Anyone hiring junior developers?",
    author: "Job Seeker",
    avatar: "👤",
    replies: 12,
    participants: 9,
    lastMessage: "We are! Send your portfolios to careers@company.com",
    lastAuthor: "HR Manager",
    time: "6h ago",
    views: 542,
    trending: false,
  },
  {
    id: 4,
    title: "P!!E API v2.0 release discussion",
    author: "Dev Lead",
    avatar: "🚀",
    replies: 34,
    participants: 12,
    lastMessage: "Breaking changes documented in the migration guide",
    lastAuthor: "Documentation",
    time: "8h ago",
    views: 856,
    trending: true,
  },
]

export default function ThreadsTab() {
  return (
    <div className="divide-y divide-border">
      {THREADS.map((thread) => (
        <div
          key={thread.id}
          className="p-6 hover:bg-muted/30 transition-colors border-l-4 border-transparent hover:border-primary cursor-pointer group"
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg flex-shrink-0">
              {thread.avatar}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{thread.title}</h3>
                {thread.trending && (
                  <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-600 rounded-full font-medium">
                    Trending
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Started by <span className="font-medium">{thread.author}</span>
              </p>
            </div>
          </div>

          {/* Last Message */}
          <div className="bg-muted/30 p-3 rounded-lg mb-3 border border-border/50">
            <p className="text-sm text-foreground line-clamp-2">{thread.lastMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last by {thread.lastAuthor} • {thread.time}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{thread.replies} replies</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{thread.participants} participants</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{thread.views} views</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
