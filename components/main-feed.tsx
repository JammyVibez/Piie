"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Post } from "./types"
import { PostCard } from "./post-card"
import { CreatePostModal } from "./create-post-modal"
import { FusionPostCard } from "./fusion-post-card"
import { CreateFusionModal } from "./create-fusion-modal"
import { CommentModal } from "./comment-modal"
import { StoryCarousel } from "./story-carousel"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, TrendingUp, Sparkles, ImageIcon, Video, Loader2 } from "lucide-react"
import type { FusionPost } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export function MainFeed() {
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [fusionPosts, setFusionPosts] = useState<FusionPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateFusionModal, setShowCreateFusionModal] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { user: currentUser, token, isAuthenticated } = useAuth()
  const [selectedPostForComment, setSelectedPostForComment] = useState<Post | null>(null)
  const tokenRef = useRef(token)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    tokenRef.current = token
  }, [token])

  const loadPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      const headers: Record<string, string> = {}
      if (tokenRef.current) {
        headers.Authorization = `Bearer ${tokenRef.current}`
      }

      const response = await fetch(`/api/posts?page=${pageNum}&limit=10&sort=recent`, { 
        headers,
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        if (append) {
          setPosts((prev) => [...prev, ...result.data.items])
        } else {
          setPosts(result.data.items || [])
        }
        setHasMore(result.data.hasMore ?? false)
      } else {
        console.error("Failed to load posts:", result.error)
        setPosts([])
        setHasMore(false)
      }
    } catch (error) {
      console.error("Failed to load posts:", error)
      setPosts([])
      setHasMore(false)
    }
  }, [])

  const loadFusionPosts = useCallback(async () => {
    try {
      const headers: Record<string, string> = {}
      if (tokenRef.current) {
        headers.Authorization = `Bearer ${tokenRef.current}`
      }

      const response = await fetch("/api/fusion?limit=5", { 
        headers,
        credentials: "include",
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fusion posts: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setFusionPosts(result.data.items || [])
      } else {
        console.error("Failed to load fusion posts:", result.error)
        setFusionPosts([])
      }
    } catch (error) {
      console.error("Failed to load fusion posts:", error)
      setFusionPosts([])
    }
  }, [])

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        await Promise.all([loadPosts(1), loadFusionPosts()])
      } catch (error) {
        console.error("Failed to load feed data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleCommentClick = (post: Post) => {
    setSelectedPost(post)
    setIsCommentOpen(true)
  }

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const nextPage = page + 1
    await loadPosts(nextPage, true)
    setPage(nextPage)
    setLoadingMore(false)
  }

  const handlePostCreate = async (newPost: Post) => {
    if (newPost.postType === "fusion") {
      setShowCreateModal(false)
      setShowCreateFusionModal(true)
      return
    }

    if (!tokenRef.current) {
      console.error("No auth token found")
      return
    }

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRef.current}`,
        },
        body: JSON.stringify({
          title: newPost.title,
          description: newPost.description,
          content: newPost.content,
          images: newPost.images || [],
          video: newPost.video,
          videoThumbnail: newPost.videoThumbnail,
          videoDuration: newPost.videoDuration, // Added videoDuration
          postType: newPost.postType || "post",
          visibility: newPost.visibility || "public",
          tags: newPost.tags || [],
          pollOptions: newPost.pollOptions,
          scheduledFor: newPost.scheduledFor,
        }),
      })

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json()
        if (result.success) {
          setPosts((prev) => [result.data, ...prev])
          setShowCreateModal(false)
        } else {
          console.error("Failed to create post:", result.error)
        }
      } else {
        console.error("Received non-JSON response or empty response from /api/posts");
      }
    } catch (error) {
      console.error("Failed to create post:", error)
    }
  }

  const handleCommunityCreate = async (communityData: any) => {
    if (!tokenRef.current) {
      console.error("No auth token found");
      return;
    }

    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenRef.current}`,
        },
        body: JSON.stringify(communityData),
      });

      const result = await response.json();
      if (result.success) {
        console.log("Community created:", result.data);
        // You might want to update local state or redirect the user
      } else {
        console.error("Failed to create community:", result.error);
      }
    } catch (error) {
      console.error("Error creating community:", error);
    }
  };

  const handleFusionPostCreate = (newFusionPost: FusionPost) => {
    setFusionPosts((prev) => [newFusionPost, ...prev])
    setShowCreateFusionModal(false)
  }

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="flex-shrink-0 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-sm border-b border-border/50 z-10">
        <div className="max-w-2xl mx-auto w-full p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-foreground">Feed</h2>
              <TrendingUp size={20} className="text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Stay connected with your community</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 neon-glow"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Create</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto w-full p-4 space-y-6">
          <div className="mb-4">
            <div className="mb-4">
              <StoryCarousel />
            </div>

            <div
              className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/30 hover:from-primary/10 hover:to-secondary/10 transition-all border border-border/50 hover:border-primary/30"
              onClick={() => setShowCreateModal(true)}
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                <AvatarImage src={currentUser?.avatar || "/placeholder.svg?height=40&width=40"} />
                <AvatarFallback>{currentUser?.name?.[0] || "Y"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-muted-foreground hover:text-foreground transition-colors">
                What&apos;s on your mind?
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary">
                  <ImageIcon size={18} />
                </button>
                <button className="p-2 hover:bg-secondary/10 rounded-lg transition-colors text-secondary">
                  <Video size={18} />
                </button>
                <button className="p-2 hover:bg-accent/10 rounded-lg transition-colors text-accent">
                  <Sparkles size={18} />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border/50 rounded-xl p-4 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-32" />
                    <div className="h-3 bg-muted rounded w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
                <div className="h-48 bg-muted rounded-lg" />
              </div>
            ))
          ) : (
            <>
              {fusionPosts.map((fusionPost) => (
                <FusionPostCard
                  key={fusionPost.id}
                  fusionPost={fusionPost}
                />
              ))}

              {posts.length === 0 && fusionPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">Be the first to share something amazing!</p>
                  <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus size={18} />
                    Create Post
                  </Button>
                </div>
              ) : (
                posts.map((post, index) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    onComment={() => setSelectedPostForComment(post)}
                  />
                ))
              )}

              {hasMore && posts.length > 0 && (
                <div className="flex justify-center py-8">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="bg-transparent border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Posts"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CreatePostModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handlePostCreate} />
      <CreateFusionModal
        isOpen={showCreateFusionModal}
        onClose={() => setShowCreateFusionModal(false)}
        onSubmit={handleFusionPostCreate}
      />
      <CommentModal
        isOpen={!!selectedPostForComment}
        onClose={() => setSelectedPostForComment(null)}
        onSubmit={(comment) => {
          console.log('Comment submitted:', comment)
          setSelectedPostForComment(null)
        }}
        postTitle={selectedPostForComment?.title}
        postId={selectedPostForComment?.id}
      />
    </main>
  )
}