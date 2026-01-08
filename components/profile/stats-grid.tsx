"use client"

import { motion } from "framer-motion"

export function StatsGrid({ user }: { user: any }) {
  const stats = [
    { label: "Influence", value: user.followers, color: "text-primary" },
    { label: "Connections", value: user.following, color: "text-secondary" },
    { label: "Artifacts", value: user.postsCount, color: "text-accent" },
    { label: "XP", value: user.xp, color: "text-white" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto px-4 py-20">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className="p-8 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-colors"
          style={{
            background: "var(--background-glass)",
            backdropFilter: "var(--backdrop-blur-glass)",
            border: "var(--border-glass)",
            boxShadow: "var(--shadow-glass)",
          }}
        >
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</span>
          <span className={`text-4xl font-black ${stat.color} group-hover:scale-110 transition-transform`}>
            {stat.value.toLocaleString()}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
