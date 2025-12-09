"use client"

import type React from "react"
import { useState } from "react"
import { Heart, MessageCircle, Share2, Zap } from "lucide-react"
import PostComments from "./post-comments"
import PostOptions from "./post-options"

const MOOD_COLORS = {
  celebration: "from-yellow-400 to-orange-400",
  active: "from-red-500 to-orange-500",
  growing: "from-green-500 to-emerald-500",
  default: "from-primary to-accent",
}

const REACTIONS = ["❤️", "😂", "😮", "🔥", "👏", "✨"]

interface FeedPostProps {
  post: any
  onReaction: (emoji: string, e: React.MouseEvent) => void
}

export default function FeedPost({ post, onReaction }: FeedPostProps) {
  const [liked, setLiked] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [hoverMoodEmojis, setHoverMoodEmojis] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const moodColor = MOOD_COLORS[post.mood as keyof typeof MOOD_COLORS] || MOOD_COLORS.default

  return (
    <>
      <div className="p-6 hover:bg-muted/30 transition-colors relative max-md:p-4">
        {/* Engagement Graph on Left */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-chart-1 via-chart-2 to-chart-3 opacity-60" />

        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl flex-shrink-0 max-sm:w-10 max-sm:h-10">
              {post.avatar}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{post.author}</h4>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
          </div>
          <PostOptions postId={post.id} />
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-foreground text-pretty mb-4">{post.content}</p>

          {/* Post Type Specific Content */}
          {post.type === "poll" && post.poll && (
            <div className="space-y-2 mb-4">
              {post.poll.options.map((option: any, i: number) => {
                const percentage = post.poll.total > 0 ? (option.votes / post.poll.total) * 100 : 0
                return (
                  <div key={i} className="relative">
                    <div
                      className="absolute inset-0 h-10 bg-primary/10 rounded-lg"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between p-2">
                      <span className="text-sm font-medium">{option.text}</span>
                      <span className="text-xs text-muted-foreground">{option.votes}</span>
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-muted-foreground text-right mt-2">{post.poll.total} votes</p>
            </div>
          )}

          {post.type === "carousel" && post.images && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {post.images.map((img: string, i: number) => (
                <div
                  key={i}
                  className="flex-1 min-w-40 h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center text-4xl hover:scale-105 transition-transform cursor-pointer"
                >
                  {img}
                </div>
              ))}
            </div>
          )}

          {post.type === "livestream" && (
            <div className="mb-4 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg flex items-center gap-3 border border-red-500/30">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-red-600">LIVE NOW • {post.viewers} watching</span>
            </div>
          )}

          {post.type === "article" && (
            <div className="mb-4 p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs text-muted-foreground italic">{post.excerpt}</p>
            </div>
          )}

          {/* Tags */}
          {post.tags && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-primary/15 text-primary rounded-full hover:bg-primary/25 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Engagement Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
          <span>👍 {post.engagement.reactions}</span>
          <div className="flex gap-4">
            <span>💬 {post.engagement.comments}</span>
            <span>❤️ {post.engagement.likes}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between relative">
          <div className="flex gap-1">
            {/* Like Button */}
            <button
              onClick={(e) => {
                setLiked(!liked)
                if (!liked) onReaction("❤️", e)
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all max-sm:text-xs ${
                liked ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span className="text-xs">Like</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-all relative max-sm:text-xs"
              onMouseEnter={() => setHoverMoodEmojis(true)}
              onMouseLeave={() => setHoverMoodEmojis(false)}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">Reply</span>

              {hoverMoodEmojis && (
                <div className="absolute bottom-full left-0 mb-2 flex gap-1 bg-card border border-border rounded-lg p-2 pop-in">
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => onReaction(emoji, e)}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </button>

            {/* Share Button */}
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-all max-sm:text-xs">
              <Share2 className="w-4 h-4" />
              <span className="text-xs">Share</span>
            </button>
          </div>

          {/* Promote Button */}
          <button className="px-3 py-2 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-all flex items-center gap-1 max-sm:hidden">
            <Zap className="w-4 h-4" />
            Promote
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      <PostComments postId={post.id} isOpen={showComments} onClose={() => setShowComments(false)} />
    </>
  )
}
