"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, ChevronLeft, ChevronRight, Upload, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

interface Story {
  user: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  stories: Array<{
    id: string
    image: string
    type: 'image' | 'video'
    createdAt: Date
  }>
}

export function StoryCarousel() {
  const { user, token, isAuthenticated } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadStories = useCallback(async () => {
    try {
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch('/api/status', { headers })
      const result = await response.json()

      if (result.success) {
        setStories(result.data)
      }
    } catch (error) {
      console.error('Failed to load stories:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadStories()
  }, [loadStories])


  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated || !user || !token) {
      toast({
        title: "Error",
        description: "Please login to upload a story",
        variant: "destructive",
      })
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: "Error",
        description: "Please select an image or video file",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleCreateStory = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      if (!token) {
        toast({
          title: "Error",
          description: "Please log in to create a story",
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      // Upload file first
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', selectedFile.type.startsWith('image/') ? 'image' : 'video')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadData = await uploadRes.json()
      if (!uploadData.success || !uploadData.data?.url) {
        throw new Error('Invalid upload response')
      }

      const { url: uploadedUrl } = uploadData.data

      // Create story
      const storyRes = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaUrl: uploadedUrl,
          mediaType: selectedFile.type.startsWith('image/') ? 'image' : 'video',
        }),
      })

      if (!storyRes.ok) {
        const errorData = await storyRes.json()
        throw new Error(errorData.error || 'Failed to create story')
      }

      const storyData = await storyRes.json()
      if (!storyData.success) {
        throw new Error('Story creation failed')
      }

      // Reload stories
      await loadStories()
      setShowCreateModal(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (error) {
      console.error('Failed to create story:', error)
      toast({
        title: "Error",
        description: `Failed to create story: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleStoryClick = (storyGroup: Story) => {
    if (storyGroup.user.id === user?.id && storyGroup.stories.length === 0) {
      setShowCreateModal(true)
      return
    }
    // Navigate to story viewer
    window.location.href = `/status/${storyGroup.user.id}`
  }


  if (isLoading) {
    return (
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-card/90 border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-card/90 border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
        >
          <ChevronRight size={18} />
        </button>
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-3 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center cursor-pointer hover:border-primary/60 transition-colors"
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Click to upload image or video
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                {selectedFile?.type.startsWith('image/') ? (
                  <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
                ) : (
                  <video src={previewUrl} className="w-full rounded-lg" controls />
                )}
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                  className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            {previewUrl && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateStory}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? 'Uploading...' : 'Post Story'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative group">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-card/90 border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-card/90 border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card"
      >
        <ChevronRight size={18} />
      </button>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-1">
        {/* Add Story Button */}
        <div className="flex-shrink-0">
          <button className="flex flex-col items-center gap-1.5 group/story" onClick={() => setShowCreateModal(true)}>
            <div className="relative p-0.5 rounded-full bg-muted">
              <div className="p-0.5 bg-background rounded-full">
                <Avatar className="h-14 w-14 group-hover/story:scale-105 transition-transform">
                  <AvatarImage src={user?.avatar || "/placeholder.svg?height=60&width=60"} />
                  <AvatarFallback>{user?.name?.[0] || 'Y'}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full border-2 border-background">
                <Plus size={12} className="text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs truncate max-w-[70px] text-foreground">
              Your Story
            </span>
          </button>
        </div>

        {/* Other Stories */}
        {stories.map((storyGroup) => (
          <button
            key={storyGroup.user.id}
            onClick={() => handleStoryClick(storyGroup)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group/story"
          >
            <div className={`relative p-0.5 rounded-full ${storyGroup.stories.some(s => s.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) ? "bg-gradient-to-br from-primary via-secondary to-accent" : "bg-muted/50"}`}>
              <div className="p-0.5 bg-background rounded-full">
                <Avatar className="h-14 w-14 group-hover/story:scale-105 transition-transform">
                  <AvatarImage src={storyGroup.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{storyGroup.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className={`text-xs truncate max-w-[70px] ${storyGroup.stories.some(s => s.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) ? "text-foreground" : "text-muted-foreground"}`}>
              {storyGroup.user.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
      </div>
    </>
  )
}