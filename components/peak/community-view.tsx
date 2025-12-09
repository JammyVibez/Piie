"use client"

import { useState } from "react"
import LeftSidebar from "./left-sidebar"
import MiddleContent from "./middle-content"
import RightSidebar from "./right-sidebar"
import { Menu, X } from "lucide-react"

interface CommunityViewProps {
  selectedCommunity: string
  onSelectCommunity: (id: string) => void
  joinedCommunities: string[]
  onLeaveCommunity: (id: string) => void
}

export default function CommunityView({
  selectedCommunity,
  onSelectCommunity,
  joinedCommunities,
  onLeaveCommunity,
}: CommunityViewProps) {
  const [activeMood, setActiveMood] = useState("active")
  const [activeTab, setActiveTab] = useState("posts")
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Menu Toggle - left sidebar */}
      <button
        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all active:scale-95"
        aria-label="Toggle left sidebar"
      >
        {leftSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Toggle - right sidebar */}
      <button
        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-all active:scale-95"
        aria-label="Toggle right sidebar"
      >
        {rightSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Left Sidebar Overlay - Mobile */}
      {leftSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setLeftSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Right Sidebar Overlay - Mobile */}
      {rightSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setRightSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar - Desktop visible, Mobile drawer */}
      <div
        className={`${
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 md:relative md:z-auto fixed left-0 top-0 z-40 h-full w-64 md:w-72 lg:w-80 overflow-y-auto bg-card`}
      >
        <LeftSidebar
          selectedCommunity={selectedCommunity}
          onSelectCommunity={(id) => {
            onSelectCommunity(id)
            setLeftSidebarOpen(false)
          }}
          joinedCommunities={joinedCommunities}
          onLeaveCommunity={onLeaveCommunity}
        />
      </div>

      {/* Middle Content */}
      <MiddleContent
        mood={activeMood}
        onMoodChange={setActiveMood}
        selectedCommunity={selectedCommunity}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenRightSidebar={() => setRightSidebarOpen(true)}
      />

      {/* Right Sidebar - Desktop visible, Mobile drawer */}
      <div
        className={`${
          rightSidebarOpen ? "translate-x-0" : "translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 lg:relative lg:z-auto fixed right-0 top-0 z-40 h-full w-72 lg:w-80 overflow-y-auto bg-card`}
      >
        <RightSidebar mood={activeMood} selectedCommunity={selectedCommunity} />
      </div>
    </div>
  )
}
