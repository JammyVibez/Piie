"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { LeftSidebar } from "@/components/left-sidebar"
import { MainFeed } from "@/components/main-feed"
import { RightSidebar } from "@/components/right-sidebar"
import CommunitiesView from "@/components/peak/communities-page"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState<"home" | "communities">("home")
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Only redirect once when auth state is determined
    if (!isLoading && !user && !hasRedirected.current) {
      hasRedirected.current = true
      router.push("/landing")
    }
  }, [user, isLoading, router])

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        {activeView === "home" && <MainFeed />}
        {activeView === "communities" && <CommunitiesView />}
        <RightSidebar setActiveView={setActiveView} />
      </div>
    </div>
  )
}