
"use client"

import { ArrowLeft, Calendar, User, Tag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const blogPosts = [
  {
    id: "v1.2.0-release",
    title: "P!!E v1.2.0 - New Features & Improvements",
    date: "2024-01-09",
    author: "P!!E Team",
    excerpt: "We're excited to announce P!!E v1.2.0 with Fusion Posts, Audio Rooms, and more!",
    tags: ["Release", "Features"],
    content: `
      We're thrilled to announce the release of P!!E v1.2.0! This update brings exciting new features and improvements to enhance your social experience.

      ## What's New

      ### Fusion Posts
      Create multi-layered, interactive posts that combine text, images, polls, and more. Fusion Posts allow you to express yourself in entirely new ways.

      ### Audio Rooms
      Host live audio conversations within your communities. Perfect for AMAs, discussions, and casual hangouts.

      ### Ripple Rooms
      24-hour temporary rooms for focused collaboration. Great for study sessions, hackathons, or time-limited projects.

      ### Enhanced Gamification
      Earn XP for your activities, unlock badges, and compete on the leaderboard. The more you engage, the more you grow!

      ## Bug Fixes
      - Fixed authentication issues in community creation
      - Improved profile picture upload functionality
      - Enhanced chat message delivery
      - Fixed notification display issues

      ## Coming Soon
      - Custom themes and wallpapers
      - Advanced search filters
      - Mobile app improvements
      - And much more!

      Thank you for being part of the P!!E community!
    `,
  },
  {
    id: "community-guidelines",
    title: "Community Guidelines & Best Practices",
    date: "2024-01-05",
    author: "P!!E Team",
    excerpt: "Learn how to create a positive and engaging community on P!!E",
    tags: ["Community", "Guidelines"],
    content: `
      Building a thriving community takes effort and care. Here are our guidelines and best practices.

      ## Be Respectful
      Treat all members with respect and kindness. We have zero tolerance for harassment or hate speech.

      ## Create Quality Content
      Share valuable insights, ask thoughtful questions, and contribute meaningfully to discussions.

      ## Engage Authentically
      Build genuine connections. Use features like Audio Rooms and Ripple Rooms to interact in real-time.

      ## Report Issues
      If you see something that violates our guidelines, please report it. We review all reports promptly.
    `,
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-muted/50 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold">P!!E Blog</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Latest Updates & News</h2>
          <p className="text-lg text-muted-foreground">
            Stay up to date with the latest features, improvements, and community highlights
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} />
                  {post.author}
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-3">{post.title}</h3>
              <p className="text-muted-foreground mb-4">{post.excerpt}</p>

              <div className="flex items-center gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <details className="group">
                <summary className="cursor-pointer text-primary font-medium hover:underline list-none">
                  Read full article →
                </summary>
                <div className="mt-4 prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-foreground/90">
                    {post.content}
                  </div>
                </div>
              </details>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-primary/10 border border-primary/20 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
          <p className="text-muted-foreground mb-6">
            Follow us for the latest updates and join our community discussions
          </p>
          <Link href="/">
            <Button>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
