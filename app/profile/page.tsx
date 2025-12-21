"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"
import ProfileShowcase from "@/components/profile-3d"
import { FusionPostCard } from "@/components/fusion-post-card"
import type { FusionPost } from "@/lib/types"

const sampleUser = {
  name: "Habsan",
  handle: "@habsan",
  bio: "Creative technologist building immersive fusions.",
  avatar: "/avatar.jpg",
  stats: { followers: 1240, following: 180, posts: 42 },
}

const sampleFusions: FusionPost[] = [
  {
    id: "fusion-1",
    title: "Dreamscape",
    owner: { name: "Habsan", avatar: "/avatar.jpg" },
    ownerId: "u1",
    seedType: "text",
    seedContent: "A neon dusk in a cyber forest",
    seedMediaUrl: null,
    layers: [
      { id: "l1", type: "image", content: "Layer 1", mediaUrl: "/sample1.jpg", author: { name: "Alice", avatar: "/a1.jpg" }, authorId: "a1", fusionPostId: "fusion-1", layerOrder: 1, likes: 3, isApproved: true, createdAt: new Date().toISOString() } as any
    ],
    likes: 12,
    forkCount: 2,
    contributors: [{ name: "Alice", avatar: "/a1.jpg" }, { name: "Bob", avatar: "/b1.jpg" }],
    contributorCount: 2,
    createdAt: new Date().toISOString(),
  } as any,
  {
    id: "fusion-2",
    title: "Aurora Drift",
    owner: { name: "Habsan", avatar: "/avatar.jpg" },
    ownerId: "u1",
    seedType: "image",
    seedContent: "",
    seedMediaUrl: "/sample2.jpg",
    layers: [],
    likes: 5,
    forkCount: 0,
    contributors: [],
    contributorCount: 0,
    createdAt: new Date().toISOString(),
  } as any,
]

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user?.id) {
        redirect(`/profile/${user.id}`)
      } else if (!isAuthenticated) {
        redirect('/auth/login')
      }
    }
  }, [isLoading, isAuthenticated, user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Sign in to view your profile</h1>
        <p className="text-muted-foreground">Please sign in to access your profile page</p>
        <a href="/login" className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90">
          Sign In
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-background to-muted/5">
      <ProfileShowcase user={sampleUser} />

      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleFusions.map((fusion) => (
          <FusionPostCard key={fusion.id} fusionPost={fusion} />
        ))}
      </div>

      {/* Minimal local styles for animations used by the components */}
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity:0; transform: translateY(10px)} to {opacity:1; transform:translateY(0)} }
        @keyframes fadeInScale { from { opacity:0; transform: scale(.98)} to {opacity:1; transform:scale(1)} }
        @keyframes pulse { 0% { opacity: 1 } 50% { opacity: .5 } 100% { opacity: 1 } }
        @keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes float { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }

        .animate-pulse-slow { animation: pulse 2.2s infinite; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .animate-spin-slow { animation: spin 40s linear infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float 9s ease-in-out infinite; }
        .animate-float-slower { animation: float 14s ease-in-out infinite; }

        /* small helpers used by FusionPostCard */
        @media (prefers-reduced-motion: no-preference) {
          .fade-in-up { animation: fadeInUp .6s ease both; }
          .fade-in-scale { animation: fadeInScale .55s ease both; }
        }
      `}</style>
    </div>
  )
}
