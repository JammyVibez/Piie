import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { xpService } from "@/lib/gamification/xp-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const { postId } = await params

    const comments = await prisma.communityPostComment.findMany({
      where: {
        communityPostId: postId,
        parentId: null,
      },
      orderBy: { createdAt: "asc" },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
    })

    const authorIds = [
      ...new Set([
        ...comments.map(c => c.authorId),
        ...comments.flatMap(c => c.replies.map(r => r.authorId)),
      ]),
    ]

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

    const formattedComments = comments.map(comment => ({
      ...comment,
      author: authorMap.get(comment.authorId),
      replies: comment.replies.map(reply => ({
        ...reply,
        author: authorMap.get(reply.authorId),
      })),
    }))

    return NextResponse.json({
      success: true,
      data: formattedComments,
    })
  } catch (error) {
    console.error("[Community Post Comments API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; postId: string }> }
) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const { postId } = await params
    const { content, parentId } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 })
    }

    const comment = await prisma.communityPostComment.create({
      data: {
        communityPostId: postId,
        authorId: payload.userId,
        content,
        parentId,
      },
    })

    await prisma.communityPost.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    })

    await xpService.awardXP(payload.userId, "comment_added", comment.id, "community_comment")

    const post = await prisma.communityPost.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (post && post.authorId !== payload.userId) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          senderId: payload.userId,
          type: "comment",
          title: "New Comment",
          message: "Someone commented on your post",
          targetId: postId,
          targetType: "community_post",
        },
      })
    }

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
        ...comment,
        author,
        replies: [],
      },
    })
  } catch (error) {
    console.error("[Community Post Comments API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to create comment" }, { status: 500 })
  }
}
