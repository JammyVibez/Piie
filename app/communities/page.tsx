"use client"

import { useState, useEffect } from "react"
import CommunitiesPage from "@/components/peak/communities-page"
import CommunityView from "@/components/peak/community-view"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { token } = useAuth()
  const [userJoinedCommunities, setUserJoinedCommunities] = useState<string[]>([])
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)

  useEffect(() => {
    const fetchJoinedCommunities = async () => {
      if (!token) return

      try {
        const response = await fetch("/api/communities?joined=true", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const result = await response.json()
        if (result.success && result.data?.communities) {
          setUserJoinedCommunities(result.data.communities.map((c: any) => c.id))
        }
      } catch (error) {
        console.error("Failed to fetch joined communities:", error)
      }
    }

    fetchJoinedCommunities()
  }, [token])

  const handleJoinCommunity = async (communityId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        setUserJoinedCommunities([...userJoinedCommunities, communityId])
      }
    } catch (error) {
      console.error("Failed to join community:", error)
    }
  }

  const handleLeaveCommunity = async (communityId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/communities/${communityId}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.ok) {
        setUserJoinedCommunities(userJoinedCommunities.filter(id => id !== communityId))
        if (selectedCommunity === communityId) {
          setSelectedCommunity(null)
        }
      }
    } catch (error) {
      console.error("Failed to leave community:", error)
    }
  }

  if (!selectedCommunity) {
    return (
      <CommunitiesPage
        userJoinedCommunities={userJoinedCommunities}
        onJoin={handleJoinCommunity}
        onSelectCommunity={setSelectedCommunity}
      />
    )
  }

  return (
    <CommunityView
      selectedCommunity={selectedCommunity}
      onSelectCommunity={setSelectedCommunity}
      joinedCommunities={userJoinedCommunities}
      onLeaveCommunity={handleLeaveCommunity}
    />
  )
}
