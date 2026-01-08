"use client"
// Inheriting the existing motion language, glow, and cinematic depth.

import { useState, useCallback, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Share, MessageCircle, MapPin, Award, Users, Grid, Heart, UserPlus, UserCheck, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { ProfileContentProps } from "@/types/profile" // Import ProfileContentProps
import { FallingSnowballs } from "@/components/FallingSnowballs" // Import FallingSnowballs
import { PostCard } from "@/components/PostCard" // Import PostCard

// Define types and themes from base here if necessary

export function ProfileContent({ user, userPosts, fusionPosts, userId }: ProfileContentProps) {
  const profileRef = useRef(null) // Declare profileRef
  const bannerRef = useRef(null) // Declare bannerRef
  const avatarRef = useRef(null) // Declare avatarRef
  const [snowEnabled, setSnowEnabled] = useState(false) // Declare snowEnabled
  const [currentTheme, setCurrentTheme] = useState({
    bg: "bg-background",
    primary: "from-primary",
    secondary: "to-secondary",
  }) // Declare currentTheme
  const [localFollowers, setLocalFollowers] = useState(0) // Declare localFollowers
  const [joinedDate, setJoinedDate] = useState("") // Declare joinedDate

  const handleShare = useCallback(() => {
    // Share logic here
  }, []) // Declare handleShare

  useEffect(() => {
    // Effect logic here
  }, [])

  return (
    <div ref={profileRef} className={`min-h-screen ${currentTheme.bg} pb-20 relative overflow-hidden`}>
      {/* Dynamic Digital Snow */}
      <FallingSnowballs enabled={snowEnabled} />

      {/* 1. ENHANCED PROFILE BANNER */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <motion.div
          ref={bannerRef}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          {user.banner ? (
            <img
              src={user.banner || "/placeholder.svg"}
              className="w-full h-full object-cover grayscale-[0.2] brightness-75"
              alt="Cover"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${currentTheme.primary} ${currentTheme.secondary} opacity-40`}
            />
          )}
          {/* Ambient Particles Layer */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10 -mt-24">
        {/* 2. IDENTITY & SOCIAL CORE */}
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <motion.div
            ref={avatarRef}
            layoutId="avatar"
            className="relative group p-1 bg-gradient-to-br from-primary via-accent to-secondary rounded-3xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[1.4rem] overflow-hidden border-4 border-background bg-card">
              <img
                src={user.avatar || "/placeholder.svg"}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                alt={user.name}
              />
            </div>
            {/* Status Indicator */}
            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-green-500 border-4 border-background animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </motion.div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-balance">{user.name}</h1>
              {/* ROLES & SIGILS */}
              <div className="flex gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/50 animate-glow">FOUNDER</Badge>
                {user.isVerified && <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/50">VERIFIED</Badge>}
              </div>
            </div>
            <p className="text-muted-foreground text-lg mb-4">
              @{user.username} • <span className="text-accent italic">Awakened {joinedDate}</span>
            </p>

            {/* 3. SOCIAL ACTION SYSTEM */}
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full px-8 bg-primary hover:bg-primary/80 text-primary-foreground font-bold shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all hover:scale-105 active:scale-95">
                <UserPlus className="mr-2 h-4 w-4" /> FOLLOW
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-6 backdrop-blur-md border-white/10 hover:bg-white/5 transition-all bg-transparent"
              >
                <Send className="mr-2 h-4 w-4" /> MESSAGE
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5" onClick={handleShare}>
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 4. DYNAMIC SOCIAL STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "FOLLOWERS", value: localFollowers, icon: Users },
            { label: "FOLLOWING", value: user.following, icon: UserCheck },
            { label: "POSTS", value: user.postsCount, icon: Grid },
            { label: "XP LEVEL", value: user.level, icon: Award },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-primary/50 transition-colors"
            >
              <stat.icon className="h-4 w-4 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
              <div className="text-2xl font-black tracking-tighter">{stat.value.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* 5. CONTENT SECTIONS (TABS) */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start bg-transparent h-auto p-0 gap-8 mb-8 border-b border-white/5 rounded-none overflow-x-auto no-scrollbar">
            {["POSTS", "MEDIA", "COLLECTIONS", "ABOUT"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase()}
                className="px-0 py-4 bg-transparent border-none rounded-none text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-[0_2px_0_0_#fff] transition-all font-bold tracking-widest text-xs"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {/* MUTUALS PROOF */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">
                Followed by <span className="text-foreground font-bold">Xenia</span> and 42 others you know
              </p>
            </div>

            <div className="grid gap-6">
              {userPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <PostCard post={post as any} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="media">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 0.98 }}
                  className="aspect-square bg-white/5 rounded-lg overflow-hidden relative group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="flex gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> 1.2k
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> 84
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="max-w-2xl">
            <div className="space-y-8 py-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold tracking-widest text-primary">CORE MANIFESTO</h3>
                <p className="text-xl leading-relaxed text-balance italic text-muted-foreground">
                  {user.bio ||
                    "Digital nomad exploring the intersection of neon and code. Building the future of P!!E."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Coordinates</h3>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <MapPin className="h-4 w-4 text-accent" /> {user.location || "Neo-Tokyo, Sector 7"}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Status</h3>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" /> Decrypting the Void
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
