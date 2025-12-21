"use client"

import React, { useState, useRef } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface ProfileShowcaseProps {
  user: {
    name: string
    handle?: string
    bio?: string
    avatar?: string
    stats?: { followers?: number; following?: number; posts?: number }
  }
}

export const ProfileShowcase: React.FC<ProfileShowcaseProps> = ({ user }) => {
  const ref = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState<{ transform: string }>({ transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)" })

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    const rotateY = x * 12
    const rotateX = -y * 8
    setTilt({ transform: `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)` })
  }
  const onLeave = () => setTilt({ transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)" })

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#071022] via-[#081427] to-[#001219] shadow-2xl"
        style={{ transition: "transform 220ms ease", ...tilt, transformStyle: "preserve-3d" }}
      >
        {/* animated background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute -left-10 -top-16 w-96 opacity-30 animate-spin-slow" viewBox="0 0 200 200">
            <defs>
              <radialGradient id="g" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="url(#g)" />
          </svg>
          <div className="absolute inset-0">
            <span className="block w-2 h-2 bg-white rounded-full opacity-20 absolute left-8 top-10 animate-float-slow" />
            <span className="block w-1.5 h-1.5 bg-white rounded-full opacity-15 absolute right-12 top-20 animate-float-slower" />
            <span className="block w-2.5 h-2.5 bg-white rounded-full opacity-10 absolute left-20 bottom-16 animate-float" />
          </div>
        </div>

        <div className="relative z-10 p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full blur-2xl opacity-60" style={{ background: "linear-gradient(45deg,#7c3aed,#ec4899)" }} />
              <div className="rounded-full p-0.5 bg-gradient-to-r from-primary to-accent">
                <Avatar className="h-20 w-20 ring-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <span className="text-xs text-accent/90 px-2 py-1 rounded-full bg-accent/10">{user.handle || ""}</span>
                <span className="ml-auto inline-flex items-center gap-1 text-sm text-primary/90 font-medium">
                  <Sparkles className="w-4 h-4" />
                  Featured
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>

              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white">{user.stats?.followers ?? 0}</span>
                  <span className="text-xs text-muted-foreground">Followers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white">{user.stats?.following ?? 0}</span>
                  <span className="text-xs text-muted-foreground">Following</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white">{user.stats?.posts ?? 0}</span>
                  <span className="text-xs text-muted-foreground">Posts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">Follow</Button>
            <Button variant="ghost" className="border border-white/10">Message</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileShowcase
