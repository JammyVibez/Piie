import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const parentId = searchParams.get("parentId")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      postId,
      parentId: parentId || null,
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              userRole: true,
              level: true,
            },
          },
          replies: {
            take: 3,
            orderBy: { createdAt: "desc" },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      prisma.comment.count({ where }),
    ])

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      author: comment.author,
      content: comment.content,
      parentId: comment.parentId,
      image: comment.image,
      likes: comment.likes,
      repliesCount: comment._count.replies,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        author: reply.author,
        content: reply.content,
        likes: reply.likes,
        createdAt: reply.createdAt,
      })),
      createdAt: comment.createdAt,
      isLiked: false,
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: formattedComments,
        total,
        page,
        limit,
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error("[Comments API] Error fetching:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 })
  }
}

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
    const { content, parentId, image } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: decoded.userId,
        content,
        parentId: parentId || null,
        image: image || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            userRole: true,
            level: true,
          },
        },
      },
    })

    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    })

    // Update challenge progress
    await updateChallengeProgress(decoded.userId, 'comment_post')

    // Create notification for post author (if not commenting on own post)
    if (post.authorId !== decoded.userId) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          senderId: decoded.userId,
          type: 'comment',
          title: 'New comment',
          message: 'commented on your post',
          targetId: postId,
          targetType: 'post',
        },
      })
    }

    const formattedComment = {
      id: comment.id,
      postId: comment.postId,
      author: comment.author,
      content: comment.content,
      parentId: comment.parentId,
      image: comment.image,
      likes: comment.likes,
      replies: [],
      repliesCount: 0,
      createdAt: comment.createdAt,
      isLiked: false,
    }

    return NextResponse.json({ success: true, data: formattedComment }, { status: 201 })
  } catch (error) {
    console.error("[Comments API] Error creating:", error)
    return NextResponse.json({ success: false, error: "Failed to create comment" }, { status: 500 })
  }
}
