"use client"

import { motion } from "framer-motion"

export function ProfileAura({ vibe = "cosmic" }: { vibe?: string }) {
  const colors =
    {
      cosmic: "from-primary via-secondary to-accent",
      neon: "from-cyan-400 via-blue-500 to-purple-600",
      shadow: "from-zinc-800 via-zinc-900 to-black",
      energy: "from-yellow-400 via-orange-500 to-red-600",
    }[vibe] || "from-primary via-secondary to-accent"

  return (
    <div className="absolute inset-0 flex items-center justify-center -z-10">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className={`w-64 h-64 rounded-full bg-linear-to-tr ${colors} blur-3xl opacity-40 animate-pulse-glow`}
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className={`absolute w-96 h-96 rounded-full bg-linear-to-br ${colors} blur-3xl opacity-20`}
      />
    </div>
  )
}
