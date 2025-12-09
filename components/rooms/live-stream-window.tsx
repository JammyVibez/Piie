
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, Minimize2, Maximize2, Volume2, VolumeX, Radio, Users, MessageCircle } from "lucide-react"

interface LiveStreamWindowProps {
  roomTitle: string
  hostName: string
  isMinimized?: boolean
  onMinimize?: () => void
  viewerCount?: number
  isStreaming?: boolean
}

export function LiveStreamWindow({ 
  roomTitle, 
  hostName, 
  isMinimized, 
  onMinimize,
  viewerCount = 1247,
  isStreaming = true 
}: LiveStreamWindowProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [showChat, setShowChat] = useState(false)

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onMinimize}
          className="group relative w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 shadow-2xl hover:shadow-red-500/50 transition-all flex items-center justify-center text-white font-bold animate-pulse-soft overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="relative flex flex-col items-center gap-1">
            <Radio className="w-6 h-6" />
            <span className="text-xs">LIVE</span>
          </div>
          {/* Animated ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-ping" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-3xl overflow-hidden border-2 border-red-500/50 shadow-2xl shadow-red-500/30 backdrop-blur-xl">
      <div className="bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-2xl">
        {/* Video Stream */}
        <div className="relative w-full aspect-video bg-black overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
            <div className="text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 mx-auto mb-3 flex items-center justify-center backdrop-blur-sm border border-red-500/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 animate-pulse flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-white text-sm font-bold">Stream Active</p>
              <p className="text-gray-400 text-xs mt-1">Gameplay streaming...</p>
            </div>
          </div>

          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 via-transparent to-transparent animate-pulse-soft" />

          {/* Live Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg shadow-red-500/50 border border-white/20">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            LIVE
          </div>

          {/* Viewer Count */}
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/10">
            <Eye className="w-3.5 h-3.5 text-red-400" />
            {viewerCount.toLocaleString()}
          </div>

          {/* Controls */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
                className="h-9 w-9 p-0 bg-black/70 backdrop-blur-md text-white hover:bg-black/80 border border-white/10 rounded-xl"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowChat(!showChat)}
                className="h-9 w-9 p-0 bg-black/70 backdrop-blur-md text-white hover:bg-black/80 border border-white/10 rounded-xl"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onMinimize} 
              className="h-9 w-9 p-0 bg-black/70 backdrop-blur-md text-white hover:bg-black/80 border border-white/10 rounded-xl"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stream Info */}
        <div className="p-4 bg-gradient-to-br from-muted/60 to-muted/30 backdrop-blur-sm border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center border border-red-500/30">
              <Users className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold line-clamp-1">{roomTitle}</p>
              <p className="text-xs text-muted-foreground">Hosted by @{hostName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
