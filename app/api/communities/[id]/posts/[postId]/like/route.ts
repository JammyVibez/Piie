import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { xpService } from "@/lib/gamification/xp-service"

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

    const existingLike = await prisma.communityPostLike.findUnique({
      where: {
        communityPostId_userId: {
          communityPostId: postId,
          userId: payload.userId,
        },
      },
    })

    if (existingLike) {
      await prisma.communityPostLike.delete({
        where: { id: existingLike.id },
      })

      await prisma.communityPost.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      })

      return NextResponse.json({
        success: true,
        liked: false,
      })
    }

    await prisma.communityPostLike.create({
      data: {
        communityPostId: postId,
        userId: payload.userId,
      },
    })

    const post = await prisma.communityPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    })

    await xpService.awardXP(payload.userId, "like_given", postId, "community_post")

    if (post.authorId !== payload.userId) {
      await xpService.awardXP(post.authorId, "like_received", postId, "community_post")

      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          senderId: payload.userId,
          type: "like",
          title: "New Like",
          message: "Someone liked your post",
          targetId: postId,
          targetType: "community_post",
        },
      })
    }

    return NextResponse.json({
      success: true,
      liked: true,
    })
  } catch (error) {
    console.error("[Community Post Like API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to toggle like" }, { status: 500 })
  }
}
