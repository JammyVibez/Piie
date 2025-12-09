"use client"

import { useState, useEffect } from "react"
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  FolderPlus,
  MoreHorizontal,
  Grid3X3,
  List,
  Tag,
  Clock,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PostCard } from "@/components/post-card"
import type { Post } from "@/components/types"
import { formatRelativeTime } from "@/lib/utils-format"

interface BookmarkCollection {
  id: string
  name: string
  count: number
  color: string
  icon?: string
}

const defaultCollections: BookmarkCollection[] = [
  { id: "all", name: "All Bookmarks", count: 0, color: "bg-primary" },
  { id: "read-later", name: "Read Later", count: 0, color: "bg-blue-500" },
  { id: "favorites", name: "Favorites", count: 0, color: "bg-red-500" },
  { id: "tutorials", name: "Tutorials", count: 0, color: "bg-green-500" },
  { id: "inspiration", name: "Inspiration", count: 0, color: "bg-purple-500" },
]

export default function BookmarksPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([])
  const [collections, setCollections] = useState<BookmarkCollection[]>(defaultCollections)
  const [activeCollection, setActiveCollection] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "popular">("recent")
  const [isLoading, setIsLoading] = useState(true)
  const [newCollectionName, setNewCollectionName] = useState("")
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("auth_token")
      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch("/api/bookmarks", { headers })
      const data = await response.json()

      if (data.success && data.data?.items) {
        const bookmarked = data.data.items.map((bookmark: any) => ({
          ...bookmark.post,
          isBookmarked: true,
          bookmarkedAt: new Date(bookmark.bookmarkedAt),
          collectionId: bookmark.collectionId || "all",
        }))

        setBookmarkedPosts(bookmarked as Post[])

        const updatedCollections = defaultCollections.map((col) => ({
          ...col,
          count: col.id === "all" ? bookmarked.length : bookmarked.filter((p: any) => p.collectionId === col.id).length,
        }))
        setCollections(updatedCollections)
      } else {
        setBookmarkedPosts([])
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error)
      setBookmarkedPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBookmark = async (postId: string) => {
    try {
      // await fetch(`/api/bookmarks/${postId}`, { method: "DELETE" })
      setBookmarkedPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch (error) {
      console.error("Failed to remove bookmark:", error)
    }
  }

  const handleBulkRemove = async () => {
    try {
      // await fetch("/api/bookmarks/bulk-delete", {
      //   method: "POST",
      //   body: JSON.stringify({ ids: selectedPosts })
      // })
      setBookmarkedPosts((prev) => prev.filter((p) => !selectedPosts.includes(p.id)))
      setSelectedPosts([])
      setIsSelecting(false)
    } catch (error) {
      console.error("Failed to bulk remove:", error)
    }
  }

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return

    const colors = ["bg-pink-500", "bg-orange-500", "bg-teal-500", "bg-indigo-500", "bg-cyan-500"]
    const newCollection: BookmarkCollection = {
      id: newCollectionName.toLowerCase().replace(/\s+/g, "-"),
      name: newCollectionName,
      count: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
    }

    setCollections((prev) => [...prev, newCollection])
    setNewCollectionName("")
    setShowCreateCollection(false)
  }

  const filteredPosts = bookmarkedPosts
    .filter((post) => {
      if (activeCollection !== "all") {
        return (post as any).collectionId === activeCollection
      }
      return true
    })
    .filter((post) => {
      if (!searchQuery) return true
      return (
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return b.likes - a.likes
    })

  const togglePostSelection = (postId: string) => {
    setSelectedPosts((prev) => (prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Bookmark className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bookmarks</h1>
              <p className="text-sm text-muted-foreground">{bookmarkedPosts.length} saved posts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSelecting ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsSelecting(false)
                    setSelectedPosts([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkRemove}
                  disabled={selectedPosts.length === 0}
                  className="gap-2"
                >
                  <Trash2 size={16} />
                  Remove ({selectedPosts.length})
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsSelecting(true)} className="gap-2">
                  Select
                </Button>
                <Dialog open={showCreateCollection} onOpenChange={setShowCreateCollection}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FolderPlus size={16} />
                      New Collection
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Collection</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Input
                        placeholder="Collection name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
                      />
                      <Button onClick={handleCreateCollection} className="w-full">
                        Create
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Collections */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Tag size={16} />
                Collections
              </h3>
              <ScrollArea className="h-auto max-h-[400px]">
                <div className="space-y-1">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => setActiveCollection(collection.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${
                        activeCollection === collection.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${collection.color}`} />
                        <span className="text-sm font-medium truncate">{collection.name}</span>
                      </div>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{collection.count}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Quick Stats */}
            <Card className="p-4 mt-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp size={16} />
                Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Saved</span>
                  <span className="font-semibold">{bookmarkedPosts.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold text-green-500">+{Math.min(5, bookmarkedPosts.length)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Collections</span>
                  <span className="font-semibold">{collections.length}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSortBy("recent")}
                      className={sortBy === "recent" ? "bg-muted" : ""}
                    >
                      <Clock size={16} className="mr-2" /> Most Recent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("oldest")}
                      className={sortBy === "oldest" ? "bg-muted" : ""}
                    >
                      <Clock size={16} className="mr-2" /> Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy("popular")}
                      className={sortBy === "popular" ? "bg-muted" : ""}
                    >
                      <TrendingUp size={16} className="mr-2" /> Most Popular
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={`rounded-none ${viewMode === "list" ? "bg-muted" : ""}`}
                  >
                    <List size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-none ${viewMode === "grid" ? "bg-muted" : ""}`}
                  >
                    <Grid3X3 size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bookmarked Posts */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card className="p-12 text-center">
                <Bookmark size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? "No matching bookmarks" : "No bookmarks yet"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? "Try a different search term" : "Start saving posts to see them here"}
                </p>
              </Card>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                {filteredPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="relative animate-message-slide"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {isSelecting && (
                      <button
                        onClick={() => togglePostSelection(post.id)}
                        className={`absolute top-4 left-4 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedPosts.includes(post.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground bg-background"
                        }`}
                      >
                        {selectedPosts.includes(post.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}

                    <div className={`group ${isSelecting ? "pl-10" : ""}`}>
                      {viewMode === "list" ? (
                        <PostCard post={post} variant="default" />
                      ) : (
                        <Card className="overflow-hidden border hover:shadow-lg transition-all">
                          {post.image && (
                            <div className="aspect-video overflow-hidden">
                              <img
                                src={post.image || "/placeholder.svg"}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={post.author.avatar || "/placeholder.svg"} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{post.author.name}</span>
                            </div>
                            <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(post.createdAt)}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Move to collection</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveBookmark(post.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 size={14} className="mr-2" />
                                    Remove bookmark
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
