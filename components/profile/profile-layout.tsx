"use client"

import type React from "react"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { ProfileAura } from "./aura"
import { FallingSnowballs } from "./digital-snow"

export function ProfileLayout({ children, user }: { children: React.ReactNode; user: any }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8])

  const [timeOfDay, setTimeOfDay] = useState<"day" | "night">("night")

  useEffect(() => {
    const hour = new Date().getHours()
    setTimeOfDay(hour >= 6 && hour < 18 ? "day" : "night")
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-background selection:bg-primary selection:text-white overflow-x-hidden"
    >
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <ProfileAura vibe={user.vibe} />
        <FallingSnowballs enabled={true} />

        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: timeOfDay === "day" ? 0.05 : 0.15 }}
          transition={{ duration: 2 }}
          style={{
            background:
              timeOfDay === "day"
                ? "linear-gradient(to bottom, rgba(255, 200, 100, 0.1), transparent)"
                : "linear-gradient(to bottom, rgba(100, 100, 255, 0.1), transparent)",
          }}
        />

        {/* Grain overlay for cinematic texture */}
        <div
          className="absolute inset-0 opacity-[0.03] grayscale invert pointer-events-none"
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }}
        />

        <motion.div className="absolute inset-0" style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-primary/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      </div>

      <motion.div style={{ opacity }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  )
}
