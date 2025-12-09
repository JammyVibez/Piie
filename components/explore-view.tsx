"use client"

import { Heart, MessageCircle, TrendingUp, Users, Flame, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function ExploreView() {
  const trendingPosts = [
    {
      id: "1",
      title: "The Future of AI in Web Development",
      author: "Tech Guru",
      likes: 2341,
      comments: 456,
      trending: 1,
      image: "/nextjs-development.jpg",
    },
    {
      id: "2",
      title: "Building Scalable Systems",
      author: "System Architect",
      likes: 1890,
      comments: 234,
      trending: 2,
      image: "/3d-code-visualization-abstract-art.jpg",
    },
    {
      id: "3",
      title: "Design System Best Practices",
      author: "Design Lead",
      likes: 1567,
      comments: 189,
      trending: 3,
      image: "/woman-with-tech-background.jpg",
    },
  ]

  const trendingTopics = [
    { id: "1", name: "#WebDevelopment", posts: 45320, trend: "↑ 28%", color: "from-blue-500 to-cyan-500" },
    { id: "2", name: "#AI & ML", posts: 38900, trend: "↑ 42%", color: "from-purple-500 to-pink-500" },
    { id: "3", name: "#DesignSystem", posts: 32450, trend: "↑ 15%", color: "from-orange-500 to-red-500" },
    { id: "4", name: "#NextJS", posts: 28900, trend: "↑ 32%", color: "from-green-500 to-emerald-500" },
  ]

  const trendingCreators = [
    { id: "1", name: "Alex Chen", followers: 15420, role: "Creator", avatar: "/placeholder.svg?height=40&width=40" },
    { id: "2", name: "Sarah Wolf", followers: 12890, role: "Analyst", avatar: "/placeholder.svg?height=40&width=40" },
    {
      id: "3",
      name: "Marcus Echo",
      followers: 9870,
      role: "Entertainer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const trendingRealms = [
    { id: "1", name: "Code Realm", members: 45320, trend: "↑ 12%", icon: "💻" },
    { id: "2", name: "Design Hub", members: 38900, trend: "↑ 24%", icon: "🎨" },
    { id: "3", name: "Data Realm", members: 32450, trend: "↑ 8%", icon: "📊" },
    { id: "4", name: "Entertainment", members: 28900, trend: "↑ 18%", icon: "🎬" },
  ]

  return (
    <div className="space-y-8">
      {/* Trending Posts with Images */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={24} className="text-accent" />
          Trending Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingPosts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-300 border border-border/50 glow-border cursor-pointer group"
            >
              <div className="relative h-40 overflow-hidden bg-muted">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-accent/90 backdrop-blur px-3 py-1 rounded-full text-white text-lg font-bold">
                  #{post.trending}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">by {post.author}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 hover:text-accent transition-colors">
                    <Heart size={14} /> {post.likes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 hover:text-secondary transition-colors">
                    <MessageCircle size={14} /> {post.comments.toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles size={24} className="text-primary" />
          Trending Topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trendingTopics.map((topic) => (
            <Card
              key={topic.id}
              className={`p-4 border border-border/50 glow-border hover:shadow-lg transition-all cursor-pointer group`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${topic.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-lg`}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {topic.trend}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Creators */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users size={24} className="text-primary" />
          Trending Creators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendingCreators.map((creator) => (
            <Card
              key={creator.id}
              className="p-4 border border-border/50 glow-border hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <img
                  src={creator.avatar || "/placeholder.svg"}
                  alt={creator.name}
                  className="w-16 h-16 rounded-full object-cover mb-3 ring-2 ring-primary/30"
                />
                <h3 className="font-semibold text-foreground">{creator.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{creator.role}</p>
                <p className="text-sm text-accent font-medium mb-3">{creator.followers.toLocaleString()} followers</p>
                <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg">
                  Follow
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Realms */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Flame size={24} className="text-orange-500" />
          Trending Realms & Communities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trendingRealms.map((realm) => (
            <Card
              key={realm.id}
              className="p-4 border border-border/50 glow-border hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {realm.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {realm.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{realm.members.toLocaleString()} members</p>
                  </div>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent whitespace-nowrap ml-2">
                  {realm.trend}
                </span>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3 hover:bg-primary/10 bg-transparent">
                Join
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
