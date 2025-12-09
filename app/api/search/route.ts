import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")?.toLowerCase()
    const type = searchParams.get("type") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!query || query.length < 2) {
      return NextResponse.json({ success: false, error: "Query too short" }, { status: 400 })
    }

    const results: {
      posts: unknown[]
      users: unknown[]
      communities: unknown[]
    } = {
      posts: [],
      users: [],
      communities: [],
    }

    if (type === "all" || type === "posts") {
      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
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

      results.posts = posts.map((post) => ({
        id: post.id,
        title: post.title,
        description: post.description,
        author: post.author,
        likes: post.likes,
        comments: post.commentsCount,
        tags: post.tags.map((t) => t.tag),
        createdAt: post.createdAt,
      }))
    }

    if (type === "all" || type === "users" || type === "members") {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          userRole: true,
          level: true,
          _count: {
            select: {
              followers: true,
            },
          },
        },
      })

      results.users = users.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        userRole: user.userRole,
        level: user.level,
        followers: user._count.followers,
      }))
    }

    if (type === "all" || type === "communities") {
      const communities = await prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        include: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      })

      results.communities = communities.map((community) => ({
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        privacy: community.privacy,
        memberCount: community._count.members,
      }))
    }

    return NextResponse.json({
      success: true,
      data: { results, query },
    })
  } catch (error) {
    console.error("[Search API] Error:", error)
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 })
  }
}
