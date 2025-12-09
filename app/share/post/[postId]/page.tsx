"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, Users, Zap, Heart, MessageCircle } from "lucide-react"
import type { Post } from "@/components/types"
import Link from "next/link"

export default function SharedPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const postId = params.postId as string

  useEffect(() => {
    if (!postId) return

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`)
        const result = await response.json()

        if (result.success && result.data) {
          setPost(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch post:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
            <MessageCircle size={40} className="text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-foreground">Post not found</h2>
          <p className="text-muted-foreground mb-6">
            This post may have been deleted or is no longer available.
          </p>
          <Link href="/landing">
            <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
              Discover P!!E
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              P!!E
            </span>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-primary to-secondary">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Shared from P!!E</p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {post.author?.name || "A user"} shared something amazing
          </h1>
        </div>

        <div className="mb-8">
          <PostCard post={post} variant="featured" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{post.likesCount?.toLocaleString() || 0}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{post.commentsCount || 0}</p>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
            <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{post.sharesCount || 0}</p>
            <p className="text-xs text-muted-foreground">Shares</p>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">Join the Conversation</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create an account to like, comment, and share. Connect with creators and build your community.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary shadow-lg">
                Create Account <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                I have an account
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Build Your Community</h3>
            <p className="text-sm text-muted-foreground">Connect with like-minded creators</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Level Up</h3>
            <p className="text-sm text-muted-foreground">Earn XP and unlock achievements</p>
          </div>
          <div className="p-6">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Share Your Voice</h3>
            <p className="text-sm text-muted-foreground">Create posts, stories, and more</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>P!!E - Next Generation Social Platform</p>
        </div>
      </footer>
    </div>
  )
}
