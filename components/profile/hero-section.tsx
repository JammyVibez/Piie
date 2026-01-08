"use client"

import { motion } from "framer-motion"
import { ProfileAura } from "./aura"
import { Badge } from "@/components/ui/badge"
import { Shield, Sparkles, MapPin } from "lucide-react"

export function HeroSection({ user }: { user: any }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
      <ProfileAura vibe={user.vibe} />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative group cursor-none"
      >
        <div className="w-48 h-48 rounded-full border-4 border-primary/50 overflow-hidden shadow-2xl relative z-10">
          <img
            src={user.avatar || "/placeholder.svg?height=200&width=200&query=futuristic+avatar"}
            alt={user.name}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <motion.div
          className="absolute -inset-4 border border-white/10 rounded-full animate-spin-slow"
          style={{ borderStyle: "dashed" }}
        />
      </motion.div>

      <div className="mt-12 text-center z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <Badge
            variant="outline"
            className="bg-primary/10 border-primary/20 text-primary uppercase tracking-widest px-4 py-1"
          >
            Power Lvl {user.level}
          </Badge>
          {user.isVerified && (
            <div className="p-1 rounded-full bg-linear-to-r from-primary to-secondary">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-6 text-gradient uppercase"
        >
          {user.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xl md:text-2xl font-mono text-muted-foreground leading-relaxed italic"
        >
          {`"${user.bio || "A digital soul navigating the P!!E universe."}"`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-6 mt-12 text-sm font-mono tracking-widest uppercase text-white/60"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-secondary" />
            {user.location || "Neo Tokyo"}
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Awakened in {new Date(user.createdAt).getFullYear()}
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 font-mono text-xs uppercase tracking-[0.5em]"
      >
        Scroll to Enter
      </motion.div>
    </section>
  )
}
