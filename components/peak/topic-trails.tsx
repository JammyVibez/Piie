"use client"

import React, { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const TOPIC_TRAILS = [
  { id: 1, name: "Web Development", icon: "🌐" },
  { id: 2, name: "JavaScript", icon: "⚡" },
  { id: 3, name: "React", icon: "⚛️" },
  { id: 4, name: "Next.js", icon: "▲" },
  { id: 5, name: "TypeScript", icon: "📘" },
  { id: 6, name: "DevOps", icon: "🚀" },
  { id: 7, name: "Cloud", icon: "☁️" },
  { id: 8, name: "Database", icon: "🗄️" },
]

export default function TopicTrails() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeTrail, setActiveTrail] = React.useState(1)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="px-6 py-4 border-b border-border bg-card/50 relative">
      <div className="flex items-center gap-2">
        <button onClick={() => scroll("left")} className="p-1 hover:bg-muted rounded-lg transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide flex gap-3"
          style={{ scrollBehavior: "smooth" }}
        >
          {TOPIC_TRAILS.map((trail) => (
            <button
              key={trail.id}
              onClick={() => setActiveTrail(trail.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all transform flex items-center gap-2 trail-pulse ${
                activeTrail === trail.id
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              <span>{trail.icon}</span>
              {trail.name}
            </button>
          ))}
        </div>

        <button onClick={() => scroll("right")} className="p-1 hover:bg-muted rounded-lg transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
