import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params
    const authHeader = request.headers.get("authorization")
    let userId: string | null = null

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    // For now, return posts that might be shared in the room
    // You may want to add a RoomPost model to track shared posts
    const posts = await prisma.post.findMany({
      where: {
        visibility: "public",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likedBy: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: posts.map(post => ({
        id: post.id,
        content: post.content || post.description,
        author: post.author,
        timestamp: post.createdAt,
        likes: post._count.likedBy,
        comments: post._count.comments,
        shares: post.shares || 0,
        views: post.views || 0,
        postType: post.postType,
        mediaUrls: post.images || [],
      })),
    })
  } catch (error) {
    console.error("[Room Posts API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { id: roomId } = await params
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ success: false, error: "Post ID required" }, { status: 400 })
    }

    // Verify user is a member
    const member = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: decoded.userId,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ success: false, error: "Not a member of this room" }, { status: 403 })
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likedBy: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    // For now, just return the post
    // You may want to create a RoomPost model to track shared posts
    return NextResponse.json({
      success: true,
      data: {
        id: post.id,
        content: post.content || post.description,
        author: post.author,
        timestamp: post.createdAt,
        likes: post._count.likedBy,
        comments: post._count.comments,
        shares: post.shares || 0,
        views: post.views || 0,
        postType: post.postType,
        mediaUrls: post.images || [],
      },
    })
  } catch (error) {
    console.error("[Room Posts API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to share post" }, { status: 500 })
  }
}

