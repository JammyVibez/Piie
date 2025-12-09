"use client"

import { useState } from "react"
import { Users, MessageCircle, TrendingUp } from "lucide-react"

interface CommunityCardProps {
  community: {
    id: string
    name: string
    description: string
    members: number
    icon: string
    posts: number
    online: number
  }
  isJoined: boolean
  onJoin: () => void
  onSelect: () => void
  isTrending: boolean
}

export default function CommunityCard({ community, isJoined, onJoin, onSelect, isTrending }: CommunityCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-card rounded-2xl border border-border/50 hover:border-primary/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
    >
      {/* Background gradient on hover with 3D effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      
      {/* 3D Tilt Effect */}
      <div 
        className="relative p-6 flex flex-col h-full"
        style={{
          transform: isHovered ? 'perspective(1000px) rotateX(2deg)' : 'none',
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Icon and Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{community.icon}</div>
          {isTrending && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-600 rounded-full text-xs font-semibold animate-pulse">
              <TrendingUp className="w-3 h-3" />
              Trending
            </div>
          )}
        </div>

        {/* Title and Description */}
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{community.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">{community.description}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground border-t border-border/30 pt-3">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{(community.members / 1000).toFixed(1)}K</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{community.posts}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{community.online}</span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => {
            if (isJoined) {
              onSelect()
            } else {
              onJoin()
            }
          }}
          className={`w-full py-2 rounded-lg font-semibold transition-all duration-200 ${
            isJoined
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
          }`}
        >
          {isJoined ? "Open" : "Join"}
        </button>
      </div>
    </div>
  )
}
