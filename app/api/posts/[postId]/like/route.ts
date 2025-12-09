import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const { postId } = await params

    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } })
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      })
      
      const updatedPost = await prisma.post.findUnique({ where: { id: postId } })
      
      return NextResponse.json({
        success: true,
        liked: false,
        likeCount: updatedPost?.likes || 0,
      })
    }

    await prisma.like.create({
      data: {
        userId: decoded.userId,
        postId,
      },
    })
    await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    })

    const updatedPost = await prisma.post.findUnique({ where: { id: postId } })

    // Create notification for post author (if not liking own post)
    if (post.authorId !== decoded.userId) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          senderId: decoded.userId,
          type: 'like',
          title: 'New like',
          message: 'liked your post',
          targetId: postId,
          targetType: 'post',
        },
      })
    }

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: updatedPost?.likes || 0,
    })
  } catch (error) {
    console.error("[Like API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to like post" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
    }

    const { postId } = await params

    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } })
      await prisma.post.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      })
    }

    const updatedPost = await prisma.post.findUnique({ where: { id: postId } })

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: Math.max(0, updatedPost?.likes || 0),
    })
  } catch (error) {
    console.error("[Unlike API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to unlike post" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params

    let isLiked = false
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        const existingLike = await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: decoded.userId,
              postId,
            },
          },
        })
        isLiked = !!existingLike
      }
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { likes: true },
    })

    return NextResponse.json({
      success: true,
      liked: isLiked,
      likeCount: post?.likes || 0,
    })
  } catch (error) {
    console.error("[Like Status API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to get like status" }, { status: 500 })
  }
}
