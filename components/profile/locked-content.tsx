"use client"

import { motion } from "framer-motion"
import { Lock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LockedContent() {
  return (
    <div className="relative py-20 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter">Digital Memories</h2>
        <div className="h-px flex-1 mx-8 bg-white/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 blur-sm grayscale pointer-events-none select-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl"
            style={{
              background: "var(--background-glass)",
              backdropFilter: "var(--backdrop-blur-glass)",
              border: "var(--border-glass)",
              boxShadow: "var(--shadow-glass)",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-12 rounded-3xl text-center max-w-md border-primary/20 shadow-[0_0_50px_rgba(var(--primary),0.1)]"
          style={{
            background: "var(--background-glass)",
            backdropFilter: "var(--backdrop-blur-glass)",
            border: "var(--border-glass)",
            boxShadow: "var(--shadow-glass)",
          }}
        >
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-4 uppercase tracking-tight">Unlock full profile</h3>
          <p className="text-muted-foreground mb-8 font-mono text-sm">
            Enter this world to view private artifacts, secure rooms, and unlocked abilities.
          </p>
          <Button className="w-full py-6 text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 transition-all hover:scale-105 group">
            <Eye className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Claim Identity
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
