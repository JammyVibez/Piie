"use client"

import type React from "react"
import { motion, useTransform, useScroll } from "framer-motion"
import { UserPlus, Send, Edit } from "lucide-react"
import { RoleBadge } from "./role-badge"
import { EnergyMeter } from "./energy-meter"
import { useRef, useState } from "react"
import { AvatarRenderer } from "./avatar-renderer"
import { AvatarEditor } from "./avatar-editor"
import { DEFAULT_AVATAR, type AvatarConfig } from "@/lib/avatar-config"

export function SocialHeader({ user, isOwnProfile = false }: { user: any; isOwnProfile?: boolean }) {
  const bannerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [use3D, setUse3D] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR)

  const { scrollY } = useScroll()
  const bannerY = useTransform(scrollY, [0, 500], [0, 100])
  const bannerOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <section className="relative w-full overflow-visible">
      <AvatarEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={(config) => {
          setAvatarConfig(config)
          setIsEditorOpen(false)
        }}
      />

      <motion.div
        ref={bannerRef}
        className="relative min-h-[400px] md:min-h-[500px] w-full"
        onMouseMove={handleMouseMove}
        style={{ y: bannerY, opacity: bannerOpacity }}
      >
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          whileHover={{
            scale: 1.05,
            rotateY: use3D ? 5 : 0,
            rotateX: use3D ? -5 : 0,
          }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          {user.banner ? (
            <img
              src={user.banner || "/placeholder.svg"}
              className="w-full h-full object-cover brightness-50"
              alt="Banner"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/20 via-background to-accent/20" />
          )}

          <motion.div
            className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent"
            style={{
              background: useTransform(
                scrollY,
                [0, 200],
                [
                  "linear-gradient(to top, oklch(0.05 0.02 260) 0%, transparent 100%)",
                  "linear-gradient(to top, oklch(0.05 0.02 260) 30%, transparent 100%)",
                ],
              ) as any,
            }}
          />

          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(var(--primary), 0.15) 0%, transparent 50%)`,
            }}
          />
        </motion.div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-[180px] md:pt-[220px]">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            <div className="relative flex-shrink-0">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: use3D ? 5 : 0,
                  rotateX: use3D ? -5 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group p-1 bg-linear-to-br from-primary via-accent to-secondary rounded-3xl shadow-[0_0_50px_rgba(var(--primary),0.3)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="rounded-[2rem] overflow-hidden border-4 border-background bg-card relative shadow-2xl"
                  style={{
                    width: "clamp(180px, 45vw, 260px)",
                    height: "clamp(180px, 45vw, 260px)",
                  }}
                >
                  {use3D ? (
                    <AvatarRenderer config={avatarConfig} />
                  ) : (
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      className="w-full h-full object-cover"
                      alt={user.name}
                    />
                  )}

                  {/* Mode Toggle Overlay - Visible for Everyone but emphasizes the tech */}
                  <button
                    onClick={() => setUse3D(!use3D)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                  >
                    {use3D ? "View Photo" : "Activate 3D"}
                  </button>
                </div>

                {/* Floating Action Cluster */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:top-6 md:left-auto md:right-0 md:translate-x-full md:translate-y-0 md:ml-6 z-20 flex flex-row md:flex-col gap-3">
                  {isOwnProfile ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsEditorOpen(true)}
                        className="p-4 rounded-2xl border border-white/10 shadow-xl btn-magnetic bg-primary text-white"
                        title="Edit Avatar"
                      >
                        <UserPlus className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 rounded-2xl border border-white/10 shadow-xl btn-magnetic bg-card"
                        title="Edit Profile"
                      >
                        <Edit className="w-5 h-5 text-muted-foreground" />
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 rounded-2xl border border-white/10 shadow-xl btn-magnetic bg-primary text-white"
                      >
                        <UserPlus className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-4 rounded-2xl border border-white/10 shadow-xl btn-magnetic bg-card"
                      >
                        <Send className="w-5 h-5 text-secondary" />
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* IDENTITY & ROLES */}
            <div className="flex-1 pb-4 text-center md:text-left w-full">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 mb-2">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter text-gradient uppercase"
                >
                  {user.name}
                </motion.h1>
                <div className="flex gap-2">
                  <RoleBadge role="FOUNDER" variant="founder" />
                  {user.isVerified && <RoleBadge role="VERIFIED" variant="verified" />}
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl md:text-2xl font-mono text-muted-foreground mb-6"
              >
                @{user.username} •{" "}
                <span className="text-accent italic">Awakened {new Date(user.createdAt).getFullYear()}</span>
              </motion.p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12">
            {[
              { label: "FOLLOWERS", value: user.followers, color: "text-primary" },
              { label: "FOLLOWING", value: user.following, color: "text-secondary" },
              { label: "POSTS", value: user.postsCount, color: "text-accent" },
              { label: "POWER LVL", value: user.level, color: "text-white" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 0 30px rgba(var(--primary), 0.2)",
                }}
                className="p-4 sm:p-6 rounded-2xl group hover:border-primary/40 transition-all cursor-pointer cursor-ripple relative overflow-hidden"
                style={{
                  background: "var(--background-glass)",
                  backdropFilter: "var(--backdrop-blur-glass)",
                  border: "var(--border-glass)",
                  boxShadow: "var(--shadow-glass)",
                  transition: "all var(--timing-normal) var(--ease-liquid)",
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={false}
                />

                <div className="relative">
                  <div className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] text-muted-foreground mb-1">
                    {stat.label}
                  </div>
                  <motion.div
                    className={`text-2xl sm:text-3xl font-black ${stat.color}`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {stat.value.toLocaleString()}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ENERGY METER */}
          <EnergyMeter level={user.level} xp={user.xp} />
        </div>
      </motion.div>
    </section>
  )
}
