"use client"

import { Video } from "lucide-react"

const MEDIA_ITEMS = [
  { id: 1, type: "image", name: "P!!E Launch Hero", author: "Sarah Chen", date: "Dec 4", icon: "📸", views: 1240 },
  {
    id: 2,
    type: "video",
    name: "Community Building Tips",
    author: "Marcus Dev",
    date: "Dec 3",
    icon: "🎥",
    views: 2100,
  },
  {
    id: 3,
    type: "image",
    name: "Midnight Theme Preview",
    author: "Design Team",
    date: "Dec 2",
    icon: "🎨",
    views: 856,
  },
  { id: 4, type: "audio", name: "Podcast Episode #5", author: "Alex Podcast", date: "Dec 1", icon: "🎙️", views: 523 },
  {
    id: 5,
    type: "document",
    name: "P!!E API Documentation",
    author: "Dev Team",
    date: "Nov 30",
    icon: "📄",
    views: 342,
  },
  { id: 6, type: "video", name: "Live Q&A Recording", author: "Sarah Chen", date: "Nov 28", icon: "🎬", views: 1876 },
]

export default function MediaTab() {
  return (
    <div className="p-6">
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { label: "All", icon: "📁" },
          { label: "Images", icon: "📸" },
          { label: "Videos", icon: "🎥" },
          { label: "Audio", icon: "🎙️" },
          { label: "Documents", icon: "📄" },
        ].map((filter) => (
          <button
            key={filter.label}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium whitespace-nowrap transition-all"
          >
            <span>{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MEDIA_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
              {item.icon}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <button className="opacity-0 group-hover:opacity-100 p-3 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-all">
                <Video className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="p-3">
              <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">{item.author}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.date}</span>
                <span>{item.views} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
