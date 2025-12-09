"use client"

import { useState, useEffect } from "react"
import { Search, Plus, ChevronDown, LogOut, Mountain, X } from "lucide-react"
import CommunityPreviewCard from "./community-preview-card"
import CreateCommunityModal from "./create-community-modal"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useAuth } from "@/contexts/auth-context"


interface LeftSidebarProps {
  selectedCommunity: string
  onSelectCommunity: (id: string) => void
  joinedCommunities: string[]
  onLeaveCommunity: (id: string) => void
}

interface Community {
  id: string
  name: string
  icon: string
  members: number
  category: string
}

const PINNED_COMMUNITIES = [
  { id: "tech-hub", name: "Tech Hub", icon: "🚀", unread: 12 },
  { id: "design-collective", name: "Design Collective", icon: "🎨", unread: 0 },
  { id: "creators-club", name: "Creators Club", icon: "✨", unread: 5 },
]

export default function LeftSidebar({
  selectedCommunity,
  onSelectCommunity,
  joinedCommunities,
  onLeaveCommunity,
}: LeftSidebarProps) {
  const { token } = useAuth()
  const [expandedCategory, setExpandedCategory] = useState<string | null>("General")
  const [hoveredCommunity, setHoveredCommunity] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateCommunity, setShowCreateCommunity] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCommunities()
  }, [token])

  const fetchCommunities = async () => {
    try {
      setIsLoading(true)
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch("/api/communities?limit=100", { headers })
      const result = await response.json()

      if (result.success && result.data?.communities) {
        setCommunities(result.data.communities)
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Group communities by category
  const communitiesByCategory = communities.reduce((acc, community) => {
    const category = community.category || "General"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(community)
    return acc
  }, {} as Record<string, Community[]>)

  // Filter communities based on search query
  const filteredCommunities = Object.entries(communitiesByCategory).reduce(
    (acc, [category, categoryComms]) => {
      const filtered = categoryComms.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      if (filtered.length > 0) {
        acc[category] = filtered
      }
      return acc
    },
    {} as Record<string, Community[]>
  )


  return (
    <>
      <div className="w-full border-r border-border bg-card flex flex-col overflow-hidden h-full">
        {/* Header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
               <Mountain size={20} className="text-white" />
            </div>
           <h1 className="text-2xl font-black gradient-text">P!!E!</h1>
                       <ThemeSwitcher />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Joined Communities */}
        {joinedCommunities.length > 0 && (
          <div className="px-3 py-3 border-b border-border flex-shrink-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Your Communities</h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {joinedCommunities.map((commId) => {
                const comm = communities.find((c) => c.id === commId)
                if (!comm) return null
                return (
                  <div
                    key={commId}
                    className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-all"
                  >
                    <button
                      onClick={() => onSelectCommunity(commId)}
                      className={`flex-1 flex items-center gap-2 text-left transition-all text-sm ${
                        selectedCommunity === commId ? "text-primary font-semibold" : "text-foreground"
                      }`}
                    >
                      <span className="text-lg">{comm.icon}</span>
                      <span className="truncate">{comm.name}</span>
                    </button>
                    <button
                      onClick={() => onLeaveCommunity(commId)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 text-destructive rounded transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Community Categories */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Discover</h3>
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-6">Loading communities...</p>
          ) : Object.entries(filteredCommunities).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No communities found</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(filteredCommunities).map(([category, communitiesInCategory]) => (
                <div key={category}>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-muted-foreground uppercase hover:text-foreground transition-colors rounded hover:bg-muted/50"
                  >
                    <span>{category}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedCategory === category ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expandedCategory === category && (
                    <div className="space-y-1 mt-2">
                      {communitiesInCategory.map((comm) => (
                        <button
                          key={comm.id}
                          onClick={() => onSelectCommunity(comm.id)}
                          onMouseEnter={() => setHoveredCommunity(comm.id)}
                          onMouseLeave={() => setHoveredCommunity(null)}
                          className={`w-full relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                            selectedCommunity === comm.id
                              ? "bg-primary/15 text-primary font-semibold"
                              : "hover:bg-muted text-foreground"
                          }`}
                        >
                          <span className="text-base">{comm.icon}</span>
                          <span className="flex-1 text-left truncate">{comm.name}</span>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                          {hoveredCommunity === comm.id && <CommunityPreviewCard community={comm} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <button
            onClick={() => setShowCreateCommunity(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateCommunity && (
        <CreateCommunityModal
          onClose={() => setShowCreateCommunity(false)}
          onCreateCommunity={(community) => {
            console.log("Community created:", community)
            setShowCreateCommunity(false)
          }}
        />
      )}
    </>
  )
}