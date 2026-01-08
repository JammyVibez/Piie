"use client"

import { motion } from "framer-motion"
import { Shield, Crown, Zap, Star } from "lucide-react"

interface RoleBadgeProps {
  role: string
  variant?: "founder" | "admin" | "creator" | "verified"
}

const ROLE_CONFIGS = {
  founder: {
    icon: Crown,
    gradient: "from-yellow-500 via-orange-500 to-red-500",
    glow: "shadow-[0_0_30px_rgba(251,191,36,0.5)]",
    aura: "animate-pulse-glow",
  },
  admin: {
    icon: Shield,
    gradient: "from-red-500 via-pink-500 to-purple-500",
    glow: "shadow-[0_0_25px_rgba(236,72,153,0.5)]",
    aura: "animate-breath",
  },
  creator: {
    icon: Zap,
    gradient: "from-cyan-500 via-blue-500 to-purple-500",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    aura: "animate-drift",
  },
  verified: {
    icon: Star,
    gradient: "from-blue-400 to-cyan-400",
    glow: "shadow-[0_0_15px_rgba(56,189,248,0.5)]",
    aura: "",
  },
}

export function RoleBadge({ role, variant = "founder" }: RoleBadgeProps) {
  const config = ROLE_CONFIGS[variant]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative inline-flex items-center"
    >
      {/* Animated aura background */}
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} opacity-20 blur-2xl ${config.aura}`}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Badge container */}
      <div
        className={`relative px-4 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} ${config.glow} flex items-center gap-2`}
      >
        <Icon className="w-3.5 h-3.5 text-white" />
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">{role}</span>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  )
}
