"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Sparkles, Users, TrendingUp, Zap, Plus, Loader2 } from "lucide-react"
import CommunityCard from "./community-card"
import CreateCommunityModal from "./create-community-modal"
import { useAuth } from "@/contexts/auth-context"

interface CommunitiesPageProps {
  userJoinedCommunities: string[]
  onJoin: (id: string) => void
  onSelectCommunity: (id: string) => void
}

interface Community {
  id: string
  name: string
  description: string
  members: number
  icon: string
  category: string
  trending: boolean
  posts: number
  online: number
}

const CATEGORIES = ["All", "Technology", "Design", "Business", "Wellness", "Gaming", "Creative", "Science", "Travel", "General"]

export default function CommunitiesPage({ userJoinedCommunities, onJoin, onSelectCommunity }: CommunitiesPageProps) {
  const { token } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState<"trending" | "members" | "recent">("trending")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCommunities()
  }, [selectedCategory, token])

  const fetchCommunities = async () => {
    try {
      setIsLoading(true)
      const headers: Record<string, string> = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const params = new URLSearchParams()
      if (selectedCategory !== "All") {
        params.append("category", selectedCategory)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/communities?${params.toString()}`, { headers })
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

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== "") {
        fetchCommunities()
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleCreateCommunity = async (data: { name: string; description: string; category: string; isPublic: boolean }) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const response = await fetch("/api/communities", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (result.success) {
        setCommunities([result.data, ...communities])
        setShowCreateModal(false)
        onJoin(result.data.id)
      }
    } catch (error) {
      console.error("Error creating community:", error)
    }
  }

  const filteredCommunities = useMemo(() => {
    let results = [...communities]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (community) =>
          community.name.toLowerCase().includes(query) ||
          (community.description && community.description.toLowerCase().includes(query))
      )
    }

    if (sortBy === "trending") {
      results.sort((a, b) => {
        const aTrending = b.trending ? 1 : 0
        const bTrending = a.trending ? 1 : 0
        return aTrending - bTrending || b.members - a.members
      })
    } else if (sortBy === "members") {
      results.sort((a, b) => b.members - a.members)
    } else if (sortBy === "recent") {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return results
  }, [communities, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-background pb-20 max-sm:pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 max-sm:px-3 max-sm:py-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold max-sm:w-9 max-sm:h-9">
                P
              </div>
              <h1 className="text-2xl font-bold max-sm:text-xl">P!!E</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">Joined: {userJoinedCommunities.length}</div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm max-sm:px-3"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-muted/50 border border-border/50 focus:border-primary/50 focus:bg-background outline-none transition-all text-sm max-sm:py-2.5"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all text-sm max-sm:px-3 max-sm:py-1.5 ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 max-sm:px-3 max-sm:py-4">
        <div className="flex items-center justify-between mb-6 max-sm:flex-col max-sm:gap-4">
          <h2 className="text-lg font-semibold text-muted-foreground max-sm:text-base">
            {filteredCommunities.length} communities found
          </h2>
          <div className="flex gap-2 max-sm:w-full">
            {[
              { id: "trending", label: "Trending", icon: TrendingUp },
              { id: "members", label: "Members", icon: Users },
              { id: "recent", label: "Recent", icon: Zap },
            ].map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as typeof sortBy)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm max-sm:flex-1 max-sm:justify-center ${
                    sortBy === option.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-sm:gap-3">
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isJoined={userJoinedCommunities.includes(community.id)}
                onJoin={() => onJoin(community.id)}
                onSelect={() => {
                  if (userJoinedCommunities.includes(community.id)) {
                    onSelectCommunity(community.id)
                  }
                }}
                isTrending={community.trending}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No communities found. Be the first to create one!</p>
          </div>
        )}
      </div>

      {showCreateModal && <CreateCommunityModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateCommunity} />}
    </div>
  )
}
