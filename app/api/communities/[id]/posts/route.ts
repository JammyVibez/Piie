import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { xpService } from "@/lib/gamification/xp-service"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where: { communityId: id },
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
        include: {
          communityPostLikes: {
            select: { userId: true },
          },
          communityPostComments: {
            take: 3,
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              content: true,
              authorId: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              communityPostComments: true,
              communityPostLikes: true,
            },
          },
        },
      }),
      prisma.communityPost.count({ where: { communityId: id } }),
    ])

    const authorIds = [...new Set(posts.map(p => p.authorId))]
    const authors = await prisma.user.findMany({
      where: { id: { in: authorIds } },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
      },
    })
    const authorMap = new Map(authors.map(a => [a.id, a]))

    const formattedPosts = posts.map(post => ({
      ...post,
      author: authorMap.get(post.authorId),
      likesCount: post._count.communityPostLikes,
      commentsCount: post._count.communityPostComments,
      likedBy: post.communityPostLikes.map(l => l.userId),
    }))

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[Community Posts API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params
    const { content, images, video } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
    }

    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: id,
          userId: payload.userId,
        },
      },
    })

    if (!membership || membership.isBanned) {
      return NextResponse.json({ success: false, error: "Not a member of this community" }, { status: 403 })
    }

    const post = await prisma.communityPost.create({
      data: {
        communityId: id,
        authorId: payload.userId,
        content,
        images: images || [],
        video,
      },
    })

    await prisma.community.update({
      where: { id },
      data: { postsCount: { increment: 1 } },
    })

    await xpService.awardXP(payload.userId, "post_created", post.id, "community_post")

    const author = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        level: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        author,
        likesCount: 0,
        commentsCount: 0,
        likedBy: [],
      },
    })
  } catch (error) {
    console.error("[Community Posts API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create post" }, { status: 500 })
  }
}
