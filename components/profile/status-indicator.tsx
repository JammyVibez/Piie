"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Zap, Headphones, Heart } from "lucide-react"

const STATUS_OPTIONS = [
  { icon: Sparkles, text: "Feeling focused", emoji: "🔥", color: "text-primary" },
  { icon: Zap, text: "Building something cool", emoji: "⚡", color: "text-secondary" },
  { icon: Headphones, text: "Chilling", emoji: "🎧", color: "text-accent" },
  { icon: Heart, text: "In the zone", emoji: "✨", color: "text-white" },
]

export function LivingStatus() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(STATUS_OPTIONS[0])

  return (
    <div className="relative">
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className="status-live flex items-center gap-3 px-4 py-2 rounded-full glass-liquid cursor-pointer select-none group"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <currentStatus.icon className={`w-4 h-4 ${currentStatus.color} animate-pulse`} />

        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.span
              key="collapsed"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-[10px] font-black tracking-widest uppercase text-muted-foreground whitespace-nowrap"
            >
              {currentStatus.emoji}
            </motion.span>
          ) : (
            <motion.span
              key="expanded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-xs font-black tracking-tight text-foreground whitespace-nowrap"
            >
              {currentStatus.text} {currentStatus.emoji}
            </motion.span>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 rounded-full energy-glow opacity-30 pointer-events-none" />
      </motion.div>

      {/* Expanded selection popup */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-4 left-0 glass-liquid p-2 rounded-2xl z-50 min-w-[200px]"
          >
            <div className="grid gap-1">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.text}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentStatus(status)
                    setIsExpanded(false)
                    console.log("[v0] Status updated to:", status.text)
                  }}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left group/item"
                >
                  <div className="flex items-center gap-3">
                    <status.icon className={`w-4 h-4 ${status.color}`} />
                    <span className="text-xs font-bold">{status.text}</span>
                  </div>
                  <span className="text-sm group-hover/item:scale-125 transition-transform">{status.emoji}</span>
                </button>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-white/5 px-4 pb-2">
              <div className="flex gap-2 justify-center">
                {["❤️", "🔥", "⚡", "✨"].map((emoji) => (
                  <button key={emoji} className="text-xs hover:scale-125 transition-transform p-1">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
