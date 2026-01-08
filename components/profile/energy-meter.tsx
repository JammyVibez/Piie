"use client"

import { motion } from "framer-motion"
import { Zap } from "lucide-react"

interface EnergyMeterProps {
  level: number
  maxLevel?: number
  xp: number
  nextLevelXp?: number
}

export function EnergyMeter({ level, maxLevel = 100, xp, nextLevelXp = 150000 }: EnergyMeterProps) {
  const progress = (xp / nextLevelXp) * 100
  const influencePercentage = (level / maxLevel) * 100

  return (
    <div className="w-full space-y-4 mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Zap className="w-5 h-5 text-primary" />
          </motion.div>
          <h3 className="text-xs font-black tracking-[0.3em] uppercase text-muted-foreground">Social Energy</h3>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          <span className="text-primary font-black">{xp.toLocaleString()}</span> / {nextLevelXp.toLocaleString()} XP
        </div>
      </div>

      {/* Energy Bar */}
      <div className="relative h-3 rounded-full bg-muted/30 overflow-hidden energy-glow">
        {/* Animated background particles */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"
          animate={{
            x: ["0%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 0.5,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Glow effect on the leading edge */}
        <motion.div
          className="absolute inset-y-0 w-8 blur-xl bg-primary"
          style={{ left: `${progress}%` }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Influence Score */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="glass-liquid p-4 rounded-xl text-center group cursor-pointer">
          <div className="text-2xl font-black text-primary mb-1">{level}</div>
          <div className="text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase">Level</div>
        </div>
        <div className="glass-liquid p-4 rounded-xl text-center group cursor-pointer">
          <div className="text-2xl font-black text-secondary mb-1">{influencePercentage.toFixed(0)}%</div>
          <div className="text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase">Influence</div>
        </div>
        <div className="glass-liquid p-4 rounded-xl text-center group cursor-pointer relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <div className="relative text-2xl font-black text-accent mb-1">∞</div>
          <div className="relative text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase">
            Potential
          </div>
        </div>
      </div>

      {/* Floating energy particles */}
      <div className="relative h-8 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary"
            style={{
              left: `${20 + i * 15}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.3,
              ease: "easeOut",
            }}
          />
        ))}
      </div>
    </div>
  )
}
