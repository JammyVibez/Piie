import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "topics"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (type === "topics") {
      const topics = await prisma.trendingTopic.findMany({
        orderBy: { posts: "desc" },
        take: limit,
      })

      if (topics.length === 0) {
        const tagCounts = await prisma.postTag.groupBy({
          by: ["tag"],
          _count: { tag: true },
          orderBy: { _count: { tag: "desc" } },
          take: limit,
        })

        if (tagCounts.length === 0) {
          return NextResponse.json({
            success: true,
            data: [
              { id: "1", name: "NextJS15", hashtag: "#NextJS15", posts: 12500, trend: "+32%", category: "Technology" },
              { id: "2", name: "ReactServer", hashtag: "#ReactServer", posts: 8900, trend: "+28%", category: "Technology" },
              { id: "3", name: "TypeScript", hashtag: "#TypeScript", posts: 15600, trend: "+15%", category: "Technology" },
            ],
          })
        }

        return NextResponse.json({
          success: true,
          data: tagCounts.map((t, i) => ({
            id: `topic-${i}`,
            name: t.tag,
            hashtag: `#${t.tag}`,
            posts: t._count.tag,
            trend: "+10%",
            category: "General",
          })),
        })
      }

      return NextResponse.json({
        success: true,
        data: topics.map((t) => ({
          id: t.id,
          name: t.name,
          hashtag: `#${t.hashtag || t.name.replace(/\s/g, "")}`,
          posts: t.posts,
          trend: t.trend || "+10%",
          category: t.category || "General",
        })),
      })
    }

    if (type === "posts") {
      const posts = await prisma.post.findMany({
        orderBy: [{ views: "desc" }, { likes: "desc" }],
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          tags: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: posts.map((p, i) => ({
          id: p.id,
          title: p.title,
          author: p.author.name,
          authorAvatar: p.author.avatar,
          authorId: p.author.id,
          likes: p.likes,
          comments: p.commentsCount,
          trending: i + 1,
          image: p.images?.[0] || null,
          tags: p.tags.map((t) => t.tag),
        })),
      })
    }

    if (type === "creators") {
      const creators = await prisma.user.findMany({
        orderBy: [{ influenceScore: "desc" }, { level: "desc" }],
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          userRole: true,
          level: true,
          influenceScore: true,
          _count: {
            select: { followers: true },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: creators.map((c) => ({
          id: c.id,
          name: c.name,
          username: c.username,
          avatar: c.avatar,
          role: c.userRole,
          followers: c._count.followers,
          level: c.level,
          influenceScore: c.influenceScore,
          isVerified: c.level >= 10,
          growth: "+5%",
        })),
      })
    }

    if (type === "realms" || type === "communities") {
      const communities = await prisma.community.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          _count: {
            select: { members: true },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: communities.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          members: c._count.members,
          trend: "+10%",
          icon: "🌐",
          tier: "gold",
        })),
      })
    }

    return NextResponse.json({
      success: true,
      data: [],
    })
  } catch (error) {
    console.error("[Trending API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch trending data" }, { status: 500 })
  }
}
