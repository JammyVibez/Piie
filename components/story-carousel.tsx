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

      toast({
        title: "Success",
        description: "Your story has been added to your status!",
      })
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
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Add to Feed
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-white/10 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Image or Video
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
                {selectedFile?.type.startsWith('image/') ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-[300px] object-cover" />
                ) : (
                  <video src={previewUrl} className="w-full h-[300px] object-cover" controls />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-4">
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                    }}
                    className="p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-red-500/80 transition-colors text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
            {previewUrl && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                  className="flex-1 bg-transparent border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateStory}
                  disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </div>
                  ) : (
                    'Share to Feed'
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative group w-full py-4">
      {/* Navigation Buttons with Glass Effect */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110"
      >
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110"
      >
        <ChevronRight size={20} className="text-white" />
      </button>

      <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide py-4 px-2 items-center">
        {/* Add Story Button - Redesigned */}
        <div className="flex-shrink-0">
          <button className="flex flex-col items-center gap-2 group/story" onClick={() => setShowCreateModal(true)}>
            <div className="relative p-[3px] rounded-full bg-gradient-to-br from-white/10 to-white/5 group-hover/story:from-primary group-hover/story:to-purple-500 transition-colors duration-300">
              <div className="p-0.5 bg-background rounded-full relative overflow-hidden">
                <Avatar className="h-16 w-16 group-hover/story:scale-105 transition-transform duration-500 border-2 border-background">
                  <AvatarImage src={user?.avatar || "/placeholder.svg?height=60&width=60"} className="object-cover" />
                  <AvatarFallback className="bg-muted text-muted-foreground">{user?.name?.[0] || 'Y'}</AvatarFallback>
                </Avatar>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/story:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                   <Plus size={24} className="text-white drop-shadow-md" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full border-4 border-background shadow-lg group-hover/story:scale-110 transition-transform">
                <Plus size={14} className="text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs font-medium text-foreground/80 group-hover/story:text-primary transition-colors">
              Add Story
            </span>
          </button>
        </div>

        {/* Other Stories */}
        {stories.map((storyGroup) => (
          <button
            key={storyGroup.user.id}
            onClick={() => handleStoryClick(storyGroup)}
            className="flex flex-col items-center gap-2 flex-shrink-0 group/story"
          >
            <div className={`relative p-[3px] rounded-full transition-all duration-300 ${
              storyGroup.stories.some(s => s.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) 
                ? "bg-gradient-to-tr from-yellow-400 via-orange-500 to-purple-600 animate-gradient-xy shadow-lg shadow-orange-500/20" 
                : "bg-muted border border-white/10"
            }`}>
              <div className="p-0.5 bg-background rounded-full">
                <Avatar className="h-16 w-16 group-hover/story:scale-105 transition-transform duration-500 border-2 border-background">
                  <AvatarImage src={storyGroup.user.avatar || "/placeholder.svg"} className="object-cover" />
                  <AvatarFallback>{storyGroup.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <span className={`text-xs font-medium truncate max-w-[80px] transition-colors ${
              storyGroup.stories.some(s => s.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) 
                ? "text-foreground" 
                : "text-muted-foreground"
            }`}>
              {storyGroup.user.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
      </div>
    </>
  )
}