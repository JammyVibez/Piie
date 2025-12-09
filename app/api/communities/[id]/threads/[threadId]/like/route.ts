import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { xpService } from "@/lib/gamification/xp-service"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; threadId: string }> }
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

    const { threadId } = await params

    const existingLike = await prisma.threadLike.findUnique({
      where: {
        threadId_userId: {
          threadId,
          userId: payload.userId,
        },
      },
    })

    if (existingLike) {
      await prisma.threadLike.delete({
        where: { id: existingLike.id },
      })

      return NextResponse.json({
        success: true,
        liked: false,
      })
    }

    await prisma.threadLike.create({
      data: {
        threadId,
        userId: payload.userId,
      },
    })

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { authorId: true },
    })

    await xpService.awardXP(payload.userId, "like_given", threadId, "thread")

    if (thread && thread.authorId !== payload.userId) {
      await xpService.awardXP(thread.authorId, "like_received", threadId, "thread")
    }

    return NextResponse.json({
      success: true,
      liked: true,
    })
  } catch (error) {
    console.error("[Thread Like API] Error:", error)
    return NextResponse.json({ success: false, error: "Failed to toggle like" }, { status: 500 })
  }
}
