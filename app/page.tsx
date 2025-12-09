"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { LeftSidebar } from "@/components/left-sidebar"
import { MainFeed } from "@/components/main-feed"
import { RightSidebar } from "@/components/right-sidebar"
import CommunitiesView from "@/components/peak/communities-page"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeView, setActiveView] = useState<"home" | "communities">("home")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/landing")
    }
  }, [user, loading, router])

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