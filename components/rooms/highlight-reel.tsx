"use client"

import { useState } from "react"
import { Play, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Highlight {
  id: string
  title: string
  thumbnail: string
  duration: number
  author: string
  likes: number
}

interface HighlightReelProps {
  highlights: Highlight[]
}

export function HighlightReel({ highlights }: HighlightReelProps) {
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null)

  if (highlights.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border/50 text-center">
        <p className="text-muted-foreground">No highlights recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Match Highlights</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {highlights.map((highlight) => (
          <button
            key={highlight.id}
            onClick={() => setSelectedHighlight(highlight)}
            className="relative group rounded-lg overflow-hidden h-24 bg-muted border border-border hover:border-primary transition-all"
          >
            <img
              src={highlight.thumbnail || "/placeholder.svg"}
              alt={highlight.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>

            {/* Duration */}
            <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-white text-xs font-semibold">
              {highlight.duration}s
            </div>

            {/* Info on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
              <p className="text-white text-xs font-semibold line-clamp-1">{highlight.title}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Highlight Modal */}
      {selectedHighlight && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-card rounded-3xl overflow-hidden glass">
            <div className="aspect-video bg-black flex items-center justify-center">
              <Play className="w-16 h-16 text-white opacity-50" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold">{selectedHighlight.title}</h3>
                <p className="text-sm text-muted-foreground">by {selectedHighlight.author}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button className="flex-1" onClick={() => setSelectedHighlight(null)}>
                  Close
                </Button>
                <Button variant="outline" className="bg-transparent">
                  <Heart className="w-4 h-4 mr-2" />
                  {selectedHighlight.likes}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
